# Product audit — research before UI design

Date: 30 September 2026. Source of truth: checked out `dev`, HEAD `04fc813941ec3ae3b0121f12c173ea4a64cd7219`. Production repository read only. No paid calls, production sessions, database writes, design implementation or publication performed. Report and temporary contact sheets were created only outside the repository; contact sheets were inspected and then removed.

## Product conclusion

The product is assisted electrical procurement, not a symbol counter alone: technical source → reviewable material list → technical canonical identity → compatible commercial products → comparable reference prices → structured supplier request → confirmed commercial contact. Three segments need different entry points: high counting need (LIARD/EMEVE/Meco), mature internal engineering (GRAMONT, value in costing/matching), and suppliers (structured demand, rapid response and traceability). Suppliers explicitly do not want to interpret the customer's plans.

The evidence supports reducing repetitive work and centralizing requests. It does not establish willingness to pay, subscription price, lead commissions, actual ERP integrations, minimum tolerable accuracy, adoption by competitors, or CADIME's precise distribution role. No individual interview with Adrián is present. Targets of ≥90% complex-plan accuracy and 90% time saving are product criteria, not broadly validated production outcomes. Demo III measured one Fundaleu case: eight plans, 31 material types, 394 units, manual four hours; tool 17 minutes, 90% detection, 100% precision. Preserve that scope if presenting it.

## Sprint 4 versus current dev

| Topic | Verified position / remaining work |
|---|---|
| Common component catalog | Implemented: 33 seeded families in `component-materials.ts`; type → attributes → closed values, without brand. Do not show this as entirely new. |
| AI reading of provider rows | Implemented background reader; same-name rows grouped; run cost and progress recorded; manual correction/link/unlink exists. Supplier queue excludes items currently PENDING. Practical improvements should cover failed/unlinked rows, incomplete attributes and safe manual recovery, not claim a missing import pipeline. |
| AI reading of BOM | Implemented background reading, normalized-text cache, standard-values-only linking and manual canonical corrections. Cached reading avoids rereading identical normalized text. This is not per-customer symbol learning. |
| Matching | Generic canonical matcher already compares type and all required attributes; every exact canonical match has score 100. Missing type/essential attributes yields NOT_FOUND with a reason. This 100 is equality score, not an AI confidence percentage. Brand/gama filter applied only when requested. “Matching for every component” remains a data coverage and validation task, not a need to replace the matching algorithm. |
| Brands/preferences | Existing account/project brand preference module and Cypress coverage; provider and brand separated; multibrand offer alternatives and cost allocation exist. |
| Detection | Current service combines YOLO detection and Claude classification. `api.py` accepts optional table but explicitly stores it without using it: names always come from fixed families. Prior report's claim that a poor table poisons valid_materials is obsolete for this pipeline. PDF already converts to DXF on upload. DWG remains absent from accepted plan extensions. |
| Symbol review on drawing | Roadmap states implemented, screen/source inventory confirms plan detail and BOM workflows with detected-component origin types. Exact interaction behavior is covered by coordinator's frontend/code audit. |
| Plan multiplier | Implemented; integer 1–1000 policy. Plan quantities are multiplied only into consolidated purchase quantities. No second paid detection needed. Must distinguish drawn quantity and quantity to buy. |
| Identity/account | Existing landing, responsive/collapsible shell and account screens; reset-password and email-change mail interface implemented. |
| Tests | Current inventory contains 28 Cypress spec files. Roadmap's 142 tests and AGENTS' 23 specs are historical snapshots, not verified current executed counts. No test suites executed for this read-only audit. |
| Deployment | Roadmap claims production demo for first five users. Architecture document describes initial single EC2 VM and future serverless migration, but dev StorageService still uses local filesystem. Deployment/live uptime cannot be inferred from source alone. Do not label serverless as live based on roadmap. |
| Demo video/customers | Office demo reported; Eaton presentation video and broader adoption use future tense. External delivery/recording not verified by local files. |

## Sprint 5: real additions and open definitions

