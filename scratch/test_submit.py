import requests
import json

url = "http://localhost:5000/api/complaints/submit"
data = {
    "text": "My order #12345 arrived with a broken box and the product inside is leaking. This is extremely urgent as it was a gift.",
    "channel": "web"
}

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
