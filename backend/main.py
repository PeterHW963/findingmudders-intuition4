import os
import openai
import json
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

openai.api_key = os.getenv('OPENAI_API_KEY')


def milestone_and_issue_creator(description: str,
                                features: str,
                                duration: int,
                                hours: int,
                                tech_stack: Optional[str] = None):
    response = openai.ChatCompletion.create(
        model="gpt-4-0613",
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
    {hours}
    
    ### Tech Stack (optional):
    {tech_stack}
    """
            }
        ],
        functions=[
            {
                "name": "generate_project_summary",
                "description": "Takes project details and generates a summary, milestones, and detailed issues with step-by-step instructions.",
                "strict": False,
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
                                    "due_date": {"type": "string", "description": "Estimated due date (YYYY-MM-DD)"},
                                    "issues": {
                                        "type": "array",
                                        "description": "List of GitHub issues under this milestone",
                                        "items": {
                                            "type": "object",
                                            "required": ["title", "description"],
                                            "properties": {
                                                "title": {"type": "string", "description": "Title of the issue/task"},
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
        ],
        function_call={"name": "generate_project_summary"}
    )

    return json.dumps(response['choices'][0]['message']['function_call']['arguments'], indent=2)

