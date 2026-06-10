# Next.js Notes for Job Pilot

This guide covers all Next.js-specific features, APIs, and patterns implemented in the Job Pilot application. It is designed to help you explain the architecture and routing of the project in technical interviews.

---

## 1. Next.js App Router

Next.js uses the **App Router** pattern where routing is based on the directory structure inside the `app/` folder. Any file named `page.tsx` (or `page.jsx`) automatically represents a URL path in the web application.

### File-System Routing Hierarchy in Job Pilot:
* `app/page.tsx` → The landing/welcome redirect page.
* `app/dashboard/page.tsx` → The main Job Dashboard page (renders under `/dashboard`).
* `app/api/jobs/route.ts` → Static API handler for POST operations under `/api/jobs`.
* `app/api/jobs/[id]/route.ts` → Dynamic API handler to update/delete specific jobs under `/api/jobs/[id]`.
* `app/api/webhook/route.ts` → Ingestion API handler specifically for n8n Webhook requests under `/api/webhook`.

### Core Routing Files:
* **`layout.tsx`**: Defines the wrapper shell (HTML structure, fonts, dark-mode providers) shared across pages.
* **`page.tsx`**: Defines the actual UI view rendered for a specific URL route.

---

## 2. Server Components vs. Client Components

Next.js divides components into two main categories to optimize load speed and allow secure database calls:

### Server Components (Default)
By default, all components inside the `app/` directory are Server Components. They execute solely on the Node.js server.
* **Benefits:** They can talk directly to MongoDB without exposing credentials to the client browser. They render static HTML on the server, saving the user's phone/computer CPU cycles.
* **Server Components in this project:**
  * `app/dashboard/page.tsx` — Connects directly to MongoDB, queries the database, converts MongoDB ObjectIds and Dates to serializable strings, and passes them down.

### Client Components (`"use client"`)
If a file starts with the `"use client"` directive, it is bundled and sent to the browser. It runs in the user's browser, allowing browser-specific tasks (like clicking, state, and page sync).
* **Why do we need them?** Server Components cannot use React state (`useState`), side-effects (`useEffect`), next-router navigation, or capture browser events (like button clicks or drag-and-drop actions).
* **Client Components in this project:**
  * `components/jobs/JobDashboard.tsx` — Handles active UI states (filters, search inputs, pagination, view toggles).
  * `components/jobs/KanbanBoard.tsx` — Captures Drag and Drop events (HTML5 DnD API) and status changes.
  * `components/jobs/JobNotesEditor.tsx` — Houses the text editor and controls debounced database saving.
  * `components/theme/ThemeToggle.tsx` — Reads and updates the dark/light mode toggle with `next-themes`.

---

## 3. useRouter

The `useRouter` hook is imported from `next/navigation` (not `next/router` which is the deprecated Pages Router hook). It allows programmatically navigating between paths.

### Usage in this Project:
Used in `components/jobs/JobDashboard.tsx` (Line 48) to dynamically update page URLs when search or filters change:
```typescript
const router = useRouter();
// updates search parameters on filter click
router.push(`/dashboard?status=Interviewing`);
```

### Interview Explanations:
* **`router.push(path)`**: Pushes a new URL entry onto the browser's history stack. The page state changes, and the back button works.
* **`router.replace(path)`**: Replaces the current URL in the browser's history stack. The user cannot go back to the previous search filter with the back button.
* **`router.refresh()`**: Refreshes the data for the current route. Next.js will re-fetch Server Component data without reloading the entire page layout (state remains intact).

---

## 4. useSearchParams

`useSearchParams` is a React hook that reads the current URL's query parameters (everything after the `?` in the URL).

### How it is used in Job Pilot:
In `components/jobs/JobDashboard.tsx`, we read search, status, score, location, view type, and page number directly from the URL rather than React state:
```typescript
const searchParams = useSearchParams();
const currentSearch = searchParams.get("search") || "";
const currentStatus = searchParams.get("status") || "Not Applied";
const currentPage = parseInt(searchParams.get("page") || "1", 10);
```

### Why sync filters with the URL?
1. **Shareable State:** A user can copy the URL (`/dashboard?status=Interviewing&search=React`) and send it to someone else. They will see the exact same filtered state.
2. **Reload Proof:** If the user refreshes the browser page, their current page number, search filters, and layout do not reset to default.
3. **History Navigation:** Clicking the browser back/forward buttons updates the filter UI naturally.

---

## 5. Updating URL Query Params

Instead of managing search inputs and dropdown selections in state, we sync them with the URL using a helper function.

### Code breakdown in `JobDashboard.tsx` (Lines 85-103):
```typescript
const updateParams = useCallback((updates: Record<string, string | null>) => {
  // 1. Convert current URL params into a mutable URLSearchParams object
  const params = new URLSearchParams(searchParams.toString());
  let pageReset = false;
  
  // 2. Loop through the update keys (e.g. { search: "node", page: "1" })
  Object.entries(updates).forEach(([key, value]) => {
    if (value === null || value === "") {
      params.delete(key); // Remove parameter if empty
    } else {
      params.set(key, value); // Set/Overwrite parameter
    }
    if (key !== "page") pageReset = true; // Reset page number to 1 if filter changes
  });

  // 3. Reset pagination page if filter settings were changed
  if (pageReset) {
    params.set("page", "1");
  }

  // 4. Update the browser URL bar
  router.push(`/dashboard?${params.toString()}`);
}, [searchParams, router]);
```

