import AdminShell from "../../(admin)/layout"
import ContactsPage from "../../(admin)/contacts/page"

export default function AdminContactsRoute() {
  return (
    <AdminShell>
      <ContactsPage />
    </AdminShell>
  )
}
