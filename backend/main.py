import os
import json
import requests
import datetime
from dotenv import load_dotenv
from typing import Optional
from openai import OpenAI
from fastapi import FastAPI, HTTPException, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
from bson import ObjectId

load_dotenv()

openai_client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
mongo_client = MongoClient(os.getenv("MONGO_URI"))

app = FastAPI()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
)

db = mongo_client[os.getenv('DB_NAME')]
userprojects_collection = db["userprojects"]

# ----------------------------------------------------------------
# DB Models and Helpers
# ----------------------------------------------------------------

class UserProject(BaseModel):
    username: str
    github_token: str
    title: str
    description: str
    github_repo_link: str

class UserProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None

class GenerateProjectDataRequest(BaseModel):
    project_description: str
    features: str
    duration: str
    hours_per_day: int
    tech_stack: Optional[str] = None

class CreateRepoRequest(BaseModel):
    repo_name: str
    repo_description: str
    private: bool
    token: str
    project_data: dict

def project_doc_helper(project: dict) -> dict:
    """Converts a MongoDB project document into a JSON-friendly dictionary."""
    return {
        "id": str(project["_id"]),
        "username": project["username"],
        "github_token": project["github_token"],
        "title": project["title"],
        "description": project["description"],
        "github_repo_link": project["github_repo_link"]
    }

# -------------------------------
# UserProject Endpoints
# -------------------------------

@app.post("/projects", response_model=UserProject, status_code=201)
def create_project(project: UserProject):
    """
    Creates a new UserProject document.
    Returns the created project object in JSON with a 201 status code.
    """
    result = userprojects_collection.insert_one(project.model_dump())
    created_project = userprojects_collection.find_one({"_id": result.inserted_id})
    return project_doc_helper(created_project)

@app.put("/projects/{project_id}", response_model=UserProject, status_code=200)
def update_project(project_id: str, update: UserProjectUpdate):
    """
    Updates only the title and description of a UserProject document.
    If no fields are provided, returns a 400 error.
    If fields are provided, returns the updated project object in JSON with a 200 status code.
    """
    update_data = update.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update")
    result = userprojects_collection.update_one(
        {"_id": ObjectId(project_id)},
        {"$set": update_data}
    )
    if result.matched_count:
        updated_project = userprojects_collection.find_one({"_id": ObjectId(project_id)})
        return project_doc_helper(updated_project)
    raise HTTPException(status_code=404, detail="Project not found")

@app.get("/projects", response_model=list, status_code=200)
def get_user_projects(username: str):
    """
    Retrieves all UserProject documents for a given username.
    Pass the username as a query parameter.
    Returns a list of project objects in JSON with a 200 status code.
    """
    result = userprojects_collection.find({"username": username})
    user_projects = [project_doc_helper(project) for project in result]
    return user_projects

# ----------------------------------------------------------------
# OpenAI Endpoints & Functions
# ----------------------------------------------------------------

@app.post("/generate-project-data")
def generate_project_data(request: GenerateProjectDataRequest):
    """Generate project summary, milestones, and issues using OpenAI."""
    try:
        json_data = milestone_and_issue_creator(
            request.project_description,
            request.features,
            request.duration,
            request.hours_per_day,
            request.tech_stack
        )
        return json.loads(json_data)  # Return as JSON object
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate project data: {str(e)}")
    
@app.post("/create-repo")
def create_repo(request: CreateRepoRequest):
    """Create a GitHub repository and populate it with milestones and issues."""
    try:
        github_username = get_github_username(request.token)
        new_repo_name = request.repo_name.replace(' ', '-')
        result = create_repo_and_process_milestones_and_issues(
            new_repo_name,
            request.repo_description,
            request.private,
            request.token,
            request.project_data
        )
        if 'success' in result and result['success']:
            user_project = UserProject(
                username=github_username["username"],  # Extract username from the response
                github_token=request.token,
                title=new_repo_name,
                description=request.repo_description,
                github_repo_link=result['repo_url']
            )
            create_project(user_project)  # Pass the UserProject instance directly
            return result['repo_url']
        else:
            raise HTTPException(status_code=400, detail=result.get('message', 'Unknown error'))
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid project_data format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create repository: {str(e)}")


