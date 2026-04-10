import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Users } from "lucide-react"

export function EmptyGroupState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <Users className="h-8 w-8 text-primary" />
      </div>
      <h3 className="font-semibold text-lg mb-1">Belum ada grup</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">
        Buat grup pertamamu dan mulai berbagi tagihan dengan teman
      </p>
      <Button asChild>
        <Link href="/groups/grp_001">Lihat Contoh Grup</Link>
      </Button>
    </div>
  )
}
