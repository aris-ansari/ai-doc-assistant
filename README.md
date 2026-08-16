# AI Document Workspace

A full-stack AI document assistant that lets authenticated users upload
documents, search their content semantically, and have grounded
conversations with one or multiple documents.

The project combines **Next.js, TypeScript, Node.js/Express, MongoDB
Atlas Vector Search, and Gemini** into a document-based
Retrieval-Augmented Generation (RAG) system.

> **Project status:** Core development is complete.
> Deployment/pre-production work is the next phase.

## Live Demo

🚀 **Live Website:** https://ai-document-workspace.vercel.app

------------------------------------------------------------------------

## Why I Built This

AI assistants are often impressive at answering questions, but a useful
document assistant needs more than a chat interface. It needs to:

-   accept real documents,
-   extract and process their content,
-   convert content into searchable vector representations,
-   retrieve the most relevant passages,
-   ground generated answers in those passages,
-   show users where answers came from,
-   isolate each user's documents,
-   and provide a practical authenticated application around the RAG
    pipeline.

This project was built to understand and implement that complete flow
rather than relying on a hosted "chat with your documents" abstraction.

------------------------------------------------------------------------

## Highlights

-   Full-stack TypeScript application
-   Next.js frontend
-   Node.js + Express + TypeScript backend
-   MongoDB Atlas as the primary database
-   MongoDB Atlas Vector Search for semantic retrieval
-   Gemini API for embeddings and grounded response generation
-   Single-document RAG
-   Multi-document RAG
-   Document filtering
-   Source citations
-   JWT access/refresh authentication
-   HttpOnly authentication cookies
-   Backend-enforced document ownership
-   Upload validation and MIME-type checks
-   Path-traversal protection
-   CORS configuration
-   Centralized environment configuration
-   Light/dark theme support
-   AMOLED-style pure-black dark theme with layered surfaces
-   Responsive mobile UI
-   ChatGPT/Gemini-style chat experience
-   Route-level authentication handling in Next.js
-   Real backend tests for high-value text-processing functionality
-   Production-oriented security review

------------------------------------------------------------------------

## Architecture

``` text
                         ┌─────────────────────┐
                         │      Browser        │
                         │     Next.js UI      │
                         └──────────┬──────────┘
                                    │
                                    │ HTTP / JSON
                                    ▼
                         ┌─────────────────────┐
                         │ Node.js + Express   │
                         │    TypeScript       │
                         │                     │
                         │ Auth / Documents    │
                         │ RAG / Validation    │
                         └───────┬───────┬─────┘
                                 │       │
                   ┌─────────────┘       └─────────────┐
                   │                                   │
                   ▼                                   ▼
          ┌──────────────────┐                ┌──────────────────┐
          │  MongoDB Atlas   │                │    Gemini API    │
          │                  │                │                  │
          │ Documents        │                │ Embeddings       │
          │ Users            │                │ Chat generation  │
          │ Chunks           │                │                  │
          │ Vector Search    │                └──────────────────┘
          └──────────────────┘
```

------------------------------------------------------------------------

## RAG Pipeline

The core document-question-answering pipeline is:

``` text
Upload document
      │
      ▼
Extract text
      │
      ▼
Split text into chunks
      │
      ▼
Generate Gemini embeddings
      │
      ▼
Store chunks + embeddings
in MongoDB Atlas
      │
      ▼
MongoDB Atlas Vector Search
      │
      ▼
Retrieve relevant chunks
      │
      ▼
Build grounded context
      │
      ▼
Gemini generates answer
      │
      ▼
Return answer + source citations
```

### Query-time flow

When a user asks a question:

1.  The backend authenticates the request.
2.  The requested document scope is validated.
3.  The user's document ownership is checked.
4.  The question is converted into an embedding.
5.  MongoDB Atlas Vector Search finds semantically relevant chunks.
6.  Retrieved chunks are used as grounding context.
7.  Gemini generates the answer using the retrieved context.
8.  Source information is returned with the response.

The result is a **grounded RAG response instead of an unrestricted model
response**.

------------------------------------------------------------------------

## MongoDB Atlas Vector Search

The project originally used ChromaDB during development, but the
architecture was migrated to **MongoDB Atlas Vector Search**.

MongoDB Atlas now handles:

-   application data,
-   document metadata,
-   document chunks,
-   embeddings,
-   and vector similarity retrieval.

This keeps the production architecture simpler by avoiding a separate
vector database.

### High-level chunk model

Conceptually, each stored chunk contains information such as:

