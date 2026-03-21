import AdminShell from "../../../../(admin)/layout"
import ContactTrabajosPage from "../../../../(admin)/contacts/[contactId]/trabajos/page"

export default async function AdminContactTrabajosRoute({
  params,
}: {
  params: Promise<{ contactId: string }>
}) {
  return (
    <AdminShell>
      <ContactTrabajosPage params={params} />
    </AdminShell>
  )
}
