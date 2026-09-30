# LIARD dev research · 30 septiembre 2026

Read-only inspection against checked-out `dev` commit `82300d56`. No source changes. Read AGENTS.md, explicit .agents/skills/ui-collage/SKILL.md, api-endpoints.md, documentacion/Roadmap.md, front CSS/routes/layouts/screens and back schema/services. GitHub 27 full open issue bodies captured at /private/tmp/liard-open-issues.json through gh (read-only network escalation). Open issue is not proof of missing functionality.

## Exact existing visual contract
Source front/src/styles/index.css:
- primary/ring #0058BE, primary foreground #FFFFFF.
- app canvas #F4F4FC (deliberately sRGB); white card/sidebar/popover.
- border/secondary-100 #E2E5EC; secondary-400 #CDD2DC; secondary-600 #AEB6C4.
- foreground #000000; text-h #08060D; code-bg #F4F3EC.
- muted oklch(.97 0 0); muted foreground oklch(.42 0 0).
- success oklch(.596 .145 163.2), success text oklch(.432 .095 166.9).
- warning oklch(.769 .188 70.08), warning text oklch(.473 .137 46.2).
- warning surface oklch(.987 .022 95.3); destructive oklch(.577 .245 27.325).
- radius .625rem; sm .6x/md .8x/lg 1x/xl 1.4x/2xl 1.8x.
- Inter Variable body + headings; JetBrains Mono technical BOM cells/codes. Local files under front/node_modules/@fontsource-variable/inter and @fontsource/jetbrains-mono if available; gallery should bundle to work offline.
- Root 18px desktop, 16px <=1024. Desktop text-3xl 34/41, 2xl 27/36, lg 20/32, body 18/27, UI sm 16/23, xs 14/18, badge/table label floor 11/14. BOM 14px with 13px spec.
- Lowercase liard, actual SVG art from front/src/components/shared/brand-art.ts. Lucide inline SVG equivalent, no emoji controls.
- Sidebar 260ms cubic-bezier(.32,.72,0,1); reduced-motion zero.

Shell source AppLayout/AppSidebar: engineer sidebar logo, Nuevo proyecto, Proyectos, Pedidos, footer account. Selected nav blue 10% surface and 4px right border. Collapsible sidebar; mobile AppTopBar opens drawer, closes upon navigation. Supplier sidebar groups Solicitudes > Recibidas/Aceptadas/Rechazadas; Catálogo > Productos/Gestión de productos/Vinculación. No global desktop topbar currently; page breadcrumb/header exists per screen. Gallery can extend nav per proposed workspace but label new sections.

## Existence matrix (dev evidence)
EXISTS:
- Session/register/password/email recovery/change, ENGINEER/SUPPLIER onboarding guards, user profile edit/account sections, preferences/password/email/delete. /api/users/me accepts photoUrl and supplier commercial fields, but photo upload/preview widget not demonstrated.
- Projects list/search/filters/paging/create/delete, detail, upload DXF and PDF, crop multiple boards + reference table from DXF, optional reference table, queue batch analysis, progress/status/error/retry via normal reprocess. Core endpoints documented.
- BOM plan & consolidated, manual project-only accessories, multiplier, drawn vs buying quantities, xlsx/csv exports.
- Graphical symbol locator tied to row, reclassify individual/all equals, manual unidentified resolution/discard batch, review marks. Plan 2D CAD/image inspector and sibling navigation.
- Canonical type/attribute/value editor; automatic BOM reading & cached extraction; manual corrections preserved; base catalog has 33 classes.
- Supplier catalog Excel wizard mapping/preview/confirm (full replacement only), CRUD, currencies/history, live AI reading progress/cost/ETA, canonical linking/unlinking and standardization.
- Brand/range separated from supplier, global/project brand preferences/exclusions, manual brand selection, equal essential-attribute matcher (100 score); no fuzzy matcher.
- Multisupplier quote matrix, per-item product alternatives within same requested technical specification, cheapest optimizer, assignment/unassignment/bulk allocation, offer detail and product codes/lead-time values.
- Order snapshot per supplier, buyer tracking/status breakdown, supplier accept/reject/contact disclosed only after acceptance; conditional status writes avoid competing responses.
- Existing delivery exposure: supplier headers `deliveryDays`, detail drawer + all-item offers with item min/max. Current fastest function uses supplier deliveryDaysMin rather than selected item variant.
- Front Cypress 28 spec files, 142 tests according to Roadmap. Pipeline test availability does not mean all later proposed workflows exist.
- Roadmap S4 explicitly says demo deployed for first 5 users; deployment operational truth is not independently checked.

PENDING S4 / open verified backlog:
- #835 catalog incremental vs full replacement. Current CatalogImportConfirmService always replaceCatalog; UI must preview updated/new/unpublished counts and preserve unmatched old items on incremental.
- #824/#826 profile largely exists; remaining avatar upload/preview and project/order renaming: no PATCH project or orders route, only multiplier PATCH plan. Do not rebuild account.
- #825 commercial account fields exist; gaps logo upload and confirmation that distribution metadata affects quote. User fields include brands, deliveryZones, minOrderAmount, leadTimeDays; mock only remaining edges.
- #827 per-item delivery in main matrix, aggregate order bottleneck, item-aware fastest optimization and stored promised lead-time in orders still missing. Existing header/detail delivery is context.
- #787/#788 edited buyer/supplier demo videos and commercial narrative remain artifacts, not extra app features.
- #985 deployment ticket remains open although Roadmap says demo deployed. Treat expansion/operational verification as planned; don't claim new deployment done.
- #987/#988 matching open despite code existing, #832 PDF implemented, #834 branding now standardized, #945 unifilar component types already merged, #970 dialog fix merged. Mark exists rather than rebuild.