1. **Alternative BOM:** absent as a persisted BOM variant workflow in searched model/service/UI sources. Current `alternatives` are commercially compatible offer variants, not separately approved alternative material lists. Need define version ownership, substitution constraints, price/stock differences and how supplier accepts a variant before mocking a resolved business rule.
2. **Subscription and lead commission:** roadmap proposal only. No subscription/billing/commission module or model found in targeted source searches. Material payment and shipping remain outside product scope; software subscription payment is a different potential revenue flow. Price, commission trigger, cancellation/refund, duplicate lead and confidential information policies remain hypotheses.
3. **AI spending controls:** existing catalog reading cost, BOM reading cost, and detector token/cost calculation are useful instrumentation. Unified spend by user, enforceable account/project budgets and complete usage presentation are not demonstrated in searched source. Mocks can propose measured usage, budget threshold, hard limit and manual fallback, with fictional amounts clearly labeled.
4. **Order email:** no order notifications in current IMailer, which exposes password reset and email change only; no mailer calls found under purchase-order. Notifications for incoming requests and supplier responses are genuinely new. Provide event history, recipient preferences and delivery failure/retry states.
5. **Observability:** detector health and structured step logs exist, but no Sentry/OpenTelemetry module found, no verified global correlation/dashboard. Architecture lists `X-Job-Id` correlation, central logs, immutable action audit, global LLM limiter/checkpoints and horizontal deployment as future work. A service health/progress view is proposal-level.
6. **DWG:** evaluation/conversion pending. Do not silently support it in ordinary upload; include recognizable unsupported/conversion failure states if demonstrating future import.
7. **Broader component/dataset coverage:** match engine is generic; correctness requires real essential attribute coverage and tested readings across new providers/client drawing styles. Never promise one SKU from an incomplete “4P 250A” description.
8. **More users/serverless:** rollout and horizontal architecture remain operational work, not just an additional screen. Do not display a guaranteed 99% SLA: the documented initial single-zone VM does not satisfy it.

## Unmet discovery with concrete product implications

- EMEVE: derived accessory rules (cable, terminals, numerators, DIN/ventilation) absent from planning; proposed review should distinguish detected, rule-inferred and manual material. Electrical calculation/dimensioning remains excluded.
- Meco: company defaults for missing breaking capacity/protection and Schneider→ABB equivalence. Existing canonical/manual editing handles the immediate correction; configurable company technical rules remain future functionality.
- Corrections learned per customer/project/template: not equivalent to cached BOM text reading; no verified symbol-learning model.
- Q Electric: distribution by zone and trust signals; existing directory is not verified as trusted geography ranking. Do not invent supplier ratings or reliability percentages.
- Nisamat: stock/lead time/payment condition/history can outweigh lowest price. Compare SKU, brand, price, availability, delivery, captured date, commercial condition and notes; current order accept/reject is thinner than fully negotiated line-level offer response.
- HCM: requoting a years-old quote without losing captured history. Stable quote snapshots already exist, but a visible refresh/diff/negotiated-offer history is a useful proposed improvement.
- PDF is already supported despite discovery's final “unplanned inputs” statement. Planillas de carga/EPLAN and DWG need separate validation, not a universal-file promise.

## Domain, confidentiality and copy rules

Use Spanish with rioplatense voseo. Product mark is lowercase `liard`; source app uses BrandLogo. State what an action does (“Emitir pedidos”, “Guardar cambios”) consistently. Errors name the failed action, known reason and recovery. True empty states explain origin and next action; filter-empty states clear filters. Never show unsupported metrics.

Never hide unmatched materials. A generic component name alone cannot identify a safe critical SKU. Keep reference price visibly separate from final supplier-confirmed commercial terms. Discounts depend on volume, customer, agreement, date and payment condition. Supplier stock may be absent or delayed three months. No payment of materials or freight flow is authorized by the product scope.

Plans, specifications and prices are confidential; the vision calls for a controlled operating environment and documents 06:00–20:00 working availability, not a guaranteed SLA. Supplier contact unlocks after confirmed request. Own supplier catalog endpoints do pass caller ID to services and filter through resolved provider ID; provider.service confirms this. AGENTS/architecture's broad “catalog reads not owner scoped” note must be qualified: shared engineer market catalog is intentionally cross-provider; own supplier catalog reads are already scoped. Tests pin both roles and the shared/own distinction. Do not repeat the older blanket warning as a proven current vulnerability.

Current limits: up to 15 plans/upload; at most 10 PDFs/upload; reference table and cropping remain DXF. Plan multiplier 1–1000. Queue/deadline behavior distinguishes occupied service (503, retries later) from analysis over deadline (504, no automatic paid retry). User-facing progress should preserve review/manual work during these states.

## Visual domain observations

All 14 plan images were visually inspected. OCJ uses compact inline “2x25A 30mA” specifications and broad repeated outgoing circuits; Fundaleu uses multiline Q/DD/K tags, circuit tables and accessory grids. TDE's BA/BC/MO/U</NCx2/NAx2 text blocks are accessories of adjacent interruptors, not unrelated standalone symbols. TS-SS is extremely wide, with repetitive circuits and notes about superimmunized differentials; it needs contextual review/zoom, not decorative thumbnail presentation. TSCELS is a sparse small plan. General views give shape/context; detail images carry readable engineering evidence.

