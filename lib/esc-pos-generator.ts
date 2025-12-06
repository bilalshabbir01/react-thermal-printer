import QRCode from "qrcode"

export interface ReceiptItem {
  id: string
  name: string
  quantity: number
  price: number
}

export class ESCPOSGenerator {
  private commands: Uint8Array[] = []

  // ESC/POS command codes
  private static readonly ESC = 0x1b
  private static readonly GS = 0x1d
  private static readonly LF = 0x0a
  private static readonly CR = 0x0d

  // Text alignment (80mm printer = 48 chars width)
  private static readonly ALIGN_LEFT = 0x00
  private static readonly ALIGN_CENTER = 0x01
  private static readonly ALIGN_RIGHT = 0x02
  private static readonly WIDTH_80MM = 48 // Standard 80mm thermal printer width

  constructor() {
    this.reset()
  }

  private reset() {
    this.commands = []
    this.addCommand([ESCPOSGenerator.ESC, 0x40]) // ESC @ - Initialize printer
  }

  private addCommand(data: number[]) {
    this.commands.push(new Uint8Array(data))
  }

  private addText(text: string) {
    const encoder = new TextEncoder()
    this.commands.push(encoder.encode(text))
  }

  private addNewLine() {
    this.addCommand([ESCPOSGenerator.CR, ESCPOSGenerator.LF])
  }

  private setAlignment(align: number) {
    this.addCommand([ESCPOSGenerator.ESC, 0x61, align])
  }

  private setBold(enabled: boolean) {
    this.addCommand([ESCPOSGenerator.ESC, 0x45, enabled ? 0x01 : 0x00])
  }

  private setFontSize(width: number, height: number) {
    const w = Math.min(Math.max(width, 1), 8)
    const h = Math.min(Math.max(height, 1), 8)
    const size = ((w - 1) << 4) | (h - 1)
    this.addCommand([ESCPOSGenerator.ESC, 0x21, size])
  }

  private resetFont() {
    this.addCommand([ESCPOSGenerator.ESC, 0x21, 0x00])
  }

  public async addQRCode(text: string) {
    try {
      const qrData = await QRCode.toDataURL(text, { width: 200, margin: 1 })
      const base64 = qrData.split(",")[1]
      const binaryString = atob(base64)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      this.commands.push(bytes)
      this.addNewLine()
    } catch (error) {
      console.error("QR code generation failed:", error)
    }
    return this
  }

  public addCenteredText(text: string, bold = false, size = 1) {
    this.setAlignment(ESCPOSGenerator.ALIGN_CENTER)
    if (bold) this.setBold(true)
    if (size > 1) this.setFontSize(size, size)
    this.addText(text)
    this.addNewLine()
    if (bold) this.setBold(false)
    if (size > 1) this.resetFont()
    this.setAlignment(ESCPOSGenerator.ALIGN_LEFT)
    return this
  }

  public addLeftText(text: string, bold = false) {
    this.setAlignment(ESCPOSGenerator.ALIGN_LEFT)
    if (bold) this.setBold(true)
    this.addText(text)
    this.addNewLine()
    if (bold) this.setBold(false)
    return this
  }

  public addLine(char = "-", length = ESCPOSGenerator.WIDTH_80MM) {
    this.addText(char.repeat(length))
    this.addNewLine()
    return this
  }

  // Columns: Description (18) | QTY (6) | Rate (8) | Amount (8) | Savings (6)
  public addTableRow(description: string, qty: string, rate: string, amount: string, savings: string, bold = false) {
    if (bold) this.setBold(true)

    const desc = description.substring(0, 18).padEnd(18)
    const q = qty.padStart(5)
    const r = rate.padStart(7)
    const a = amount.padStart(7)
    const s = savings.padStart(5)

    const line = `${desc}${q}${r}${a}${s}`
    this.addText(line)
    this.addNewLine()

    if (bold) this.setBold(false)
    return this
  }

  public addTotalsRow(qtyTotal: string, rateTotal: string, amountTotal: string, savingsTotal: string) {
    this.setBold(true)
    this.addLine("=")
    this.addTableRow("TOTALS", qtyTotal, rateTotal, amountTotal, savingsTotal, true)
    this.setBold(false)
    return this
  }

  public addBlankLines(count = 1) {
    for (let i = 0; i < count; i++) {
      this.addNewLine()
    }
    return this
  }

  public cutPaper() {
    this.addCommand([ESCPOSGenerator.GS, 0x56, 0x00])
    this.addNewLine()
    return this
  }

  public generate(): Uint8Array {
    const totalLength = this.commands.reduce((sum, cmd) => sum + cmd.length, 0)
    const result = new Uint8Array(totalLength)
    let offset = 0

    for (const cmd of this.commands) {
      result.set(cmd, offset)
      offset += cmd.length
    }

    return result
  }
}

export async function generateReceiptESCPOS(items: ReceiptItem[], billNumber: string): Promise<Uint8Array> {
  const generator = new ESCPOSGenerator()

  generator.addCenteredText(billNumber, true, 2).addBlankLines(1)

  await generator.addQRCode(billNumber)

  generator.addBlankLines(1)

  generator.addLine("=")
  generator.addTableRow("Description", "QTY", "Rate", "Amount", "Savings", true)
  generator.addLine("-")

  let totalQty = 0
  let totalRate = 0
  let totalAmount = 0
  let totalSavings = 0

  // Add items rows
  items.forEach((item) => {
    const amount = item.price * item.quantity
    const savings = 0

    generator.addTableRow(
      item.name,
      item.quantity.toString(),
      item.price.toFixed(2),
      amount.toFixed(2),
      savings.toFixed(2),
    )

    totalQty += item.quantity
    totalRate += item.price
    totalAmount += amount
    totalSavings += savings
  })

  generator.addTotalsRow(totalQty.toString(), totalRate.toFixed(2), totalAmount.toFixed(2), totalSavings.toFixed(2))

  generator
    .addBlankLines(1)
    .addLine("=")
    .addCenteredText(`TOTAL AMOUNT: ${totalAmount.toFixed(2)}`, true, 2)
    .addLine("=")
    .addBlankLines(2)
    .addCenteredText("Thank you for your purchase!", false, 1)
    .addBlankLines(3)
    .cutPaper()

  return generator.generate()
}
