---
name: fyc-architecture
description: >
  findyourcofounder architecture and code patterns — Next.js App Router, data
  fetching, file structure, API calls, authentication, and Selego conventions.
  Use this skill whenever you create a new page, component, API route, or data
  fetch function. Also use when refactoring, adding auth, structuring a new
  feature, or asking "where does this file go?". Triggers on: "add a page",
  "create a server component", "fetch from the API", "add an API route", "handle
  auth", "where should I put this?", or any task involving app structure rather
  than visual styling. Use alongside fyc-ui for full coverage.
---

# findyourcofounder Architecture & Code Patterns

This is the source of truth for all structural decisions in the FYC app.

---

## Stack

- **Next.js 14 App Router** — all routing via `src/app/` directory
- **NextAuth** for authentication (`next-auth`)
- **Radix UI** for accessible primitives (Dialog, etc.)
- **react-hot-toast** for notifications
- **httpService** class for all API calls (see §4)
- **Sentry** for error tracking (config files at project root — do not remove)

---

## File Structure

```
app/src/
  app/
    layout.jsx                  ← global layout: TopBar + Footer + auth Provider
    page.jsx                    ← homepage (founder grid)
    globals.css                 ← base styles and custom utilities
    config.js                   ← APP_COUNTRY and other env-driven config

    api/
      auth/[...nextauth]/
        route.js                ← NextAuth handler — do not reorganise

    components/
      top-bar.jsx               ← global navigation
      footer.jsx                ← global footer
      card.jsx                  ← founder card
      card-modal.jsx            ← founder detail modal (Radix Dialog)
      search-bar.jsx            ← search + filter UI
      ui/                       ← generic reusable primitives
        button.jsx
        pagination.jsx

    utils/
      constants.js              ← skillsColors, BASE_URL, SERVER_BASE_URL

    [page-name]/
      page.jsx                  ← one file per route

  services/
    httpService.js              ← the shared API client (single instance exported)

  lib/
    utils.js                    ← shared utility functions
```

**One file = one concern.** Pages import and compose components. Components handle one UI section. No 500-line files.

---

## Page Pattern (App Router Server Components)

Pages are **async server components** by default. Data fetching happens directly inside the component — there is no `getServerSideProps`.

```jsx
// src/app/page.jsx
import { httpService } from "@/services/httpService";
import { Card } from "@/app/components/card";

export default async function Home({ searchParams }) {
  const getUsers = async () => {
    try {
      const { ok, data } = await httpService.post("/search", {
        search: searchParams.search,
        page: parseInt(searchParams.page) || 1,
        per_page: 50,
      });
      if (!ok) return { users: [], total: 0 };
      return { users: data.users, total: data.total };
    } catch {
      return { users: [], total: 0 };
    }
  };

  const { users, total } = await getUsers();

  return (
    <main>
      {users.map((user) => <Card user={user} key={user._id} />)}
    </main>
  );
}
```

**Rules:**
- Always `async/await` — never `.then()` in page or component code
- Always wrap fetches in try/catch with a sensible fallback return
- Early return on `!ok`
- Never fetch data client-side for content that should be server-rendered (SEO)
- Pass data down as props — pages do not contain business logic

---

## Client Components

Mark with `"use client"` only when the component needs browser APIs, event handlers, or React hooks (`useState`, `useEffect`, `useRouter`, etc.).

```jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { httpService } from "@/services/httpService";

export const SearchBar = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = async () => {
    // push to URL so the server component re-runs with new searchParams
    router.push(`/?search=${query}`);
  };

  return <input type="search" onChange={(e) => setQuery(e.target.value)} />;
};
```

**Rules:**
- Keep client components small and focused
- Prefer server components — only drop to client when genuinely needed
- `useState` + `useEffect` cover 90% of client needs; avoid `useReducer`, `useCallback`, `useMemo` without a documented reason

---

## API Calls — httpService

All API calls go through the shared `httpService` instance from `src/services/httpService.js`. Never initialise a new `Api` class or call `fetch` directly in a component.

```js
import { httpService } from "@/services/httpService";

// GET
const { ok, data } = await httpService.get("/users");

// POST
const { ok, data } = await httpService.post("/search", { search: "amsterdam" });

// PUT
const { ok, data } = await httpService.put(`/${user._id}`, { clicks: user.clicks + 1 });

// DELETE
const { ok } = await httpService.delete(`/${user._id}`);
```

**Rules:**
- Always `async/await` — the service methods currently use `.then()` internally but calling code must use `await`
- Always check `!ok` and return early
- Never filter or sort data on the frontend — put filters in the request body and let the API handle it
- The API base URL comes from `SERVER_BASE_URL` in `utils/constants.js` — never hardcode it

---

## Authentication

NextAuth is the only auth mechanism. Session state is available server-side via `getServerSession` and client-side via `useSession`.

```jsx
// Server component
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const session = await getServerSession(authOptions);
if (!session) redirect("/signin");

// Client component
"use client";
import { useSession, signOut } from "next-auth/react";

const { status, data: session } = useSession();
if (status === "authenticated") { ... }
```

Wrap the entire app in `<Provider>` (the `auth-provider.jsx` component) inside `layout.jsx` — this is already done. Do not add a second provider.

---

## Environment Variables

| Variable | File | Purpose |
|---|---|---|
| `NODE_ENV` | built-in | Switches `SERVER_BASE_URL` between local and production |
| `NEXTAUTH_SECRET` | `.env.local` | NextAuth signing secret |
| `NEXTAUTH_URL` | `.env.local` | Canonical app URL for NextAuth |

All env vars that need to be readable in the browser must be prefixed `NEXT_PUBLIC_`. Never commit `.env.local`.

---

## Routing

| Route | File | Notes |
|---|---|---|
| `/` | `src/app/page.jsx` | Founder grid (server component) |
| `/signup` | `src/app/signup/page.jsx` | Registration form |
| `/signin` | `src/app/signin/page.jsx` | Login |
| `/profile` | `src/app/profile/page.jsx` | Authenticated user's own profile |
| `/contact/[slug]` | `src/app/contact/[slug]/page.jsx` | Public founder profile |
| `/concept` | `src/app/concept/page.jsx` | How it works |
| `/forgot-password` | `src/app/forgot-password/page.jsx` | |
| `/reset-password` | `src/app/reset-password/page.jsx` | |

Dynamic routes follow `src/app/[resource]/[param]/page.jsx`.

New public pages must be added to `src/app/sitemap.js`.

---

## Notifications

Use `react-hot-toast` for all user-facing feedback. Never use `alert()`.

```jsx
import toast from "react-hot-toast";

if (!ok) return toast.error("Something went wrong");
toast.success("Profile updated!");
```

---

## Pre-PR Checklist (Selego §6.8 adapted for FYC)

- [ ] PR covers a single feature or fix
- [ ] New pages added to `sitemap.js` if publicly indexable
- [ ] Data for SEO-critical pages fetched server-side (not in `useEffect`)
- [ ] All API calls go through `httpService` — no raw `fetch` in components
- [ ] `!ok` handled with early return on every API call
- [ ] Client components marked with `"use client"` and kept small
- [ ] No component or page file over ~200 lines
- [ ] No secrets or API URLs hardcoded — use `constants.js` and `.env.local`
- [ ] `.env.local` not committed
