'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, ShieldCheck, UploadCloud, Users, Car, Wrench, Building } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center shadow-sm bg-white sticky top-0 z-50">
        <Link href="#" className="flex items-center justify-center">
          <FileText className="h-6 w-6 text-blue-600" />
          <span className="ml-2 text-xl font-bold text-gray-800">GutachtenPortal24</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4">
            Anmelden
          </Link>
          <Button asChild>
            <Link href="/signup">Jetzt Registrieren</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Digitales Gutachten-Management für Profis
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl">
                    Optimieren Sie Ihre Schadensregulierung. Erstellen Sie Kfz-Gutachten in Minuten, verwalten Sie Dokumente sicher und arbeiten Sie effizienter mit Versicherungen und Werkstätten zusammen.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/signup">Kostenlos starten</Link>
                  </Button>
                </div>
              </div>
              <img
                src="https://images.unsplash.com/photo-1553775282-20af80779774?q=80&w=2070&auto=format&fit=crop"
                alt="Gutachter bei der Arbeit an einem Auto"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm text-blue-600">Kernfunktionen</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Alles, was Sie für die digitale Gutachtenerstellung benötigen</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Unser Portal ist darauf ausgelegt, Ihren Workflow zu beschleunigen und die Sicherheit Ihrer Daten zu gewährleisten.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="grid gap-1 text-center">
                <UploadCloud className="h-10 w-10 mx-auto text-blue-600" />
                <h3 className="text-xl font-bold">Effiziente Fallerstellung</h3>
                <p className="text-sm text-gray-500">
                  Legen Sie neue Fälle mit wenigen Klicks an. Alle Partnerinformationen werden automatisch ausgefüllt.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <ShieldCheck className="h-10 w-10 mx-auto text-blue-600" />
                <h3 className="text-xl font-bold">Sicheres Dokumenten-Management</h3>
                <p className="text-sm text-gray-500">
                  Laden Sie alle relevanten Bilder und Dokumente sicher hoch. Jeder Fall wird in einem geschützten, eigenen Bereich gespeichert.
                </p>
              </div>
              <div className="grid gap-1 text-center">
                <Users className="h-10 w-10 mx-auto text-blue-600" />
                <h3 className="text-xl font-bold">Zentrale Fallübersicht</h3>
                <p className="text-sm text-gray-500">
                  Behalten Sie den Überblick über alle Ihre Fälle. Als Administrator sehen Sie die Gutachten aller Partner an einem Ort.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Target Audience Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
             <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Für die Profis der Schadensregulierung</h2>
                 <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Egal ob Versicherung, Werkstatt oder freier Gutachter - unser Portal passt sich Ihren Bedürfnissen an.
                </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
                 <div className="grid gap-1 text-center"><Building className="h-10 w-10 mx-auto text-blue-600" /><h3 className="text-xl font-bold">Versicherungen</h3></div>
                 <div className="grid gap-1 text-center"><Wrench className="h-10 w-10 mx-auto text-blue-600" /><h3 className="text-xl font-bold">Werkstätten</h3></div>
                 <div className="grid gap-1 text-center"><Car className="h-10 w-10 mx-auto text-blue-600" /><h3 className="text-xl font-bold">Gutachter & Sachverständige</h3></div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} GutachtenPortal24. Alle Rechte vorbehalten.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="/impressum" className="text-xs hover:underline underline-offset-4">
            Impressum
          </Link>
          <Link href="/datenschutz" className="text-xs hover:underline underline-offset-4">
            Datenschutz
          </Link>
        </nav>
      </footer>
    </div>
  );
}
