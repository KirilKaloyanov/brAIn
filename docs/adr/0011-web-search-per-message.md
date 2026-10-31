# 0011. Web search is per message

- Status: Accepted
- Date: 2026-10-31

## Context

Web search grounds an answer in current results (ADR-0006), but it makes a request slower and
costs more than a plain answer, and most messages don't need it. The toggle could apply to a
whole chat or to one message (was OD-3).

## Decision

Web search is chosen per message. The toggle turns off after each send, so every message starts
with search off. Only messages store `webSearch`; the chat document doesn't.

## Consequences

- Search is used only when the owner asks for it, so it can't stay on by accident for a whole
  chat.
- A follow-up that also needs search means turning the toggle on again.
- A retry reuses the `webSearch` value of the message it retries.
- No chat-level setting to store or migrate.
- Details: `docs/architecture.md` §5.
