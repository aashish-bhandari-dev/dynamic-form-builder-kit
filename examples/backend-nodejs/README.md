# Standalone Node.js Backend Example

A zero-dependency, ready-to-run Node.js REST API backend for **`dynamic-form-builder-kit`**.

## How to Run

No `npm install` needed! Runs directly with Node.js 18+:

```bash
node server.js
```

The server will start on `http://localhost:5000` with CORS configured for `http://localhost:3000` (Next.js default).

## Available Endpoints

- `GET /api/forms` - List all forms
- `POST /api/forms` - Create a new form schema
- `GET /api/forms/:id` - Get a form schema by ID
- `PUT /api/forms/:id` - Update a form schema
- `DELETE /api/forms/:id` - Delete a form
- `POST /api/forms/:id/submissions` - Submit responses for a form
- `GET /api/forms/:id/submissions` - Retrieve submitted responses for a form

For the full TypeScript/Express architecture with MongoDB and PostgreSQL/Prisma, see [BACKEND_IMPLEMENTATION.md](../../BACKEND_IMPLEMENTATION.md).