---

## 6. Dynamic Routes and `[id]` Params

Dynamic routes are used when the URL contains variables (like individual database IDs). In Next.js App Router, these folders are named with square brackets: `[id]`.

### Usage in Job Pilot:
* **API File Path:** `app/api/jobs/[id]/route.ts`
* **Route Endpoint:** `/api/jobs/65bc1234...` (where `65bc1234...` is the MongoDB document ID).
* **Code Implementation:**
  ```typescript
  export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
  ) {
    const { id } = await params;
    // Database query uses the ID to delete/update:
    await Job.findByIdAndDelete(id);
  }
  ```

---

## 7. Await Params in next.js

In modern versions of Next.js, `params` and `searchParams` in Page components and Route Handlers are asynchronous. This means they cannot be accessed synchronously; you must `await` them before reading.

### Usage in API:
In `app/api/jobs/[id]/route.ts` (Lines 15 and 47), we use:
```typescript
const { id } = await params;
```
If we try to access `params.id` without `await`, older packages might allow it, but modern Next.js environments will throw a runtime warning or compile error.

---

## 8. Next.js API Routes (Route Handlers)

Next.js allows writing backend code inside `route.ts` files. They act as standalone serverless API endpoints.

### 1. Static API Routes (`app/api/jobs/route.ts`):
* Handles POST requests under `/api/jobs`.
* Used to manually save a new job or update existing ones (upsert check).
* Imports Mongoose model `Job` and database connector.

### 2. Dynamic API Routes (`app/api/jobs/[id]/route.ts`):
* Handles DELETE requests (removes job by id).
* Handles PATCH requests (updates status/notes of a specific job).

---

## 9. `NextResponse.json()`

In Next.js App Router, we return a `NextResponse` object to respond to API requests instead of using standard Express `res.send()` or `res.json()`.

### Implementation:
```typescript
import { NextResponse } from "next/server";

// Success:
return NextResponse.json({ success: true, data: job }, { status: 201 });

// Error:
return NextResponse.json({ error: "Failed to save job" }, { status: 500 });
```
* `NextResponse.json()` takes the data object, stringifies it to JSON, and sets the appropriate header (`Content-Type: application/json`).
* `{ status: 201 }` explicitly sets the HTTP status code (201 = Created, 500 = Server Error, 404 = Not Found).

---

## 10. Request Body Handling

To read data sent by the frontend client (like payload or form data), we parse the stream request body inside API routes using `await req.json()`.

### Code Implementation (`app/api/webhook/route.ts`):
```typescript
export async function POST(req: Request) {
  const jobData = await req.json(); // Parses raw stream to JS Object
  const result = await Job.create(jobData);
}
```
* **Common Pitfall:** Calling `req.json()` on requests that do not have a JSON body (like empty requests or raw text) will throw an error. This is why we always wrap this inside a `try/catch` block.

---

## 11. Serverless Architecture & Connection Reuse

When you deploy a Next.js application (like on Vercel), your API routes do not run on a persistent, running server. Instead, they run on **Serverless Functions** (ephemeral lambdas).

### Serverless Connection Behavior:
* A container boots up to handle the request, and once the request ends, the container goes idle or shuts down.
* If we open a new database connection inside every request handler, the connections accumulate rapidly. MongoDB will quickly reach its maximum concurrent connection limit and crash the site.

### Solution in `lib/mongodb.ts`:
```typescript
if (mongoose.connection.readyState >= 1) return;
await mongoose.connect(MONGODB_URI);
```
Before executing `mongoose.connect()`, we check if the readyState of the active connection is `1` (Connected) or `2` (Connecting). If yes, we skip new connection creation and **reuse** the active connection pool.

---

## 12. Environment Variables in Next.js

Next.js uses `.env` files to store configurations. It enforces a strict boundary between server-side and client-side variables:

* **Client Variables:** Must start with the prefix `NEXT_PUBLIC_` (e.g. `NEXT_PUBLIC_ANALYTICS_ID`). Next.js embeds these in the browser bundle.
* **Server Variables:** Variables without this prefix (like `MONGODB_URI`) are strictly server-side. Next.js guarantees they will never be leaked into the browser Javascript files.
* **Job Pilot variables:**
  * `MONGODB_URI` — Kept server-side for connecting mongoose securely. No client-side exposure.

---

## 13. Deployment Notes

Next.js is designed to deploy seamlessly on Vercel. 
* API handlers in the `/api` folders are mapped to Vercel Serverless Functions.
* The frontend pages are statically rendered where possible and dynamically served where necessary.
* Production secrets (`MONGODB_URI`) are entered in the Vercel dashboard environment variables tab, completely isolated from git version control.
