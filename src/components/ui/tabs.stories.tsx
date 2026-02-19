import type { Meta, StoryObj } from "@storybook/react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const meta = {
  title: "Design System/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: {},
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-80">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p className="text-sm text-muted-foreground">Overview content goes here.</p>
      </TabsContent>
      <TabsContent value="analytics">
        <p className="text-sm text-muted-foreground">Analytics content goes here.</p>
      </TabsContent>
      <TabsContent value="settings">
        <p className="text-sm text-muted-foreground">Settings content goes here.</p>
      </TabsContent>
    </Tabs>
  ),
}

export const WithCards: Story = {
  name: "With Card Content",
  render: () => (
    <Tabs defaultValue="account" className="w-[420px]">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
      </TabsList>

      <TabsContent value="account">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your account settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Display name</span>
              <Badge variant="secondary">John Doe</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Plan</span>
              <Badge variant="accent">Pro</Badge>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="security">
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Update your password and 2FA.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm">Change Password</Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="billing">
        <Card>
          <CardHeader>
            <CardTitle>Billing</CardTitle>
            <CardDescription>Manage your subscription.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="sm">Upgrade Plan</Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
}

export const Disabled: Story = {
  name: "With Disabled Tab",
  render: () => (
    <Tabs defaultValue="tab1" className="w-72">
      <TabsList>
        <TabsTrigger value="tab1">Active</TabsTrigger>
        <TabsTrigger value="tab2">Normal</TabsTrigger>
        <TabsTrigger value="tab3" disabled>Disabled</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <p className="text-sm text-muted-foreground">First tab content.</p>
      </TabsContent>
      <TabsContent value="tab2">
        <p className="text-sm text-muted-foreground">Second tab content.</p>
      </TabsContent>
    </Tabs>
  ),
}

export const DarkAndLight: Story = {
  name: "Dark + Light",
  globals: { theme: "side-by-side" },
  render: () => (
    <Tabs defaultValue="tab1" className="w-64">
      <TabsList>
        <TabsTrigger value="tab1">Overview</TabsTrigger>
        <TabsTrigger value="tab2">Analytics</TabsTrigger>
        <TabsTrigger value="tab3">Reports</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">
        <p className="text-sm text-muted-foreground mt-2">Overview content.</p>
      </TabsContent>
      <TabsContent value="tab2">
        <p className="text-sm text-muted-foreground mt-2">Analytics content.</p>
      </TabsContent>
      <TabsContent value="tab3">
        <p className="text-sm text-muted-foreground mt-2">Reports content.</p>
      </TabsContent>
    </Tabs>
  ),
}
