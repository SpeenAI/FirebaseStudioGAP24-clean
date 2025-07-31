// src/components/EditCaseForm.tsx
import { useState } from 'react'
import type { Case } from '@/types'           // <-- Dein Case‑Interface aus src/types/index.ts
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CardContent } from './ui/card'

interface EditCaseFormProps {
  isOpen: boolean
  onClose: () => void
  initialData: Case
  onSave: (data: Case) => Promise<void>
}

export default function EditCaseForm({
  isOpen,
  onClose,
  initialData,
  onSave,
}: EditCaseFormProps) {
  const [form, setForm] = useState<Case>(initialData)

  const handleChange = <K extends keyof Case>(field: K, value: Case[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Fall bearbeiten</DialogTitle>
        </DialogHeader>

          {/* ———————————————————————————————— */}
         {/* **NEUE NACHTRÄGLICH AUSZUFÜLLENDE FELDER** */}
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="inspectionLocation">Besichtigungsort</Label>
              <Input
                id="inspectionLocation"
                value={form.inspectionLocation || ''}
                onChange={e => handleChange('inspectionLocation', e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="policeRecordNumber">Polizei‑Aktenzeichen</Label>
              <Input
                id="policeRecordNumber"
                value={form.policeRecordNumber || ''}
                onChange={e => handleChange('policeRecordNumber', e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="witnesses">Zeugen</Label>
              <Textarea
                id="witnesses"
                rows={2}
                placeholder="Volle Namen, durch Kommas trennen"
                value={form.witnesses || ''}
                onChange={e => handleChange('witnesses', e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="serviceBook">Scheckheft gepflegt</Label>
              <Input
                id="serviceBook"
                value={form.serviceBook || ''}
                onChange={e => handleChange('serviceBook', e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="accidentLocation">Unfallort</Label>
              <Input
                id="accidentLocation"
                value={form.accidentLocation || ''}
                onChange={e => handleChange('accidentLocation', e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="accidentDescription">Unfallbeschreibung</Label>
              <Textarea
                id="accidentDescription"
                rows={3}
                placeholder="Bitte Skizze hier erläutern"
                value={form.accidentDescription || ''}
                onChange={e => handleChange('accidentDescription', e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="clientPhone">Handynummer des Kunden</Label>
              <Input
                id="clientPhone"
                value={form.clientPhone || ''}
                onChange={e => handleChange('clientPhone', e.target.value)}
              />
            </div>

            {/* E‑Mail des Kunden haben Sie vermutlich schon */}
          </CardContent>

          {/* Hier alle weiteren Felder analog … */}
          {/* z.B. clientName, clientEmail, clientAddress, tireBrand, usw. */}

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button onClick={() => onSave(form)}>Speichern</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
