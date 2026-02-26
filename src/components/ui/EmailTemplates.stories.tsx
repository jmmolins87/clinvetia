import type { Meta, StoryObj } from "@storybook/react"

import {
  adminUserInviteEmail,
  adminUserResetPasswordEmail,
  bookingConfirmationEmail,
  contactConfirmationEmail,
  internalLeadNotificationEmail,
  leadSummaryEmail,
} from "@/lib/emails"

function EmailPreview({ html }: { html: string }) {
  return (
    <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-black/20 p-2">
      <iframe
        title="email-preview"
        srcDoc={html}
        className="h-[880px] w-full rounded-lg bg-white"
        sandbox=""
      />
    </div>
  )
}

const meta = {
  title: "Design System/Email Templates",
  component: EmailPreview,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "Previews de plantillas HTML de correo (render real en iframe con `srcDoc`).",
      },
    },
  },
} satisfies Meta<typeof EmailPreview>

export default meta
type Story = StoryObj<typeof meta>

const mockBooking = {
  dateLabel: "Miércoles, 4 de marzo de 2026",
  timeLabel: "11:30",
  duration: 45,
}

const mockRoi = {
  monthlyPatients: 240,
  averageTicket: 86,
  conversionLoss: 28,
  roi: 31,
}

export const DemoConfirmation: Story = {
  render: () => (
    <EmailPreview
      html={bookingConfirmationEmail({
        name: "Dra. Laura Pérez",
        dateLabel: mockBooking.dateLabel,
        timeLabel: mockBooking.timeLabel,
        duration: mockBooking.duration,
        brandName: "Clinvetia",
        supportEmail: "info@clinvetia.com",
      })}
    />
  ),
}

export const ContactConfirmation: Story = {
  render: () => (
    <EmailPreview
      html={contactConfirmationEmail({
        name: "Dra. Laura Pérez",
        brandName: "Clinvetia",
        supportEmail: "info@clinvetia.com",
      })}
    />
  ),
}

export const LeadSummary: Story = {
  render: () => (
    <EmailPreview
      html={leadSummaryEmail({
        brandName: "Clinvetia",
        nombre: "Dra. Laura Pérez",
        email: "laura@clinicaprueba.com",
        telefono: "600123123",
        clinica: "Clínica Veterinaria Centro",
        mensaje: "Queremos revisar tiempos de respuesta y agenda de urgencias. Nos interesa ver el flujo de demo completo.",
        supportEmail: "info@clinvetia.com",
        booking: mockBooking,
        roi: mockRoi,
      })}
    />
  ),
}

export const InternalLeadNotification: Story = {
  render: () => (
    <EmailPreview
      html={internalLeadNotificationEmail({
        brandName: "Clinvetia",
        nombre: "Dra. Laura Pérez",
        email: "laura@clinicaprueba.com",
        telefono: "600123123",
        clinica: "Clínica Veterinaria Centro",
        mensaje: "Necesitamos mejorar captación y atención de leads desde web y teléfono.",
        booking: mockBooking,
        roi: mockRoi,
      })}
    />
  ),
}

export const UserInvite: Story = {
  render: () => (
    <EmailPreview
      html={adminUserInviteEmail({
        brandName: "Clinvetia",
        recipientName: "Marina Torres",
        recipientEmail: "marina@clinvetia.com",
        role: "manager",
        generatedPassword: "ABcd1234xyZ9",
        confirmUrl: "http://localhost:3000/admin/confirm-user-action?token=mock-token",
        supportEmail: "info@clinvetia.com",
      })}
    />
  ),
}

export const UserResetPassword: Story = {
  render: () => (
    <EmailPreview
      html={adminUserResetPasswordEmail({
        brandName: "Clinvetia",
        recipientName: "Marina Torres",
        recipientEmail: "marina@clinvetia.com",
        generatedPassword: "Zx91pqrs88LM",
        confirmUrl: "http://localhost:3000/admin/confirm-user-action?token=mock-token",
        supportEmail: "info@clinvetia.com",
      })}
    />
  ),
}

