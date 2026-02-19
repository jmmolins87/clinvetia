import { create } from "zustand"

export type ClinicType = "pequena" | "mediana" | "grande" | "especializada" | null

interface ROIState {
  clinicType: ClinicType
  monthlyPatients: number
  averageTicket: number
  conversionLoss: number
  isCalculated: boolean
  setClinicType: (type: ClinicType) => void
  setMonthlyPatients: (patients: number) => void
  setAverageTicket: (ticket: number) => void
  setConversionLoss: (loss: number) => void
  setClinicData: (data: Partial<Omit<ROIState, "setClinicType" | "setMonthlyPatients" | "setAverageTicket" | "setConversionLoss" | "setClinicData" | "reset">>) => void
  reset: () => void
}

const initialState = {
  clinicType: null,
  monthlyPatients: 300,
  averageTicket: 50,
  conversionLoss: 20,
  isCalculated: false,
}

export const useROIStore = create<ROIState>((set) => ({
  ...initialState,

  setClinicType: (clinicType) => set({ clinicType, isCalculated: true }),

  setMonthlyPatients: (monthlyPatients) => set({ monthlyPatients, isCalculated: true }),

  setAverageTicket: (averageTicket) => set({ averageTicket, isCalculated: true }),

  setConversionLoss: (conversionLoss) => set({ conversionLoss, isCalculated: true }),

  setClinicData: (data) =>
    set((state) => ({
      ...state,
      ...data,
      isCalculated: true,
    })),

  reset: () => set(initialState),
}))
