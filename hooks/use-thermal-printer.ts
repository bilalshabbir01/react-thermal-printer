"use client"

import { useState, useCallback } from "react"

interface PrinterDevice {
  device: USBDevice
  connected: boolean
  vendorId: number
}

export function useThermalPrinter() {
  const [printerDevice, setPrinterDevice] = useState<PrinterDevice | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connectPrinter = useCallback(async (vendorId = 0x0483) => {
    setIsLoading(true)
    setError(null)

    try {
      const device = await navigator.usb.requestDevice({
        filters: [{ vendorId }],
      })

      await device.open()
      await device.selectConfiguration(1)
      await device.claimInterface(0)

      setPrinterDevice({
        device,
        connected: true,
        vendorId,
      })
    } catch (err: any) {
      setError(err?.message || "Failed to connect printer")
      setPrinterDevice(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const disconnectPrinter = useCallback(async () => {
    if (!printerDevice?.device) return

    try {
      await printerDevice.device.close()
      setPrinterDevice(null)
    } catch (err: any) {
      setError(err?.message || "Failed to disconnect printer")
    }
  }, [printerDevice])

  const printReceipt = useCallback(
    async (escposData: Uint8Array) => {
      if (!printerDevice?.device) {
        setError("Printer not connected")
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        await printerDevice.device.transferOut(1, escposData)

        // Add paper cut command (ESC/POS)
        const cutCommand = new Uint8Array([0x1d, 0x56, 0x00])
        await printerDevice.device.transferOut(1, cutCommand)
      } catch (err: any) {
        setError(err?.message || "Failed to print receipt")
      } finally {
        setIsLoading(false)
      }
    },
    [printerDevice],
  )

  return {
    printerDevice,
    isConnected: printerDevice?.connected || false,
    isLoading,
    error,
    connectPrinter,
    disconnectPrinter,
    printReceipt,
  }
}