@app.patch("/update-issue/{repo_owner}/{repo_name}/{issue_number}")
def update_issue_to_complete(repo_owner: str, repo_name: str, issue_number: int, token: str):
    """Update an issue to complete (closed) in the specified GitHub repository."""
    try:
        url = f"https://api.github.com/repos/{repo_owner}/{repo_name}/issues/{issue_number}"
        headers = {
            "Authorization": f"token {token}",
            "Content-Type": "application/json",
        }
        payload = {
            "state": "closed"
        }
        response = requests.patch(url, headers=headers, data=json.dumps(payload))
        if response.status_code == 200:
            return {"message": f"Issue #{issue_number} updated to complete (closed) successfully!"}
        else:
            raise HTTPException(status_code=response.status_code, detail=f"Failed to update issue #{issue_number}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update issue: {str(e)}")


@app.patch("/update-milestone/{repo_owner}/{repo_name}/{milestone_number}")
def update_milestone_to_complete(repo_owner: str, repo_name: str, milestone_number: int, token: str):
    """Update a milestone to complete (closed) if all its issues are closed."""
    try:
        url = f"https://api.github.com/repos/{repo_owner}/{repo_name}/milestones/{milestone_number}/issues"
        headers = {
            "Authorization": f"token {token}",
            "Content-Type": "application/json",
        }
        # Fetch all issues for the milestone
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            issues = response.json()
            all_completed = all(issue['state'] == 'closed' for issue in issues)
            if all_completed:
                milestone_url = f"https://api.github.com/repos/{repo_owner}/{repo_name}/milestones/{milestone_number}"
                milestone_payload = {
                    "state": "closed"
                }
                milestone_response = requests.patch(milestone_url, headers=headers, data=json.dumps(milestone_payload))
                if milestone_response.status_code == 200:
                    return {"message": f"Milestone #{milestone_number} updated to complete (closed) successfully!"}
                else:
                    raise HTTPException(status_code=milestone_response.status_code, detail=f"Failed to update milestone #{milestone_number}")
            else:
                return {"message": f"Milestone #{milestone_number} cannot be completed as not all issues are closed."}
        else:
            raise HTTPException(status_code=response.status_code, detail=f"Failed to fetch issues for milestone #{milestone_number}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update milestone: {str(e)}")


@app.get("/fetch-milestones/{repo_owner}/{repo_name}")
def fetch_all_milestones_and_issues(repo_owner: str, repo_name: str, token: str):
    """Fetch all milestones and their pertaining issues (open and closed) in the specified GitHub repository."""
    try:
        # Step 1: Fetch all milestones
        url = f"https://api.github.com/repos/{repo_owner}/{repo_name}/milestones"
        headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28"
        }
        response = requests.get(url, headers=headers)
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"Failed to fetch milestones: {response.text}")

        milestones = response.json()
        result = []

        # Step 2: For each milestone, fetch all issues (open and closed)
        for milestone in milestones:
            milestone_number = milestone['number']
            issues_url = f"https://api.github.com/repos/{repo_owner}/{repo_name}/issues"
            params = {
                "milestone": milestone_number,
                "state": "all",  # Fetch both open and closed issues
                "per_page": 100  # Max results per page to reduce pagination needs
            }
            issues_response = requests.get(issues_url, headers=headers, params=params)

            if issues_response.status_code != 200:
                raise HTTPException(status_code=issues_response.status_code, 
                                   detail=f"Failed to fetch issues for milestone #{milestone_number}: {issues_response.text}")

            issues = issues_response.json()
            # Simplify issues data to include only relevant fields
            simplified_issues = [
                {
                    "number": issue["number"],
                    "title": issue["title"],
                    "state": issue["state"],
                    "created_at": issue["created_at"],
                    "closed_at": issue["closed_at"] if issue["state"] == "closed" else None
                }
                for issue in issues
            ]

            result.append({
                "milestone": {
                    "number": milestone["number"],
                    "title": milestone["title"],
                    "state": milestone["state"],
                    "description": milestone["description"]
                },
                "issues": simplified_issues
            })

        # Step 3: Return the result in JSON format
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch milestones and issues: {str(e)}")
    

