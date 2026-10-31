# 0007. Google sign-in with device sessions and a PIN lock

- Status: Accepted
- Date: 2026-10-31

## Context

The app is private to one person and holds their chats. It is used on phones and laptops, so a
lost or unattended device must not expose them, but signing in to Google every time is too slow
for daily use. There is no user database to manage, only the owner.

## Decision

- Sign-in uses Google OAuth. Only the account in the `ALLOWED_EMAIL` setting (with a verified
  email) is let in; anyone else is turned away and nothing is stored.
- A sign-in keeps that device signed in for 15 days. The server keeps a record of each signed-in
  device in Firestore, keyed by a hash of the session cookie, so a device can be cancelled.
- After 30 minutes of inactivity the app locks. A 4-digit PIN, set in the app after the first
  sign-in and stored only as a salted hash, unlocks it. Three wrong PINs in a row sign the device
  out.
- There is one PIN for the owner, shared by all devices. The idle timer and the wrong-PIN count
  are kept per device.
- "Forgot PIN" clears the PIN and signs out every device. Otherwise a device still signed in
  would see "no PIN set" and could set a new one, getting past the lock without a Google sign-in.
- The server is the authority on the lock. A signed-out page load is redirected to `/sign-in`; a
  signed-out API call gets `401` and the app goes to `/sign-in`. A locked device's API calls get
  `403 { code: 'locked' }` and the app shows the PIN screen.

## Consequences

- No passwords to store or reset; Google handles the account and its second factor.
- Signing out or too many wrong PINs delete the device record, which ends that session at once.
  "Forgot PIN" costs one Google sign-in on each device.
- Locking is by idle time only. There is no manual "Lock now", and closing the tab doesn't lock:
  reopening within 30 minutes goes straight in. Both are post-MVP options (see
  `docs/architecture.md` §9).
- A short PIN is enough because it only works on a device that already holds a valid session,
  and three tries end that session.
- Every API request reads the device record, and active use writes `lastActiveAt` (throttled to
  once a minute).
- PIN hashing uses Node's built-in `crypto.scrypt`, so no extra dependency.
- Passkey unlock is a post-MVP option.
- Details: `docs/architecture.md` §4.
