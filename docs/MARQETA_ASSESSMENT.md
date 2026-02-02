# Marqeta API Assessment: Networks, Tiers & The Trench

This assessment covers how we map our business model to the Marqeta ecosystem and what advanced features we are leveraging for the "Enterprise Build."

## 1. Card Networks & Tiering Strategy

The tiers are defined by the "Card Product" configuration in Marqeta.

### Visa & Verve (Basic/Standard Tiers)
*   **Verve**: Primarily for the African market (Nigeria). 
*   **Visa**: Global Virtual card for daily expenses.
*   **Abilities**: 
    - [x] **Online Ecommerce**: Verified for Amazon, Netflix, Shopify.
    - [x] **In-Store Retail**: Works with Apple Pay/Google Pay via NFC.
*   **Limits**: 
    - Velocity: Locked to $1,000/day.
    - Merchants: Blocked from "High Risk" MCCs (Gambling, Cash Advance).
    - Physical: Not available (Virtual-only).

### Mastercard (Premium/Credit Tier)
*   **Use Case**: Enterprise high-value and corporate credit accounts.
*   **Abilities**: 
    - [x] **Global Online/Store**: No merchant restrictions.
    - [x] **ATM Withdrawal**: Enabled with specific pin-set controls.
    - [x] **Software Subscriptions**: Optimized for SaaS (AWS, Azure, GCP).
*   **Limits**: 
    - Velocity: Flexible, ranging from $10,000 to $50,000+.
    - Physical: Metal card fulfillment available.

---

## 2. In the "Mariana Trench" (Advanced Tech)

These are the deep-level features I am currently exploring in the documentation:

### Gateway JIT (Just-in-Time) Funding
*   **The Logic**: When a card is swiped, Marqeta sends a JSON payload to our **Go Engine**.
*   **The Decision**: Our engine checks the user's **Crypto Wallet** balance in real-time.
*   **The Funding**: Only the exact amount for that transaction is moved into the Marqeta account. No balance "sits" on the card.

### Velocity Control Layering
*   **The Feature**: We don't just set one limit. We "layer" them.
*   **Example**: A user can have a $5,000 monthly limit, but also a $50 limit on "Dining" and a total block on "International eCommerce."

### ISO 8583 to JSON Mapping
*   **The Deep Dive**: Traditional banking uses a hard-to-read "ISO 8583" string.
*   **Our Build**: Marqeta gives us a clean JSON version, but we can access the **Raw ISO Fields** for advanced troubleshooting.
    *   *Why?* To see exactly why a bank rejected a transaction (e.g., CVV2 mismatch or Address Verification failure).

### Direct Deposit (GPR)
*   **The Feature**: "General Purpose Reloadable" accounts.
*   **The Goal**: We can provide users with actual **Account/Routing numbers**. They can send their salary directly to their Atlanticfrewaycard wallet.

---

## 3. Future Enhancements

*   **Digital Wallet Push**: Pushing cards directly to Apple Pay or Google Pay via the API (no manual card entry).
*   **3D Secure (3DS)**: Handling modern "Verified by Visa" prompts via a custom UI in our dashboard.
*   **Spend Reconciliation**: Matching Marqeta "Settlement" events (which happen 1-2 days later) with our "Authorization" events to ensure zero data drift.