# New OAuth endpoints
@app.get("/getAccessToken")
async def get_access_token(code: str):
    url = "https://github.com/login/oauth/access_token"
    params = {
        "client_id": os.getenv('VITE_GITHUB_CLIENT_KEY'),
        "client_secret": os.getenv('VITE_GITHUB_CLIENT_SECRETS'),
        "code": code
    }
    headers = {"Accept": "application/json"}
    response = requests.post(url, params=params, headers=headers)
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to get access token")
    data = response.json()
    return {"access_token": data.get("access_token")}
    
@app.get("/getUserData")
async def get_user_data(request: Request):
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        raise HTTPException(status_code=401, detail="No token provided")
    url = "https://api.github.com/user"
    headers = {"Authorization": f"token {token}"}  # Changed from "Bearer {token}" to "token {token}"
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=f"API error: {response.text}")
    return response.json()

def create_github_repo(repo_name, description, private, token):
    """Create a new GitHub repository."""
    url = "https://api.github.com/user/repos"
    headers = {
        "Authorization": f"token {token}",
        "Content-Type": "application/json",
    }
    payload = {
        "name": repo_name,
        "description": description,
        "private": private,
        "auto_init": True,
    }
    response = requests.post(url, headers=headers, data=json.dumps(payload))
    if response.status_code == 201:
        return response.json()['html_url']
    else:
        error_info = response.json()
        if 'errors' in error_info:
            error_messages = [error['message'] for error in error_info['errors']]
            return {"success": False, "status_code": response.status_code, "error_messages": error_messages}
        else:
            return {"success": False, "status_code": response.status_code, "message": error_info.get('message', 'Unknown error')}

