# AI Document Workspace - Frontend

The frontend for **AI Document Workspace**, a full-stack document-based RAG assistant built with **Next.js, TypeScript, and the Next.js App Router**.

The frontend provides the user-facing experience for authentication, document management, AI chat, document selection, source citations, and theme switching. The backend remains responsible for authentication, authorization, document processing, RAG retrieval, and AI generation.

## Features

### Authentication

* Login and registration interfaces
* Authenticated route handling
* Redirects based on authentication state
* HttpOnly-cookie-based authentication through the backend
* Responsive authentication pages

### Dashboard

* Document upload through drag-and-drop or file picker
* PDF, DOCX, and TXT upload support
* Client-side file-size and MIME-type validation
* Optional document titles
* Upload progress state
* Document status display
* Processing-state polling
* Manual document refresh
* Document metadata
* Document deletion with confirmation
* Loading, empty, and error states
* Responsive mobile document layout

### AI Chat

* ChatGPT/Gemini-style conversation interface
* Single-document and multi-document selection
* Immediate user-message display
* Typing indicator
* Smooth automatic scrolling
* Auto-growing message input
* `Enter` to send
* `Shift + Enter` for newline
* Copy assistant responses
* Source citation display
* Responsive conversation sidebar
* Mobile navigation

### Theme System

The application supports both light and dark themes.

The default theme is **dark**, using an AMOLED-style visual hierarchy:

* Pure black page background
* Near-black cards and panels
* Slightly raised dark surfaces
* Neutral borders
* White primary text
* Muted secondary text

The light theme remains available through the theme toggle.

The user's selected theme is stored in `localStorage` and overrides the default theme for returning users.

### Responsive Design

The interface is optimized for desktop and mobile layouts.

On narrow screens:

* Navigation becomes a hamburger menu
* Document lists adapt into mobile-friendly cards
* Upload areas adapt to smaller widths
* Chat controls resize for mobile use
* Conversation navigation remains accessible

## Tech Stack

* **Next.js**
* **React**
* **TypeScript**
* **Next.js App Router**
* CSS / Tailwind-based utility styling
* Browser `localStorage` for theme preference

The frontend communicates with the Node.js/Express backend through the configured API URL.

## Project Structure

```text
frontend/
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   ├── chat/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── auth/
│   │   ├── chat/
│   │   ├── documents/
│   │   └── ui/
│   │
│   ├── providers/
│   │   └── themeProvider.tsx
│   │
│   └── proxy.ts
│
├── .env.example
├── package.json
└── README.md
```

## Authentication Routing

The frontend handles route-level authentication behavior for a better user experience.

### Logged out

```text
/            → Home
/login       → Login
/register    → Register
/dashboard   → /login
/chat        → /login
```

### Logged in

```text
/            → /dashboard
/login       → /dashboard
/register    → /dashboard
/dashboard   → Dashboard
/chat        → Chat
```

This frontend routing is **not the security boundary**. The backend independently validates authentication and document ownership.

## Environment Configuration

Create `.env.local` from `.env.example`.

For local development:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

For production, this variable points to the deployed backend API.

Only public configuration should be exposed through `NEXT_PUBLIC_*` variables. Backend secrets such as database credentials, JWT secrets, and Gemini API keys must never be placed in the frontend environment.

## Local Development

Install dependencies:

```bash
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

Start the development server:

```bash
npm run dev
```

The backend must also be running at the configured API URL.

## Production

The frontend is deployed as part of the project's production architecture using **Vercel**.

The production frontend communicates with the deployed Node.js/Express backend rather than the local development server.

Production configuration should be supplied through the hosting platform's environment-variable settings rather than committing environment files containing deployment-specific values.

## Backend Relationship

The frontend is responsible for the user experience, while the backend remains responsible for:

* Authentication
* Authorization
* Document ownership
* File processing
* Text extraction
* Text chunking
* Gemini embeddings
* MongoDB Atlas Vector Search
* RAG retrieval
* Gemini response generation
* Source citation generation

High-level flow:

```text
Next.js Frontend
       │
       │ API requests
       ▼
Node.js / Express Backend
       │
       ├── MongoDB Atlas
       ├── MongoDB Atlas Vector Search
       └── Gemini API
```

## Development Philosophy

The frontend was developed with an emphasis on:

* Simple component structure
* Reusable UI components
* Responsive behavior
* Practical authentication UX
* Clear loading and error states
* Minimal unnecessary dependencies
* Consistent light/dark theme behavior
* Manual verification of important user flows

The frontend is intentionally kept focused on presentation and user interaction rather than duplicating backend security or RAG responsibilities.

## Project Status

**Completed and deployed.**

The frontend's core authentication, dashboard, document-management, chat, responsive-design, and theme functionality has been implemented and verified as part of the complete AI Document Workspace application.