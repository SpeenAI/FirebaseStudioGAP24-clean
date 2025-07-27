'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText } from 'lucide-react';
import { auth, db } from '@/firebaseConfig'; // Import db from firebaseConfig
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from "firebase/firestore"; // Import Firestore functions
import { useToast } from '@/hooks/use-toast';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user) {
        // Step 1: Update the user's profile in Firebase Auth
        await updateProfile(user, { displayName: companyName });

        // Step 2: Create a corresponding user document in Firestore
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          displayName: companyName,
          email: user.email,
          role: "partner", // Assign a default role
          createdAt: new Date(),
        });
      }

      toast({
        title: "Konto erstellt!",
        description: "Ihr Partnerkonto wurde erfolgreich erstellt.",
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error("Fehler bei der Registrierung:", error);
      toast({
        title: "Registrierung fehlgeschlagen",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader className="text-center">
        <div className="flex justify-center items-center mb-4">
            <FileText className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="text-3xl font-bold font-headline">Partnerkonto erstellen</CardTitle>
        <CardDescription>Treten Sie GutachtenPortal24 als Partner bei.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Firmenname / Gutachtername</Label>
            <Input
              id="companyName"
              type="text"
              placeholder="Ihre Firma GmbH"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="kontakt@ihrefirma.de"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Passwort</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full font-semibold">
            Konto erstellen
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-4">
        <div className="text-sm">
          Bereits ein Konto?{' '}
          <Link href="/login" className="underline text-primary font-medium">
            Anmelden
          </Link>
        </div>
        <div className="text-sm">
          <Link href="/" className="underline text-muted-foreground hover:text-primary">
            Zurück zur Startseite
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
