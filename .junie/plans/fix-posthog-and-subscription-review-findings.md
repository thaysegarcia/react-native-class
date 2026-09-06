---
sessionId: session-260906-125952-mslg
---

# Requirements

### Overview & Goals
Address and resolve code review findings across PostHog analytics integration, authentication lifecycle tracking, privacy compliance in search telemetry, and subscription cancellation UI state handling in the React Native Expo app.

### Scope
- **In Scope**:
  - Host URL validation in `lib/posthog.ts` (enforcing HTTPS in release builds and permitting HTTP only on `localhost` during development).
  - Calling `posthog?.reset()` on user sign-out / unauthenticated state in `app/_layout.tsx`.
  - Sanitizing `subscription_searched` event in `app/(tabs)/subscriptions.tsx` to send non-content metrics (`query_length`, `has_query`) instead of raw search strings.
  - Adding `subscription_id` and `subscription_name` to `subscription_details_toggled` tracking in `app/(tabs)/index.tsx`.
  - Managing subscription cancellation state (`isCancelling`), updating subscription status only on success, and preventing premature success alerts in `app/(tabs)/subscriptions.tsx` and `app/(tabs)/index.tsx`.
  - Updating references in `.claude/skills/integration-react-native/references/react-native.md` (`disabled` option, `PostHog.initAsync` capitalization, clean `posthog.unregister`).
- **Out of Scope**:
  - Modifying external PostHog backend dashboards or Clerk configuration.
  - Redesigning UI components outside the specified review feedback.

### User Stories
- As a user, I want my search queries to remain private so that sensitive personal text is not logged in analytics.
- As a user, I want accurate feedback when cancelling a subscription so that I know the cancellation is pending and only confirmed when finished.
- As a developer, I want PostHog host configuration validated securely to prevent sending analytics over insecure HTTP in production.
- As a developer, I want user tracking sessions to properly reset when logging out to avoid attribution mix-ups across accounts.

# Technical Design

### Current Implementation
- `lib/posthog.ts`: Directly passes `host` to `new PostHog(projectToken, { host, ... })` without verifying whether `host` is valid or uses HTTPS.
- `app/_layout.tsx`: `IdentifyUser` clears `identifiedUserId.current = undefined` when `!user` but does not invoke `posthog.reset()`, leaving cached distinct IDs active.
- `app/(tabs)/subscriptions.tsx`: Emits raw `query: text.trim()` on `subscription_searched`, exposing user input. When confirming cancellation, it immediately triggers `Alert.alert("Subscription Cancelled", ...)` without updating subscription state or passing `isCancelling` to `SubscriptionCard`.
- `app/(tabs)/index.tsx`: Emits `subscription_details_toggled` without `subscription_id` and `subscription_name`, diverging from `subscriptions.tsx`. Cancellation also displays immediate success alert.
- `.claude/skills/.../react-native.md`: Mentions `disable` instead of `disabled` in prose, and `Posthog.initAsync` with incorrect capitalization.

### Key Decisions
1. **Host Validation Strategy in `lib/posthog.ts`**:
   - Parse `host` with `URL` constructor.
   - In production (`!__DEV__`), enforce `protocol === "https:"`. If invalid, log warning or fail creation.
   - In development (`__DEV__`), allow `protocol === "https:"` or (`protocol === "http:"` when hostname is `localhost` or `127.0.0.1`).
2. **Search Telemetry Privacy**:
   - Change `subscription_searched` payload from `{ query: text.trim() }` to `{ has_query: true, query_length: text.trim().length }`.
3. **Cancellation State & Feedback**:
   - Manage `cancellingId` in `subscriptions.tsx` and pass `isCancelling={cancellingId === item.id}` to `SubscriptionCard`.
   - Update subscription state (or status to `'cancelled'`) upon cancellation completion before showing the confirmation alert.

