import { LoadingOverlay } from "@/components/ui/spinner"

export default function RootLoading() {
  return (
    <LoadingOverlay 
      message="Clinvetia" 
      variant="primary" 
      className="bg-background/95 backdrop-blur-3xl"
    />
  )
}
