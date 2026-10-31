# 0006. Gemini through the `@google/genai` SDK

- Status: Accepted
- Date: 2026-10-31

## Context

The app is a private chat client for Google Gemini (PRD). It must stream answers and, when the
user turns it on, ground answers in web search results.

## Decision

Call Gemini from the server with Google's `@google/genai` SDK, using an API key from Secret
Manager. Web search uses Gemini's built-in Google Search grounding tool. The model name comes from
the `GEMINI_MODEL` setting.

## Consequences

- `@google/genai` is Google's current, supported SDK for the Gemini API, with streaming and tools
  built in.
- Search grounding needs no separate search API or key, and returns sources the app can show.
- The API key never reaches the browser.
- Changing the model is a config change, not a code change.
- The app is tied to Gemini. The server's `gemini` module wraps the SDK behind a small interface,
  so tests use a fake client (never the real API) and another provider could be added later.
