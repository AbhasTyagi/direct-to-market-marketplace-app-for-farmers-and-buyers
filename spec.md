# Specification

## Summary
**Goal:** Build a direct-to-market marketplace app where farmers can publish produce listings and buyers can browse and place order requests, with identity-based accounts, role-based UI, and persisted backend data.

**Planned changes:**
- Add Internet Identity authentication with session-aware UI (sign in/out) and principal-scoped data for profiles, listings, and orders.
- Implement profile onboarding and management with roles (Farmer/Buyer) and fields: display name, role, location, optional phone/email, bio; include public farmer profile view from listings.
- Build farmer listing management: create/edit/publish-unpublish/delete listings with fields (title, category, unit, quantity, price, optional availability date, location, description) and “My Listings”.
- Create marketplace browsing for buyers with keyword search, category/location filters, sorting (newest, price low/high), and pagination/incremental loading.
- Implement order request flow: buyers place requests (quantity, pickup/delivery note, optional message); farmers accept/decline; buyer can cancel pending; track statuses (Pending/Accepted/Declined/Cancelled).
- Add asynchronous per-order message thread (chronological, author, timestamp) restricted to order participants.
- Provide core pages and navigation: Landing, Marketplace, Listing Detail, Create/Edit Listing (farmer), My Listings (farmer), Sales (farmer), Purchases (buyer), Profile; role-based nav and refresh-safe routing.
- Apply a consistent agriculture-inspired theme (earthy greens/warm neutrals; avoid blue/purple) with cohesive layout/components across pages.
- Add frontend + backend validation and user-friendly error handling, plus loading/empty states for lists.
- Persist profiles, listings, orders, and order messages in a single Motoko backend actor and expose a minimal Candid API with role/ownership access control.
- Add generated static images under `frontend/public/assets/generated` and render them in the header branding and landing page.

**User-visible outcome:** Users can sign in with Internet Identity, create a Farmer or Buyer profile, browse or manage produce listings based on role, place and manage order requests with status updates and an order-specific message thread, and navigate the app through a consistent agriculture-themed UI with clear validation and states.
