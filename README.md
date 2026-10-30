# Ian & Riley's Wedding Website

![Ian & Riley](/public/images/happyCouple.jpeg)

Our wedding website is built with Astro, React, and Vercel. The site includes a guest authentication flow, RSVP collection, countdown timer, gallery, and a polished event landing page for our wedding weekend.

## Overview

This project is a wedding website for Ian and Riley, with a secured guest experience:

- Guest sign-in using a phone number and invitation code
- Session-based access to private event content
- RSVP submission for invited guests
- Wedding date and venue details
- Countdown to the event
- Photo gallery and event timeline
- Vercel-ready Astro configuration

## Tech stack

- Astro
- React
- TypeScript
- Vercel
- Google Apps Script for RSVP/authentication backend

## Prerequisites

- Node.js 20 or later
- npm 10 or later

## Local setup

1. Clone the repository:

   ```bash
   git clone git@github.com:rcfroomin/wedding.git
   cd wedding
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a local environment file:

   ```bash
   touch .env.local
   ```

4. Add the required environment variables:

   ```env
   SESSION_SECRET=<64-character hexadecimal string>
   RSVP_SCRIPT_URL="https://script.google.com/macros/s/AKfycbyINeNWZxm-9H1GA0oOX4IVFbsojPCMJrBDM46N5WW97f-8UWdSgWFNL7-CF5OhUwhG/exec"
   RSVP_API_SHARED_SECRET=<shared-secret>
   ```

   Notes:
   - `SESSION_SECRET` must be a 64-character hexadecimal value (32 bytes). The app validates it with a strict regex.
   - `RSVP_SCRIPT_URL` is the endpoint used by the app for authentication and RSVP submission.
   - `RSVP_API_SHARED_SECRET` is the shared secret used by the Google Apps Script backend.

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open the site in your browser:

   ```text
   http://localhost:4321
   ```

## Available scripts

```bash
npm run dev
```
Runs the Astro site in development mode.

```bash
npm run build
```
Builds the production site.

```bash
npm run preview
```
Serves the production build locally for previewing.

## Project structure

```text
.
├── public/
│   └── images/
├── src/
│   ├── components/
│   ├── data/
│   ├── layouts/
│   ├── lib/
│   ├── pages/
│   └── styles/
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── .gitignore
├── README.md
└── .env.local
```

Key files:

- `src/data/wedding.ts` — wedding metadata ex. names, date, venue, and RSVP deadline
- `src/pages/index.astro` — main site page and content sections
- `src/lib/auth.ts` — guest session creation and validation
- `src/lib/appsScript.ts` — backend service integration for RSVP/authentication
- `src/pages/api/auth.ts` — login endpoint for guest authentication
- `src/pages/api/rsvp.ts` — RSVP submission endpoint

## Customization

### Wedding details
Update the site content in `src/data/wedding.ts`:

```ts
export const wedding = {
  couple: {
    partner1: "Riley",
    partner2: "Ian",
  },
  date: {
    display: "July 1, 2028",
    iso: "2028-07-01T16:00:00-07:00",
  },
  venue: {
    name: "Merrywood Farm",
    city: "Oregon City",
    state: "Oregon",
  },
  contact: {
    email: "hello@example.com",
  },
  rsvp: {
    deadline: "July 1, 2027",
  },
};
```

### Site copy and layout
Main page content and sections live in `src/pages/index.astro`.

### Styling
The visual theme and custom styles are in `src/styles/global.css`.

### Photos
Add or replace gallery and hero images in `public/images/`.

## Guest authentication and RSVP flow

This project includes a private guest experience:

1. Guests enter a phone number and invitation code
2. The app sends those credentials to the configured Google Apps Script URL
3. If authenticated, the app creates an encrypted session cookie
4. Authenticated guests can view the site and submit RSVP responses
5. RSVP answers are validated and forwarded to the backend service

This flow is implemented in:

- `src/pages/api/auth.ts`
- `src/pages/api/rsvp.ts`
- `src/lib/auth.ts`
- `src/lib/appsScript.ts`

## Deployment

This project is configured for Vercel.

To deploy:

1. Push the repository to GitHub
2. Import the project into Vercel
3. Add the same environment variables in the Vercel project settings:
   - `SESSION_SECRET`
   - `RSVP_SCRIPT_URL`
   - `RSVP_API_SHARED_SECRET`
4. Deploy the app

## Notes

- The project uses an Astro server output configuration.
- A secure `SESSION_SECRET` is required for guest session cookies.
- The RSVP backend is handled through this [Google Apps Script](https://script.google.com/u/0/home/projects/1lEqIhy9RwSSBxnbJCMixSUDd-YpDgNjv0MpZ8Mq-fN48zUHpaL-vJW3w)
