import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

// Public GET — no auth required, verified by view token via SECURITY DEFINER function
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.nextUrl.searchParams.get("token")
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 })

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(token) || !uuidRegex.test(params.id)) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 })
  }

  const supabase = createClient()
  const { data, error } = await supabase.rpc("get_public_group_expenses", {
    p_group_id: params.id,
    p_view_token: token,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Invalid or expired link" }, { status: 404 })

  return NextResponse.json(data)
}
