import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

export default function DatenschutzPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="px-4 lg:px-6 h-16 flex items-center shadow-sm bg-white">
        <Link href="/" className="flex items-center justify-center">
          <FileText className="h-6 w-6 text-blue-600" />
          <span className="ml-2 text-xl font-bold text-gray-800">GutachtenPortal24</span>
        </Link>
      </header>
      <main className="flex-1 container py-12 md:py-16">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Datenschutzerklärung</h1>

        <div className="prose prose-lg mt-8">
          <p className="p-4 border-l-4 border-yellow-400 bg-yellow-50">
            <strong>Wichtiger Hinweis:</strong> Dies ist ein Platzhalter. Bitte ersetzen Sie diesen Inhalt durch Ihre eigene, rechtlich geprüfte Datenschutzerklärung.
          </p>

          <h2 className="text-2xl font-semibold mt-8">1. Verantwortlicher</h2>
          <p>
            Max Mustermann, Musterfirma GmbH, Musterstraße 1, 12345 Musterstadt, Deutschland
          </p>

          <h2 className="text-2xl font-semibold mt-8">2. Datenerfassung auf dieser Website</h2>
          <p>
            Wir erheben und verarbeiten personenbezogene Daten, die Sie uns bei der Registrierung und Nutzung unseres Dienstes zur Verfügung stellen (z.B. Name, E-Mail-Adresse). Diese Daten werden ausschließlich zum Zweck der Vertragserfüllung und zur Bereitstellung unseres Dienstes verwendet.
          </p>

          <h2 className="text-2xl font-semibold mt-8">3. Firebase</h2>
          <p>
            Diese Website nutzt Firebase, einen Dienst der Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland. Wir verwenden Firebase für Funktionen wie Authentifizierung, Datenbank und Hosting. Dabei können personenbezogene Daten wie E-Mail-Adressen, Nutzernamen und IP-Adressen verarbeitet werden. Die Datenverarbeitung erfolgt auf Grundlage unseres berechtigten Interesses an einer sicheren und effizienten Bereitstellung unserer App.
          </p>
          
           <h2 className="text-2xl font-semibold mt-8">4. Cookies</h2>
          <p>
            Unsere Website verwendet Cookies. Dies sind kleine Textdateien, die Ihr Webbrowser auf Ihrem Endgerät speichert. Cookies helfen uns dabei, unser Angebot nutzerfreundlicher, effektiver und sicherer zu machen. Einige Cookies sind "Session-Cookies", welche nach Ende Ihres Besuchs automatisch gelöscht werden. Andere Cookies bleiben auf Ihrem Endgerät bestehen, bis Sie diese löschen.
          </p>

          {/* Fügen Sie hier alle weiteren relevanten Abschnitte hinzu, z.B. zu Ihren Rechten als Nutzer */}

        </div>

         <Button asChild className="mt-12">
            <Link href="/">Zurück zur Startseite</Link>
        </Button>
      </main>
    </div>
  );
}
