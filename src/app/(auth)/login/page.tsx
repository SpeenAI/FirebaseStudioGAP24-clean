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
import { auth } from '@/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      toast({
        title: "Anmeldung erfolgreich!",
        description: `Willkommen zurück, ${user.displayName || user.email}.`,
      });

      router.push('/dashboard');

    } catch (error: any) {
      console.error("Fehler bei der Anmeldung:", error);
      toast({
        title: "Anmeldung fehlgeschlagen",
        description: error.message || "Ein unerwarteter Fehler ist aufgetreten.",
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
        <CardTitle className="text-3xl font-bold font-headline">Willkommen zurück</CardTitle>
        <CardDescription>Geben Sie Ihre Anmeldedaten ein, um auf Ihr Konto zuzugreifen.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
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
            Anmelden
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-4">
        <div className="text-sm">
          Noch kein Konto?{' '}
          <Link href="/signup" className="underline text-primary font-medium">
            Registrieren
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
