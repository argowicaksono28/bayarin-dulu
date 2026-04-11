import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = createClient(request as any)
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ error: "Receipt scanning not configured" }, { status: 503 })

  const formData = await request.formData()
  const file = formData.get("file") as File | null
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const base64 = Buffer.from(bytes).toString("base64")
  const mediaType = (file.type || "image/jpeg") as "image/jpeg" | "image/png" | "image/gif" | "image/webp"

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64 },
            },
            {
              type: "text",
              text: `You are a receipt OCR engine. Extract ALL line items, tax, service charge, and totals from this receipt image.

IMPORTANT NOTES:
- "PB1" on Indonesian receipts = government restaurant/hotel tax (Pajak Bangunan 1), typically 10%. Treat it as tax.
- "Service" or "Service Charge" = service charge, typically 5-10%.
- Amounts are in IDR (Indonesian Rupiah) — digits only, no symbols.
- qty defaults to 1 if not shown.

Respond ONLY with raw JSON (no markdown, no code fences):
{
  "restaurantName": "string or empty",
  "items": [
    { "name": "item name", "qty": 1, "amount": 12000 }
  ],
  "subtotal": 0,
  "taxLabel": "PB1 or Tax or empty",
  "taxPercent": 0,
  "tax": 0,
  "serviceChargePercent": 0,
  "serviceCharge": 0,
  "total": 0
}

If a field cannot be determined, use 0 or empty string. Always output valid raw JSON.`,
            },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    console.error("Anthropic API error:", err)
    return NextResponse.json({ error: (err as any).error?.message ?? "AI service error" }, { status: 500 })
  }

  const result = await response.json()
  const raw = (result.content?.[0]?.text ?? "").trim()

  // Strip markdown code fences if present
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim()

  try {
    const parsed = JSON.parse(cleaned)

    // Derive taxPercent from tax amount if not given
    let taxPercent = typeof parsed.taxPercent === "number" ? parsed.taxPercent : 0
    let serviceChargePercent = typeof parsed.serviceChargePercent === "number" ? parsed.serviceChargePercent : 0
    const subtotal = typeof parsed.subtotal === "number" ? parsed.subtotal : 0
    if (taxPercent === 0 && subtotal > 0 && parsed.tax > 0) {
      taxPercent = Math.round((parsed.tax / subtotal) * 100)
    }
    if (serviceChargePercent === 0 && subtotal > 0 && parsed.serviceCharge > 0) {
      serviceChargePercent = Math.round((parsed.serviceCharge / subtotal) * 100)
    }

    return NextResponse.json({
      restaurantName: typeof parsed.restaurantName === "string" ? parsed.restaurantName : "",
      items: Array.isArray(parsed.items)
        ? parsed.items.map((item: any, idx: number) => ({
            id: String(idx),
            name: typeof item.name === "string" ? item.name : `Item ${idx + 1}`,
            qty: typeof item.qty === "number" ? item.qty : 1,
            amount: typeof item.amount === "number" ? item.amount : 0,
          }))
        : [],
      subtotal,
      taxLabel: typeof parsed.taxLabel === "string" ? parsed.taxLabel : "Tax",
      taxPercent,
      tax: typeof parsed.tax === "number" ? parsed.tax : 0,
      serviceChargePercent,
      serviceCharge: typeof parsed.serviceCharge === "number" ? parsed.serviceCharge : 0,
      total: typeof parsed.total === "number" ? parsed.total : 0,
    })
  } catch {
    console.error("Receipt scan raw response:", raw)
    return NextResponse.json({ error: "Failed to read receipt — try a clearer photo" }, { status: 500 })
  }
}
