# Product Requirements — brAIn

What the app does and for whom. How it is built lives in `docs/architecture.md` and `docs/adr/`.
Open questions are tracked under **Open decisions** in `docs/ROADMAP.md` and referenced here as `OD-n`.

## 1. Vision

brAIn is a private chat app for talking to Google Gemini, similar to gemini.google.com but owned and
hosted by its single user. It keeps every conversation, can search the web when asked, and is
meant to grow into a personal memory: over time it should learn from past chats and use that
knowledge in new ones (post-MVP, see §7).

## 2. User

One person: the owner, who deploys and uses the app. They use it on desktop and mobile browsers
and want:

- a private place to chat with Gemini that nobody else can open;
- every conversation saved, so they can come back to it, continue it or delete it;
- web search when a question needs current facts, and no search when it doesn't.

## 3. Goals and non-goals

### Goals (MVP)

- Only the owner's Google account can use the app.
- Multi-turn chat with Gemini, with formatted (Markdown) answers.
- Conversations are saved and can be listed, resumed and deleted.
- Web search grounding that the user can switch on and off, with sources shown.
- Usable on phone-sized screens.

### Non-goals (MVP)

- More than one user, sign-up or sharing.
- Memory extracted from past chats (planned post-MVP, §7).
- Choosing between models, file or image uploads (post-MVP, §7).
- Native mobile apps.
- Plugins or tools other than web search.

## 4. User journeys

1. **Sign in.** The owner opens the app, signs in with Google, sets a PIN on first use and
   lands on a new chat. Anyone else who signs in is refused.
2. **New chat.** The owner types a question and gets an answer. The chat appears in the
   sidebar with a title.
3. **Continue a chat.** The owner picks a past chat from the sidebar, sees the whole
   conversation and asks a follow-up. The answer takes the earlier messages into account.
4. **Search the web.** The owner turns web search on, asks about something recent and gets an
   answer with links to its sources.
5. **Delete a chat.** The owner deletes a chat, confirms, and it is gone for good.
6. **Unlock after a break.** The owner comes back after more than 30 minutes away. The app is
   locked; they enter their PIN and carry on where they left off.
7. **Sign out.** The owner signs out; the app asks them to sign in with Google again.

## 5. Functional requirements

Each requirement lists acceptance criteria (AC) that a task built from it must meet.

### 5.1 Access

**FR-1 Sign in with Google.**

- AC: A signed-out visitor sees only a "Sign in with Google" screen.
- AC: Signing in with the owner's account opens the app.
- AC: Signing in with any other account shows an "access denied" message and creates no
  session.
- AC: The owner's email is set in configuration, not in code.

**FR-2 Everything is private.**

- AC: Every page and API call except the sign-in and unlock flows requires a signed-in,
  unlocked device.
- AC: How a signed-out or locked request is answered (redirect or `401`) follows OD-4.

**FR-3 Stay signed in, sign out.**

- AC: Signing in with Google signs in that device for 15 days, across browser restarts.
- AC: After 15 days the device is signed out and needs a new Google sign-in.
- AC: Signing out cancels the device's sign-in on the server; the next request needs a new
  Google sign-in.
- AC: Signing in on one device does not sign out the others.

**FR-3a Lock and unlock with a PIN.**

- AC: After the first Google sign-in, the owner must set a 4-digit PIN before using the app.
- AC: The owner can change the PIN from within the app by entering the current one.
- AC: After 30 minutes without activity the app locks and asks for the PIN.
- AC: The correct PIN unlocks the app and returns the owner to where they were.
- AC: After 3 wrong PINs in a row, the device is signed out and needs a new Google sign-in.
- AC: A "Forgot PIN" action signs the device out; after a new Google sign-in the owner sets a
  new PIN.
- AC: A PIN only unlocks a device that is still signed in; it never replaces Google sign-in.
- AC: The PIN is stored only as a secure hash, never as plain text.
- AC: An answer still being produced when the app locks is finished and saved.

