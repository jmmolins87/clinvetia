import type { Meta, StoryObj } from "@storybook/react"
import { ROICalculator } from "./roi-calculator"
import { useROIStore } from "@/store/roi-store"
import { useEffect } from "react"

const meta: Meta<typeof ROICalculator> = {
  title: "Marketing/ROICalculator",
  component: ROICalculator,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
}

export default meta
type Story = StoryObj<typeof ROICalculator>

export const Default: Story = {
  render: (args) => {
    const Component = () => {
      // Reset store on mount for clean state in Storybook
      useEffect(() => {
        useROIStore.getState().reset()
      }, [])

      return <ROICalculator {...args} />
    }
    return <Component />
  },
}

export const WithPredefinedValues: Story = {
  render: (args) => {
    const Component = () => {
      useEffect(() => {
        const store = useROIStore.getState()
        store.setMonthlyPatients(500)
        store.setAverageTicket(60)
        store.setConversionLoss(15)
      }, [])

      return <ROICalculator {...args} />
    }
    return <Component />
  },
}

export const CustomTrigger: Story = {
  args: {
    trigger: (
      <button className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-bold hover:scale-105 transition-transform">
        ¡Calcula cuánto ganas!
      </button>
    ),
  },
}

export const InMarketingContext: Story = {
  render: () => (
    <div className="w-full max-w-4xl p-12 bg-background border border-border rounded-3xl overflow-hidden relative">
      <div className="absolute inset-0 bg-primary/5 -z-10" />
      <div className="text-center space-y-4 mb-8">
        <h2 className="text-3xl font-bold">¿Cuánto podrías ahorrar?</h2>
        <p className="text-muted-foreground">Usa nuestra herramienta para proyectar tu crecimiento.</p>
      </div>
      <div className="flex justify-center">
        <ROICalculator />
      </div>
    </div>
  ),
}
