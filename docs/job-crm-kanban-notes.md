# Job CRM Update: Kanban Board & Job Notes

## What was implemented
1. **Notes Field**: Added a `notes` string field to the MongoDB `Job` model and updated the `/api/jobs/[id]` PATCH route to support partial updates for `notes`.
2. **View Toggle**: Added a toggle at the top of the dashboard to switch between "List View" (default) and "Board View" (Kanban). The view state is synced with the URL query parameter `?view=list` or `?view=board`.
3. **Kanban Board View**: A Trello-style board that groups the *currently filtered jobs* into columns by their `status` (Not Applied, Applied, Interviewing, Offer, Rejected).
4. **Drag & Drop Status Updates**: Users can drag a job card from one column to another. Native HTML5 drag-and-drop is used, triggering an optimistic UI status update immediately. A network request is sent in the background, rolling back if it fails.
5. **Debounced Notes Editor**: A collapsible inline notes editor on each Kanban card allows users to type interview notes. After typing stops for 700ms, the notes are automatically saved to MongoDB. Visual feedback (Saving..., Saved, Error) is provided.

## Files Changed/Added
- `models/Job.ts`: Added `notes` schema field.
- `app/api/jobs/[id]/route.ts`: Allowed `notes` property in the PATCH request body.
- `components/jobs/JobDashboard.tsx`: Added state for `currentView`, added the `<ViewToggle>`, and conditionally rendered the `<KanbanBoard>` while maintaining all previous filters and search functions.
- `components/jobs/KanbanBoard.tsx` (New): The drag-and-drop columns view.
- `components/jobs/KanbanCard.tsx` (Inline in KanbanBoard): Visual rendering of jobs with dragging properties.
- `components/jobs/JobNotesEditor.tsx` (New): Expanding inline text area with debounce save logic.
- `components/jobs/ViewToggle.tsx` (New): A small modular component for switching dashboard layout mode.

## How Status Update & Optimistic Rollback Works
1. When a user drops a card into a new column, the `onStatusChange` function is called immediately from `JobDashboard.tsx`.
2. A shallow copy of `jobs` is made for backup.
3. Local UI state (`jobs`) is instantly mapped so the job has the new status, causing it to snap to the new column immediately.
4. A fetch request (`PATCH`) runs in the background. If it fails, `setJobs(backup)` restores the UI and an error toast is fired.

## How Notes Debounce Save Works
1. In `JobNotesEditor.tsx`, a `useEffect` hook depends on `notes`.
2. Whenever the user types, the `useEffect` fires, but immediately clears the previous timeout.
3. Once the user stops typing for 700ms, the timeout completes and triggers the `PATCH` request.
4. An inline status indicator smoothly shifts from "Saving..." to a green "Saved" checkmark.

## How to Test
**Board View & Filters:**
1. Open the dashboard. You should see the standard List View.
2. Click the **"Board"** button. The URL should update to `?view=board` and columns should appear.
3. Try searching or applying a location filter; the Board should live-update based on the filtered results.

**Drag & Drop (Status Update):**
1. Grab any job card.
2. Drag it into the "Interviewing" or "Applied" column.
3. Ensure it moves instantly and a success toast appears.
4. Verify by refreshing the page; the job should remain in the new column.

**Notes Save:**
1. In Board view, click the **"Add Notes"** button on a card.
2. Type some text (e.g., "Great company, interview on Friday").
3. Stop typing. Within 1 second, you should see "Saving..." then "Saved" appear at the bottom of the card.
4. Refresh the page to verify that the notes persisted.

## Assumptions Made
- We assume that the user does not expect standard table pagination mechanics to limit the Kanban board. We pass `processedJobs` (all filtered jobs) to the Kanban board so they can drag to any status column without items unexpectedly disappearing due to page constraints.
- Native HTML5 Drag and Drop was chosen for its reliability without external dependency bloat, while Framer Motion was used for visual entering/exiting layout transitions.