### 5.2 Chat

**FR-4 Write a message.**

- AC: The input accepts multiple lines: `Enter` sends, `Shift+Enter` adds a new line.
- AC: Empty or whitespace-only messages can't be sent.
- AC: The input is disabled while an answer is being produced.

**FR-5 Get an answer.**

- AC: The answer is rendered as Markdown: headings, lists, tables, links and code blocks with
  syntax highlighting.
- AC: While waiting, the user sees that an answer is on its way. Whether the text streams in
  or appears at once follows OD-1.

**FR-6 Context across turns.**

- AC: A follow-up that refers to an earlier message ("make it shorter") is answered correctly.
- AC: A chat too long to fit the model's context still gets answers; older turns may be
  dropped, but the app does not fail.

**FR-7 Errors are visible and recoverable.**

- AC: If Gemini fails, times out or hits a quota limit, the user sees a clear error in the
  chat, not a blank or frozen screen.
- AC: The user's message is kept and can be retried with one action.

### 5.3 Conversations

**FR-8 Every chat is saved.**

- AC: Every user message and every answer is saved as soon as it is complete.
- AC: Reloading the page or opening the app on another device shows the same chats and
  messages.

**FR-9 Chat list.**

- AC: A sidebar lists all chats, most recently active first.
- AC: Each chat shows a title, set automatically after the first exchange (how it is made
  follows OD-2).
- AC: On a phone-sized screen the sidebar can be opened and closed.

**FR-10 New chat.**

- AC: A "New chat" action opens an empty chat.
- AC: A chat is only saved once its first message is sent; empty chats never show in the list.

**FR-11 Resume a chat.**

- AC: Selecting a chat shows all its messages in order and lets the user continue it.
- AC: Switching to another chat while an answer is still being produced does not lose that
  answer: it is saved and shown when the user returns.

**FR-12 Delete a chat.**

- AC: Deleting asks for confirmation.
- AC: After confirming, the chat and all its messages are permanently removed and disappear
  from the list.
- AC: If the deleted chat was open, the app switches to a new chat.

### 5.4 Web search

**FR-13 Web search toggle.**

- AC: A visible control switches web search on or off. Whether it applies per chat or per
  message follows OD-3.
- AC: With search off, the model has no web access.

**FR-14 Sources.**

- AC: When an answer used web search, its sources are listed under it as links.
- AC: Sources are saved with the answer and shown again when the chat is reopened.

## 6. Non-functional requirements

- **Security.** API keys and cloud credentials stay on the server and never reach the
  browser. Session cookies can't be read by scripts or sent from other sites.
- **Privacy.** Conversations are stored only in the owner's own Google Cloud project and are
  kept until the owner deletes them.
- **Cost.** The app never calls Gemini without a signed-in owner. Any spending cap follows
  OD-5.
- **Performance.** The app shell loads in under 2 s on a typical connection, after a cold
  start of the server. Opening a chat with 100 messages takes under 1 s once the server is
  running.
- **Devices.** Works in current Chrome, Firefox, Safari and Edge, on screens from 360 px wide.
- **Quality.** Typecheck, lint, format and tests pass in CI on every change (see `AGENTS.md`).

## 7. Post-MVP

- **Personal memory.** Learn from past conversations and use that knowledge in new ones:
  - _memories_: events, experiences and context from the owner's life;
  - _axioms_: findings, rules and principles the owner has arrived at;
  - _links_ between memories and axioms, forming a graph.

  Relevant items are found by meaning (vector search) and given to the model during a chat.

- **Model choice.** Pick between Gemini models (for example Pro or Flash) per chat.
- **Attachments.** Send images, PDFs and audio with a message.
- **Passkey unlock.** Unlock with a passkey (fingerprint, face, Windows Hello) instead of, or as
  well as, the PIN.
