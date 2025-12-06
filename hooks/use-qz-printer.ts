"use client"

import { useState, useCallback, useEffect } from "react"
import qz from "@/lib/qz-setup"

export function useQZPrinter() {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [printerName, setPrinterName] = useState<string | null>(null)
  const [availablePrinters, setAvailablePrinters] = useState<string[]>([])
  const [autoConnectAttempted, setAutoConnectAttempted] = useState(false)

  const connectPrinter = useCallback(async (selectedPrinter?: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Connect to QZ Tray daemon
      await qz.websocket.connect()
      console.log("[v0] QZ Tray connected")

      // Find available printers
      const printers = await qz.printers.find()
      console.log("[v0] Available printers:", printers)
      setAvailablePrinters(printers)

      // If specific printer requested, use it
      let finalPrinter = selectedPrinter

      // Otherwise, look specifically for Xprinter XP-80C
      if (!finalPrinter) {
        const xpPrinter = printers.find((p) => {
          const lower = p.toLowerCase()
          return (
            lower.includes("xprinter") ||
            lower.includes("xp-80") ||
            lower.includes("xp80") ||
            lower.includes("xp80c") ||
            lower.includes("80c") ||
            lower.includes("thermal")
          )
        })

        if (xpPrinter) {
          finalPrinter = xpPrinter
          console.log("[v0] XP-80C auto-detected:", xpPrinter)
        }

        // Fall back to first printer if XP-80C not found
        if (!finalPrinter && printers.length > 0) {
          finalPrinter = printers[0]
          console.log("[v0] XP-80C not found, using first available printer:", finalPrinter)
        }
      }

      if (!finalPrinter) {
        throw new Error("No printers found")
      }

      setPrinterName(finalPrinter)
      setIsConnected(true)
      console.log("[v0] Selected printer:", finalPrinter)
    } catch (err: any) {
      const errorMsg = err?.message || "Failed to connect to QZ Tray (is it running?)"
      setError(errorMsg)
      setIsConnected(false)
      console.error("[v0] QZ Connection error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const disconnectPrinter = useCallback(async () => {
    try {
      await qz.websocket.disconnect()
      setIsConnected(false)
      setPrinterName(null)
      console.log("[v0] Disconnected from printer")
    } catch (err: any) {
      setError(err?.message || "Failed to disconnect")
    }
  }, [])

  const printReceipt = useCallback(
    async (escposData: string | Uint8Array) => {
      if (!isConnected || !printerName) {
        const errorMsg = "Printer not connected"
        setError(errorMsg)
        console.log("[v0] Print failed: not connected")
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const config = qz.configs.create(printerName, {
          scaleContent: false,
          rasterize: false,
          encoding: "UTF-8",
          endOfDocumentTrigger: null,
        })

        let printData: string
        if (escposData instanceof Uint8Array) {
          printData = String.fromCharCode.apply(null, Array.from(escposData))
          console.log("[v0] Converted Uint8Array to binary string, length:", escposData.length, "bytes")
        } else {
          printData = escposData
        }

        console.log("[v0] Sending print job to:", printerName)
        console.log("[v0] Data length:", printData.length)

        await qz.print(config, [printData])

        console.log("[v0] Print job sent successfully")
      } catch (err: any) {
        const errorMsg = err?.message || "Failed to print receipt"
        setError(errorMsg)
        console.error("[v0] Print error:", err)
      } finally {
        setIsLoading(false)
      }
    },
    [isConnected, printerName],
  )

  useEffect(() => {
    if (!autoConnectAttempted) {
      setAutoConnectAttempted(true)
      connectPrinter()
    }
  }, [autoConnectAttempted, connectPrinter])

  return {
    isConnected,
    isLoading,
    error,
    printerName,
    availablePrinters,
    connectPrinter,
    disconnectPrinter,
    printReceipt,
  }
}