SPRINT5 planned, not in code:
- #829 alternative optional specification+brand in ProjectBomItem, #830 backup complete quote (alternative only where defined, base otherwise), #831 emit correct variant + provenance to supplier. Different from existing same-spec brand alternatives. No alternative fields in ProjectBomItem schema.
- Expanded production to both roles; serverless target is future, no arbitrary deploy architecture migration in mock.
- Match coverage for all types: 33 seeds now; #856 says 88 components but issue body only '.', do not claim 88 complete. Coverage view should separate tested families / missing essential / unmapped / untested.
- Subscription + supplier lead commission commercial model undecided: prototype prices illustrative, requires product policy before charging.
- Account-level all-pipeline IA limits: individual BOM reading rows and catalog runs already costUsd, no budget/quota ledger across account or detector.
- Order emails: common mail module only password reset/email change today. Need event outbox/email retries/preferences; do not conflate UI toasts with notification backend.
- #836 cross-service APM + IA trace reporting absent from package deps/config; recommends Langfuse or equivalent and New Relic or equivalent, optional instrumentation. #985 newer design avoids prompts/images in telemetry; use model/tokens/cost/job alias only.
- DWG conversion exploratory: DXF/PDF exist; conversion needs fidelity validation/error before process.
- Dataset expansion/evaluation: no user dataset consent/provenance workflow. QElectroTech CC-BY symbols explicitly never training data.

OTHER CURRENT BACKLOG, separately label planned issue/proposal:
- #1007 poles text/traces -> #1008 poles inherited only via real connected graph, never nearest neighbor -> #1009 estimated panel summary, #1010 epic. Manual pole edit canonical already possible. Panel summary needs coverage and sourced per-type factors; poles != DIN modules; non-DIN components count poles but not modules. No cabinet recommendation until LIARD validates engineering rules. 'Vías' ambiguous; show 'protecciones' absent topology.
- #1002 numbered reference markers resolve against DXF table. Current detector stores/discards table ('Se guarda y no se usa'). Unknown should show review, never invented spec. Ticket frontend display explicitly out-of-scope; labeling provenance in broader future review is proposal.
- #1000 queue remaining: own YOLO per process, shutdown release, async job idempotency/progress heartbeat, transaction BOM+job+plan, checkpoint paid calls, cancellation RUNNING and manual FAILED retry. Existing fairness/global vision concurrency/cooperative deadline already shipped.
- #813 residual missing-symbol recovery remains spike; pipeline #996 filters implemented. Show evaluation, no promised performance.

## Architecture dependencies for lifecycle expansion
1. Organization/team ownership & RBAC are needed before shared approvals/collaboration; current project owner single user; account role only two values. Proposed operations/admin are new authorized roles, not existing product sessions.
2. Immutable BOM revisions + item/physical-instance provenance before 3D selection, scenarios, traceable alternative purchases, audit/collaboration, manufacturing, installed asset.
3. Extend canonical identity with sourced dimensions/cabinet/accessory assembly rules and per-symbol mapping before trustworthy 3D panel/layout. Existing detection bboxes are normalized human review regions incl text, not CAD geometry.
4. Alternative revision model -> quote comparison -> line snapshot chosen technical variant -> exact supplier code/brand/spec order. Existing PurchaseOrderLine lacks brand; #831 requires extending snapshot and provenance.
5. Selected-item lead-time snapshots, partial receipt/stock/lot models before delivery scenarios and manufacturing reservations. Current order states only SENT/CONFIRMED/REJECTED/EXPIRED, no fulfillment.
6. Estimate pricing/cost schema separates purchase vs sale, labor, contingency, taxes, margin and scenario version; current quotation supplier purchase price only.
7. Event outbox + idempotency + notification prefs before email and automation. Authorization snapshot and approval gates for consequential agent actions.
8. Usage ledger/reserve-release budget semantics across detector and reading jobs before billing/quota; existing costs can seed ledger adapter, don't duplicate calls.
9. Commercial policies for subscription/lead charge/refund/duplicate lead + payment webhooks ledger before payment UI production.
10. Manufacturing traveler/work instructions/test records -> installation redlines/commissioning -> installed asset QR/serial/warranty -> maintenance actions. Entire domains proposed, no current schema.

Read sources rather than issue status when assigning horizon. Gallery screens should label context Existe, changes Pendiente S4/Planificado S5, and future Propuesta; prototypes never close sprint tickets.

## Additional research constraints
Discovery lines 241–259 explicitly leaves pricing/willingness to pay/lead commission unvalidated. Subscription+lead fees in Sprint 5 are business hypotheses, so every mock price must be labelled illustrative, with duplicate/rejected lead refund policy exposed for decision. Catalog price is preliminary until supplier confirms conditions. Documentacion/Arquitectura Liard.md initial single VM; horizontal scaling prepared not deployed. Available local font artifacts in front/node_modules/@fontsource-variable/inter/files (latin wght normal) and @fontsource/jetbrains-mono/files (latin 400/500/600/700 normal).
