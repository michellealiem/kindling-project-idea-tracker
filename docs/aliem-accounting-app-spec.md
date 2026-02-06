# ALiEM Accounting App - Build Spec

**Kindling Card**: ALiEM Simple Accounting
**Type**: Permasolution
**Stage**: Spark
**Effort**: Large (1 week+)
**Tags**: permasolution, finance, automation, aliem

## Problem

Michelle pays $20/month ($240/year) for Xero to manage ALiEM LLC accounting. After downgrading from S-Corp to a simple LLC, the needs are minimal:

- Track ~10-15 business expenses per month
- Log occasional ad income (Google AdSense, Amazon Affiliates, biannual sponsor checks)
- Categorize everything for Schedule C tax filing
- Export annual summary for accountant

Xero is massive overkill for this use case.

## Solution

A self-hosted Next.js app (same stack as Kindling) that handles single-member LLC accounting with automated bank/credit card transaction import.

## Accounts to Connect

| Account | Institution | Type |
|---------|------------|------|
| Checking | Ally Bank | Bank |
| Savings | Bank of America | Bank |
| Checking | Bank of America | Bank |
| Business Credit Card | Chase Business Ink | Credit Card |

## Income Sources

| Source | Frequency | Method |
|--------|-----------|--------|
| Google AdSense | Monthly | Direct deposit |
| Amazon Affiliates | Monthly | Direct deposit |
| Sponsors | ~2x/year | Physical check |

## Bank Connection Strategy

### DO NOT use Plaid

Plaid requires ~$500/month minimum in production. This defeats the entire purpose of replacing a $20/month subscription.

### Recommended: SimpleFIN Bridge ($15/year)

- Powered by MX, supports 16,000+ financial institutions
- Ally, BofA, and Chase are all supported
- $15/year flat rate — that's it
- Privacy-focused: you control access, one-click revoke
- Simple REST API: get a token, pull transactions
- Used by Actual Budget, Bursar, and other self-hosted finance tools

### Fallback: CSV Import

All four accounts support CSV export. For months where SimpleFIN has issues:
- Download CSV from bank/CC portal
- Import into app
- Categorize transactions

### How SimpleFIN Works

1. User signs up at simplefin.org ($15/year)
2. Links bank accounts through SimpleFIN's secure portal
3. Gets an API access token (called a "setup token")
4. App uses token to pull transactions via REST API
5. Transactions come back as JSON with date, amount, description, account

## Schedule C Categories (IRS Line Items)

The app must support these expense categories, mapped to Schedule C:

| Line | Category | Examples |
|------|----------|----------|
| 8 | Advertising | Google Ads, promotional materials |
| 10 | Car & Truck | Business mileage (not needed for Michelle) |
| 11 | Commissions & Fees | Payment processing fees |
| 15 | Insurance | Business insurance |
| 17 | Legal & Professional | Accountant, legal fees |
| 18 | Office Expense | Office supplies, small equipment |
| 20a | Rent - Vehicle/Equipment | Equipment rental |
| 20b | Rent - Other | Office space rental |
| 22 | Supplies | Business supplies |
| 24a | Travel | Flights, hotels for business |
| 24b | Meals | Business meals (50% deductible) |
| 25 | Utilities | Internet, phone (business portion) |
| 27a | Other - Software | SaaS subscriptions, domains, hosting |
| 27b | Other - Education | Courses, books, conferences |
| 27c | Other - Misc | Everything else |

### Custom Categories for ALiEM

- **Software & Subscriptions** (hosting, domains, SaaS tools)
- **Education & Conferences** (CME, conferences, books)
- **Professional Services** (accountant, legal)
- **Meals & Entertainment** (50% deductible - needs business purpose note)

## Core Features

### 1. Dashboard
- Year-to-date income vs expenses
- Quarterly P&L snapshots
- Uncategorized transaction count (action item)
- Monthly burn rate

