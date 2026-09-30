# 02 — What the LIARD backend actually implements

Source: `lab3-liard`, branch `dev`, commit `04fc8139`. Read-only audit; nothing was run (no tests, no docker, no DB).
Paths are relative to `lab3-liard/back/` unless stated.

## 1. Access model (read this first)

- Three global guards, in order (`src/app.module.ts:45-53`): `JwtAuthGuard` (deny by default; `@Public()` opts out),
  `OnboardingGuard` (every route requires a sealed onboarding unless `@AllowIncompleteOnboarding()`), `RolesGuard`
  (`@Roles(...)`; silent when absent).
- `RequireAuth` / `RequireRole` / `GuestOnly` / `RequireOnboarded` are **front-end** route guards
  (`front/src/components/auth/guards/`), not backend decorators. Backend equivalents: `@Public`, `@Roles`, `@AllowIncompleteOnboarding`.
- Refusals are `403` with a `code`: `ROLE_NOT_SET` (→ `/onboarding/role`), `ONBOARDING_PENDING` (→ `/onboarding/profile`),
  `WRONG_ROLE` (`src/common/auth/exception/access-refusal.exception.ts`). Unauthenticated: `401 "Sesión inválida o vencida."`.
- Session: `liard_session` HttpOnly cookie (Bearer also accepted). Auth routes throttled per IP (in-memory).

### Roles
`enum UserRole { ENGINEER, SUPPLIER }` — **no admin** (explicitly out of scope; the PO access spec has an empty
`it('does not mark any route as admin-only')`). `User.role` is nullable: accounts register with `role: null`.

### Onboarding (`src/modules/users/`)
- `needsOnboarding = role === null || onboardingCompletedAt === null` (`service/users.service.ts:17`).
- Role and profile are set via `PATCH /api/users/me`. Role can change freely **until** sealed; after that → `RoleAlreadySetException`.
  Switching role before sealing empties the other role's columns (`ROLE_ONLY_PROFILE_COLUMNS`).
- Seal is automatic when all required fields are present (`types/users.types.ts:23`):
  - ENGINEER: fullName, position, phone, companyName, taxId, state, city.
  - SUPPLIER: fullName, phone, companyName, taxId, website, state, city **and** ≥1 `categories`.
- Supplier-only profile: categories, shortDescription, brands, deliveryZones, minOrderAmount, leadTimeDays.
  Of these only `leadTimeDays` feeds logic (quote lead-time fallback); `minOrderAmount`/`deliveryZones` are displayed
  (provider directory) but **no matching or ordering logic uses them**.
- `DELETE /api/users/me` = soft "baja" (`disabledAt` + `tokenVersion++`).

### Access matrices (pinned by tests)
- `test/modules/provider/unit/catalog-access.spec.ts`: `GET /providers` = any session, onboarding NOT required (the
  onboarding UI consults it); BOM market reads (`/bom-catalog`, `/electrical-plan/:planId/bom/market-data`,
  `/project/:projectId/bom/market-data`) = `ENGINEER`, sealed; **no write** on the shared catalog; none public.
- `test/modules/purchase-order/unit/purchase-order-access.spec.ts`: 9 routes; `/orders/supplier/requests*` = `SUPPLIER`;
  buyer routes = `ENGINEER` (scoped by project ownership); none public; none exempt from onboarding.
- Ownership: engineer data is filtered by `ownerId` in every repository query (projects, plans, quotes, batches).
  Supplier's own catalog and inbox resolve the caller's `Provider` (`ProviderService.resolveOwnProviderId`, lazy + idempotent).
  **Cross-supplier catalog visibility**: engineers' market/quote reads see every active supplier's catalog — by design.
- `canonical-catalog/*` has **no `@Roles`**: any onboarded account (ENGINEER or SUPPLIER) can `POST`/`PATCH` canonical
  components. Documented ("session and sealed onboarding, any role"), but a product decision worth revisiting.

## 2. Routes (86, all under `/api`)

Legend: E = `@Roles(ENGINEER)`, S = `@Roles(SUPPLIER)`, any = session + sealed onboarding, no role, P = `@Public`,
onb = `@AllowIncompleteOnboarding`. Status = explicit `@HttpCode` or Nest default (POST 201, else 200).

