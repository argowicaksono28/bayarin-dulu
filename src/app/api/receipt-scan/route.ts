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
      model: "claude-haiku-4-5-20251001",
      max_tokens: 256,
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
              text: `You are a receipt scanner. Extract the total amount and a short description (3-5 words) from this receipt image.
Respond ONLY with a JSON object in this exact format with no markdown or extra text:
{"amount": <number in IDR without currency symbol, just digits>, "description": "<short description>"}
If you cannot determine the total, use 0 for amount. Always respond with valid JSON.`,
            },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    return NextResponse.json({ error: (err as any).error?.message ?? "AI service error" }, { status: 500 })
  }

  const result = await response.json()
  const text = result.content?.[0]?.text ?? "{}"

  try {
    const parsed = JSON.parse(text)
    return NextResponse.json({
      amount: typeof parsed.amount === "number" ? parsed.amount : 0,
      description: typeof parsed.description === "string" ? parsed.description : "",
    })
  } catch {
    return NextResponse.json({ error: "Failed to parse receipt data" }, { status: 500 })
  }
}
