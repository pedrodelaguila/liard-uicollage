# Engineering prototype verification

Scope: `d-projects.html`, `d-engineering.html`, `d-panel.html`, `engineering.js`, `engineering.css`. Checked with bundled Playwright, installed Google Chrome headless, file:// with allow-file-access-from-files. Checks use isolated browser contexts and fictional local state. No production service or paid model called. Repository unchanged.

## Checks actually executed

- `node --check engineering.js` after implementation and every repair: passes.
- Loaded every combination of 3 owned screens × 4 variants (guided/expert/assisted/visual) at 1440×994: content rendered, no pageerror events, document scrollWidth did not exceed viewport.
- Canonical inspector: checked l2 human approval and submitted. Confirmed `DifferentialSwitch` family, `required={poles:4,current:40,sensitivity:30}` retained, canonical confirmed and technicalApproved true. Seed families use shared schema names; editable essential numeric attributes are separate from textual specification.
- Private accessory rule: preview then attempt apply without approval. Accessible error appears; no accessory created. Check approval and apply: one private rule and one proposed accessory line saved. Added line still requires technical review before request.
- Full BOM scenario: save named snapshot, change multiplier from 3 to 5, restore snapshot. Multiplier returns to 3; project version increments to invalidate prior RFQ snapshots. Snapshot includes lines, alternatives and costs, not just toast text.
- Timeout: open upload modal and demonstration disclosure; simulate 504. Plan saved as TIMEOUT; count of detection retry buttons is zero. Manual recovery saves MANUAL and returns to BOM. Busy 503 remains explicitly retryable; 504 does not repeat paid detection.
- CSV export: Playwright download event fires with actual `Hospital-del-Parque-bom-v3.csv` filename. Export uses shared formula escaping and includes drawn quantity, multiplier, purchase quantity, unit, brand, review and origin.
- Model controls: range change, exploded/reunited toggle and accessible 2D toggle operate; `.eng-stage.flat` appears. Model/table selections share line IDs and link back to review.
- Slider accessible names verified by getByRole('slider'): exactly one each named “Giro horizontal del tablero”, “Inclinación del tablero”, “Escala del tablero”.
- Engineering at 390×844, each of all 4 variants: document scrollWidth 390. Wide table scrolls inside its own table-wrap. Guided steps scroll within rail. Assisted details/grid children repaired with min-width:0 and max-width:100%.
- Error recovery with `?v=assisted&estado=error`: click domain recover; URL loses estado via history.replaceState; reload shows zero recover controls. Saved local changes stay intact.
- Counts in unit `u`: input min1/step1. Enter 1.5 and blur: local state version remains1 and l1 quantity remains12, accessible integer validation error appears. Enter7 and blur: quantity saves7. Final test reset restored reproducible seed. Fractional technical attributes such as 2.5mm² remain valid; they are not counts.
- Dialog handlers include Escape close and Tab/Shift+Tab focus loop; project-create focus targets first field. These handlers were source inspected; no comprehensive screen-reader audit claimed.

## Captures visually inspected by engineering agent

- `/private/tmp/liard-engineering-qa.png`: saved scenario page; identified duplicate shared/domain header.
- `/private/tmp/liard-engineering-bom.png`: BOM table and human inspector after timeout/manual recovery.
- `/private/tmp/liard-panel-2d.png`: model front view, selection outline, controls and linked accessible table.
- `/private/tmp/liard-engineering-assisted-mobile-fixed.png`: full mobile assisted page after min-width repair; inspected readable queue/accordions/scrolling table/inspector. Root screenshot suite covers integrated post-repair appearance in `shots/verified`; this file does not claim root captures were individually inspected by engineering.

## Repairs made during verification

Canonical family names corrected to shared English IDs; structured essential inputs added. Shared/domain double heading hidden in owned CSS. PDF copy specifies vectorial single sheet and no scanned support. Multiplier label identifies selected plan, not a production-wide multiplier rule. Timeout distinguished from busy service. Assisted mobile intrinsic width fixed; slider names explicit; recovery query removed. Counts standardized to positive safe integers consistent with commerce.

## Limits and assumptions

- Prototype stores fake file name/format only; no DXF/PDF parsing, network upload or paid analysis. Simulated detection reserves budget before completion and fake charge; PDF content compliance cannot be verified without real parser.
- Single selected-plan contribution modeled by project.multiplier; production has multiplier per plan. The UI labels this scope. No electrical calculations, certified physical geometry or equipment-fit guarantees.
- Private rules and technical alternatives are proposals with explicit approval, no learned customer model. Applying alternatives changes version; supplier offer compatibility remains commerce integration's responsibility.
- Local file persistence can vary by browser; shared store's memory fallback and HTTP server path remain available. Chrome checks observed localStorage persistence in the isolated context.
- Full production lint/typecheck/unit/integration suites were not run: production was read only, and artifact is standalone HTML/CSS/JavaScript. These checks verify local prototype flows, not production implementation readiness.