| Area | Routes |
| --- | --- |
| auth (11) | P: `POST auth/register` 201, `POST auth/login` 200, `POST auth/logout` 204, `POST auth/forgot-password` 204, `POST auth/reset-password` 204, `POST auth/email/confirm` 201. onb: `GET auth/me`, `PATCH auth/password` 204, `PATCH auth/email` 202, `GET auth/email/pending`, `DELETE auth/email/pending` 204 |
| users (2) | onb: `PATCH users/me` 200, `DELETE users/me` 204 |
| brand prefs (4) E | `GET/PUT users/me/brand-preferences`, `GET/PUT project/:projectId/brand-preferences` |
| project (11) E | `POST project` 201, `GET project`, `GET project/:id`, `DELETE project/:id` 204, `GET/PUT project/:id/bom`, `GET project/:id/bom/export` (xlsx\|csv), `GET project/:id/reference-table/file`, `POST project/:id/reference-table` (201 created / 200 replaced, set via `res.status`), `POST project/:id/reference-table/crop`, `DELETE project/:id/reference-table` 204 |
| plans in project (5) E | `POST project/:projectId/electrical-plan` 201 (multi-file DXF/PDF), `POST .../electrical-plan/crop` 201 (one plan per zone, ≤15), `GET .../electrical-plan`, `GET .../electrical-plan/:planId`, `DELETE .../electrical-plan/:planId` 204 |
| processing (3) E | `POST project/:projectId/process-all` 202, `GET project/:projectId/processing-status`, `DELETE project/:projectId/processing-batch` 200 |
| plan (7) E | `POST electrical-plan/:id/process` 202, `GET electrical-plan/:id`, `PATCH electrical-plan/:id` (multiplier only), `DELETE electrical-plan/:id` 200 (soft), `GET .../bom/export`, `GET .../file` (DXF), `GET .../source` (original PDF) |
| plan BOM (7) E | `GET electrical-plan/:planId/bom/tile-image/:tileIndex`, `PATCH/DELETE .../bom/unidentified/:id` (resolve / dismiss), `POST .../bom/symbols/:symbolId/reclassify` (+`/preview`), `PATCH .../bom/symbols/review`, `PUT .../bom/components` (diff save) |
| market (3) E | `GET bom-catalog`, `GET electrical-plan/:planId/bom/market-data`, `GET project/:projectId/bom/market-data` |
| canonical (5) any | `GET canonical-catalog/components`, `GET .../components/:id`, `GET .../component-types`, `POST .../components` 201, `PATCH .../components/:id` |
| providers (16) | onb (any role): `GET providers` (directory). S: `GET providers/catalog` (summary), `GET .../catalog/reading`, `GET .../catalog/currencies`, `GET .../catalog/items`, `GET .../catalog/unlinked`, `POST .../catalog/items` 201, `PATCH/DELETE .../catalog/items/:id` (204), `PUT/DELETE .../catalog/items/:id/canonical`, `PUT .../catalog/items/:id/reading`, `GET .../catalog/imports`, `POST .../catalog/imports/preview` 200, `POST .../catalog/imports` 201 |
| quotation (4) E | `POST quotation/:projectId` 201, `GET quotation/:projectId/current`, `GET quotation/:projectId/:quoteId`, `GET quotation/:projectId/:quoteId/offers/:providerOfferId` |
| orders (9) | E: `POST orders/projects/:projectId/quotes/:quoteId` 201, `GET orders` (`?status&projectId`), `GET orders/:batchId/providers`, `GET orders/:batchId/providers/:providerOrderId`. S: `GET orders/supplier/requests` (`?status`), `GET .../:purchaseOrderId`, `GET .../:purchaseOrderId/contact`, `POST .../:purchaseOrderId/accept` 200, `POST .../:purchaseOrderId/reject` 200 |

### Cross-check vs `api-endpoints.md` (verified by script over the decorators and over both the "At a glance" table and the `###` headings)
- **Code routes missing from docs: none. Documented routes missing from code: none.** 86 = 86 = 86.
- Status codes: all the ones I checked match the docs (e.g. `DELETE project/:id` 204, `DELETE electrical-plan/:id` 200,
  reference-table 201/200, processing 202).
- Confirmed mismatches, all minor:
  1. `POST /api/auth/email/confirm` returns **201** (no `@HttpCode`); `api-endpoints.md` says 201, but its own Swagger
     `@ApiResponse` says `HttpStatus.OK` (`src/modules/auth/controller/auth.controller.ts:284-295`). Swagger is the wrong one.
  2. `QuoteProviderOfferDto.coveragePercent` (inside `POST quotation/:projectId` → `providerOffers[]`) is not named in
     the docs; the comparison DTO calls the same concept `availabilityPercent`. Two names for one number.
  3. `BomDetectedComponentDto` fields `shortName`, `confidence`, `isComponent`, `mergedIntoAnotherBox`,
     `detectionConfidence` are not documented (the doc only points to "the note above").
  4. Docs say `responseDeadlineAt` is always null and nothing writes `EXPIRED` — true in code (see §3).
