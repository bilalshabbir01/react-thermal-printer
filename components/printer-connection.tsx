"use client"

import { Printer, Wifi } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePrinter } from "@/context/printer-context"

export function PrinterConnection() {
  const { isConnected, isLoading, error, printerName, availablePrinters, connectPrinter, disconnectPrinter } =
    usePrinter()

  const handleConnect = async () => {
    await connectPrinter()
  }

  const handleSelectPrinter = async (printer: string) => {
    await disconnectPrinter()
    await connectPrinter(printer)
  }

  return (
    <div className="flex flex-col gap-4 p-6 rounded-lg border border-border bg-card">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500" : "bg-gray-400"}`} />
        <h3 className="text-sm font-semibold">{isConnected ? "Connected" : "Not Connected"}</h3>
      </div>

      <p className="text-xs text-muted-foreground">
        {isConnected
          ? `Connected to: ${printerName}`
          : "Make sure QZ Tray is running (qz.io/download), then click to connect"}
      </p>

      {error && <p className="text-xs text-red-500 bg-red-50 p-2 rounded">{error}</p>}

      <div className="flex gap-2">
        {!isConnected ? (
          <Button onClick={handleConnect} disabled={isLoading} className="flex items-center gap-2" size="sm">
            <Printer className="w-4 h-4" />
            {isLoading ? "Connecting..." : "Connect Printer"}
          </Button>
        ) : (
          <Button
            onClick={disconnectPrinter}
            variant="outline"
            className="flex items-center gap-2 bg-transparent"
            size="sm"
          >
            <Wifi className="w-4 h-4" />
            Disconnect
          </Button>
        )}
      </div>

      {isConnected && availablePrinters.length > 1 && (
        <div className="border-t pt-4">
          <p className="text-xs font-semibold mb-2">Switch Printer:</p>
          <div className="flex flex-wrap gap-2">
            {availablePrinters.map((printer) => (
              <Button
                key={printer}
                onClick={() => handleSelectPrinter(printer)}
                variant={printerName === printer ? "default" : "outline"}
                size="sm"
                className="text-xs"
              >
                {printer.length > 20 ? printer.substring(0, 20) + "..." : printer}
              </Button>
            ))}
          </div>
        </div>
      )}

      {!isConnected && (
        <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
          <strong>Setup required:</strong>
          <ol className="list-decimal ml-4 mt-1">
            <li>Download and install QZ Tray from qz.io/download</li>
            <li>Start QZ Tray (runs in background)</li>
            <li>Connect your Xprinter XP-80C via USB</li>
            <li>Click "Connect Printer" - it will auto-detect XP-80C</li>
          </ol>
        </div>
      )}
    </div>
  )
}
