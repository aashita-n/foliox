# TODO: Add "Chat with Bot" Button to Frontend

## Information Gathered:
- `frontend/src/App.jsx` currently only renders `<Dashboard />` with no routing
- `frontend/src/components/AiChat.jsx` already contains the chatbot UI implementation
- `frontend/src/components/dashboard.jsx` is the main dashboard with a top bar
- Need to add routing and a button that navigates to `/ai-chat`

## Plan:

### Step 1: Update `frontend/src/App.jsx` ✅ COMPLETED
- Import React Router components (`BrowserRouter`, `Routes`, `Route`)
- Import `Dashboard` and `AiChat` components
- Set up routing:
  - `/` → renders `Dashboard`
  - `/ai-chat` → renders `AiChat`

### Step 2: Update `frontend/src/components/dashboard.jsx` ✅ COMPLETED
- Import React Router's `Link` component
- Add a "Chat with Bot" button in the top bar next to the FolioX logo
- Button links to `/ai-chat`

## Dependent Files to be Edited:
1. ✅ `frontend/src/App.jsx`
2. ✅ `frontend/src/components/dashboard.jsx`

## Followup Steps:
- Test the button click to ensure it navigates to `/ai-chat`
- Verify the AiChat page loads correctly at `/ai-chat`

