import os
import sys
import json
from fastapi.testclient import TestClient

sys.path.append(os.getcwd())
from main import app

client = TestClient(app)
analysis = {
  'entity_type': 'customers',
  'mapping': {
    'Customer ID': 'external_id',
    'First Name': 'first_name',
    'Last Name': 'last_name',
    'Phone Number': 'phone',
    'Email Address': 'email',
    'City': 'city',
    'Preferred Channel': 'channel_pref'
  }
}
files = {'file': ('sample_customers.xlsx', open('../sample_customers.xlsx', 'rb'), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')}
data = {'analysis': json.dumps(analysis)}
headers = {'X-Org-Id': '3748ae6b-dff9-4596-9db1-fbe440e09d3c'}

try:
    response = client.post('/api/v1/imports/run', files=files, data=data, headers=headers)
    print("Status:", response.status_code)
    print("Text:", response.text)
except Exception as e:
    import traceback
    traceback.print_exc()
