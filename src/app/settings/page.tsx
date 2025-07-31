'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db, storage } from '@/firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface PartnerProfile {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  address: string;

  // Zahlungsdaten
  payoutMethod: 'bank' | 'paypal';
  iban?: string;
  bic?: string;
  accountHolder?: string;
  paypalEmail?: string;

  // Logo
  logoUrl?: string;

  // Steuer
  vatId?: string;
  taxNumber?: string;
}

export default function PartnerSettingsPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [profile, setProfile] = useState<PartnerProfile>({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    payoutMethod: 'bank',
    iban: '',
    bic: '',
    accountHolder: '',
    paypalEmail: '',
    logoUrl: '',
    vatId: '',
    taxNumber: '',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 1) Partner‑Daten laden
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return router.push('/login');
    (async () => {
      const docRef = doc(db, 'partners', uid);
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        toast({ title: 'Fehler', description: 'Profil nicht gefunden.', variant: 'destructive' });
        return;
      }
      setProfile(snap.data() as PartnerProfile);
    })();
  }, [router, toast]);

  // 2) Eingaben handlen
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setProfile((p) => ({ ...p, [id]: value }));
  };

  // 3) Logo‑Upload
  const handleLogoSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setLogoFile(e.target.files[0]);
  };

  // 4) Speichern
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return router.push('/login');
    setIsSaving(true);

    const uid = auth.currentUser.uid;
    const docRef = doc(db, 'partners', uid);
    let updatedProfile = { ...profile };

    // Logo hochladen, falls ausgewählt
    if (logoFile) {
      const storageRef = ref(storage, `partners/${uid}/logo/${logoFile.name}`);
      const task = uploadBytesResumable(storageRef, logoFile);
      await new Promise<void>((res, rej) =>
        task.on(
          'state_changed',
          () => {},
          (err) => rej(err),
          async () => {
            const url = await getDownloadURL(storageRef);
            updatedProfile.logoUrl = url;
            res();
          }
        )
      );
    }

    // Firestore updaten
    await updateDoc(docRef, updatedProfile);
    toast({ title: 'Gespeichert', description: 'Dein Profil wurde aktualisiert.' });
    setIsSaving(false);
  };

  return (
    <div className="p-6">
      <Button variant="outline" onClick={() => router.back()} className="mb-4">
        ← Zurück
      </Button>

      <form onSubmit={handleSubmit} className="grid gap-6">
        {/* Firmenstammdaten */}
        <Card>
          <CardHeader>
            <CardTitle>Firmenprofil</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="companyName">Firmenname</Label>
              <Input id="companyName" value={profile.companyName} onChange={handleChange} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contactName">Ansprechpartner</Label>
              <Input id="contactName" value={profile.contactName} onChange={handleChange} required />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <Label htmlFor="email">E‑Mail</Label>
                <Input id="email" type="email" value={profile.email} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="phone">Telefon</Label>
                <Input id="phone" type="tel" value={profile.phone} onChange={handleChange} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Adresse</Label>
              <Input id="address" value={profile.address} onChange={handleChange} required />
            </div>
          </CardContent>
        </Card>

        {/* Zahlungsdaten */}
        <Card>
          <CardHeader>
            <CardTitle>Zahlungsdaten</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <Label htmlFor="payoutMethod">Auszahlung per</Label>
                <select
                  id="payoutMethod"
                  className="input"
                  value={profile.payoutMethod}
                  onChange={handleChange}
                >
                  <option value="bank">Banküberweisung</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>

              {profile.payoutMethod === 'bank' ? (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="iban">IBAN</Label>
                    <Input id="iban" value={profile.iban} onChange={handleChange} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="bic">BIC / SWIFT</Label>
                    <Input id="bic" value={profile.bic} onChange={handleChange} />
                  </div>
                  <div className="grid gap-2 sm:col-span-2">
                    <Label htmlFor="accountHolder">Kontoinhaber</Label>
                    <Input id="accountHolder" value={profile.accountHolder} onChange={handleChange} />
                  </div>
                </>
              ) : (
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="paypalEmail">PayPal‑E‑Mail</Label>
                  <Input id="paypalEmail" type="email" value={profile.paypalEmail} onChange={handleChange} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Firmenlogo & Steuernummern */}
        <Card>
          <CardHeader>
            <CardTitle>Branding & Steuer</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label>Firmenlogo</Label>
              <div className="border-2 border-dashed p-6 text-center relative">
                <Upload className="mx-auto mb-2" />
                <p className="text-sm">Logo auswählen</p>
                <Input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleLogoSelect}
                />
              </div>
              {profile.logoUrl && (
                <img src={profile.logoUrl} alt="Logo" className="h-24 object-contain mt-2" />
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="vatId">USt‑ID</Label>
                <Input id="vatId" value={profile.vatId} onChange={handleChange} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="taxNumber">Steuernummer</Label>
                <Input id="taxNumber" value={profile.taxNumber} onChange={handleChange} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Aktion-Buttons */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => router.push('/')}>Abbrechen</Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Speichern…' : 'Speichern'}
          </Button>
        </div>
      </form>
    </div>
  );
}