- Not a doc issue but convention drift: `electrical-plan/dto/electrical-plan-bom-response.dto.ts` holds the detector's
  **inbound** Spanish-keyed payload in `dto/` (it never reaches an HTTP response; `SymbolDetectionResponseMapper` translates).
- `CLAUDE.md` says `test/modules/` covers "all 12 src modules"; there are **14** (`users`, `brand-preference` included).

## 3. Data model (`prisma/schema.prisma`: 33 models, 14 enums, 68 migrations, last `20260930130000_quote_line_unmatched_reason`)

### Enums, verbatim, with what writes them
| Enum | Values | Written in practice |
| --- | --- | --- |
| `ElectricalPlanStatus` | `PENDING, PROCESSING, COMPLETED, ERROR, STALE` | all |
| `ElectricalBomStatus` | `PENDING_REVIEW, COMPLETE` | all |
| `DetectedComponentOrigin` | `DETECTOR, MANUAL_RESOLUTION, LEGACY_POINT` | all |
| `ProcessingJobStatus` | `QUEUED, RUNNING, SUCCEEDED, FAILED, CANCELLED` | all |
| `SyncStatus` (catalog import run) | `PENDING, RUNNING, SUCCESS, FAILED, PARTIAL` | only `SUCCESS`, `FAILED` |
| `QuoteStatus` | `PENDING, PROCESSING, READY, PARTIAL, FAILED, EXPIRED` | `PROCESSING` → `READY`/`PARTIAL`/`FAILED`; `PENDING` only as DB default, **`EXPIRED` never** |
| `QuoteLineStatus` | `QUOTED, NOT_FOUND, STALE_PRICE, ERROR, MANUAL_REQUIRED` | `QUOTED`, `NOT_FOUND`, `STALE_PRICE`; `ERROR`/`MANUAL_REQUIRED` only mapped |
| `MatchMethod` | `EXACT_CODE, SKU, MANUFACTURER_PART, NAME_SPEC, FUZZY, MANUAL, CANONICAL` | **only `CANONICAL`** (score always 100); the rest are legacy |
| `PurchaseOrderStatus` | `SENT, CONFIRMED, REJECTED, EXPIRED` | `SENT` → `CONFIRMED`/`REJECTED`; **`EXPIRED` never** |
| `UserRole` | `ENGINEER, SUPPLIER` | |
| `BrandPreferenceKind` | `PREFERRED, BLOCKED` | |
| `CanonicalAttributeDataType` | `NUMBER, TEXT, BOOLEAN` | |
| `CatalogReadingStatus` | `PENDING, READ, FAILED` | all |
| `CanonicalLinkStatus` | `UNLINKED, AUTO, MANUAL` | all |

### Models by area (DB names differ: 40 `@@map`/`@map`; e.g. `ElectricalPlan`→`Plan`, `ElectricalBom`→`Bom`, `ElectricalComponent`→`BomItem`)
- **Identity**: `User` (role, profile, `onboardingCompletedAt`, `disabledAt`, `tokenVersion`), `PasswordResetToken`, `EmailChangeRequest`.
- **Project**: `Project` (single `ownerId`, soft delete, `currentQuoteId`), `ReferenceTable` (1:1), `ProjectBomItem`
  (project-level manual lines), `BrandPreference` (per user **or** per project).
- **Plans & detection**: `ElectricalPlan` (`file` DXF, `sourceFile` PDF, `multiplier`, `lastError`), `ProcessingJob`
  (lease: `workerId`, `leaseExpiresAt`, `attempts`/`maxAttempts=3`, `batchId`, `availableAt`), `ElectricalBom` (1:1 plan),
  `ElectricalComponent` (BOM line, canonical link + reading status), `DetectedComponent` (a box, optionally counted by a line),
  `UnidentifiedElectricalComponent` (resolved*/`resolvedAt`), `BomTileImage`.
- **Canonical catalog**: `CanonicalComponentType` → `CanonicalComponentTypeAttribute` (`required`, `displayOrder`) →
  `CanonicalAttribute`; `CanonicalComponent` (`@@unique[componentTypeId, attributeSignature]`) →
  `CanonicalComponentAttributeValue`; `BomLineReading` (AI reading cache per normalized material+spec).
- **Supplier catalog**: `Provider` (1:1 with a SUPPLIER `User`, `catalogColumnMapping`), `ProviderCatalogItem`
  (`productCode`, brand/brandCode/subBrand, price, currency default ARS, lead time, `priceValidUntil`, `isActive`,
  canonical link), `ProviderPriceHistory`, `ProviderSyncRun` (import run), `CatalogReadingRun` (AI cost log).
