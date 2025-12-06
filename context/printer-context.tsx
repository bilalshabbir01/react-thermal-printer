"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useQZPrinter } from "@/hooks/use-qz-printer"

interface PrinterContextType {
  isConnected: boolean
  isLoading: boolean
  error: string | null
  printerName: string | null
  connectPrinter: () => Promise<void>
  disconnectPrinter: () => Promise<void>
  printReceipt: (escposData: string | Uint8Array) => Promise<void>
}

const PrinterContext = createContext<PrinterContextType | undefined>(undefined)

export function PrinterProvider({ children }: { children: ReactNode }) {
  const printerState = useQZPrinter()

  return <PrinterContext.Provider value={printerState}>{children}</PrinterContext.Provider>
}

export function usePrinter() {
  const context = useContext(PrinterContext)
  if (!context) {
    throw new Error("usePrinter must be used within PrinterProvider")
  }
  return context
}
