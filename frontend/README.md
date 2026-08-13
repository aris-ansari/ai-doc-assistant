# AI Document Workspace — Frontend

Next.js App Router frontend for the AI Document Assistant.

## Phase 8 — Document Management

The dashboard now supports:

- PDF, DOCX, and TXT drag-and-drop/file-picker uploads
- Client-side 10 MB file-size and MIME validation
- Optional document titles
- Upload progress state
- Document list backed by the Express API
- Pending/processing/completed/failed status badges
- Automatic polling while documents are processing
- Manual document refresh
- Document size and upload date metadata
- Failed-processing error display
- Delete confirmation dialog
- Deletion through the authenticated backend API
- Empty, loading, and error states

## Local setup

Create `.env.local` from `.env.example`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

Install dependencies and start the app:

```bash
npm install
npm run dev
```

The backend must be running at the configured API URL.