- **Quoting**: `BomQuote` (per project, `revision`, `bomFingerprint`) → `BomQuoteLine` (snapshot of BOM line,
  `selectedBrand`, `selectedProviderId`, `unmatchedReason`) and `QuoteProviderOffer` (one per provider: totals,
  coverage, lead time) → `QuoteLineOffer` (provider × line, matched item + price snapshot).
- **Ordering**: `PurchaseOrderBatch` (one per confirmed quote, snapshot) → `PurchaseOrder` (one per provider,
  `@@unique[batchId, providerId]`) → `PurchaseOrderLine`; plus `PurchaseOrderUnassignedLine`.
- **Dead columns** (in schema, never written by `src/`): `BomQuote.supersededAt`, `BomQuote.expiresAt`,
  `BomQuote.selectedOfferId` (so comparison `isSelected` is always false), `BomQuote.confirmedAt` (read for ordering
  only), `PurchaseOrder.responseDeadlineAt` (read and enforced in `respondToSupplierRequest`, never set).

### State machines
- **Plan**: `PENDING` →(enqueue)→ `PROCESSING` → `COMPLETED` | `ERROR`. Retryable failure keeps `PROCESSING` with
  `lastError` while backing off (`markPlanAsQueuedForRetry`). Replacing the reference table marks `COMPLETED` plans `STALE`
  (`project.repository.ts:966`). Processable = `PENDING | ERROR | STALE` (`processable-plan-statuses.ts`). Cancelling a
  batch resets its queued plans to `PENDING`. Soft delete via `deletedAt`.
- **ProcessingJob**: `QUEUED` → `RUNNING` (claimed under a lease, fair per owner) → `SUCCEEDED` | `FAILED`, or `QUEUED`
  again on a transient error (30 s base backoff; 504 is **not** retried; 503 is) or on an expired lease (sweep);
  `QUEUED` → `CANCELLED` by batch cancel or project delete.
- **BOM**: `PENDING_REVIEW` while any unidentified symbol is unresolved → `COMPLETE` once all are resolved/dismissed.
- **Canonical link / reading** (catalog items, `BomItem`, `ProjectBomItem`): create/import/name-or-spec edit →
  `readingStatus PENDING` → background Claude read (`claude-haiku-4-5` by default) → `READ` (link `AUTO` or `UNLINKED`)
  | `FAILED`. A human correction → `MANUAL` (and the AI never overwrites it). BOM line readings are cached in `BomLineReading`.
- **Quote**: created `PROCESSING` (synchronously, inside the POST) → `READY` (every line quoted) | `PARTIAL` | `FAILED`
  (zero lines, or an exception — returned as 201 with `FAILED`, not an HTTP error). `READY`/`PARTIAL` becomes
  `Project.currentQuoteId`. Quotes are immutable snapshots; re-quoting creates `revision + 1`.
- **Purchase order**: created `SENT` → supplier `accept` → `CONFIRMED` | `reject` → `REJECTED` (409 if already answered
  or past a deadline). Terminal. Batch status is **derived**, never stored: any `EXPIRED` > any `REJECTED` > any `SENT` >
  `CONFIRMED` (`purchase-order-status.helpers.ts`). One batch per quote (409 on a second confirm).

## 4. End-to-end workflow: status per step

