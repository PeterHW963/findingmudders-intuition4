import os
import json
from dotenv import load_dotenv
from typing import Optional
from openai import OpenAI
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pymongo import MongoClient
from bson import ObjectId

load_dotenv()

openai_client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
mongo_client = MongoClient(os.getenv("MONGO_URI"))

app = FastAPI()

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
                           "step-by-step instructions. "
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