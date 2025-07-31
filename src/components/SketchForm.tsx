// src/components/SketchForm.tsx
import React, { useRef } from 'react'
import { Dialog, DialogContent } from './ui/dialog'
import { Button } from './ui/button'

interface SketchFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (file: File) => void
  caseData: {
    caseNumber: string
    clientName:  string
    clientAddress: string
  }
  isLoading: boolean
}

export default function SketchForm({
  isOpen,
  onClose,
  onSave,
  caseData,
  isLoading,
}: SketchFormProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawing = useRef(false)

  // Helper: liefert Maus- oder Touch-Koordinaten relativ zum Canvas
  const getPoint = (x: number, y: number) => {
    const canvas = canvasRef.current!
    const rect   = canvas.getBoundingClientRect()
    const scaleX = canvas.width  / rect.width
    const scaleY = canvas.height / rect.height
    return {
      x: (x - rect.left) * scaleX,   // hier x statt clientX
      y: (y - rect.top)  * scaleY,   // hier y statt clientY
    }
  }

  // Start drawing (Mouse & Touch)
  const startDraw = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const pt = getPoint(clientX, clientY)
    isDrawing.current = true
    ctx.beginPath()
    ctx.moveTo(pt.x, pt.y)
  }

  // Continue drawing
  const draw = (clientX: number, clientY: number) => {
    if (!isDrawing.current) return
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const pt = getPoint(clientX, clientY)
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#333'
    ctx.lineTo(pt.x, pt.y)
    ctx.stroke()
  }

  // Stop drawing
  const stopDraw = () => {
    if (!isDrawing.current) return
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    ctx.closePath()
    isDrawing.current = false
  }

  // Event‑Handler Mouse
  const handleMouseDown = (e: React.MouseEvent) => startDraw(e.clientX, e.clientY)
  const handleMouseMove = (e: React.MouseEvent) => draw(e.clientX, e.clientY)
  const handleMouseUp   = () => stopDraw()

  // Event‑Handler Touch
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    startDraw(touch.clientX, touch.clientY)
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()  // verhindert Scroll
    const touch = e.touches[0]
    draw(touch.clientX, touch.clientY)
  }
  const handleTouchEnd = () => stopDraw()

// Save canvas as PNG
const handleSave = () => {
  const canvas = canvasRef.current!
  canvas.toBlob((blob) => {
    if (!blob) return
    const file = new File(
      [blob],
      `${caseData.caseNumber}-sketch.png`,
      { type: 'image/png' }
    )
    onSave(file)
  }, 'image/png')
}

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <h2 className="text-lg font-semibold mb-4">
          Skizze für {caseData.caseNumber}
        </h2>
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="border mb-4 w-full touch-none cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Speichern…' : 'Speichern'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
