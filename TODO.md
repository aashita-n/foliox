# TODO: Fix "Method Not Allowed" Error for AI Chat

## Issues Identified
1. The `/ai-chat` endpoint internally calls `http://localhost:5000/api/immune/analyze`
2. The Java backend's `ImmuneController` uses `@GetMapping` but the Flask `script.py` uses `methods=["POST"]`
3. CORS headers missing in `script.py`

## Fixes Implemented

### Fix 1: Update ImmuneController.java ✅
- [x] Changed `@GetMapping` to support both GET and POST methods
- [x] Added separate methods for GET and POST that call a common private method

### Fix 2: Add CORS headers to script.py ✅
- [x] Imported CORS support
- [x] Enabled CORS for all routes to allow calls from ai_chat.py

### Fix 3: Verify Vite proxy configuration
- [ ] The Vite proxy already has `/api` pointing to port 8080 (Java backend)

## Testing Steps
1. Run Java backend on port 8080 (`mvn spring-boot:run`)
2. Run Flask script.py on port 5000 (`python script.py`)
3. Run Flask ai_chat.py on port 5001 (`python ai_chat.py`)
4. Start frontend (`npm run dev`)
5. Test the chat functionality by clicking "Chat with Bot"

## Note
The proxy configuration in `vite.config.js` is already correct:
- `/ai-chat` → port 5001 (ai_chat.py)
- `/api` → port 8080 (Java backend)

