"use client"
import { useState } from "react"
import { QrReader } from "react-qr-reader"

interface QRCodeScannerProps {
  onScan: (data: string) => void
}

export default function QRCodeScanner({ onScan }: QRCodeScannerProps) {
  const [startScan, setStartScan] = useState(false)

  const handleScan = (data: string | null) => {
    if (data) {
      onScan(data)
      setStartScan(false)
    }
  }

  return (
    <div>
      {startScan ? (
        <QrReader
          onResult={(result, error) => {
            if (result) {
              handleScan(result?.getText())
            }
            if (error) {
              console.error(error)
            }
          }}
          constraints={{ facingMode: "environment" }}
        />
      ) : (
        <button
          onClick={() => setStartScan(true)}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition duration-300"
        >
          Scan QR Code
        </button>
      )}
    </div>
  )
}