``` text
document
├── document ownership
├── source document
├── chunk text
├── chunk position
└── embedding vector
```

The vector search index operates on the stored embedding vectors to
retrieve relevant document chunks.

------------------------------------------------------------------------

## Authentication & Authorization

Authentication uses:

-   JWT access tokens
-   JWT refresh tokens
-   HttpOnly cookies
-   backend-controlled authentication and authorization

The backend remains the **actual security authority**.

The frontend route protection improves user experience, but it is not
treated as the security boundary.

### Document ownership

Before document retrieval or RAG operations, the backend verifies that
the authenticated user owns the requested document.

This prevents a user from using a document identifier to retrieve
another user's content.

The project includes cross-user ownership protection at the backend
level.

------------------------------------------------------------------------

## Frontend

The frontend is built with **Next.js + TypeScript**.

Major areas include:

``` text
Home
 ├── Landing experience
 └── Theme support

Authentication
 ├── Login
 └── Register

Dashboard
 ├── Document upload
 ├── Document list
 ├── Document filtering
 └── Document deletion

Chat
 ├── Conversation interface
 ├── Document selection
 ├── Multi-document selection
 ├── Typing indicator
 ├── Auto-growing input
 ├── Enter-to-send
 ├── Shift+Enter for newline
 ├── Copy response
 └── Source citations
```

### Responsive design

The interface was manually tested and adjusted for narrow screens.

Below the mobile breakpoint:

-   navbar becomes a hamburger menu,
-   dashboard documents become mobile-friendly cards,
-   upload areas adapt to narrow widths,
-   chat controls adapt to mobile screens.

------------------------------------------------------------------------

## Theme System

The application supports both light and dark themes.

### Default theme

The default/initial theme is **dark**.

A saved localStorage preference overrides the default for returning
users.

### Dark theme design

The dark theme uses an AMOLED-style hierarchy:

``` text
Page background       #000000
Main surfaces         near-black
Raised surfaces       slightly lighter black
Inputs / controls     layered dark surfaces
Borders               dark neutral gray
Primary text          #FFFFFF
Secondary text        muted gray
```

The goal is to preserve a true-black AMOLED appearance without making
every card, modal, sidebar, and input look like the exact same surface.

------------------------------------------------------------------------

## Chat UX

The chat interface was intentionally designed to feel familiar to users
of modern AI assistants.

Implemented UX improvements include:

-   immediate display of user messages,
-   typing indicator,
-   smooth scrolling,
-   auto-growing textarea,
-   Enter to send,
-   Shift+Enter for multiline input,
-   response copy action,
-   source display,
-   responsive conversation sidebar,
-   mobile navigation,
-   dark/light theme support.

------------------------------------------------------------------------

## Document Processing

The backend processes uploaded documents through a pipeline rather than
sending entire files directly to the model.

``` text
File
 ↓
Validation
 ↓
Text extraction
 ↓
Text splitting
 ↓
Embedding generation
 ↓
Vector storage
```

This makes retrieval more targeted and allows the system to work with
documents that are larger than a single model context window.

------------------------------------------------------------------------

## Security

Security was reviewed across the major application boundaries.

### Authentication

-   JWT-based access/refresh authentication
-   HttpOnly cookies
-   Password handling
-   Backend authentication authority

### Authorization

-   Document ownership validation
-   Cross-user access protection
-   Ownership checks before RAG retrieval

### File handling

-   Upload validation
-   MIME-type validation
-   Path-traversal considerations
-   Controlled upload handling

### Application security

-   CORS configuration
-   Environment-based secrets
-   No committed secret values
-   Backend error handling
-   Git ignore rules for sensitive/local files

### Current production-hardening limitations

Some additional hardening was intentionally left for a future phase:

-   rate limiting,
-   stronger malicious-file scanning,
-   production file-storage strategy.

These were identified during review rather than being hidden or treated
as completed features.

------------------------------------------------------------------------

## Project Structure

The project is organized as a frontend/backend application:

``` text
AI Document Workspace/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── server.ts
│   │
│   ├── test/
│   │   ├── textSplitter.test.ts
│   │   └── documentParser.test.ts
│   │
│   ├── uploads/
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── providers/
│   │   └── proxy.ts
│   │
│   ├── package.json
│   └── .env.example
│
├── .gitignore
└── README.md
```

> Exact internal filenames may evolve as the project continues toward
> deployment.

------------------------------------------------------------------------

## Environment Variables

### Backend

The backend uses environment variables for configuration and secrets.

