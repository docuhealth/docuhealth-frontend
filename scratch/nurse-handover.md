
# Nurse Handover
- The endpoints below are accessible to authenticated Nurses only
- A Nurse can only handover to another Nurse
- A Nurse can only retrieve the handovers they sent out and the ones they've received

## Creating Nurse Handover
- POST request with a valid JSON body should be sent to this endpoint `/api/nurses/in-patient-handover` 
  to create a new Handover. 

  Request Body Structure. All fields are required
  ```json
  {
    "to_nurse_id": "sqid_of_nurse_to_hand_over_to",
    "patient_hin": "hin_of_patient_being_handed_over",
    "general_patient_condition": "string",
    "significant_events": "string",
    "medications_due": "string",
    "outstanding_nursing_tasks": "string",
    "pending_investigations": "string",
    "escalations": "string",
    "recommendations": "string"
  }
  ```


## Retreiving Nurse Handovers
- GET `/api/nurses/in-patient-handovers-recvd`: For getting handovers sent to the authenticated nurse making the request

  Response body shape
  ```json
    {
      "count": 123,
      "next": "http://api.example.org/accounts/?page=4",
      "previous": "http://api.example.org/accounts/?page=2",
      "results": [
        {
          "sqid": "string",
          "from_nurse_info": {
            "staff_id": "string",
            "firstname": "string",
            "lastname": "string",
            "role": "doctor",
            "specialization": "string"
          },
          "patient_info": {
            "hin": "string",
            "firstname": "string",
            "lastname": "string",
            "gender": "male",
            "dob": "2026-08-30"
          },
          "general_patient_condition": "string",
          "significant_events": "string",
          "medications_due": "string",
          "outstanding_nursing_tasks": "string",
          "pending_investigations": "string",
          "escalations": "string",
          "recommendations": "string"
        }
      ]
    }
  ```
- GET `/api/nurses/in-patient-handovers-sent`: For getting handovers sent out by the authenticated nurse making the request

  Response body shape
  ```json
    {
      "count": 123,
      "next": "http://api.example.org/accounts/?page=4",
      "previous": "http://api.example.org/accounts/?page=2",
      "results": [
        {
          "sqid": "string",
          "to_nurse_info": {
            "staff_id": "string",
            "firstname": "string",
            "lastname": "string",
            "role": "doctor",
            "specialization": "string"
          },
          "patient_info": {
            "hin": "string",
            "firstname": "string",
            "lastname": "string",
            "gender": "male",
            "dob": "2026-08-30"
          },
          "general_patient_condition": "string",
          "significant_events": "string",
          "medications_due": "string",
          "outstanding_nursing_tasks": "string",
          "pending_investigations": "string",
          "escalations": "string",
          "recommendations": "string"
        }
      ]
    }
  ```
