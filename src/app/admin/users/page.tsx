import AdminShell from "../../(admin)/layout"
import UsersPage from "../../(admin)/users/page"

export default function AdminUsersRoute() {
  return (
    <AdminShell>
      <UsersPage />
    </AdminShell>
  )
}
