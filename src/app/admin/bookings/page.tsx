import AdminShell from "../../(admin)/layout"
import BookingsPage from "../../(admin)/bookings/page"

export default function AdminBookingsRoute() {
  return (
    <AdminShell>
      <BookingsPage />
    </AdminShell>
  )
}
