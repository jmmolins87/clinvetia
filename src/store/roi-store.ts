import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { storage } from "@/lib/storage"

export type ClinicType = "pequena" | "mediana" | "grande" | "especializada" | null

interface ROIState {
  token: string | null
  accessToken: string | null
  clinicType: ClinicType
  monthlyPatients: number
  averageTicket: number
  conversionLoss: number
  isCalculated: boolean
  hasAcceptedDialog: boolean
  expiresAt: string | null
  formExpiresAt: string | null
  setClinicType: (type: ClinicType) => void
  setMonthlyPatients: (patients: number) => void
  setAverageTicket: (ticket: number) => void
  setConversionLoss: (loss: number) => void
  setHasAcceptedDialog: (accepted: boolean) => void
  setAccessToken: (token: string | null) => void
  setExpiration: (date: string) => void
  setFormExpiration: (date: string | null) => void
  setClinicData: (data: Partial<Omit<ROIState, "setClinicType" | "setMonthlyPatients" | "setAverageTicket" | "setConversionLoss" | "setClinicData" | "reset" | "setHasAcceptedDialog" | "setExpiration" | "setFormExpiration" | "setAccessToken">>) => void
  reset: () => void
}

const initialState = {
  token: null,
  accessToken: null,
  clinicType: null,
  monthlyPatients: 450,
  averageTicket: 65,
  conversionLoss: 18,
  isCalculated: false,
  hasAcceptedDialog: false,
  expiresAt: null,
  formExpiresAt: null,
}

const generateToken = () => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID()
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
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

      setAccessToken: (accessToken) => set({ accessToken }),

      setExpiration: (expiresAt) => set({ expiresAt }),

      setFormExpiration: (formExpiresAt) => set({ formExpiresAt }),

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
      storage: createJSONStorage(() => ({
        getItem: (name) => storage.get("session", name, null),
        setItem: (name, value) => storage.set("session", name, value),
        removeItem: (name) => storage.remove("session", name),
      })),
    }
  )
)
