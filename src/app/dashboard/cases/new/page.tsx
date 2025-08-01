'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, ChangeEvent, FormEvent } from 'react';
import { auth, db } from '@/firebaseConfig';
import { collection, doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface CaseFormData {
  caseNumber: string;
  clientName: string;
  clientAddress: string;
  customerPlate: string;
  accidentDate: string;
  opponentPlate: string;
  opponentInsurance: string;
  opponentVnr: string;
  opponentSnr: string;
  inspectionLocation: string;
  policeRecordNumber: string;
  witnesses:          string;
  serviceBook:        string;
  accidentLocation:   string;
  accidentDescription:string;
  clientPhone:        string;
  clientEmail:        string;
}

export default function NewCasePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CaseFormData>({
    caseNumber: '',
    clientName: '',
    clientAddress: '',
    customerPlate: '',
    accidentDate: '',
    opponentPlate: '',
    opponentInsurance: '',
    opponentVnr: '',
    opponentSnr: '',
    inspectionLocation: '',
    policeRecordNumber: '',
    witnesses:          '',
    serviceBook:        '',
    accidentLocation:   '',
    accidentDescription:'',
    clientPhone:        '',
    clientEmail:        '',
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const user = auth.currentUser;
    if (!user) {
      toast({ title: 'Authentifizierung erforderlich', description: 'Bitte melden Sie sich an.', variant: 'destructive' });
      setIsLoading(false);
      return;
    }
    if (!formData.caseNumber || !formData.clientName) {
      toast({ title: 'Fehlende Pflichtfelder', description: 'Aktenzeichen und Name des Kunden sind erforderlich.', variant: 'destructive' });
      setIsLoading(false);
      return;
    }

    try {
      const newCaseRef = doc(collection(db, 'cases', user.uid, 'user_cases'));
      await setDoc(newCaseRef, {
        ...formData,
        caseId: newCaseRef.id,
        createdAt: new Date(),
        status: 'Open',
        media: { images: {}, documents: {} },
        partnerName: user.displayName || user.email,
        partnerEmail: user.email,
      });

      toast({ title: 'Fall erfolgreich angelegt', description: `Fall ${formData.caseNumber} wurde erstellt.` });
      router.push(`/dashboard/cases/${newCaseRef.id}`);
    } catch (err: any) {
      toast({ title: 'Fehler', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon" className="h-7 w-7">
          <Link href="/dashboard">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Zurück</span>
          </Link>
        </Button>
        <h1 className="text-xl font-semibold">Neuen Fall anlegen</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* --- Block 1: Grunddaten --- */}
        <Card>
          <CardHeader>
            <CardTitle>Fallinformationen</CardTitle>
            <CardDescription>
              Erfasse hier die Basisdaten für den neuen Fall.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="caseNumber">Aktenzeichen</Label>
              <Input id="caseNumber" placeholder="Aktenzeichen eingeben" required value={formData.caseNumber} onChange={handleInputChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="clientName">Name des Kunden</Label>
              <Input id="clientName" placeholder="Max Mustermann" required value={formData.clientName} onChange={handleInputChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="clientAddress">Adresse des Kunden</Label>
              <Input id="clientAddress" placeholder="Musterstraße 1, 12345 Stadt" value={formData.clientAddress} onChange={handleInputChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customerPlate">Kennzeichen des Kunden</Label>
              <Input id="customerPlate" placeholder="B AB 1234" value={formData.customerPlate} onChange={handleInputChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="accidentDate">Unfalltag</Label>
              <Input id="accidentDate" type="date" value={formData.accidentDate} onChange={handleInputChange} />
            </div>
          </CardContent>
        </Card>

        {/* --- Block 2: Gegnerdaten --- */}
        <Card>
          <CardHeader>
            <CardTitle>Gegnerdaten</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="grid gap-2">
            <Label htmlFor="opponentPlate">Kennzeichen des Gegners</Label>
            <Input id="opponentPlate" placeholder="M CD 5678" value={formData.opponentPlate} onChange={handleInputChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="opponentInsurance">Versicherung des Gegners</Label>
              <Input id="opponentInsurance" placeholder="Versicherung XY" value={formData.opponentInsurance} onChange={handleInputChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="opponentVnr">VNR des Gegners</Label>
              <Input id="opponentVnr" placeholder="1234567890" value={formData.opponentVnr} onChange={handleInputChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="opponentSnr">SNR des Gegners</Label>
              <Input id="opponentSnr" placeholder="0987654321" value={formData.opponentSnr} onChange={handleInputChange} />
            </div>
          </CardContent>
        </Card>

        {/* Weitere Angaben */}
        <Card>
          <CardHeader><CardTitle>Weitere Angaben</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="inspectionLocation">Besichtigungsort</Label>
              <Input id="inspectionLocation" value={formData.inspectionLocation} onChange={handleInputChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="policeRecordNumber">Polizei-Aktenzeichen</Label>
              <Input id="policeRecordNumber" value={formData.policeRecordNumber} onChange={handleInputChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="witnesses">Zeugen</Label>
              <Input id="witnesses" value={formData.witnesses} onChange={handleInputChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="serviceBook">Scheckheft gepflegt</Label>
              <Input id="serviceBook" value={formData.serviceBook} onChange={handleInputChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="accidentLocation">Unfallort</Label>
              <Input id="accidentLocation" value={formData.accidentLocation} onChange={handleInputChange} />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="accidentDescription">Unfallbeschreibung</Label>
              <Input id="accidentDescription" value={formData.accidentDescription} onChange={handleInputChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="clientPhone">Telefonnummer</Label>
              <Input id="clientPhone" value={formData.clientPhone} onChange={handleInputChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="clientEmail">E-Mail</Label>
              <Input id="clientEmail" type="email" value={formData.clientEmail} onChange={handleInputChange} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={() => router.push('/dashboard')}>
            Abbrechen
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Erstelle...' : 'Fall erstellen'}
          </Button>
        </div>
      </form>
    </div>
  );
}
