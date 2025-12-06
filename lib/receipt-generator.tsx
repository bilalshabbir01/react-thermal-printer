import { Printer, Text, Row } from "react-thermal-printer"
import type { ReceiptItem } from "@/components/receipt-form"

export async function generateReceiptESCPOS(
  items: ReceiptItem[],
  shopName: string,
  invoiceNumber: string
) {

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const now = new Date()
  const date = now.toLocaleDateString()
  const time = now.toLocaleTimeString()

  const receipt = Printer.render(
    <Printer type="epson" width={48} color="black" > 
      {/* SHOP NAME */}
      <Text align="center" bold size={{ width: 2, height: 2 }}>
        {shopName}
      </Text>

      <Text align="center">
        DUPLICATE
      </Text>

      <Text>{"-----------------------------------------------"}</Text>

      {/* BILL INFO */}
      <Row left={`Bill #: ${invoiceNumber}`} right={`Date: ${date}`} />
      <Row left={`Time: ${time}`} right={`Cashier: CASHIER1`} />

      <Text>{"-----------------------------------------------"}</Text>

      {/* TABLE HEADER */}
      <Row 
        left="Description" 
        right="Qty   Rate   Value"
      />
      <Text>{"-----------------------------------------------"}</Text>

      {/* ITEMS */}
      {items.map((item) => {
        const value = (item.quantity * item.price).toFixed(2)
        const rate = item.price.toFixed(2)

        return (
          <>
            <Text>{item.name}</Text>
            <Row
              left=""
              right={`${item.quantity}   ${rate}   ${value}`}
            />
          </>
        )
      })}

      <Text>{"-----------------------------------------------"}</Text>

      {/* TOTALS */}
      <Row left={`Total Items: ${items.length}`} right={total.toFixed(2)} bold />

      {/* OPTIONAL DISCOUNT, PAYMENT ETC */}
      <Row left="Net" right={total.toFixed(2)} bold />
      <Row left="Payment" right={"0.00"} />
      <Row left="Change" right={"0.00"} />

      <Text>{"-----------------------------------------------"}</Text>

      {/* FOOTER */}
      <Text align="center">Thank you for shopping!</Text>
      <Text>{"\n\n\n"}</Text>
    </Printer>
  )

  return receipt
}
