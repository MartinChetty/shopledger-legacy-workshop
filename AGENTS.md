# ShopLedger repository instructions

## Project overview

ShopLedger is an internal wholesale and retail billing, inventory, and Khata ledger application for Corner Shop. It is a Node.js application using Express and `body-parser`, with a static browser UI and JSON-file persistence.

- Entry point: `server.js`
- Package name/version: `shopledger` `0.8.4`
- HTTP framework: Express 4.x
- Static UI: `public/index.html`, `public/js/app.js`, and `public/css/style.css`
- Persistence: `data/db.json`, accessed through `lib/store.js`
- Architecture reference: `docs/shopledger-architecture.svg`

There is no `README.md` in this repository.

## Repository map

- `server.js`: configures Express, JSON parsing, static asset serving, mounts each router at `/api`, and serves `GET /orders/:id/invoice`.
- `config.js`: central configuration for the port, shop details, GST/HSN slabs, inventory defaults, coupons, and the admin export key.
- `routes/`:
  - `products.js`: `GET /products` and `GET /coupons`.
  - `orders.js`: order list/detail, creation, and cancellation routes.
  - `customers.js`: customer/settlement reads and Khata settlement creation.
  - `reports.js`: dashboard, GST reconciliation, pricing preview, and admin export routes.
- `lib/`:
  - `store.js`: synchronous JSON data `read`, `write`, and `appendAudit` functions.
  - `inventory.js`: product lookup, stock checks, reserve/release, and inventory summaries.
  - `pricing.js`: subtotals, discounts, GST totals, and rounding.
  - `tax.js`: GST-rate and CGST/SGST helpers.
  - `coupons.js`: coupon normalization, validation, discount calculation, and active-coupon listing.
  - `orders.js`: order creation, lookup, cancellation, and filtering.
  - `ledger.js`: customer lookup, Khata charge/reversal, balances, and settlements.
  - `reports.js`: dashboard and GST-reconciliation calculations.
  - `dates.js`: Indian date formatting, date-key normalization, and fiscal-year calculation.
  - `invoice.js`: invoice figures and printable HTML rendering.
- `public/`: the browser UI served directly by Express.
- `data/db.json`: the production-style JSON data store containing products, customers, orders, settlements, audit entries, and ID counters.

## Commands

- Install the declared dependencies: `npm install`.
- Start the application: `npm start` (runs `node server.js`).
- Test command: `npm test` is defined, but currently prints `Error: no test specified` and exits with status 1. No test framework or test files are currently configured.

Do not install dependencies unless the assigned task explicitly authorizes it.

## Architecture and coding conventions

- Use CommonJS modules (`require`, `module.exports`, and `exports`).
- Route handlers are Express callback functions. API routers are mounted by `server.js` under `/api`.
- Read and mutate an in-memory database object through the existing `lib/store.js` interface. `store.write(db)` serializes the full object to `data/db.json`.
- Keep business rules in the relevant `lib/` module; routers coordinate request handling and persistence.
- Order totals are calculated with `pricing.computeTotals()`, which uses `coupons.js` and `tax.js`.
- GST rates are resolved from a line item's GST rate or HSN slab through `tax.getRateForItem()`.
- Dates written by `dates.today()` use `DD/MM/YYYY` format.
- Preserve the existing plain JavaScript style: `var`, named functions/exports, and explicit loops are used throughout the codebase.

## Workshop rules

- Write characterization tests before changing existing behaviour.
- Modify only the module or modules associated with the assigned ticket.
- Tests must never read or write the real `data/db.json`.
- Use in-memory fixtures or isolated temporary data for tests.
- Do not introduce new dependencies.
- Keep fixes minimal and run the relevant tests.
