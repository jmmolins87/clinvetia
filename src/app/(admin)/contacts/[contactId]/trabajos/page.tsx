import ClientTrabajosPage from "@/components/admin/client-trabajos-page"

export default async function ContactTrabajosPage({
  params,
}: {
  params: Promise<{ contactId: string }>
}) {
  const { contactId } = await params

  return <ClientTrabajosPage contactId={contactId} />
}