| # | Step | Status | Evidence / notes |
| --- | --- | --- | --- |
| 1 | Register → pick role → complete profile | **Exists** | `auth.service.ts`, `users/service/profile-write.builder.ts`; mail only for reset + email change (SMTP or log mailer) |
| 2 | Create project (name, description) | **Exists** | `ProjectService.create`; single owner, no members |
| 3 | Reference table DXF: upload / replace / crop from a plan / delete | **Exists**, optional | `project.service.ts:660`; replacing marks plans `STALE`. Detection works without it |
| 4 | Upload plans: multi-file DXF, PDF auto-converted to DXF by detector `/pdf/convert` (vector PDFs only; scanned rejected; all-or-nothing batch) | **Exists** | `electrical-plan.service.ts:81`, `plan-source-conversion.service.ts` |
| 5 | Split a DXF into zones (one plan per zone, ≤15) | **Exists** | `POST .../electrical-plan/crop`, `dxf-crop/` → detector `/dxf/crop` |
| 6 | Process: one plan or all (optionally `planIds`), 202 + poll; cancel queued | **Exists** | Postgres queue + LISTEN/NOTIFY, lease, retry, recovery sweep |
| 7 | Detection: YOLO locates symbols, Claude vision (`claude-opus-5-5` default in `component-detector/factory.py:67`) names them; Spanish payload mapped to English | **Exists** | `symbol-detection-service.llm.ts` → `/bom/detectBom`; tile images kept for review |
| 8 | Review plan BOM: resolve/dismiss unidentified, reclassify a symbol or row (with preview + optimistic lock `expectedUpdatedAt`), mark symbols reviewed, diff-save lines, per-plan multiplier, export xlsx/csv | **Exists** | `electrical-bom.service.ts:112-294` |
| 9 | Canonical identity of each BOM line (type + attributes), AI then human correction | **Exists** | `bom-line-reading.service.ts`, `canonical` field in saves → `MANUAL` |
| 10 | Consolidated project BOM: merges `COMPLETED`/`STALE` plans × multiplier + project-only lines; warnings for unprocessed/partial/stale; save; export | **Exists** | `project.service.ts:102-660` |
| 11 | Brand preferences (user + project; preferred/blocked) | **Partial** | Stored and served by the backend, **consumed only by the front's BOM editor** (autofill/dropdowns). The quote matcher does not read them; it only honours a brand/range written on the line |
| 12 | Market data while editing (who sells this line, at what price) and global catalog browse | **Exists** | `quotation/market/*`, same matcher as the quote |
| 13 | Quote: equality match on base type + every `required` attribute; brand/range filter only if requested; per-provider offers with totals, coverage, lead time; currency conversion to `QUOTATION_CURRENCY` (ARS default) | **Exists** | `quotation.service.ts:144`, `matching/quote-matcher.service.ts`; guards `EMPTY_BOM`, `NO_PROVIDER_CATALOG` |
| 14 | Compare offers: ranked list + per-offer line detail + brand alternatives per line | **Exists** (read-only) | `GET quotation/:projectId/:quoteId(/offers/:id)`; no "select offer" write (`selectedOfferId` never set), no side-by-side line matrix endpoint beyond per-offer detail |
| 15 | Confirm quote → one batch, one `PurchaseOrder` per provider from engineer's per-line `{quoteLineId, providerId, catalogItemId?}`; unassigned lines snapshotted | **Exists** | `purchase-order.service.ts:51`; mixing providers per line is supported |
| 16 | Buyer tracks orders: list batches (derived status + per-status counts), providers in a batch, lines per provider order (paginated) | **Exists** | |
| 17 | Supplier catalog: xlsx import with column-mapping proposal, two-step preview/confirm, history, item CRUD, AI reading progress, manual canonical link | **Exists** | `provider/`, `catalog/import/`; only `.xlsx` |
| 18 | Supplier inbox: list/detail of own requests, accept or reject whole order; buyer contact revealed only after `CONFIRMED` | **Exists** | `purchase-order.service.ts:178-250` |
| 19 | Supplier edits the offer (counter-price, quantity, partial accept, lead time, comments) | **Absent** | accept/reject carry no body; offers are generated from the catalog, never authored by the supplier |
| 20 | RFQ / supplier-submitted quotes (supplier prices a BOM on request) | **Absent** | quotes are 100 % catalog-driven |
| 21 | Response deadlines / expiry of orders or quotes | **Absent** (scaffolded) | enum values + columns exist, nothing writes them, no scheduler |
| 22 | Notifications (in-app, email, webhook) about orders, processing, quotes | **Absent** | email only for password reset / email change; the only NOTIFY is internal to the job queue; clients poll |
| 23 | Payments, invoicing, delivery tracking, receipt | **Absent** | no model or route |
| 24 | Collaboration: project members/sharing, comments, activity log, approvals | **Absent** | `Project.ownerId` only; the "review" of symbols is a flag, not a comment |
| 25 | Admin / moderation of canonical catalog or accounts | **Absent** | no admin role; canonical writes open to any sealed role |
| 26 | Catalog price history | **Partial** | `ProviderPriceHistory` written on import (`provider.repository.ts`); **no route reads it** |

## 5. Things a UX designer should know
- Quoting is synchronous inside `POST /quotation/:projectId`; plan detection is asynchronous (202 + poll `processing-status` / plan).
- A quote's outcome depends on canonical identity: a line without a base component or missing an essential attribute is
  `NOT_FOUND` with a Spanish `unmatchedReason` — the fix is in the BOM editor, not the quote.
- Everything user-facing the backend emits (errors, reasons, warnings) is Spanish; field names are English.
- Most "future" states (`EXPIRED`, deadlines, selected offer, sync `PARTIAL`, legacy match methods) are present in the
  schema but inert: the UI must not assume they happen.