All 35 QElectroTech sheets were visually inspected. The 399 shapes span 1P/2P/3P/4P and mechanical/function variants across protections, contacts/coils, transformers, sources/converters, controls, instruments, PLCs and terminals. Similar labels do not imply identical poles/function. Red/blue terminal markers are QET-specific, not ordinary AutoCAD features. The local document says CC-BY 3.0 with attribution and an explicit English/Catalan no-machine-learning clause. Respect the prohibition on training/fine-tuning/synthetic datasets; use only for domain reference. Do not put QET art into uncredited generated product mock content.

## Stale, missing and inaccessible references

- `docs/analisis-mejoras/analisis-mejoras.md` is dated dev 5852877, 5 September. Its auth absence, mandatory reference table, old Claude tile-count pipeline and browser crop architecture do not describe current dev. Its principle “never export without knowing what is trustworthy” remains useful, but its bug status is not current truth.
- Discovery's PDF planning gap is stale; Sprint4/accepted extensions prove support.
- Roadmap simultaneously states deployed five-user demo and contains older “deploy/demo immediately next” language. Treat code, roadmap and live production evidence separately.
- Demo source PPTX files (`Demo I Lab3 LIARD.pptx`, `_Demo II Lab3 LIARD.pptx`, `DEMO III Lab3 LIARD (1).pptx`) are not in repo file inventory; only Markdown transcripts were read.
- Fundaleu manual ground truth (8 plans/31 types/394 units) missing, as planos.md explicitly states; only test5 selected-plan ground truth confirmed by document. TGBT↔test4 identity unconfirmed.
- Old report links `docs/tickets/bugs-pendientes/`, `docs/tickets/procesamiento-asincrono/steps.md`, `docs/tickets/auth/`, `docs/planos-interrumpidos/README.md` are absent in current repo inventory. Do not imply those tickets were read.
- External open attempted: Autodesk standardization URL https://help.autodesk.com/view/ACD/2024/ESP/?guid=GUID-D64F8076-4978-44B7-B056-D921C77FEA88 — tool inaccessible; https://download.qelectrotech.org/qet/elements/ELEMENTS.LICENSE — tool inaccessible; https://download.qelectrotech.org/qet/elements/10_electric/10_allpole/ — tool inaccessible. No live confirmation of those payloads; rely on local documentary restrictions and record that provenance.
- External open succeeded: https://qelectrotech.org/ (official product homepage); confirms electrical diagram software and symbol collection, does not independently prove the local collection's no-training clause.
- No ERP/API credentials, José's final Zoho endpoint schema, actual CADIME API limit/latency contract, CADIME partnership, subscription pricing or commission acceptance were available. Price-service meetings are discovery material, not an integrated API contract.

## Complete source inventory actually opened

### Full-text documents

- `AGENTS.md` — full contents read.
- `documentacion/Arquitectura Liard.md` — full contents read.
- `documentacion/Documento de Visión - LIARD.md` — full contents read.
- `documentacion/Entrevistas de discovery.md` — full contents read.
- `documentacion/Roadmap.md` — full contents read.
- `documentacion/demo-1-sprint-1.md` — full contents read.
- `documentacion/demo-2-sprint-2.md` — full contents read.
- `documentacion/demo-3-sprint-3.md` — full contents read.
- `documentacion/planos.md` — full contents read.
- `documentacion/simbolos-tableros-electricos.md` — full contents read.
- `docs/price-service/informe_bom_cadime.md` — full contents read.
- `docs/price-service/reunion1.md` — full contents read.
- `docs/ui-tono-y-mensajes.md` — full contents read.
- `docs/analisis-mejoras/analisis-mejoras.md` — full contents read.

### Code/tests opened fully or in explicit focused sections

- `back/src/modules/quotation/matching/quote-matcher.service.ts` — full.
- `back/src/modules/canonical-catalog/seed/component-materials.ts` — full.
- `back/src/modules/provider/service/catalog-reading.service.ts` — full.
- `back/src/modules/electrical-bom/service/bom-line-reading.service.ts` — full.
- `back/src/modules/provider/controller/provider.controller.ts` — full.
- `back/src/modules/provider/service/provider.service.ts` — owner resolution/list and owner-item guard sections.
- `back/src/modules/electrical-plan/plan-multiplier.config.ts` — full.
- `front/src/utils/uploadPlansValidation.ts` — full.
- `back/src/common/mail/mailer.interface.ts` — full.
- `back/test/modules/provider/unit/catalog-access.spec.ts` — full.
- `back/test/modules/provider/unit/own-catalog-access.spec.ts` — full.
- `back/test/modules/purchase-order/unit/purchase-order-access.spec.ts` — full.
- `component-detector/api.py` — full.
- `component-detector/pipeline.py` — full.
- Targeted search excerpts: schema models/cost/multiplier; auth credentials/password reset mail usage; all source subscription/commission/budget/DWG/observability terms; detector/backend contract cost and family keys; local storage filesystem operations. Repository `rg --files` inventories for pages, Cypress, integration tests, deployment and cited missing documents. Searches are not represented as full-file reads.

