# 05 - Market, competitors and pricing (LIARD)

Research date: 2026-09-30. Desk research only (web search plus LIARD's own discovery interviews in
`lab3-liard/documentacion/Entrevistas de discovery.md`). Nothing was signed up for, submitted or bought.

How to read the numbers:
- **[S]** a figure published by the named source (still a third-party claim, not audited by me).
- **[E]** my own estimate or arithmetic from sourced inputs. Treat as a hypothesis.
- **[D]** from LIARD's discovery interviews (7 companies, not a representative sample).

---

## 1. Market size and structure

### 1.1 Switchgear / panel building

| Scope | Figure | Source |
| --- | --- | --- |
| Global LV switchgear 2025 | USD 33B to 94B depending on the firm's definition (The Business Research Co. 33.0B; MarketGenics 66.4B; Fortune BI 94.2B) | [S] [ResearchAndMarkets](https://www.researchandmarkets.com/reports/5939740/low-voltage-switchgear-global-market-report), [Switchgear Magazine, Apr 2026](https://switchgear-magazine.com/news/business/low-voltage-switchgear-market-to-reach-115-6-b-by-2035/), [Fortune BI](https://www.fortunebusinessinsights.com/industry-reports/low-voltage-switchgear-market-100924) |
| Global switchgear, all voltages, 2025 | USD 103.7B (to 136.7B in 2030, 5.7% CAGR) | [S] [MarketsandMarkets](https://www.marketsandmarkets.com/Market-Reports/switchgear-market-1162268.html) |
| Latin America share of LV switchgear | 3.6% in 2022, fastest-growing region (4.6% CAGR 2022-28) | [S] [Frost & Sullivan](https://store.frost.com/low-voltage-switchgear-growth-opportunities.html) |
| Latin America LV switchgear, USD | ~1.5B to 2.8B (3.6% x the global range) | [E] |
| South America switchgear (all) | > USD 2.77B by 2031 | [S] [Bonafide Research](https://www.bonafideresearch.com/product/231069785/south-america-switchgear-market) |
| Argentina circuit breakers & fuses 2025 | USD 141.7M, to 180.0M by 2030 (4.9% CAGR) | [S] [MarketsandMarkets](https://www.marketsandmarkets.com/Market-Reports/geography/circuit-breaker-and-fuse-market/argentina) |
| Argentina LV switchgear | Not public. Order of magnitude USD 150M to 350M (breakers are a large share of a board's bill of materials) | [E], unverified |
| US control panel market | USD 4.8B to 5.5B, of which 60-65% is standard / configure-to-order | [S] [Drives & Systems, 2026 blog](https://www.drivesandsystems.com/custom-vs-standard-part-3-how-much-of-the-us-control-panel-market-is-custom-vs-standard/) |

Structure. Five OEMs (ABB, Schneider, Siemens, Eaton, plus Mitsubishi/Chint/Legrand by region) make the devices.
Panel builders (tableristas) assemble and certify (IEC 61439). Distributors sit in between. In Chile about 60% of
panels are said to go through distributors on large projects ([S] [ElectroIndustria, Chile](https://www.emb.cl/electroindustria/articulo.mvc?act=3&srch=&xid=251));
no equivalent figure was found for Argentina. Schneider appears in "a very high proportion" of boards ([D] Nisamat).

### 1.2 Number of panel builders

No census exists anywhere I could find.
- **Argentina:** no public count. Visible firms include Stymel (1983), Tecniark (1997), Ladmill (1999), Servinel,
  EMEVE. ABB Argentina runs a dedicated "Integradores & Tableristas" program ([ABB AR](https://new.abb.com/south-america/argentina/integradores-tableristas)).
  My working range: **300 to 1,500 firms that quote LV boards regularly** [E, unverified]. Meaningful for a pilot, small for a
  SaaS-only business.
- **Global proxies:** Schneider EcoXpert has ~4,000-5,000 partners in 74-120+ countries, all partner types, not only
  panel builders ([S] [Schneider UK EcoXpert](https://www.se.com/uk/en/partners/ecoxpert/)). EPLAN reports 68,000 customers and
  525,000+ users (machine builders, engineering firms and panel shops together) ([S] [EPLAN](https://www.eplan.com/de-en/)).
  UL's directory showed "434 pages" of listed US panel shops about 13 years ago ([S] [Mike Holt forum](https://forums.mikeholt.com/threads/database-of-ul-listed-panel-shops.104807/)).
  Many panel shops are in-house departments: 78% of the 12 firms in the ISW "Schaltschrankbau 4.0" study build in-house.

### 1.3 Electrical wholesale distribution

| Metric | Figure | Source |
| --- | --- | --- |
| Global electrical wholesale 2025 | ~USD 481B (2.3% CAGR to 2035); original firm unidentified, weak source | [S] [prtimes.org](https://www.prtimes.org/news/16375) |
| Sonepar 2025 | USD 37.9B sales; digital USD 13.9B (~37%) | [S] [Digital Commerce 360, Mar 2026](https://www.digitalcommerce360.com/2026/03/24/sonepar-digital-sales-2025/) |
| Rexel 2025 | EUR 19.4B sales; digital 34% of group (44% Europe, 25% N. America) | [S] [Rexel FY2025](https://www.rexel.com/en/q4-sales-fy-2025-results) |
| Graybar 2025 | USD 12.9B, +10.6% | [S] [Yahoo Finance](https://finance.yahoo.com/news/graybar-announces-2025-financial-results-204900699.html) |
| Spain (reference market) | 397 distributors, 1,470 points of sale, EUR 6.0B, +6.7% (ADIME 2025) | [S] [iRehabitae](https://www.irehabitae.es/la-distribucion-de-material-electrico-crecio-un-67-en-2025-segun-se-destaco-en-el-ix-encuentro-adime/) |
| Argentina | No sector revenue published. CADIME (distributors' chamber, 1971) is the entry point; CAME retail proxy for "ferretería y materiales eléctricos": +0.3% y/y Aug 2026 | [S] [CADIME](https://www.cadime.org.ar/) |

### 1.4 Margins

| Actor | Gross margin | Net / operating | Source |
| --- | --- | --- | --- |
| Wesco (FY2025) | 21.1% | - | [S] [Wesco FY2025](https://investors.wesco.com/news-releases/news-release-details/wesco-international-reports-fourth-quarter-and-full-year-2025) |
| Rexel (FY2025) | ~25.2% (10-yr median 24.9%) | adj. EBITA 6.0% | [S] [Rexel](https://www.rexel.com/en/q4-sales-fy-2025-results), [GuruFocus](https://www.gurufocus.com/term/gross-margin/RXEEY) |
| Typical US electrical distributor | ~21-22% | ~3% pretax (NAED 2018: 3.7% net) | [S] [EW model](https://www.ewweb.com/news/article/20921461/the-biggest-profit-secrets-for-electrical-distributors), [NAED](https://blog.naed.org/the-naed-par-report-is-now-available) |
| US panel builders, standard / OEM | 15-25% | - | [S] [Drives & Systems](https://www.drivesandsystems.com/custom-vs-standard-control-panel-profit-margins/) (blog, cites CSIA) |
| US panel builders, custom engineer-to-order | 35-50% | - | same |

Implication [E]: distributors live on ~3% net, so a take rate above ~1-2% of GMV would eat half of their profit on
that order. That caps what LIARD can charge the supply side per transaction.

### 1.5 How estimating is done today

| Evidence | Figure | Source |
| --- | --- | --- |
| Counting a 40-board job | ~1.5 days; a complex board can take a full day | [D] EMEVE |
| Quote volume | Meco 35-40/week (5 people); César Braña 11 people quoting daily; Nisamat 15-20/day per salesperson; GRAMONT ~300/year | [D] |
| Win rate | GRAMONT 10-15% [D]; electrical contractors 18-25% average, >40% suggests underpricing | [S] [Simpro](https://www.simprogroup.com/blog/how-to-bid-estimate-electrical-jobs) (vendor blog) |
| Supplier response time | 2-3 h per quote, more for unusual items | [D] Nisamat |
| Suppliers asked per job | at least 2-3 | [D] EMEVE |
| First responder advantage (manufacturing RFQs) | first quote wins 42%, second 23%, third 12% (PMPA 2023, reported second-hand) | [S] [TribalLogix](https://triballogix.com/blog/rfq-response-time-wins-cnc-contracts), unverified primary |
| Estimating errors | ">65% of electrical cost overruns trace to estimating errors" | [S] [Constructem](https://constructem.com/top-10-electrical-estimating-mistakes-contractors-make-in-2026/), unnamed studies, weak |
| Tools in use | Excel, macros, in-house tools, one paid AI that hallucinated (EMEVE), EPLAN (GRAMONT), Electrobase/Odoo ERPs (Nisamat) | [D] |

No industry survey (NECA, ELECTRI, CFMA, CSIA) with hours-per-quote for **panel** quoting was found publicly.

---

## 2. Competitors and adjacent tools

| Tool | What it does | Public price | Gap vs LIARD |
| --- | --- | --- | --- |
| **EPLAN Electric P8 + Pro Panel** | Electrical CAD, 3D panel layout, wiring and manufacturing data | Not published. Capterra lists P8 at ~USD 1,990/user/yr; Pro Panel is an add-on on top ([Capterra](https://www.capterra.com/p/152595/Electric-P8/), [EPLAN UK](https://blog.eplan.co.uk/how-much-does-eplan-cost)) | Design tool for firms that **author** the drawing. Does not read a third-party DXF/PDF, does not quote across distributors. |
| **EPLAN eBUILD** | Cloud rule-based schematic generation (Project Builder); free tier exists | Free tier; full version via sales ([EPLAN FAQ](https://www.eplan.com/int/en/support/ebuild.html)) | Generates new designs from rules; no plan reading, no marketplace. |
| **Schneider EcoStruxure Power Build (Rapsody)** / **EcoSet Config** (Argentina) | Configure and quote switchboards from an SLD with Schneider parts; BOM, layout, proposal; EcoSet Config is online, 3D, "diseñar y cotizar tableros" | Free (historically freeware; EcoSet described as free by users) ([SE download](https://www.se.com/eg/en/download/document/EcoStruxure_Power_Build/), [SE AR EcoSet](https://www.se.com/ar/es/product-range/345630198-ecoset-config/)) | Single-brand, user re-enters the diagram. LIARD's multi-brand equivalence and reading of the customer's plan is the gap. **Free OEM configurators set the price anchor to zero for "BOM from a known design".** |
| **ABB e-Design** | Suite: calculation (DOC), product selection and quotation (CAT), switchboard design; import BOM from SLD | Freeware ([ABB](https://new.abb.com/low-voltage/support/software/e-design/download)) | Same as Schneider: single-brand, manual entry. |
| **Siemens SIMARIS configuration / create** | Configure ALPHA/SIVACON boards, pricing, power loss, BOM, one-click ordering | Registration-based; price of configuration not confirmed ([Siemens](https://www.siemens.com/en-us/products/simaris/create/)) | Single-brand. |
| **Trimble Accubid** | Electrical contractor estimating (labor units, assemblies) | Not published; third parties: USD 3,000-15,000+/user/yr | US contractor workflow, manual or semi-manual takeoff, no panel device detection, no LatAm catalogs. |
| **ConEst IntelliBid** | Electrical estimating | ~USD 115-200+/user/month (third party) | Same. |
| **McCormick** | Electrical estimating | From USD 300/user/month (Software Advice) ([link](https://www.softwareadvice.com/construction/mccormick-electrical-estimating-profile/)) | Same. |
| **Togal.AI** | AI takeoff on architectural plans (areas, lengths, symbol search) | USD 299/user/month billed yearly ([Togal pricing](https://www.togal.ai/pricing)) | Floor plans, not unifilares; no electrical attribute extraction, no supplier matching. |
| **Kreo** | 2D takeoff with AI tier | USD 35-175/user/month ([Software Finder](https://softwarefinder.com/construction/kreo-software)) | Same. |
| **Drawer AI** | Electrical-specific AI takeoff (devices, fixtures, branch routing); has a "Supplier" plan | Subscriptions via sales; concierge per project from USD 22.20 min, e.g. 400 devices USD 88.80 ([Drawer pricing](https://drawer.ai/pricing), [concierge](https://drawer.ai/takeoff-concierge-service)) | **Closest AI analogue**, but building wiring plans in the US, not switchboard SLDs; per-quantity pricing is a useful model. |
| **Switchonomy** (India) | AI reads image/PDF SLD, builds BOM, applies 12,000+ live prices, generates quote | Free trial; price not found ([Switchonomy](https://switchonomy.com/)) | **Most direct competitor found.** Needs verification of accuracy, catalogs and whether it has any LatAm presence (none seen). |
| **OpenDrawing** | AI BOM from single-line diagrams for switchgear/panelboard makers | Not found ([OpenDrawing](https://opendrawing.ai/blog/?view=announcement)) | Direct competitor on detection; no marketplace seen. |
| **Amazon Business / Zoro** | MRO marketplaces; Amazon referral 6-15% tiered by price; Zoro negotiates per partner | ([Distribution Strategy](https://distributionstrategy.com/2022/04/how-zoro-is-building-real-partnerships-with-distributors-with-no-competitive-risk/)) | Catalog commerce, no project BOM, no technical equivalences; not in Argentina. |
| **Rexel / Sonepar / Graybar digital** | Distributor webshops, EDI, Sonepar "Spark" and Digital Job Center (> USD 2B) | n/a | Each is one distributor's catalog; LIARD compares several. They are potential **customers or partners**, and also the incumbents that could copy the matching layer. |
| **Mercado Libre (Argentina)** | Retail/SMB marketplace, "Industrias y Oficinas", tools/construction | Sale charge ~11-17% plus fixed fee below ARS 33,000 (third-party tables; changed 1 Sep 2026) ([Digital Sellers](https://digitalsellers.com.ar/blog/comisiones-mercado-libre/)) | Unit retail purchases; not project quoting. Shows that Argentine sellers already accept double-digit take rates **for retail demand**, not for B2B project orders. |
| **ElectroNorte (electronorte.com.ar)** | Argentine distributor since 1972, >1,000 catalog items, >60 client companies (its own site) | n/a | Verified as a distributor (not "Electro Norte Outlet", a home appliance store). A prospective supply-side user, not a competitor. |
| **Legrand XL PRO³, IDE CEC, EleCalculador** | Free panel design tools (Legrand LatAm), Argentine free calculators (AEA 90364) | Free | Anchor the free end of the market. |
| **TRA-SER (Trade Service)** | US electrical price database fed into estimating systems | USD 1,260/user/yr ([Trade Service](https://www.tradeservice.com/products/pricing-products/tra-ser-contractors/tra-ser-electrical-contractors)) | Price-data product benchmark; no equivalent found for Argentina. |

**Positioning gap [E]:** no tool found combines (a) reading a third party's DXF/PDF switchboard plan, (b) multi-brand
attribute equivalence, and (c) comparing several distributors' prices and emitting purchase orders. OEM tools are free but
single-brand and need re-entry; US estimating tools are paid but manual and US-centric; AI takeoff tools read floor plans,
not unifilares; Switchonomy and OpenDrawing are the only ones reading SLDs and must be tracked.

---

## 3. Willingness to pay and pricing models

Discovery status: **monetization, commission and WTP were never asked in the interviews** [D]. Suppliers explicitly
rejected handling payments on-platform and said the shown price is only a reference [D].

### 3.1 Benchmarks

| Model | Benchmark | Source |
| --- | --- | --- |
| SaaS per seat, AI takeoff | Togal USD 299/user/month; Kreo USD 35-175 | above |
| SaaS per seat, electrical estimating | IntelliBid ~115-200; McCormick from 300; Accubid 3k-15k/yr | above |
| Per plan / per quantity | Drawer concierge: min USD 22.20 per detection, ~USD 0.22 per device at 400 devices | [Drawer](https://drawer.ai/takeoff-concierge-service) |
| Lead / project data subscription | ConstructConnect USD 129-199/month per market (list), 3,200-7,200/yr reported | [ConstructConnect](https://www.constructconnect.com/pricing), [downtobid](https://downtobid.com/blog/is-constructconnect-worth-it) |
| Price-intelligence data | TRA-SER USD 1,260/user/yr | above |
| B2B marketplace take rate | typically 3-15% (Multiples.vc), 2-10% for bulk goods (Shipturtle) | [Multiples.vc](https://multiples.vc/coverage/b2b-marketplaces), [Shipturtle](https://www.shipturtle.com/blog/marketplace-commission-charges-industry-vendors-shipturtle-2026) |
| Independent manufacturer reps | 8-16% of net sales, 10-12% for electromechanical lines | [SalesCookie 2026](https://blog.salescookie.com/2026/05/01/sales-commission-rates-by-industry-2026/) |
| Amazon referral fee | 15% up to USD 250, 10% to 1,000, 6% above (older schedule) | [Zentail](https://www.zentail.com/blog/marketplace-commission-rates-comparison-jet-com-walmart-amazon-ebay) |
| Mercado Libre AR | ~11-17% + fixed fee | above |

### 3.2 Value-based ceiling for the buyer side [E]

EMEVE: 40 boards ~ 1.5 working days ~ 12 engineer-hours ~ **18 min per board** just counting. Loaded engineer cost in
Argentina is not verified; at an assumed USD 15-30/h, counting costs **USD 4.5-9 per board** (USD 180-360 per 40-board
job). A 60-75% saving (Togal's peer-reviewed figure is ~70%, see §4) is worth roughly **USD 3-7 per board**. Capturing a
third to half of that gives **USD 1-3.5 per board processed**. A firm doing Meco's volume (35-40 quotes/week, board count
per quote unknown) could plausibly justify USD 100-400/month. Every input here except EMEVE's hours is assumed.

### 3.3 Pricing hypotheses to test

1. **Tablerista: firm subscription with a plan quota, not per seat.** Tiers around USD 60 / 150 / 400 per month (ARS
   billing, indexed monthly) with ~N boards included and a per-board overage around USD 1.5-3. Per seat punishes the
   "11 people quoting" shape and invites login sharing. Anchor below Togal's USD 299/user because OEM configurators are free.
2. **Per-plan pay-as-you-go** for occasional users (the GRAMONT shape: ~300 quotes/year), e.g. USD 5-15 per plan
   depending on size, mirroring Drawer's per-quantity concierge.
3. **Supplier side: subscription for structured RFQs, not a transaction fee.** A distributor answering 15-20 quotes/day
   per salesperson at 2-3 h each values receiving a clean, already-interpreted BOM. Hypothesis: USD 100-300/month per
   branch, or a per-qualified-RFQ fee (USD 2-10). Suppliers asked for efficiency and order, "not necessarily more volume" [D].
4. **Take rate only as a later, optional layer:** 0.5-1.5% of the PO value, charged to the supplier on POs issued through
   LIARD. Justification: distributor net margin ~3%, so 2-10% marketplace norms do not transfer to project orders; and with
   payments off-platform the fee is invoice-based and easy to route around. Rep commissions (8-16%) show OEMs pay for demand,
   so an **OEM-funded** fee (Schneider/ABB/Chint paying for specification share) may be more robust than a distributor fee.
5. **Data product:** anonymised price-and-lead-time index per canonical component, sold to distributors and OEMs.
   Benchmark TRA-SER USD 1,260/user/yr. Needs enough quote volume first, and suppliers' consent: they warned listed prices
   are only references to negotiated prices [D].

---

## 4. Differentiators to validate: metric and threshold

| Claim | External evidence | Metric for LIARD | Threshold to call it validated |
| --- | --- | --- | --- |
| **AI detection saves engineer time** | Togal vs On-Screen Takeoff, Univ. of Kansas: ~70% time saved within 5% accuracy (one first-time user, one case) ([Togal case](https://www.togal.ai/case-study/peer-reviewed-study-togal-ai-vs-on-screen-takeoff)); EMEVE's earlier AI failed on hallucinations [D] | End-to-end minutes per board **including human review**, vs the firm's own manual baseline, on 5+ real plans per firm | >= 60% less time per board, and missing essential items <= 1 per board (recall >= 95% on items that carry price) |
| **Trust in the BOM** | Vision document target: 90% on complex boards [D, unvalidated] | Share of lines the engineer accepts without edit | >= 90% on simple boards, >= 80% on complex; at least 3 of 5 pilot firms keep using it after week 4 |
| **Faster supplier answer wins jobs** | First responder wins 42% of RFQs (PMPA, second-hand) | Supplier time from RFQ to priced answer | Median < 30 min vs today's 2-3 h [D]; >= 50% of RFQs answered in-platform |
| **FX / inflation handling is a reason to buy** | Argentina CPI 1.7% m/m, 33.5% y/y (Aug 2026); wholesale USD ARS 1,522, +4.6% YTD, far below inflation ([INDEC](https://www.indec.gob.ar/uploads/informesdeprensa/ipc_09_26A1BE2DC4CD.pdf), [Infobae 29-09-2026](https://www.infobae.com/economia/2026/09/29/el-dolar-volvio-a-ceder-y-se-encamina-a-quedar-por-debajo-de-la-inflacion-en-septiembre/)); payment terms change the price [D] | (a) share of accepted quotes repriced before the PO; (b) catalog age: share of lines refreshed in the last 7 days; (c) WTP for automatic re-quote in USD/ARS | (a) measured baseline first, then a >= 50% reduction in manual repricing; (b) >= 80% of lines < 7 days old for active suppliers; (c) >= 40% of pilot firms say they would pay extra for it |
| **3D / visual layout adds value at quote stage** | ISW "Schaltschrankbau 4.0" (12 firms, 2017, sponsored by EPLAN): 3D design saves up to 35% of engineering and 22% of manufacturing time; wiring is 49% of build time ([all-electronics](https://www.all-electronics.de/elektronik-entwicklung/isw-studie-deckt-die-zeit-und-kostenfresser-auf/795086)). Those savings are in **manufacturing**, after the quote is won. EMEVE's "zona gris" (enclosure size, ventilation, DIN rail, ducts) is a quote-stage pain [D] | Error on enclosure / accessory lines between quote and as-built | Build only if accessories and enclosure explain >= 15% of the quote-vs-actual cost gap, or >= 2 of 5 pilots ask for it unprompted. Otherwise a rule-derived accessory list (EMEVE's approach) is cheaper than 3D |

---

## 5. What could NOT be verified

- Number of panel builders in Argentina, LatAm or worldwide (no census; CADIME, CADIEEL or a Google Maps / AFIP-activity scrape would be needed).
- Argentina LV switchgear and electrical distribution market size (only paid reports: Bonafide, 6Wresearch, Polaris).
- The global electrical wholesale figure (~USD 481B) comes from an unidentified firm via a press site.
- Argentine panel builders' and distributors' margins; loaded engineer cost per hour in Argentina.
- Hours per quote and win rates from any primary survey (only vendor blogs and LIARD's interviews).
- EPLAN Pro Panel/eBUILD, Accubid, McCormick and Siemens SIMARIS configuration current prices (not published).
- Current pricing of Schneider EcoSet Config and Rapsody (free status is from old or third-party sources).
- Switchonomy and OpenDrawing accuracy, pricing, customer count, and whether they target LatAm.
- The PMPA first-responder study and the ">65% of overruns" error statistic (primary sources not found).
- Mercado Libre's exact post-Sept-2026 commission for industrial categories in Argentina.
- Any willingness-to-pay figure from Argentine tableristas or suppliers: never asked in discovery.