``` env
PORT=
NODE_ENV=
MONGO_URI=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=
JWT_REFRESH_EXPIRES_IN=
GEMINI_API_KEY=
CLIENT_URL=
GEMINI_EMBEDDING_MODEL=
GEMINI_EMBEDDING_DIMENSIONS=
GEMINI_CHAT_MODEL=
DNS_SERVERS=
```

### DNS configuration

`DNS_SERVERS` is optional.

It was introduced as an environment-controlled configuration because
local development on the author's network required an explicit DNS
resolver for MongoDB Atlas SRV resolution.

Example local configuration:

``` env
DNS_SERVERS=8.8.8.8
```

The application does not require this variable when the normal
environment DNS resolver works correctly.

**Secrets must never be committed to Git.**

### Frontend

The frontend uses:

``` env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

For production, this will point to the deployed backend API.

Only public configuration belongs in `NEXT_PUBLIC_*` variables. Secrets
remain on the backend.

------------------------------------------------------------------------

## Local Development

### Prerequisites

Install:

-   Node.js
-   npm
-   MongoDB Atlas account
-   Gemini API access

The application uses MongoDB Atlas for both normal database storage and
vector search.

No separate vector database is required.

### Backend

``` bash
cd backend
npm install
```

Create a `.env` file using the required backend environment variables.

Then run:

``` bash
npm run dev
```

### Frontend

``` bash
cd frontend
npm install
```

Create `.env.local`:

``` env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

Then run:

``` bash
npm run dev
```

The frontend and backend can then be run together during development.

------------------------------------------------------------------------

## Testing

The project intentionally follows a **lightweight testing philosophy**.

The goal is not to create a huge test suite for every function.

Instead, a small number of high-value real tests cover important
document-processing behavior.

Current tests include:

-   text splitting,
-   document parsing.

The project currently has **7 passing tests**.

Run:

``` bash
npm test
```

The backend build can be checked with:

``` bash
npm run build
```

Manual verification remains important for flows such as:

-   authentication,
-   document upload,
-   document deletion,
-   single-document RAG,
-   multi-document RAG,
-   document filtering,
-   source citations,
-   responsive UI,
-   theme switching.

------------------------------------------------------------------------

## Verified Functionality

The following functionality has been implemented and verified during
development:

-   [x] Document upload
-   [x] Document processing
-   [x] Gemini embeddings
-   [x] MongoDB vector storage
-   [x] MongoDB Atlas Vector Search
-   [x] Single-document RAG
-   [x] Multi-document RAG
-   [x] Document filtering
-   [x] Source citations
-   [x] Document ownership validation
-   [x] JWT authentication
-   [x] Refresh authentication
-   [x] HttpOnly cookies
-   [x] Cross-user ownership protection
-   [x] Responsive UI
-   [x] Dark/light theme
-   [x] Chat UX improvements
-   [x] Route-level authentication handling
-   [x] Backend build
-   [x] Lightweight real tests
-   [x] Practical security review
-   [x] Git checkpoints throughout development

------------------------------------------------------------------------

## Authentication Routing

The frontend uses route-level authentication handling.

### Logged out

``` text
/            → Home
/login       → Login
/register    → Register
/dashboard   → /login
/chat        → /login
```

### Logged in

``` text
/            → /dashboard
/login       → /dashboard
/register    → /dashboard
/dashboard   → Dashboard
/chat        → Chat
```

The backend remains responsible for actual authorization.

------------------------------------------------------------------------

## Production Deployment

The application is deployed using the following production architecture:

```text
┌─────────────────────────────┐
│          Vercel             │
│       Next.js frontend      │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│          Render             │
│    Node + Express backend   │
└──────────────┬──────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
┌─────────────┐   ┌─────────────┐
│ MongoDB     │   │ Gemini API  │
│ Atlas       │   │             │
└─────────────┘   └─────────────┘
```

Production configuration includes:

- Vercel-hosted Next.js frontend
- Render-hosted Node.js/Express backend
- MongoDB Atlas database and Vector Search
- Gemini API for embeddings and response generation
- Production frontend/backend environment variables
- Production CORS configuration
- MongoDB Atlas network access configuration
- Production authentication verification
- Production document upload and processing verification
- Production RAG and source-citation verification
- Responsive/mobile production verification

The application uses environment-based configuration so local development settings and production settings remain separate.

## MongoDB Atlas Network Access

For local development, the development machine's IP can be allowed in
MongoDB Atlas Network Access.

For production, the deployed backend's outbound IP/network access must
be configured appropriately.

Avoid opening MongoDB Atlas to the entire internet with:

