import requests
import json


def create_github_repo(repo_name, description, private, token):
    """
    Creates a new Github Repository for the user.

    :param repo_name: New name of Repository
    :param description: Description for new Repository
    :param private: True if private repo and False if public repo
    :param token: GitHub Personal Access Token
    :return: If successful, returns URL. Else, returns {'success': False, 'status_code': 422, 'error_messages': [...]}
    """
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
        repo_info = response.json()
        print(repo_info['html_url'])
        return repo_info['html_url']
    else:
        error_info = response.json()
        if 'errors' in error_info:
            error_messages = [error['message'] for error in error_info['errors']]
            return {
                "success": False,
                "status_code": response.status_code,
                "error_messages": error_messages
            }
        else:
            return {
                "success": False,
                "status_code": response.status_code,
                "message": error_info.get('message', 'Unknown error')
            }


print(create_github_repo("gay", "more gay2", True, "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"))