@app.get("/get-github-username")
def get_github_username(token: Optional[str] = Header(None, description="GitHub Personal Access Token")):
    """
    Fetch the GitHub username associated with the provided personal access token.
    
    Args:
        token: GitHub Personal Access Token passed as a header
        
    Returns:
        JSON with the GitHub username
        
    Raises:
        401: If no token is provided
        403: If the token is invalid
        500: For other errors
    """
    if not token:
        raise HTTPException(status_code=401, detail="GitHub token is required")
    try:
        headers = {'Authorization': f'token {token}'}
        response = requests.get('https://api.github.com/user', headers=headers)
        if response.status_code == 200:
            return {"username": response.json()['login']}
        elif response.status_code == 401:
            raise HTTPException(status_code=403, detail="Invalid or expired GitHub token")
        else:
            raise HTTPException(
                status_code=response.status_code, 
                detail=f"GitHub API error: {response.text}"
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch GitHub username: {str(e)}")


def process_due_date(due_date):
    """Convert a due date to ISO 8601 format for GitHub API."""
    if isinstance(due_date, str):
        try:
            date_only = datetime.date.fromisoformat(due_date)
            due_date_utc = datetime.datetime.combine(date_only, datetime.time(0, 0), tzinfo=datetime.timezone.utc)
            return due_date_utc.isoformat().replace('+00:00', 'Z')
        except ValueError:
            print(f"Invalid date format: {due_date}")
            return None
    else:
        print(f"due_date must be a string in YYYY-MM-DD format, got {type(due_date)}")
        return None

def create_milestone(repo_owner, repo_name, token, milestone_data):
    """Create a milestone in the specified GitHub repository."""
    url = f"https://api.github.com/repos/{repo_owner}/{repo_name}/milestones"
    headers = {
        "Authorization": f"token {token}",
        "Content-Type": "application/json",
    }
    due_on = process_due_date(milestone_data.get("due_date"))
    payload = {
        "title": milestone_data["title"],
        "description": milestone_data["description"]
    }
    if due_on:
        payload["due_on"] = due_on
    response = requests.post(url, headers=headers, data=json.dumps(payload))
    if response.status_code == 201:
        print(f"Milestone '{milestone_data['title']}' created successfully!")
        return response.json()['number']
    else:
        print(f"Failed to create milestone: {response.status_code}")
        return None

def create_issue(repo_owner, repo_name, token, issue_data, milestone_number):
    """Create an issue in the specified GitHub repository under a milestone."""
    url = f"https://api.github.com/repos/{repo_owner}/{repo_name}/issues"
    headers = {
        "Authorization": f"token {token}",
        "Content-Type": "application/json",
    }
    payload = {
        "title": issue_data["title"],
        "body": issue_data["description"],
        "milestone": milestone_number
    }
    response = requests.post(url, headers=headers, data=json.dumps(payload))
    if response.status_code == 201:
        print(f"Issue '{issue_data['title']}' created successfully!")
    else:
        print(f"Failed to create issue: {response.status_code}")

def create_repo_and_process_milestones_and_issues(repo_name, repo_description, private, token, json_data):
    """Create a GitHub repo and populate it with milestones and issues."""
    repo_link = create_github_repo(repo_name, repo_description, private, token)
    if isinstance(repo_link, dict) and not repo_link['success']:
        return repo_link
    
    repo_owner = get_github_username(token)
    if not repo_owner:
        return {"success": False, "message": "Failed to get GitHub username"}

    data = json.dumps(json_data)

    print(data)

    parsed_data = json.loads(data)

    for milestone_data in parsed_data["milestones"]:
        milestone_number = create_milestone(repo_owner, repo_name, token, milestone_data)
        if milestone_number:
            for issue_data in milestone_data["issues"]:
                create_issue(repo_owner, repo_name, token, issue_data, milestone_number)
        
    return {"success": True, "repo_url": repo_link}

def milestone_and_issue_creator(description: str,
                                features: str,
                                duration: str,
                                hours_per_day: int,
                                tech_stack: Optional[str] = None):
    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": "You are an AI product manager. Generate a project summary, milestones, and issues with "
                           f"step-by-step instructions. Be as technical as you can when generating the milestones and issues." 
                           "Today's date is {datetime.today().strftime('%Y-%m-%d')}"
            },
            {
                "role": "user",
                "content": f"""
    ### Project Description:
    {description}

    ### Features:
    {features}

    ### Expected Project Duration (in weeks):
    {duration}

    ### Number of Hours Per Day the User Will Work:
    {hours_per_day}

    ### Tech Stack (optional):
    {tech_stack}
    """
            }
        ],
        tools=[
            {
                "type": "function",
                "function": {
                    "name": "generate_project_summary",
                    "description": "Takes project details and generates a summary, milestones, and detailed issues with step-by-step instructions.",
                    "parameters": {
                        "type": "object",
                        "required": ["summary", "milestones"],
                        "properties": {
                            "summary": {
                                "type": "string",
                                "description": "Summary of the user's project description and features"
                            },
                            "milestones": {
                                "type": "array",
                                "description": "List of GitHub milestones with their issues",
                                "items": {
                                    "type": "object",
                                    "required": ["title", "description", "due_date", "issues"],
                                    "properties": {
                                        "title": {"type": "string", "description": "Title of the milestone"},
                                        "description": {"type": "string",
                                                        "description": "Brief description of the milestone"},
                                        "due_date": {"type": "string",
                                                     "description": "Estimated due date (YYYY-MM-DD)"},
                                        "issues": {
                                            "type": "array",
                                            "description": "List of GitHub issues under this milestone",
                                            "items": {
                                                "type": "object",
                                                "required": ["title", "description"],
                                                "properties": {
                                                    "title": {"type": "string",
                                                              "description": "Title of the issue/task"},
                                                    "description": {"type": "string",
                                                                    "description": "Step-by-step instructions on how to complete this issue"}
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        ],
        tool_choice={"type": "function", "function": {"name": "generate_project_summary"}}
    )
    tool_call = response.choices[0].message.tool_calls[0]
    return json.dumps(json.loads(tool_call.function.arguments), indent=2)



# print(milestone_and_issue_creator("Create a hookup app", "Find attractive girls nearby and a chat feature to make appointment with them", "4", 6, "React Typescript, Node, and MySQL"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)