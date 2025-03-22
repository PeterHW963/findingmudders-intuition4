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
users_collection = db["users"]
projects_collection = db["projects"]

# ----------------------------------------------------------------
# DB Models and Helpers
# ----------------------------------------------------------------

class User(BaseModel):
    username: str
    github_token: str
    projects: list[str] = []

class Project(BaseModel):
    title: str
    description: str
    github_repo_link: str
    owner_id: str

def user_doc_helper(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "github_token": user["github_token"],
        "projects": user.get("projects", [])
    }

def project_helper(project: dict) -> dict:
    return {
        "id": str(project["_id"]),
        "title": project["title"],
        "description": project["description"],
        "github_repo_link": project["github_repo_link"],
        "owner_id": project["owner_id"]
    }

# ----------------------------------------------------------------
# User Endpoints
# ----------------------------------------------------------------



# ----------------------------------------------------------------
# Project Endpoints
# ----------------------------------------------------------------



# ----------------------------------------------------------------
# OpenAI Functions
# ----------------------------------------------------------------

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