### Raster source inventory — all visually inspected via nine contact sheets

- `documentacion/planos/fundaleu-tde-detalle-1.png`
- `documentacion/planos/fundaleu-tde-detalle-2.png`
- `documentacion/planos/fundaleu-tde-general.png`
- `documentacion/planos/fundaleu-tsact-general.png`
- `documentacion/planos/fundaleu-tsss-detalle-1.png`
- `documentacion/planos/fundaleu-tsss-detalle-2.png`
- `documentacion/planos/fundaleu-tsss-general.png`
- `documentacion/planos/ocj-test5-detalle.png`
- `documentacion/planos/ocj-test5-general.png`
- `documentacion/planos/ocj-tgbt-detalle-1.png`
- `documentacion/planos/ocj-tgbt-detalle-2.png`
- `documentacion/planos/ocj-tgbt-detalle-3.png`
- `documentacion/planos/ocj-tgbt-general.png`
- `documentacion/planos/ocj-tscels1-general.png`
- `documentacion/simbolos/130_terminals_terminal_strips.png`
- `documentacion/simbolos/130_terminals_terminal_strips__90_terminal_strips_diagram.png`
- `documentacion/simbolos/130_terminals_terminal_strips__95_terminals_spring_box.png`
- `documentacion/simbolos/200_fuses_protective_gears__10_fuses.png`
- `documentacion/simbolos/200_fuses_protective_gears__11_circuit_breakers.png`
- `documentacion/simbolos/200_fuses_protective_gears__12_magneto_thermal_circuit_breakers.png`
- `documentacion/simbolos/200_fuses_protective_gears__20_disconnecting_switches.png`
- `documentacion/simbolos/200_fuses_protective_gears__30_thermal_relays.png`
- `documentacion/simbolos/200_fuses_protective_gears__50_residual_current_circuit_breaker.png`
- `documentacion/simbolos/200_fuses_protective_gears__90_overvoltage_protections.png`
- `documentacion/simbolos/310_relays_contactors_contacts__01_coils.png`
- `documentacion/simbolos/310_relays_contactors_contacts__02_contacts_cross_referencing__01_auxiliary_contacts.png`
- `documentacion/simbolos/310_relays_contactors_contacts__02_contacts_cross_referencing__02_power_contacts.png`
- `documentacion/simbolos/310_relays_contactors_contacts__02_contacts_cross_referencing__11_delayed_contacts.png`
- `documentacion/simbolos/310_relays_contactors_contacts__02_contacts_cross_referencing__15_protection_contacts.png`
- `documentacion/simbolos/310_relays_contactors_contacts__03_contacts.png`
- `documentacion/simbolos/330_transformers_power_supplies__10_transformers.png`
- `documentacion/simbolos/330_transformers_power_supplies__30_power_supplies.png`
- `documentacion/simbolos/330_transformers_power_supplies__40_uninterruptible_power_supply.png`
- `documentacion/simbolos/340_converters_inverters__10_converters.png`
- `documentacion/simbolos/340_converters_inverters__15_measuring_transducers.png`
- `documentacion/simbolos/340_converters_inverters__20_current_tansformers.png`
- `documentacion/simbolos/340_converters_inverters__90_filters.png`
- `documentacion/simbolos/340_converters_inverters__90_filters__almeto.png`
- `documentacion/simbolos/340_converters_inverters__90_filters__schurter.png`
- `documentacion/simbolos/380_signaling_operating__01_human_machine_interface.png`
- `documentacion/simbolos/380_signaling_operating__11_optical_signaling.png`
- `documentacion/simbolos/380_signaling_operating__12_acoustic_signaling.png`
- `documentacion/simbolos/380_signaling_operating__20_push_buttons.png`
- `documentacion/simbolos/380_signaling_operating__21_selector_switches.png`
- `documentacion/simbolos/380_signaling_operating__25_lever_switches.png`
- `documentacion/simbolos/390_sensors_instruments__60_timers.png`
- `documentacion/simbolos/390_sensors_instruments__70_meters_measuring_indicators.png`
- `documentacion/simbolos/395_electronics_semiconductors__41_PLC_controllers.png`
- `documentacion/simbolos/500_home_installation__40_meters.png`
