# 0009. Import chats from a Gemini Markdown export only

- Status: Accepted
- Date: 2026-10-31

## Context

The owner has earlier chats on gemini.google.com and wants to continue them in brAIn (FR-15).
gemini.google.com has no export API. A chat can be exported to Google Docs and downloaded as
Markdown, but that format is not documented and can change.

## Decision

- Importing a chat from a Markdown file is in the MVP. The only supported format is a
  gemini.google.com chat exported to Google Docs and downloaded as Markdown.
- An imported chat is an ordinary chat that can be continued; it only adds `importedFrom` to the
  chat document.
- The browser sends the file's text as JSON to `POST /api/chats/import`, up to 1 MB. No
  multipart upload.
- The parser is strict: a file that doesn't match the format is rejected whole.

## Consequences

- No new dependency and no separate upload path; the route keeps the same `Origin` + JSON
  protection as the rest of the API.
- Imported chats need no special handling elsewhere: the chat flow, history and deletion work as
  for any chat.
- A change in Google's format shows up as an import error rather than a half-broken chat, and the
  parser is then updated.
- Other export formats (or other assistants) would each need their own parser.
- The 1 MB limit keeps every message under Firestore's 1 MiB document limit.
- Details: `docs/architecture.md` §5.1.
