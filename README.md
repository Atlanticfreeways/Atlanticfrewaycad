# Atlanticfrewaycard Platform (V2)

**Unified card platform combining business expense management and personal virtual cards.**
*Enterprise-ready with Event-Driven Architecture and Microservices.*

![Status](https://img.shields.io/badge/status-online-brightgreen)
![Marqeta](https://img.shields.io/badge/integration-marqeta--live-blue)
![Architecture](https://img.shields.io/badge/architecture-hybrid--monolith-orange)

## 🚀 Quick Start (Local Development)

The entire platform (App, Go Service, DBs) is now unified for ease of use.

### 1. Configure Environment
Populate your `.env` file with your credentials. See [api_key_guide.md](./.gemini/antigravity/brain/26ff118e-fc29-4d4d-b3ff-f5ac00965473/api_key_guide.md) for details.

### 2. Launch All Services
We have unified the startup into a single robust script:
```bash
./start-all.sh
```
*This script automatically cleans ports, starts the Backend (3000) and Frontend (3001), and verifies health.*

### 3. Access
* **Dashboard**: [http://localhost:3001](http://localhost:3001)
* **API Health**: [http://localhost:3000/health](http://localhost:3000/health)

---

## 💳 Card Tiers & Capabilities

Atlanticfrewaycard offers tiered card products designed for specific user needs and risk profiles.

### 🥉 Standard Tier (Visa / Verve)
*   **Target**: Individual users and entry-level accounts.
    *   **Acceptance**: Perfect for [Online Payments] and [In-Store Retail].
    *   **Limits**: Restricted daily spending ($1,000 max) and limited merchant categories.
    *   **Features**: Virtual-only by default, 3D Secure enabled.

### 🥈 Business Tier (Visa)
*   **Target**: Employee management and operational expenses.
    *   **Acceptance**: Wide [Global Acceptance], [Subscription Management], and [Travel/Hotel Booking].
    *   **Limits**: Flexible $5,000+ daily limits.
    *   **Features**: Supports physical card fulfillment, real-time merchant enrichment.

### 🥇 Enterprise Tier (Mastercard)
*   **Target**: Treasury management and corporate high-value spending.
    *   **Acceptance**: [Unlimited Merchant Access], [ATM Cash Access], [Credit-Line Capabilities].
    *   **Limits**: High-velocity corporate caps ($10k - $50k+).
    *   **Features**: Metal card options, dedicated account manager, raw ISO 8583 data access.

---

## 🏗️ Architecture

Atlanticfrewaycard leverages a high-performance hybrid architecture:
- **Core API (Node.js)**: Global dashboard, auth, and business logic.
- **JIT Funding (Go)**: Sub-100ms authorization engine for real-world card swipes.
- **WebSocket Gateway**: Real-time push for balance updates and auth notifications.

Refer to [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for deep dives.

## 🛠️ Tech Stack
- **Frontend**: Next.js 14, Tailwind CSS, Framer Motion.
- **Backend**: Node.js, Express, Go 1.22.
- **Database**: PostgreSQL (Core), MongoDB (Audit), Redis (Cache).
- **Messaging**: RabbitMQ.
- **Card Issuing**: Marqeta (Live Integration).

## 📄 Documentation & Resources
- [Detailed Technical Architecture](./docs/ARCHITECTURE.md)
- [API Reference](./docs/API.md)
- [Security Model](./docs/SECURITY.md)
- [Global Multi-Currency Roadmap](./roadmap.md)

## 🤝 Contributing
Please see our [Changelog](./CHANGELOG.md) for recent updates. 

## 📄 License
MIT License
