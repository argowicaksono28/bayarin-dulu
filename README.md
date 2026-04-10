# Bayarin Dulu — MVP UI Preview

Split-bill app UI/UX design review build. Fully runnable on mock data — no backend, no database.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Screens

| Route | Description |
|---|---|
| `/` | Redirect to `/dashboard` |
| `/auth` | Sign In / Sign Up / Magic Link + Google OAuth |
| `/dashboard` | Global balance, group list, notification bell |
| `/groups/grp_001` | Bali Trip 2025 — Expenses / Balances / Activity |
| `/groups/grp_002` | Kost Margonda — 3 members |
| `/groups/grp_003` | Makan Siang Kantor — 4 members |

## How to Review Each Screen

### Auth (`/auth`)
- Three tabs: Masuk, Daftar, Magic Link
- Try submitting with empty fields to see zod validation errors
- Google OAuth button is UI-only (non-functional)
- Valid sign in redirects to `/dashboard`

### Dashboard (`/dashboard`)
- Watch skeleton loading for ~800ms, then group cards appear
- Green/red balance hero card shows net position across all groups
- Bell icon → notification popover with 5 unread items + "Mark all read"
- Click any group card to navigate to group detail

### Group Detail (`/groups/grp_001`)
**Pengeluaran tab:**
- 6–8 mock expenses with search bar (type to filter live)
- FAB (+) → opens Add Expense (Sheet on mobile, Dialog on desktop)

**Saldo tab:**
- Debt rows with "Lunasi" and "Tagih" buttons
- Click "Lunasi" → AlertDialog → confirm → balance disappears + 5s undo Toast
- Click "Batalkan" in toast → balance restored
- Hover over debtor/creditor avatars → HoverCard with breakdown

**Aktivitas tab:**
- Chronological feed of mock events (expense added, settlement, member joined)

### Add Expense (FAB in Pengeluaran tab)
1. Click calculator icon → custom numpad; try `25000+15000÷2` (evaluates to 32500)
2. Type description → autocomplete chips appear
3. Switch split tabs: Sama Rata / Persen / Nominal / Bagian — live validation
4. Open "Pajak & Biaya Layanan" accordion → enter tax % → live breakdown card updates
5. Select category from emoji grid
6. Save button only enables when form is valid + split is valid

### Settlement Flow
1. Group detail → Saldo tab → "Lunasi" on any row
2. Confirm in AlertDialog → balance row disappears instantly (optimistic)
3. Toast appears with 5s countdown; click "Batalkan" → balance restored

### Request Payment
1. Saldo tab → "Tagih" button (only on rows where you're owed)
2. Edit the pre-filled Indonesian message
3. Toggle "Sertakan nama grup" switch
4. "Salin Pesan" → clipboard + success toast
5. "WhatsApp" → opens wa.me with encoded message

### Invite Member
1. Group header → "Undang" button
2. Copy link → toast; QR placeholder; Email → toast on send

### Notifications
1. Bell icon (top bar on mobile, header on desktop)
2. 5 unread items; click any → marks as read
3. "Tandai semua dibaca" → badge disappears

## Responsive Layout

| Breakpoint | Layout |
|---|---|
| < 1024px | TopBar (fixed top) + page content + BottomNav (fixed bottom) |
| ≥ 1024px | Left sidebar 240px + scrollable main content area |

Forms open as **Sheet** (slide-up) on mobile, **Dialog** (center modal) on desktop.

## Dark Mode

Click the Sun/Moon icon → Light / Dark / System options (persists across navigation)

## Mock Data (`src/lib/mock-data.ts`)

5 users (current user = Budi Santoso `usr_001`), 3 groups, 12 expenses, 9 balances, 12 activities, 7 notifications.

## Stack

- Next.js 14.2 (App Router)
- shadcn/ui + Tailwind CSS v4
- TypeScript — `npx tsc --noEmit` passes clean
- react-hook-form + zod
- mathjs (calculator keyboard expression evaluator)
- next-themes (dark mode)
- sonner (toasts)

## Known Limitations

- No persistent state — refreshing resets optimistic updates
- QR code is a static placeholder (random boxes)
- Receipt upload button is UI-only
- Email invite sends a mock toast only (no real email)
- FAB on dashboard creates no real group (placeholder)
