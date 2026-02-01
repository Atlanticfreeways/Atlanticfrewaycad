# Changelog

All notable changes to the Atlanticfrewaycard Platform will be documented in this file.

## [1.2.0] - 2026-02-01
### Added
- **New Dashboard UI**: Implemented a modern, responsive Next.js 14 dashboard with Tailwind CSS.
- **Real-time Updates**: Integrated WebSockets (Socket.io) for live balance and transaction notifications.
- **Unified Startup**: Created `start-all.sh` to launch both Backend and Frontend with automated health checks.
- **Production Marqeta Client**: Formalized `MarqetaClient` with exponential backoff and Sandbox/Live environment switching.
- **Security**: Robust webhook signature verification for Marqeta events.
- **API Rewrites**: Unified port experience via Next.js proxying to improve local development and resolve CORS issues.

### Changed
- **Database Architecture**: Enhanced PostgreSQL schema for multi-currency support and event auditing.
- **Auth Flow**: Updated `ApiClient` and `AuthContext` to handle CSRF and persistent JWT sessions more securely.
- **Service Configuration**: Optimized local development environment to resolve Google Drive file-locking and dependency issues.

### Fixed
- Resolved `MODULE_NOT_FOUND` errors during startup by purifying `node_modules`.
- Fixed Cross-Origin (CORS) blocks for local development on port 3001.
- Corrected database connection issues for local Mac environments.

## [1.1.0] - 2026-01-25
### Added
- **Go JIT Funding Service**: High-performance transaction authorization microservice.
- **Exchange Rate Engine**: Multi-source rate fetcher with Frankfurter and CoinGecko fallbacks.
- **Redis Caching**: Sub-1ms access to currency rates for JIT decisions.

## [1.0.0] - 2026-01-10
### Added
- Initial release of the Atlanticfrewaycard Platform.
- Core Node.js API.
- Marqeta Sandbox integration.
- Basic card issuance and management.
