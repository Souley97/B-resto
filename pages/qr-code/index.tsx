"use client"
import { useState } from "react"
import { QRCodeSVG } from "qrcode.react"

export default function QRCodePage() {
  const [tableNumber, setTableNumber] = useState("")
  const [qrCodeData, setQRCodeData] = useState("")

  const generateQRCode = (e: React.FormEvent) => {
    e.preventDefault()
    const data = JSON.stringify({
      type: "table",
      number: tableNumber,
      url: `${window.location.origin}/menu?table=${tableNumber}`,
    })
    setQRCodeData(data)
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">QR Code Generator</h1>
      <form onSubmit={generateQRCode} className="mb-8">
        <input
          type="number"
          placeholder="Table Number"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
          className="border p-2 mr-2"
        />
        <button type="submit" className="bg-purple-500 text-white p-2 rounded">
          Generate QR Code
        </button>
      </form>
      {qrCodeData && (
        <div className="bg-white shadow-md rounded-lg p-4 inline-block">
          <QRCodeSVG value={qrCodeData} size={256} />
          <p className="mt-4 text-center">Table {tableNumber}</p>
        </div>
      )}
    </div>
  )
}

