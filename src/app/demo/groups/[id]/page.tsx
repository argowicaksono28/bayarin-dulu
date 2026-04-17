import { DemoGroupDetail } from "@/components/demo/DemoGroupDetail"

interface PageProps {
  params: { id: string }
}

export default function DemoGroupPage({ params }: PageProps) {
  return <DemoGroupDetail groupId={params.id} />
}