``` text
0.0.0.0/0
```

unless there is a specific temporary requirement and the security
implications are understood.

------------------------------------------------------------------------

## Production File Storage

The current application uses local backend upload storage during
development.

This is suitable for local development but is a deployment consideration
because application instances on many cloud platforms should not be
treated as permanent file storage.

A production storage strategy will therefore be addressed before
treating deployment as complete.

Possible future approaches include object storage, depending on the
final deployment requirements.

------------------------------------------------------------------------

## Design Decisions

### Why MongoDB Atlas Vector Search?

MongoDB Atlas was already part of the application's data architecture.

Using Atlas Vector Search means:

-   document metadata and vector data remain together,
-   fewer infrastructure components are required,
-   retrieval can be performed directly against MongoDB,
-   deployment is simpler than maintaining a separate vector database.

### Why Gemini?

Gemini provides the model capabilities used for:

-   document embeddings,
-   grounded response generation.

This keeps the embedding and generation workflow within the same model
provider.

### Why backend authorization instead of frontend-only protection?

Frontend route protection improves navigation and user experience, but
it cannot be trusted as the security boundary.

The backend validates authentication and document ownership before
sensitive operations.

### Why lightweight tests?

The project prioritizes meaningful confidence over a large test suite.

Core behavior is covered with a small number of real tests, while
already-verified end-to-end flows are also manually tested.

------------------------------------------------------------------------

## Production Hardening Roadmap

The following improvements are recognized but intentionally not part of
the completed development scope:

-   Rate limiting
-   Stronger malicious-file scanning
-   Production object storage
-   Additional operational monitoring
-   Production logging/observability
-   Further abuse protection
-   Automated deployment checks

These can be added as the project moves from portfolio/development
deployment toward a more hardened production service.

------------------------------------------------------------------------

## What This Project Demonstrates

This project is intended to demonstrate practical full-stack AI
engineering rather than only API usage.

It combines:

**Frontend engineering**

-   Next.js
-   TypeScript
-   responsive design
-   authentication UX
-   theme systems
-   interactive chat UI

**Backend engineering**

-   Node.js
-   Express
-   TypeScript
-   REST-style API design
-   middleware
-   authentication
-   authorization
-   file processing

**AI engineering**

-   embeddings
-   vector search
-   retrieval-augmented generation
-   grounded prompting
-   source attribution
-   multi-document retrieval

**Database engineering**

-   MongoDB Atlas
-   document storage
-   vector storage
-   Atlas Vector Search
-   document ownership relationships

**Security engineering**

-   JWT authentication
-   HttpOnly cookies
-   authorization checks
-   file validation
-   CORS
-   secret management
-   path-traversal considerations

**Deployment engineering**

-   environment-based configuration
-   production architecture planning
-   cloud deployment preparation
-   production database access planning

------------------------------------------------------------------------

## Future Improvements

Potential future work includes:

-   streaming model responses,
-   richer citation UI,
-   conversation persistence,
-   document previews,
-   more document formats,
-   background processing for large documents,
-   production object storage,
-   rate limiting,
-   stronger file security scanning,
-   observability and metrics,
-   automated CI/CD,
-   more advanced retrieval strategies,
-   reranking,
-   evaluation datasets for RAG quality.

These are intentionally separated from the current implementation so the
core product remains understandable and maintainable.

------------------------------------------------------------------------

## Project Status

### Development

**Completed**

The core application functionality has been implemented, tested, manually verified, and prepared for production.

### Production

**Deployed**

The production frontend and backend are deployed using the documented cloud architecture, with production configuration and verification completed.

### Learning / Documentation

The next planned phase is a deep walkthrough of the entire project, including:

- frontend architecture,
- backend architecture,
- authentication,
- document processing,
- embeddings,
- MongoDB Vector Search,
- RAG retrieval,
- Gemini grounding,
- source citations,
- deployment architecture,
- and security decisions.

## Author Notes

This project was built incrementally with an emphasis on understanding
the architecture rather than adding unnecessary technologies.

A key architectural decision was migrating from ChromaDB to MongoDB
Atlas Vector Search, resulting in a simpler production architecture with
MongoDB handling both application data and vector retrieval.

The project also deliberately avoids over-engineering the testing layer:
a small set of high-value tests is combined with manual verification of
complete user workflows.

------------------------------------------------------------------------

## License

Add the project's chosen license here before public release.

If this repository is intended as a portfolio project, consider adding
an explicit open-source license such as MIT if you want others to be
able to reuse the code.
