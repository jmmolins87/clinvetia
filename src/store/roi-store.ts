import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export type ClinicType = "pequena" | "mediana" | "grande" | "especializada" | null

interface ROIState {
  token: string | null
  clinicType: ClinicType
  monthlyPatients: number
  averageTicket: number
  conversionLoss: number
  isCalculated: boolean
  hasAcceptedDialog: boolean
  expiresAt: string | null
  setClinicType: (type: ClinicType) => void
  setMonthlyPatients: (patients: number) => void
  setAverageTicket: (ticket: number) => void
  setConversionLoss: (loss: number) => void
  setHasAcceptedDialog: (accepted: boolean) => void
  setExpiration: (date: string) => void
  setClinicData: (data: Partial<Omit<ROIState, "setClinicType" | "setMonthlyPatients" | "setAverageTicket" | "setConversionLoss" | "setClinicData" | "reset" | "setHasAcceptedDialog" | "setExpiration">>) => void
  reset: () => void
}

const initialState = {
  token: null,
  clinicType: null,
  monthlyPatients: 450,
  averageTicket: 65,
  conversionLoss: 18,
  isCalculated: true,
  hasAcceptedDialog: false,
  expiresAt: null,
}

const generateToken = () => {
  return typeof crypto !== "undefined" && crypto.randomUUID 
    ? crypto.randomUUID() 
    : Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export const useROIStore = create<ROIState>()(
  persist(
    (set) => ({
      ...initialState,

      setClinicType: (clinicType) => set((state) => ({ 
        clinicType, 
        isCalculated: true,
        token: state.token || generateToken()
      })),

      setMonthlyPatients: (monthlyPatients) => set((state) => ({ 
        monthlyPatients, 
        isCalculated: true,
        token: state.token || generateToken()
      })),

      setAverageTicket: (averageTicket) => set((state) => ({ 
        averageTicket, 
        isCalculated: true,
        token: state.token || generateToken()
      })),

      setConversionLoss: (conversionLoss) => set((state) => ({ 
        conversionLoss, 
        isCalculated: true,
        token: state.token || generateToken()
      })),

      setHasAcceptedDialog: (hasAcceptedDialog) => set({ hasAcceptedDialog }),

      setExpiration: (expiresAt) => set({ expiresAt }),

      setClinicData: (data) =>
        set((state) => ({
          ...state,
          ...data,
          isCalculated: true,
          token: state.token || generateToken()
        })),

      reset: () => set(initialState),
    }),
    {
      name: "clinvetia-session-store",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)
