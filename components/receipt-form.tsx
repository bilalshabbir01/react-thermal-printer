"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Plus } from "lucide-react"

export interface ReceiptItem {
  id: string
  name: string
  quantity: number
  price: number
}

interface ReceiptFormProps {
  onAddItem: (item: ReceiptItem) => void
  onRemoveItem: (id: string) => void
  items: ReceiptItem[]
}

export function ReceiptForm({ onAddItem, onRemoveItem, items }: ReceiptFormProps) {
  const [itemName, setItemName] = useState("")
  const [itemQty, setItemQty] = useState("1")
  const [itemPrice, setItemPrice] = useState("")

  const handleAddItem = () => {
    if (!itemName || !itemPrice) {
      alert("Please fill all fields")
      return
    }

    const newItem: ReceiptItem = {
      id: Date.now().toString(),
      name: itemName,
      quantity: Number.parseInt(itemQty) || 1,
      price: Number.parseFloat(itemPrice) || 0,
    }

    onAddItem(newItem)
    setItemName("")
    setItemQty("1")
    setItemPrice("")
  }

  return (
    <div className="flex flex-col gap-4 p-6 rounded-lg border border-border bg-card">
      <h3 className="text-sm font-semibold">Add Items</h3>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Input
          placeholder="Item name"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          className="text-sm"
        />
        <Input
          placeholder="Quantity"
          type="number"
          value={itemQty}
          onChange={(e) => setItemQty(e.target.value)}
          className="text-sm"
        />
        <Input
          placeholder="Price"
          type="number"
          step="0.01"
          value={itemPrice}
          onChange={(e) => setItemPrice(e.target.value)}
          className="text-sm"
        />
        <Button onClick={handleAddItem} size="sm" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      {items.length > 0 && (
        <div className="flex flex-col gap-2 mt-4">
          <h4 className="text-xs font-semibold uppercase">Current Items</h4>
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-2 rounded bg-muted text-sm">
              <span>
                {item.name} x {item.quantity} @ {item.price}
              </span>
              <Button onClick={() => onRemoveItem(item.id)} size="sm" variant="ghost">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
