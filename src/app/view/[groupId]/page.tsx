import { createClient } from "@/lib/supabase/server"
import { PublicViewClient } from "./PublicViewClient"

export const dynamic = "force-dynamic"

export default async function PublicViewPage({ 
  params,
  searchParams 
}: { 
  params: { groupId: string }
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const token = typeof searchParams.token === "string" ? searchParams.token : null

  if (!token) {
    return <PublicViewClient errorMsg="Missing access token" />
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(token) || !uuidRegex.test(params.groupId)) {
    return <PublicViewClient errorMsg="Invalid token" />
  }

  const supabase = createClient()
  const { data, error } = await supabase.rpc("get_public_group_expenses", {
    p_group_id: params.groupId,
    p_view_token: token,
  })

  if (error) {
    return <PublicViewClient errorMsg={error.message} />
  }

  if (!data) {
    return <PublicViewClient errorMsg="Invalid or expired link" />
  }

  return <PublicViewClient initialData={data} />
}
