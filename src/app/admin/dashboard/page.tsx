import AdminShell from "../../(admin)/layout"
import DashboardPage from "../../(admin)/dashboard/page"

export default function AdminDashboardRoute() {
  return (
    <AdminShell>
      <DashboardPage />
    </AdminShell>
  )
}
