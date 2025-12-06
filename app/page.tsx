"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PrinterProvider } from "@/context/printer-context"
import { PrinterConnection } from "@/components/printer-connection"
import { ReceiptForm, type ReceiptItem } from "@/components/receipt-form"
import { ReceiptPreview } from "@/components/receipt-preview"
import { PrinterIcon } from "lucide-react"

function HomeContent() {
  const [items, setItems] = useState<ReceiptItem[]>([])
  const [shopName, setShopName] = useState("My Shop")
  const [invoiceNumber, setInvoiceNumber] = useState("INV-001")

  const handleAddItem = (item: ReceiptItem) => {
    setItems([...items, item])
  }

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-lg bg-orange-500">
            <PrinterIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Thermal Printer</h1>
            <p className="text-sm text-gray-400">React + QZ Tray + TSC TDP-245</p>
          </div>
        </div>

        {/* Shop Settings */}
        <Card className="p-6 mb-6 bg-slate-800 border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Settings</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-gray-300 mb-2 block">Shop Name</label>
              <Input
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Enter shop name"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-300 mb-2 block">Invoice Number</label>
              <Input
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Invoice number"
              />
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Connection & Form */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <PrinterConnection />
            <ReceiptForm items={items} onAddItem={handleAddItem} onRemoveItem={handleRemoveItem} />
          </div>

          {/* Right: Preview */}
          <div>
            <ReceiptPreview items={items} shopName={shopName} invoiceNumber={invoiceNumber} />
          </div>
        </div>
      </div>
    </main>
  )
}

export default function Home() {
  return (
    <PrinterProvider>
      <HomeContent />
    </PrinterProvider>
  )
}
