'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useState, ChangeEvent, FormEvent } from 'react';
import { auth, db } from '@/firebaseConfig';
import { collection, doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface CaseFormData {
  caseNumber: string; caseType: string; description: string;
  clientName: string; clientEmail: string; clientAddress: string;
}

export default function NewCasePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CaseFormData>({
    caseNumber: '', caseType: '', description: '',
    clientName: '', clientEmail: '', clientAddress: '',
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, caseType: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const user = auth.currentUser;

    if (!user) {
      toast({ title: "Authentifizierung erforderlich", description: "Bitte melden Sie sich an.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    if (!formData.caseNumber) {
      toast({ title: "Fehlendes Aktenzeichen", description: "Bitte geben Sie ein Aktenzeichen an.", variant: "destructive" });
      setIsLoading(false);
      return;
    }

    try {
      const newCaseRef = doc(collection(db, "cases", user.uid, "user_cases"));

      await setDoc(newCaseRef, {
        ...formData,
        caseId: newCaseRef.id,
        createdAt: new Date(),
        status: 'Open',
        media: { images: {}, documents: {} },
        partnerName: user.displayName || user.email,
        partnerEmail: user.email,
      });

      toast({
        title: "Fall erfolgreich angelegt!",
        description: `Der Fall ${formData.caseNumber} wurde erstellt.`
      });

      router.push(`/dashboard/cases/${newCaseRef.id}`);

    } catch (error: any) {
      toast({
        title: "Erstellung des Falls fehlgeschlagen",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon" className="h-7 w-7">
          <Link href="/dashboard"><ChevronLeft className="h-4 w-4" /><span className="sr-only">Zurück</span></Link>
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0 font-headline">Neuen Fall anlegen</h1>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Falldetails</CardTitle>
            <CardDescription>
              Füllen Sie die Grunddaten für den neuen Fall aus. Bilder und Dokumente können im nächsten Schritt hinzugefügt werden.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="caseNumber">Aktenzeichen</Label>
              <Input id="caseNumber" placeholder="Aktenzeichen eingeben" required value={formData.caseNumber} onChange={handleInputChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="case-type">Fallart</Label>
              <Select onValueChange={handleSelectChange} value={formData.caseType}>
                <SelectTrigger id="case-type"><SelectValue placeholder="Wählen Sie eine Fallart" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="accident">Unfallgutachten</SelectItem>
                  <SelectItem value="property">Sachschaden</SelectItem>
                  <SelectItem value="personal-injury">Personenschaden</SelectItem>
                  <SelectItem value="other">Sonstiges</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea id="description" placeholder="Geben Sie eine kurze Zusammenfassung des Falls" rows={5} value={formData.description} onChange={handleInputChange} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Klienteninformationen</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2"><Label htmlFor="clientName">Vollständiger Name</Label><Input id="clientName" placeholder="Max Mustermann" value={formData.clientName} onChange={handleInputChange} /></div>
            <div className="grid gap-2"><Label htmlFor="clientEmail">E-Mail</Label><Input id="clientEmail" type="email" placeholder="max.mustermann@example.com" value={formData.clientEmail} onChange={handleInputChange} /></div>
            <div className="grid gap-2 sm:col-span-2"><Label htmlFor="clientAddress">Adresse</Label><Input id="clientAddress" placeholder="Musterstraße 123, 12345 Musterstadt" value={formData.clientAddress} onChange={handleInputChange} /></div>
          </CardContent>
        </Card>
        <div className="flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={() => router.push('/dashboard')}>Abbrechen</Button>
          <Button type="submit" disabled={isLoading}>{isLoading ? 'Wird angelegt...' : 'Fall anlegen & Weiter'}</Button>
        </div>
      </form>
    </div>
  );
}
