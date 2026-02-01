# 🗺️ Global Currency & Crypto Integration Roadmap

This roadmap outlines the path to transforming Atlanticfrewaycard into a truly global, multi-currency platform supporting Fiat, Crypto, and Stablecoins.

## 🎯 Vision
A seamless financial experience where users can hold, spend, and view balances in any global currency or crypto asset, with real-time conversion during card transactions.

---

## 🏗️ Phase 1: Data & Infrastructure (Weeks 1-2)
**Goal**: Establish reliable, real-time price feeds for all assets.

### 1.1 High-Efficiency Exchange Rate Engine
- [x] **OpenExchangeRates Integration**: Primary source for 170+ fiat currencies and major crypto/stablecoins.
- [x] **Zero-Latency Caching**: Implement a Redis/Memory hybrid cache. Rates are updated in the background, ensuring card authorizations (**JIT Funding**) never wait for a network call to the exchange API.
- [x] **Lean Adapter**: A single-file implementation to keep the codebase simple and maintainable.

### 1.2 Multi-Currency Database Evolution
- [x] **User Preferences**: Add `preferred_display_currency` column to `users` table.
- [x] **Flexible Balances**: Transition from a single `balance` column to a `balances` JSONB structure or a `wallet_accounts` table to support multiple assets (USD, EUR, BTC, etc.) simultaneously.

---

## ⚙️ Phase 2: Core Service Logic (Weeks 3-5)
**Goal**: Enable real-time conversion and multi-tenant scaling.

### 2.1 Currency-Aware JIT Funding
- [x] **Logic Refactor**: Update the `jit-funding-service` to:
    1. Detect transaction currency from Marqeta webhook.
    2. Convert transaction amount to user's wallet asset(s).
    3. Apply spread/fee logic defined by the partner tier.
    4. Authorize based on converted value.

### 2.2 Global Settlement Logic
- [x] **Conversion Audit Log**: Track every conversion event (Rate, Timestamp, Source, Target) for compliance and user transparency.
- [x] **Automated Payouts**: Update `CommissionCalculationService` to support payouts in the partner's preferred local currency.

---

## 💻 Phase 3: Frontend & UX (Weeks 6-8)
**Goal**: Dynamic and localized user experience.

### 3.1 Currency Selector & Formatting
- [x] **Global Selector**: Add a currency preference toggle in the Sidebar/Profile.
- [x] **Localized Formatting**: Implement `Intl.NumberFormat` across the dashboard to handle symbols, decimals, and separators for global currencies correctly.
- [x] **Crypto Visibility**: Create a "Crypto Wallet" view showing balances in native units (e.g., 0.05 BTC) with an optional fiat valuation toggle.

### 3.2 Real-Time Valuations
- [x] **Websocket Updates**: Stream price updates to the dashboard for high-volatility crypto assets to ensure "Available Balance" is always accurate.

---

## ⚖️ Compliance & Risk (Ongoing)
- **Spread Management**: Implement dynamic spreads to mitigate risk during high-volatility periods.
- **Regulatory Reporting**: Ensure all cross-border and crypto-fiat conversions meet AML/KYC reporting requirements per jurisdiction.

---

> [!TIP]
> **Why OpenExchangeRates?** It provides a highly reliable REST API for fiat and is the industry standard for business applications requiring historical and real-time forex data. 

> [!IMPORTANT]
> **Crypto as a Primary Balance**: By making crypto "optional" for display but "natively supported" for funding, we cater to both traditional business users and web3-native individuals.