### Architecture Diagram
```mermaid
graph TD
    A[User Sign-Out / No User] -->|Trigger Reset| B[PostHog Client: posthog.reset()]
    C[Search Input Change] -->|Sanitize Telemetry| D[subscription_searched: query_length, has_query]
    E[Subscription Card Cancel Click] -->|Set isCancelling| F[Cancellation Handler]
    F -->|Update Status / State| G[Success Alert]
    H[PostHog Init] -->|Validate URL Protocol| I{HTTPS or Dev Localhost?}
    I -->|Valid| J[Initialize PostHog SDK]
    I -->|Invalid| K[Reject / Error in DEV]
```

### File Structure & Changes
- `lib/posthog.ts`: Add host URL validation helper and enforce secure protocols.
- `app/_layout.tsx`: Call `posthog?.reset()` in `IdentifyUser` when `!user`.
- `app/(tabs)/subscriptions.tsx`: Sanitize `subscription_searched` event; add `isCancelling` and local state update for cancellation flow.
- `app/(tabs)/index.tsx`: Include `subscription_id` and `subscription_name` in `subscription_details_toggled`; prevent premature cancellation alerts.
- `.claude/skills/integration-react-native/references/react-native.md`: Correct typo in `disabled` option, casing on `PostHog.initAsync`, and verify `posthog.unregister`.

# Testing

### Validation Approach
Verify the changes using static type checking (`tsc --noEmit`), linter (`npm run lint`), and code inspection of all modified event schemas and validation logic.

### Key Scenarios
1. **Host URL Validation**:
   - Test with `https://us.i.posthog.com` -> Valid.
   - Test with `http://localhost:8000` in `__DEV__` -> Valid.
   - Test with `http://insecure-host.com` in production -> Rejected.
2. **User Logout / Switch**:
   - When `user` becomes null/undefined, verify `posthog.reset()` is invoked and `identifiedUserId.current` is cleared.
3. **Subscription Search Analytics**:
   - Typing in search box triggers `subscription_searched` with `query_length` and `has_query`, without raw query string.
4. **Subscription Details Toggle**:
   - Toggling card expansion on Home screen captures `subscription_id`, `subscription_name`, `expanded`, `billing_frequency`, `category`.
5. **Subscription Cancellation**:
   - Tapping confirm cancellation activates `isCancelling` pending state, updates subscription state, and shows success alert only after completion.

### Regressions to Prevent
- TypeScript compilation errors or breaking existing `SubscriptionCardProps`.
- Crashes when PostHog is disabled or unconfigured (`posthog` is undefined).

# Delivery Steps

### ✓ Step 1: Implement PostHog host validation, user reset lifecycle, and documentation fixes
The PostHog client securely validates host URLs and properly handles user logouts and documentation examples.

- In `lib/posthog.ts`, implement host URL validation requiring HTTPS in production/release builds, and permitting HTTP only for `localhost` or `127.0.0.1` in development mode (`__DEV__`).
- In `app/_layout.tsx`, update the `IdentifyUser` component to call `posthog?.reset()` when `user` is null/undefined before clearing `identifiedUserId.current`.
- In `.claude/skills/integration-react-native/references/react-native.md`, fix the documentation references (use `disabled` option at line 1367, fix `PostHog.initAsync` casing at line 1427, and verify clean standalone `posthog.unregister` call at line 789).

### ✓ Step 2: Standardize analytics event payloads and sanitize search tracking
The subscription search and toggle analytics events adhere to privacy standards and schema consistency across screens.

- In `app/(tabs)/subscriptions.tsx`, update `handleSearchChange` to emit `subscription_searched` with privacy-safe non-content metrics (`query_length` and `has_query`) instead of raw query text.
- In `app/(tabs)/index.tsx`, update the `subscription_details_toggled` event capture to include `subscription_id` and `subscription_name`, matching `subscriptions.tsx` while preserving `expanded`, `billing_frequency`, and `category`.

### ✓ Step 3: Refactor subscription cancellation flow and pending state handling
Subscription cancellation accurately tracks pending state and displays completion alerts only after state updates succeed.

- In `app/(tabs)/subscriptions.tsx`, introduce cancellation state management (`cancellingSubscriptionId` / `isCancelling`), update local subscription status upon confirmed cancellation, and display the success alert only after completion.
- In `app/(tabs)/index.tsx`, align cancellation behavior to prevent premature success alerts before cancellation completes, updating local state or delegating to the cancellation workflow.