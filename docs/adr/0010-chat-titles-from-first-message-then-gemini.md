# 0010. Chat titles: the first message, then a title from Gemini

- Status: Accepted
- Date: 2026-10-31

## Context

The sidebar lists chats by title, so every chat needs one soon after it starts (was OD-2). The
start of the first message is available at once but often reads poorly as a title. A short
title written by Gemini reads better but costs an extra call that can fail or be slow.

## Decision

After the first exchange, the chat's title is set to the start of the first message. The server
then makes an extra Gemini call for a short title, and replaces the first title if that call
succeeds. A failed title call keeps the first title and shows no error.

## Consequences

- A chat always has a usable title right away, even if the answer or the title call fails.
- One extra, small Gemini call per new chat.
- The title call runs inside the same streaming request as the first answer (ADR-0008), so the
  stream stays open until it ends. The web app may receive two `title` events and shows the last
  one.
- Imported chats skip this step; they take the title from the export (ADR-0009).
- Details: `docs/architecture.md` §5.
