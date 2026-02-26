import AdminShell from "../../(admin)/layout"
import AuditPage from "../../(admin)/audit/page"

export default function AdminAuditRoute() {
  return (
    <AdminShell>
      <AuditPage />
    </AdminShell>
  )
}
