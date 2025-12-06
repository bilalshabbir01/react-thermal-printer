"use client"

import { usePrinter } from "@/context/printer-context"
import { generateReceiptESCPOS } from "@/lib/esc-pos-generator"
import type { ReceiptItem } from "./receipt-form"
import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"

interface ReceiptPreviewProps {
  items: ReceiptItem[]
  shopName: string
  invoiceNumber: string
}

export function ReceiptPreview({ items, shopName, invoiceNumber }: ReceiptPreviewProps) {
  const { isConnected, isLoading, printReceipt } = usePrinter()

  const calculateTotal = () => items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const calculateTotals = () => {
    let totalQty = 0
    let totalRate = 0
    let totalAmount = 0

    items.forEach((item) => {
      totalQty += item.quantity
      totalRate += item.price
      totalAmount += item.price * item.quantity
    })

    return { totalQty, totalRate, totalAmount }
  }

  const handlePrint = async () => {
    console.log("[v0] Print button clicked, items count:", items.length, "isConnected:", isConnected)
    const escposData = await generateReceiptESCPOS(items, invoiceNumber)
    console.log("[v0] ESC/POS data generated, bytes:", escposData.length)
    await printReceipt(escposData)
  }

  const isDisabled = !isConnected || isLoading || items.length === 0
  const totals = calculateTotals()

  console.log("[v0] Receipt preview rendered:", { isConnected, isLoading, itemsCount: items.length, isDisabled })

  return (
    <div className="flex flex-col gap-4 p-6 rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Receipt Preview</h3>
        <Button onClick={handlePrint} disabled={isDisabled} className="flex items-center gap-2" size="sm">
          <Printer className="w-4 h-4" />
          {isLoading ? "Printing..." : "Print Receipt"}
        </Button>
      </div>

      <div className="bg-white border border-dashed border-gray-300 p-4 rounded font-mono text-xs leading-relaxed max-w-xs mx-auto">
        <div className="text-center font-bold mb-2 text-sm">{invoiceNumber}</div>

        {/* QR code placeholder */}
        <div className="text-center text-gray-400 mb-2 py-8">[QR Code: {invoiceNumber}]</div>

        <div className="border-t border-dashed pt-2 pb-2">
          {/* Table header */}
          <div className="text-xs font-bold border-b border-dashed pb-1 mb-1">
            <div className="flex justify-between gap-1">
              <span className="flex-1">Description</span>
              <span className="w-8 text-right">QTY</span>
              <span className="w-10 text-right">Rate</span>
              <span className="w-10 text-right">Amount</span>
              <span className="w-10 text-right">Savings</span>
            </div>
          </div>

          {/* Items */}
          {items.length === 0 ? (
            <div className="text-gray-400 text-center py-4">No items</div>
          ) : (
            <>
              {items.map((item) => (
                <div key={item.id} className="flex justify-between gap-1 text-xs mb-1">
                  <span className="flex-1 truncate">{item.name}</span>
                  <span className="w-8 text-right">{item.quantity}</span>
                  <span className="w-10 text-right">${item.price.toFixed(2)}</span>
                  <span className="w-10 text-right">${(item.price * item.quantity).toFixed(2)}</span>
                  <span className="w-10 text-right">$0.00</span>
                </div>
              ))}

              {/* Totals row */}
              <div className="border-t border-dashed pt-1 mt-1 font-bold text-xs">
                <div className="flex justify-between gap-1">
                  <span className="flex-1">TOTALS</span>
                  <span className="w-8 text-right">{totals.totalQty}</span>
                  <span className="w-10 text-right">${totals.totalRate.toFixed(2)}</span>
                  <span className="w-10 text-right">${totals.totalAmount.toFixed(2)}</span>
                  <span className="w-10 text-right">$0.00</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Total amount */}
        <div className="border-t border-dashed pt-2 mt-2 font-bold text-center">
          <div className="text-sm">TOTAL AMOUNT</div>
          <div className="text-lg">${calculateTotal().toFixed(2)}</div>
        </div>

        <div className="text-center text-xs mt-3 text-gray-600">Thank you for your purchase!</div>
      </div>
    </div>
  )
}
