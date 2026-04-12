import {
  UtensilsCrossed, Building2, Car, ShoppingCart, Ticket, Coffee, Zap, Wifi, Compass, Package,
  PartyPopper, Umbrella, Home, Plane, Gamepad2, Dumbbell, BookOpen, Briefcase,
  Music, Clapperboard, Tent, Pill, PawPrint, GraduationCap, Flame, TreePalm,
  Target, Pizza, Ship, Trophy,
} from "lucide-react"
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

// Group icon options — emoji stored as DB key, icon displayed as monochrome Lucide
export const GROUP_ICON_OPTIONS: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "🎉", label: "Party",      icon: PartyPopper },
  { key: "🏖️", label: "Beach",      icon: Umbrella },
  { key: "🏠", label: "Home",       icon: Home },
  { key: "🍽️", label: "Food",       icon: UtensilsCrossed },
  { key: "🚗", label: "Road Trip",  icon: Car },
  { key: "✈️", label: "Travel",     icon: Plane },
  { key: "🎮", label: "Gaming",     icon: Gamepad2 },
  { key: "🏋️", label: "Fitness",    icon: Dumbbell },
  { key: "📚", label: "Study",      icon: BookOpen },
  { key: "💼", label: "Work",       icon: Briefcase },
  { key: "🎵", label: "Music",      icon: Music },
  { key: "🎬", label: "Cinema",     icon: Clapperboard },
  { key: "🏕️", label: "Camping",    icon: Tent },
  { key: "🛒", label: "Shopping",   icon: ShoppingCart },
  { key: "💊", label: "Health",     icon: Pill },
  { key: "🐾", label: "Pets",       icon: PawPrint },
  { key: "🎓", label: "Graduation", icon: GraduationCap },
  { key: "💪", label: "Workout",    icon: Flame },
  { key: "🌴", label: "Nature",     icon: TreePalm },
  { key: "🎯", label: "Goals",      icon: Target },
  { key: "🍕", label: "Pizza",      icon: Pizza },
  { key: "☕", label: "Coffee",     icon: Coffee },
  { key: "🚢", label: "Cruise",     icon: Ship },
  { key: "⚽", label: "Sports",     icon: Trophy },
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
