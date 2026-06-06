# Changelog

All notable changes to the Pollax SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-06-04

This release aligns the SDKs with the public API surface shipped in the
`feat/public-api-foundations` backend branch: Bearer-API-key auth, idempotency,
signed outbound webhooks, and per-key rate limiting.

### Added

#### Both SDKs
- **`webhooks` resource** for managing outbound webhook subscriptions:
  `create`, `list`, `retrieve`, `update`, `delete`, `rotate_secret` /
  `rotateSecret`, `list_deliveries` / `listDeliveries`. Backed by
  `POST /api/v1/webhooks` and friends.
- **`Pollax.verifyWebhookSignature(...)`** / **`Pollax.verify_webhook_signature(...)`**
  — static helper to validate the `Pollax-Signature: t=…,v1=…` HMAC SHA-256
  header on incoming webhooks. Stripe-style; uses timing-safe compare and a
  5-minute timestamp tolerance by default.
- **`idempotencyKey` / `idempotency_key` parameter** on `calls.create()` and
  `campaigns.create()` — forwards as `Idempotency-Key` request header. Safe to
  retry on network errors without double-creating.
- **Rate-limit info on the client** — `Pollax.lastRateLimit` (TS) /
  `Pollax.last_rate_limit` (Py) populated from `X-RateLimit-*` /
  `RateLimit-*` response headers after every request.
- **`CallStatus` exported type / Literal** for narrowing call status values.

### Changed
- **BREAKING (data contract — actually a fix):** Call `status` values now match
  what the backend emits: `'initiated' | 'ringing' | 'in_progress' | 'completed'
  | 'failed' | 'busy' | 'no_answer' | 'voicemail'`. Previously the SDKs declared
  the wrong shape (`'queued'`, `'in-progress'`, `'no-answer'`) — type-narrowed
  consumers will see a one-line update.
- Repository URLs in `package.json` / `pyproject.toml` corrected to
  `github.com/pollaxai/Pollax-SDK`.
- User-Agent strings bumped to `1.1.0`.

### Migration from 1.0.0

```ts
// Before
if (call.status === 'in-progress') { ... }    // dead code — backend never sent this
// After
if (call.status === 'in_progress') { ... }
```

```python
# Idempotent outbound call (recommended for any retried POST)
call = client.calls.create(
    agent_id="agent_123",
    to_number="+91...",
    idempotency_key=f"order-{order.id}",
)
```

```js
// Verify a webhook
import { Pollax } from 'pollax';
Pollax.verifyWebhookSignature(rawBody, req.header('Pollax-Signature'), SECRET);
```

## [1.0.0] - 2024-01-18

### Added

#### TypeScript/JavaScript
- Initial release of TypeScript/JavaScript SDK
- Full TypeScript support with type definitions
- Agent management (create, list, retrieve, update, delete)
- Call operations (create, list, retrieve, end, transfer)
- Campaign management with bulk calling
- Knowledge base integration
- Analytics and reporting
- Integrations management
- Phone number management
- API key management
- Voice cloning support
- Automatic retry logic with exponential backoff
- Comprehensive error handling
- Browser and Node.js support

#### Python
- Initial release of Python SDK
- Full type hints with Pydantic models
- Agent management (create, list, retrieve, update, delete)
- Call operations (create, list, retrieve, end, transfer)
- Campaign management with bulk calling
- Knowledge base integration
- Analytics and reporting
- Integrations management
- Phone number management
- API key management
- Voice cloning support
- Automatic retry logic with exponential backoff
- Comprehensive error handling
- Context manager support
- Python 3.8+ support

#### Documentation
- Quick start guide
- Complete API reference
- Usage examples for all features
- Best practices guide
- Contributing guidelines

#### Examples
- Basic call examples
- Bulk campaign examples
- Knowledge base integration examples
- Analytics and reporting examples

### Features

- Type-safe API clients
- Automatic retries with exponential backoff
- Rate limit handling
- Comprehensive error types
- Webhook support
- Real-time call monitoring
- Transcript and recording access
- Campaign progress tracking
- Knowledge base search
- Analytics data export

### Security

- API key authentication
- Secure HTTPS connections
- No sensitive data logging

## [Unreleased]

### Planned

- Go SDK
- PHP SDK
- Webhook signature verification
- WebSocket support for real-time events
- Streaming call transcripts
- Advanced analytics queries
- Integration templates
- CLI tool
- Docker images
- CI/CD examples

---

## Release Notes

### Version 1.0.0 - Initial Release

This is the first stable release of the Pollax SDK, providing production-ready client libraries for TypeScript/JavaScript and Python.

**Key Features:**
- Complete coverage of Pollax API endpoints
- Type-safe interfaces in both languages
- Automatic error handling and retries
- Comprehensive documentation and examples
- Production-ready code quality

**Breaking Changes:**
- None (initial release)

**Migration Guide:**
- None (initial release)

**Known Issues:**
- None

**Deprecations:**
- None

---

For detailed changes, see the [commit history](https://github.com/pollax/pollax-sdk/commits/main).

To report issues or request features, visit our [GitHub Issues](https://github.com/pollax/pollax-sdk/issues).
