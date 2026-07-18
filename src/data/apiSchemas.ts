export interface ApiSchema {
  id: string;
  name: string;
  description: string;
  payload: string;
}

export const API_SCHEMAS: ApiSchema[] = [
  {
    id: 'users',
    name: 'Users',
    description: 'The standard Service Alignment User payload returned from /v1/users. Shows exactly what user details can be exported.',
    payload: `{
  "data": [
    {
      "id": "12345",
      "type": "users",
      "attributes": {
        "created-at": "2026-06-18T15:12:20Z",
        "name": "Jack Luther",
        "title": "CEO",
        "email": "jack.luther@servicealignment.com",
        "phone": "+17328611238",
        "role": "admin",
        "visible": true,
        "hide-email": false,
        "hide-phone": false
      },
      "relationships": {
        "department": { "links": { "related": "..." } },
        "location": { "links": { "related": "..." } }
      }
    }
  ]
}`
  },
  {
    id: 'jobs',
    name: 'Jobs',
    description: 'The standard Service Alignment Job payload returned from /v1/jobs. Contains all posting information and status.',
    payload: `{
  "data": [
    {
      "id": "98765",
      "type": "jobs",
      "attributes": {
        "title": "Senior Frontend Developer",
        "status": "published",
        "created-at": "2026-07-01T10:00:00Z",
        "body": "<p>We are looking for a developer...</p>",
        "tags": ["engineering", "frontend"],
        "internal": false
      },
      "relationships": {
        "department": { "links": { "related": "..." } },
        "location": { "links": { "related": "..." } }
      }
    }
  ]
}`
  },
  {
    id: 'candidates',
    name: 'Candidates',
    description: 'The standard Service Alignment Candidate payload from /v1/candidates (Requires Admin scope API key).',
    payload: `{
  "data": [
    {
      "id": "55555",
      "type": "candidates",
      "attributes": {
        "created-at": "2026-07-05T09:30:00Z",
        "first-name": "Jane",
        "last-name": "Doe",
        "email": "jane.doe@example.com",
        "phone": "+15551234567",
        "tags": ["react", "senior"],
        "sourced": true
      },
      "relationships": {
        "job-applications": { "links": { "related": "..." } },
        "answers": { "links": { "related": "..." } }
      }
    }
  ]
}`
  }
];
