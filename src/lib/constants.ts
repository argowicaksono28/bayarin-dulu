import { UtensilsCrossed, Building2, Car, ShoppingCart, Ticket, Coffee, Zap, Wifi, Compass, Package } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export const CATEGORY_OPTIONS: { label: string; emoji: string; icon: LucideIcon }[] = [
  { label: "Makanan",  emoji: "🍽️", icon: UtensilsCrossed },
  { label: "Hotel",    emoji: "🏨", icon: Building2 },
  { label: "Transport",emoji: "⛽", icon: Car },
  { label: "Belanja",  emoji: "🛒", icon: ShoppingCart },
  { label: "Hiburan",  emoji: "🎟️", icon: Ticket },
  { label: "Kopi",     emoji: "☕", icon: Coffee },
  { label: "Utilitas", emoji: "💡", icon: Zap },
  { label: "Internet", emoji: "📶", icon: Wifi },
  { label: "Wisata",   emoji: "🎡", icon: Compass },
  { label: "Lainnya",  emoji: "📦", icon: Package },
]

export const EXPENSE_SUGGESTIONS = [
  "Makan siang",
  "Makan malam",
  "Kopi",
  "Bensin",
  "Parkir",
  "Tagihan listrik",
  "Internet",
  "Belanja bulanan",
]
