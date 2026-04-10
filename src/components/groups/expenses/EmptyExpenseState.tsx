import { Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  onAdd?: () => void
}

export function EmptyExpenseState({ onAdd }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <Receipt className="h-8 w-8 text-primary" />
      </div>
      <h3 className="font-semibold text-lg mb-1">Belum ada pengeluaran</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">
        Tambahkan pengeluaran pertama dan bagi biaya dengan anggota grup
      </p>
      <Button onClick={onAdd}>Tambah Pengeluaran</Button>
    </div>
  )
}