### 2. Transaction Management
- Auto-import from SimpleFIN (daily or on-demand sync)
- CSV import fallback
- Manual entry for cash/check transactions (sponsor checks)
- Bulk categorization (assign category to multiple similar transactions)
- Split transactions (e.g., Amazon order that's part business, part personal)
- "Business purpose" notes field (critical for meals, travel)

### 3. Smart Categorization
- Learn from past categorizations (vendor -> category mapping)
- Auto-suggest categories for known vendors
- Flag potential personal expenses mixed in business accounts
- Rules engine: "If vendor contains 'AWS', auto-categorize as Software"

### 4. Income Tracking
- Log income by source (AdSense, Amazon, Sponsors)
- Track against 1099 thresholds
- Annual income summary by source

### 5. Reports
- **Schedule C Summary**: The exact numbers your accountant needs
- **Quarterly P&L**: Income vs expenses by quarter
- **Category Breakdown**: Expenses by category with drill-down
- **Export to CSV/PDF**: For accountant handoff
- **Annual Tax Package**: One-click export of everything needed for tax filing

### 6. Quarterly Tax Awareness
- Running profit calculation
- Flag if estimated taxes may be owed (net profit > $1,000 threshold)
- Show quarterly deadlines (Apr 15, Jun 15, Sep 15, Jan 15)
- Not a calculator, just an awareness nudge

## Data Architecture

### Transaction Model

```typescript
interface Transaction {
  id: string;
  date: string;                    // ISO 8601
  amount: number;                  // Negative for expenses, positive for income
  description: string;             // From bank/CC
  vendor: string;                  // Cleaned vendor name
  category: ScheduleCCategory | null;  // null = uncategorized
  account: 'ally-checking' | 'boa-savings' | 'boa-checking' | 'chase-ink';
  type: 'expense' | 'income' | 'transfer';
  businessPurpose?: string;        // Required for meals/travel
  receiptNote?: string;            // Optional note about receipt
  isPersonal: boolean;             // Flag to exclude from business reporting
  importSource: 'simplefin' | 'csv' | 'manual';
  importId?: string;               // Dedup key from SimpleFIN
  createdAt: string;
  updatedAt: string;
}

interface VendorRule {
  id: string;
  pattern: string;                 // Regex or substring match
  category: ScheduleCCategory;
  isPersonal?: boolean;            // Auto-mark as personal
}

interface IncomeEntry {
  id: string;
  date: string;
  amount: number;
  source: 'adsense' | 'amazon-affiliates' | 'sponsor' | 'other';
  description: string;
  account: string;
  transactionId?: string;          // Link to imported transaction
}
```

### Storage Strategy

**Primary**: localStorage (single device - Mac Studio at home)
**Backup**: Repo lives in Dropbox folder = automatic cloud sync + version history
**Export**: Manual JSON/CSV export for extra safety

#### Why Dropbox is sufficient backup:

- Dropbox keeps 30-day version history (180 days on Plus plan)
- The entire app + data lives in the Dropbox-synced folder
- localStorage data gets exported to JSON periodically (app prompts monthly)
- If browser localStorage clears, import from latest JSON backup
- Git history provides additional versioning

#### Recommended backup ritual:
1. App auto-prompts monthly "Export your data backup?"
2. JSON backup saved to `~/Dropbox/ALiEM-Accounting/backups/`
3. Git commits capture code changes
4. Dropbox handles cloud sync and versioning

## Security Considerations

### What's sensitive
- Bank transaction data (amounts, vendors, dates)
- SimpleFIN API token
- Business income figures

### Security model
- **All data stays local** - nothing sent to external servers (except SimpleFIN API calls over HTTPS)
- **SimpleFIN token** stored in `.env.local` (gitignored, never committed)
- **No authentication needed** - it's your local browser on your Mac Studio
- **HTTPS only** for SimpleFIN API calls
- **No Ollama/AI** - no financial data sent to any model
- **Dropbox encryption** - Dropbox encrypts files at rest and in transit
- **JSON exports are plaintext** - don't put them in public repos

### What we do NOT need
- User authentication (single user, local machine)
- Database encryption at rest (localStorage is per-browser, machine is yours)
- Multi-device sync (Mac Studio only)
- Server-side storage (no backend)

## Tech Stack

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Framework | Next.js 14 (App Router) | Same as Kindling, familiar |
| Styling | Tailwind CSS | Same as Kindling |
| Storage | localStorage + JSON export | Simple, sufficient for single-user |
| Bank Sync | SimpleFIN Bridge API | $15/year, simple REST, privacy-first |
| CSV Parsing | Papa Parse | Battle-tested CSV parser |
| Charts | Recharts or Chart.js | Lightweight, for dashboard |
| PDF Export | @react-pdf/renderer | For accountant-ready reports |
| Icons | Lucide React | Same as Kindling |

## Build Phases

### Phase 1: Core (MVP)
- [ ] Transaction entry (manual)
- [ ] CSV import from all 4 accounts
- [ ] Schedule C categorization
- [ ] Basic dashboard (YTD income/expenses)
- [ ] JSON export/import for backup
- [ ] Income logging

### Phase 2: Automation
- [ ] SimpleFIN integration (auto-pull transactions)
- [ ] Vendor rules engine (auto-categorize)
- [ ] Duplicate detection (prevent double-imports)
- [ ] Monthly backup prompt

### Phase 3: Tax Reporting
- [ ] Schedule C summary report
- [ ] Quarterly P&L view
- [ ] Annual tax package export (CSV + PDF)
- [ ] Quarterly estimated tax awareness nudge

### Phase 4: Polish
- [ ] Transaction search and filtering
- [ ] Bulk categorization
- [ ] Split transactions
- [ ] Category spending trends (charts)
- [ ] Year-over-year comparison

## Cost Analysis

| Item | Current (Xero) | New (Self-hosted) |
|------|----------------|-------------------|
| Accounting software | $240/year | $0 |
| Bank sync | Included | $15/year (SimpleFIN) |
| Hosting | N/A | $0 (Netlify free or local) |
| **Total** | **$240/year** | **$15/year** |
| **Savings** | | **$225/year** |

## Open Questions

1. Should this be a separate repo or a route within Kindling?
   - Recommendation: **Separate repo** - different domain, different data, clean separation
2. Should we host on Netlify or just run locally?
   - Recommendation: **Local only** (`npm run dev`) since it's single-machine anyway. Simpler security model.
3. Do we want receipt photo storage eventually?
   - Can add later: photo -> base64 in localStorage, or save to Dropbox folder
4. Is the Mac Studio always-on, or do we need to handle "sync on demand"?
   - SimpleFIN can be triggered manually: "Sync Now" button

## References

- [SimpleFIN Bridge](https://simplefin.org) - $15/year bank connection API
- [IRS Schedule C Instructions](https://www.irs.gov/instructions/i1040sc) - Expense categories
- [Papa Parse](https://www.papaparse.com/) - CSV parsing library
- [Plaid Pricing](https://plaid.com/pricing/) - Why we're NOT using Plaid (~$500/month)
