Content Contract (CMS ⇄ API)

This document defines the canonical payload shapes for content blocks and topic content responses. It should be treated as the source of truth for the CMS and learner UI.

Topic Content Response
GET /topics/:slug/content

Response
{
  "topic": { "slug": "string", "title": "string" },
  "blocks": [
    { "type": "intro", "data": { "title": "string", "description": "string" } },
    { "type": "code", "data": { "language": "string", "code": "string" } },
    { "type": "accordion", "data": { "items": [ { "title": "string", "description": "string" } ] } },
    { "type": "checklist", "data": { "items": [ { "title": "string", "description": "string" } ] } },
    { "type": "pitfalls", "data": { "items": [ { "title": "string", "description": "string" } ] } },
    { "type": "resources", "data": { "items": [ { "title": "string", "url": "string" } ] } }
  ]
}

Block Types

Intro
{
  "type": "intro",
  "data": {
    "title": "string",
    "description": "string"
  }
}

Code
{
  "type": "code",
  "data": {
    "language": "string",
    "code": "string"
  }
}

Accordion
{
  "type": "accordion",
  "data": {
    "items": [
      { "title": "string", "description": "string" }
    ]
  }
}

Checklist
{
  "type": "checklist",
  "data": {
    "items": [
      { "title": "string", "description": "string" }
    ]
  }
}

Pitfalls
{
  "type": "pitfalls",
  "data": {
    "items": [
      { "title": "string", "description": "string" }
    ]
  }
}

Resources
{
  "type": "resources",
  "data": {
    "items": [
      { "title": "string", "url": "string" }
    ]
  }
}

Validation Semantics
- All blocks are validated server-side before save and before content delivery.
- If any block fails validation, the operation fails (no partial results).
- Block types outside this contract are rejected.
