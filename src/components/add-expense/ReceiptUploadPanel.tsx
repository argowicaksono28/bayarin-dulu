"use client"

import { useState } from "react"
import { ScanLine, Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import type { ScannedReceipt } from "@/components/receipt/ReceiptScannerSheet"

interface Props {
  onScanned: (receipt: ScannedReceipt) => void
}

export function ReceiptUploadPanel({ onScanned }: Props) {
  const [scanning, setScanning] = useState(false)

  async function handleFile(file: File) {
    setScanning(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/receipt-scan", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Failed to scan receipt")
        return
      }
      onScanned(data as ScannedReceipt)
    } catch {
      toast.error("Failed to scan receipt")
    } finally {
      setScanning(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      {scanning ? (
        <div className="flex flex-col items-center gap-3 py-6">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Scanning receipt…</p>
        </div>
      ) : (
        <>
          <div className="h-24 w-24 rounded-2xl border-2 border-dashed border-border/50 bg-muted/30 flex items-center justify-center">
            <ScanLine className="h-10 w-10 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground text-center px-4">
            Take a photo or upload an image of your receipt to auto-fill the form
          </p>

          {/* Camera capture (mobile) */}
          <label className="w-full cursor-pointer">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
                e.target.value = ""
              }}
            />
            <Button
              type="button"
              className="w-full gap-2 pointer-events-none"
              asChild={false}
            >
              <span className="flex items-center justify-center gap-2">
                <ScanLine className="h-4 w-4" />
                Take Photo
              </span>
            </Button>
          </label>

          {/* File upload */}
          <label className="w-full cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
                e.target.value = ""
              }}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 border-border/50 pointer-events-none"
              asChild={false}
            >
              <span className="flex items-center justify-center gap-2">
                <Upload className="h-4 w-4" />
                Upload from Gallery
              </span>
            </Button>
          </label>
        </>
      )}
    </div>
  )
}
