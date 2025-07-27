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
          <p>
            Diese Datenschutzerklärung informiert Sie über die Erhebung, Verarbeitung und Nutzung Ihrer personenbezogenen Daten im Rahmen unseres Angebots unter <strong>GutachtenPortal24</strong> und unserer zugrunde liegenden Services, insbesondere Google Firebase und die Webdienste der Nassery Oral Partnerschaftsgesellschaft.
          </p>
          <h2>1. Verantwortlicher und Kontakt</h2>
          <p>
            <strong>Verantwortlicher:</strong><br />
            Nassery Oral Partnerschaftsgesellschaft<br />
            Mainzer Landstraße 303<br />
            60326 Frankfurt am Main, Deutschland<br />
            Tel.: 0178 921 6726<br />
            E‑Mail: <a href="mailto:info@noa-gutachter.de">info@noa-gutachter.de</a><br />
            Website: <a href="https://noa-gutachter.de">noa-gutachter.de</a>
          </p>
          <p>
            <strong>Datenschutzbeauftragter (DSB):</strong><br />
            Mohammad Speen<br />
            Lärchenstraße 80, 65933 Frankfurt am Main<br />
            Tel.: +49 698 6099524<br />
            E‑Mail: <a href="mailto:mohammad.speen@afghan-sprachendienst.de">mohammad.speen@afghan-sprachendienst.de</a>
          </p>
          <p>
            <strong>EU-Vertreter:</strong><br />
            Mohammad Speen (siehe oben)
          </p>
          <p><em>Stand: 27. Juli 2025</em></p>

          <h2>2. Geltungsbereich und Begriffsbestimmungen</h2>
          <p>
            Diese Erklärung gilt für alle Dienste von GutachtenPortal24, einschließlich der Nutzung von Firebase-Diensten und der Webseiten der Nassery Oral Partnerschaftsgesellschaft. Begriffe wie „personenbezogene Daten“, „Verarbeitung“, „Einwilligung“ entsprechen den Definitionen in Art. 4 DSGVO.
          </p>

          <h2>3. Erhobene Daten und Verarbeitungszwecke</h2>
          <h3>3.1 Firebase-Dienstdaten</h3>
          <p>
            Firebase-Dienstdaten sind personenbezogene Daten, die Google im Rahmen der Bereitstellung und Verwaltung von Firebase-Diensten erhebt (Logfiles, Konfigurationsdaten, Nutzungsstatistiken). Kunden- und Google Cloud-Daten sind ausgenommen.
          </p>
          <p><strong>Verwendungszwecke:</strong></p>
          <ul>
            <li>Betrieb und Optimierung der Firebase-Services (Analytics, Cloud Messaging etc.)</li>
            <li>Erstellung statistischer Auswertungen und Empfehlungen zur Nutzung von Google-Diensten</li>
          </ul>
          <p>Nutzer:innen können in den Firebase-Projekteinstellungen festlegen, ob ihre Dienstdaten zur Verbesserung anderer Google-Dienste verwendet werden.</p>

          <h3>3.2 Webseitendaten</h3>
          <h4>Allgemeine Logfiles</h4>
          <ul>
            <li>Browsertyp, Betriebssystem, Referrer, IP-Adresse, Datum/Uhrzeit</li>
            <li>Zweck: Betriebssicherheit, Fehleranalyse, Abwehr von Angriffen</li>
          </ul>
          <h4>Cookies</h4>
          <ul>
            <li>Session- und persistente Cookies für Login, Funktionen, Analytics</li>
            <li>Deaktivierung per Browsereinstellung möglich, Hinweis auf eingeschränkte Funktion</li>
          </ul>
          <h4>Kontaktformulare &amp; E‑Mail</h4>
          <p>Freiwillige Übermittlung von Name, E‑Mail, Nachricht zum Zweck der Anfragebearbeitung.</p>

          <h2>4. Rechtsgrundlagen der Verarbeitung</h2>
          <ul>
            <li><strong>Art. 6 Abs. 1 lit. b DSGVO:</strong> Vertragserfüllung (Bereitstellung der Plattform)</li>
            <li><strong>Art. 6 Abs. 1 lit. a DSGVO:</strong> Einwilligung (Cookies, Analytics, Newsletter)</li>
            <li><strong>Art. 6 Abs. 1 lit. f DSGVO:</strong> Berechtigtes Interesse (Sicherheit, Statistik, Werbung)</li>
          </ul>

          <h2>5. Weitergabe und Drittlandtransfer</h2>
          <ul>
            <li>Google Firebase: Datenverarbeitung in den USA mit Standardvertragsklauseln</li>
            <li>Facebook, Instagram, Google Analytics &amp; Co.: Verarbeitung in USA/Irland; Opt-out via Logout, Browser-Add-Ons, Opt-out-Seiten</li>
          </ul>

          <h2>6. Speicherdauer und Löschung</h2>
          <ul>
            <li>Datenlöschung, sobald Speicherzweck entfällt oder gesetzliche Fristen enden</li>
            <li>Bewerberdaten: 2 Monate nach Absage</li>
            <li>Logfiles &amp; Analytics: max. 26 Monate (sofern nicht anonymisiert)</li>
          </ul>

          <h2>7. Betroffenenrechte</h2>
          <p>Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerspruch, Widerruf; Kontakt über DSB oder Mitarbeiter.</p>

          <h2>8. Technische und organisatorische Maßnahmen (TOM)</h2>
          <ul>
            <li>Zugriffskontrollen, TLS in Transit, AES‑256 at rest</li>
            <li>Regelmäßige Sicherheitsüberprüfungen und Penetrationstests</li>
          </ul>

          <h2>9. Einbindung externer Dienste und Plugins</h2>
          <ul>
            <li>Facebook-Plug‑Ins: Opt‑out durch Logout/Extensions</li>
            <li>Google Analytics (<em>anonymizeIp</em>) aktiv</li>
            <li>Google AdWords &amp; Remarketing: Conversion-Cookies (30 Tage, keine Personenidentifikation)</li>
          </ul>

          <h2>10. Einwilligungsmanagement</h2>
          <p>React Cookie-Banner beim ersten Besuch, Opt‑in erforderlich, Consent‑Log gespeichert.</p>

          <h2>11. Änderungen der Datenschutzerklärung</h2>
          <p>Wir aktualisieren diese Erklärung bei Bedarf. Letzte Änderung: 27. Juli 2025.</p>
        </div>

        <Button asChild className="mt-12">
          <Link href="/">Zurück zur Startseite</Link>
        </Button>
      </main>
    </div>
  );
}
