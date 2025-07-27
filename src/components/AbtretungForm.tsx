'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SignatureCanvas from 'react-signature-canvas';
import { PDFDocument, PageSizes } from 'pdf-lib';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';

// --- PROPS & STATE INTERFACES ---
interface AbtretungFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pdfFile: File) => void;
  caseData: {
    caseNumber: string;
    clientName: string;
    clientAddress?: string;
  };
  isLoading: boolean;
}

interface FormData {
  nameHalter: string;
  nameBevollmaechtigter: string;
  anschriftStrasse: string;
  anschriftPlzOrt: string;
  amtlKennzeichen: string;
  schadentag: string;
  nameSchaediger: string;
  anschriftSchaediger: string;
  kennzeichenSchaediger: string;
  fahrzeugtypSchaediger: string;
  haftpflichtversicherung: string;
  versNrSchaediger: string;
  schadenNrVersicherung: string;
  ortDatumUnterschriftAbtretung: string;
  ortDatumUnterschriftDatenschutz: string;
  ortDatumUnterschriftWerkvertrag: string;
  ortDatumUnterschriftSachverstaendiger: string;
  ortDatumUnterschriftWiderruf1: string;
  ortDatumUnterschriftWiderruf2: string;
}

// --- FULL LEGAL TEXTS ---
const textAbtretung1 = `Der Auftraggeber hat heute mit dem KFZ-Prüfbüro NOA (Oral Nassery Özkan Kfz-Sachverständige Partnerschaftsgesellschaft, vertreten durch die Partner Herr Enis Oral, Herr Manhajuddin Nassery und Herr Orhan Özkan, Schiersteiner Straße 94, 65187 Wiesbaden) einen Vertrag zur Erstellung eines Haftpflichtgutachtens für das Fahrzeug mit dem oben genannten Kennzeichen abgeschlossen. Aufgrund des Schadenfalls beauftrage ich das oben genannte KFZ-Sachverständigenbüro, ein Gutachten über die Schadenhöhe zu erstellen. Das Honorar des KFZ-Prüfbüro NOA richtet sich nach der Schadenhöhe gemäß deren Honorartabelle zuzüglich eventuell anfallender Nebenkosten.`;
const textAbtretung2 = `Ich trete hiermit meinen Anspruch auf Erstattung der Sachverständigenkosten in Höhe des Bruttoendbetrags (ink. MwSt.) der Rechnung des beauftragten Sachverständigenbüros NOA unwiderruflich und vorrangig erfüllungshalber gegen den Fahrer, den Halter und den Versicherer des unfallbeteiligten Fahrzeugs zugunsten des KFZ-Sachverständigenbüros ab. Auf den Zugang der Annahmeerklärung verzichte ich. Ich weise den regulierungspflichtigen Versicherer an, die Sachverständigenkosten direkt, ungekürzt in vollständiger Höhe an das von mir beauftragte Sachverständigenbüro NOA zu zahlen.`;
const textDatenschutz = `Ich erkläre hiermit meine Einwilligung, dass meine personenbezogenen Daten im Rahmen der Erstellung des von mir beauftragten Schadengutachtens an die von mir beauftragte Reparaturwerkstatt, an die von mir beauftragte Anwaltskanzlei sowie an die regulierungspflichtige Versicherung zum Zwecke der Schadenregulierung weitergeleitet werden. Ich kann meine Einwilligung jederzeit mit Wirkung für die Zukunft gegenüber dem beauftragten Sachverständigen widerrufen.`;
const textWiderruf1 = `1. Widerrufsrecht: Als Verbraucher haben Sie das Recht, binnen 14 Tagen ohne Angabe von Gründen den Vertrag über die Erstellung Ihres Kfz-Schadensgutachtens zu widerrufen.
Die Widerrufsfrist beträgt 14 Tage ab dem Tage des Vertragsschlusses. Um Ihr Widerrufsrecht auszuüben, müssen Sie uns, dem KFZ-Prüfbüro NOA... über Ihren Entschluss, diesen Vertrag zu widerrufen, mittels einer eindeutigen Erklärung (z.B. ein mit der Post versandter Brief, Telefax oder Email), informieren.
2. Folgen des Widerrufs: Wenn Sie diesen Vertrag widerrufen, haben wir alle Zahlungen, die wir von Ihnen erhalten haben, unverzüglich und spätestens 14 Tage ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf bei uns eingegangen ist.
3. Verlust des Widerrufsrechts: Ihr Widerrufsrecht erlischt vor Ablauf der Widerrufsfrist, wenn wir auf Ihre ausdrückliche Zustimmung hin mit der Ausführung der Leistungen begonnen haben und die Leistungen vor Ablauf der Widerrufsfrist vollständig erbracht wurden.`;
const textWiderruf2 = `4. Beauftragung zur sofortigen Leistungserbringung: In Kenntnis der vorstehenden Widerrufsbelehrung verlange/n ich /wir als Auftraggeber ausdrücklich, dass das KFZ-Prüfbüro NOA ... mit seiner Leistung bereits vor Ablauf der Widerrufsfrist beginnen. Mir ist bekannt, dass ich bei Widerruf bereits erbrachte Leistungen zu bezahlen habe und bei vollständiger Vertragserfüllung durch das Sachverständigenbüro mein Widerrufsrecht verliere.`;
const honorarTableData = [
  ['500,00 €','282 €','14.500,00 €','1.377 €'],
  ['750,00 €','315 €','15.000,00 €','1.412 €'],
  ['1.000,00 €','370 €','16.000,00 €','1.470 €'],
  ['1.250,00 €','410 €','17.000,00 €','1.528 €'],
  ['1.500,00 €','445 €','18.000,00 €','1.582 €'],
  ['1.750,00 €','476 €','19.000,00 €','1.644 €'],
  ['2.000,00 €','503 €','20.000,00 €','1.711 €'],
  ['2.250,00 €','528 €','21.000,00 €','1.775 €'],
  ['2.500,00 €','554 €','22.000,00 €','1.828 €'],
  ['2.750,00 €','579 €','23.000,00 €','1.885 €'],
  ['3.000,00 €','601 €','24.000,00 €','1.947 €'],
  ['3.250,00 €','624 €','25.000,00 €','1.974 €'],
  ['3.500,00 €','647 €','26.000,00 €','2.029 €'],
  ['3.750,00 €','670 €','27.000,00 €','2.085 €'],
  ['4.000,00 €','693 €','28.000,00 €','2.153 €'],
  ['4.250,00 €','713 €','29.000,00 €','2.207 €'],
  ['4.500,00 €','735 €','30.000,00 €','2.278 €'],
  ['4.750,00 €','753 €','32.500,00 €','2.421 €'],
  ['5.000,00 €','772 €','35.000,00 €','2.571 €'],
  ['5.250,00 €','790 €','37.500,00 €','2.729 €'],
  ['5.500,00 €','810 €','40.000,00 €','2.879 €'],
  ['5.750,00 €','827 €','42.500,00 €','3.069 €'],
  ['6.000,00 €','848 €','45.000,00 €','3.266 €'],
  ['6.500,00 €','875 €','47.500,00 €','3.433 €'],
  ['7.000,00 €','904 €','50.000,00 €','3.595 €'],
  ['7.500,00 €','931 €','für je weitere 1.000,00 €','+ 28,25 €'],
  ['8.000,00 €','965 €','',''],
  ['8.500,00 €','997 €','',''],
  ['9.000,00 €','1.027 €','',''],
  ['9.500,00 €','1.057 €','',''],
  ['10.000,00 €','1.087 €','',''],
  ['10.500,00 €','1.123 €','',''],
  ['11.000,00 €','1.148 €','',''],
  ['11.500,00 €','1.188 €','',''],
  ['12.000,00 €','1.217 €','',''],
  ['12.500,00 €','1.248 €','',''],
  ['13.000,00 €','1.282 €','',''],
  ['13.500,00 €','1.314 €','',''],
  ['14.000,00 €','1.343 €','',''],
]; // existing array as before

// --- COMPONENT ---
export const AbtretungForm: React.FC<AbtretungFormProps> = ({ isOpen, onClose, onSave, caseData, isLoading }) => {
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  const sigRefs = {
    abtretung: useRef<SignatureCanvas>(null),
    datenschutz: useRef<SignatureCanvas>(null),
    werkvertrag: useRef<SignatureCanvas>(null),
    werkvertragSV: useRef<SignatureCanvas>(null),
    widerruf1: useRef<SignatureCanvas>(null),
    widerruf2: useRef<SignatureCanvas>(null),
  };

  const [formData, setFormData] = useState<FormData>({
  nameHalter: '',
  nameBevollmaechtigter: '',
  anschriftStrasse: '',
  anschriftPlzOrt: '',
  amtlKennzeichen: '',
  schadentag: '',
  nameSchaediger: '',
  anschriftSchaediger: '',
  kennzeichenSchaediger: '',
  fahrzeugtypSchaediger: '',
  haftpflichtversicherung: '',
  versNrSchaediger: '',
  schadenNrVersicherung: '',
  ortDatumUnterschriftAbtretung: '',
  ortDatumUnterschriftDatenschutz: '',
  ortDatumUnterschriftWerkvertrag: '',
  ortDatumUnterschriftSachverstaendiger: '',
  ortDatumUnterschriftWiderruf1: '',
  ortDatumUnterschriftWiderruf2: '',
}); // existing init

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => { /* existing */ };

  const handleGeneratePdf = async () => {
    const contentElement = printRef.current;
    if (!contentElement) {
      toast({ title: 'Fehler', description: 'Formularinhalt nicht gefunden.', variant: 'destructive' });
      return;
    }

    try {
      // Render form to canvas
      const canvas = await html2canvas(contentElement, { scale: 2, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');

      // Create PDF
      const pdfDoc = await PDFDocument.create();
      const pngImage = await pdfDoc.embedPng(imgData);
      const a4PageSize = PageSizes.A4;
      let remainingHeight = canvas.height;
      let yOffset = 0;

      while (remainingHeight > 0) {
        const page = pdfDoc.addPage(a4PageSize);
        const { width: pageW, height: pageH } = page.getSize();
        const scale = pageW / canvas.width;
        const portionHeight = pageH / scale;

        page.drawImage(pngImage, {
          x: 0,
          y: pageH - portionHeight * scale - yOffset * scale,
          width: pageW,
          height: canvas.height * scale,
        });

        yOffset += portionHeight;
        remainingHeight -= portionHeight;
      }

      const pdfBytes = await pdfDoc.save();
      const pdfFile = new File([pdfBytes], `Abtretung_${caseData.caseNumber}.pdf`, { type: 'application/pdf' });

      // upload callback to parent
      onSave(pdfFile);
      // trigger browser download
      const url = URL.createObjectURL(pdfFile);
      const a = document.createElement('a');
      a.href = url;
      a.download = pdfFile.name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({ title: 'Fehler', description: 'Das PDF konnte nicht erstellt werden.', variant: 'destructive' });
    }
  };

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-xl font-bold text-[#3F51B5] mt-6 mb-2 pb-2 border-b-2 border-[#3F51B5]">
      {children}
    </h3>
  );

  const LegalTextBox = ({ children }: { children: React.ReactNode }) => (
    <div className="p-2 border bg-gray-50 text-xs text-gray-700 whitespace-pre-wrap">
      {children}
    </div>
  );

  const SignatureSection = ({ canvasRef, id, label }: { canvasRef: React.RefObject<SignatureCanvas>, id: keyof FormData, label: string }) => (
    <div className="grid grid-cols-2 gap-4 items-end mt-4">
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="border rounded-md bg-white">
          <SignatureCanvas ref={canvasRef} canvasProps={{ className: 'w-full h-[100px]' }} />
        </div>
        <Button variant="link" size="sm" onClick={() => canvasRef.current?.clear()} className="p-0">
          Löschen
        </Button>
      </div>
      <div className="space-y-2">
        <Label htmlFor={id}>Ort & Datum</Label>
        <Input id={id} value={formData[id]} onChange={handleInputChange} />
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <div ref={printRef} className="p-8 bg-white text-black">
          {/* 1. Logo + Haupttitel */}
          <div className="flex items-center mb-6">
            <img src="/noa.logo.png" alt="NOA Logo" className="h-16 w-auto mr-4" />
            <h2 className="text-2xl font-semibold text-[#3F51B5]">Abtretung &amp; Datenschutz</h2>
          </div>

          {/* 2. Abtretungstexte */}
          <p className="mb-2 whitespace-pre-wrap">{textAbtretung1}</p>
          <p className="mb-6 whitespace-pre-wrap">{textAbtretung2}</p>

          {/* 3. Unterschrift Abtretung */}
          <Label className="font-medium">Unterschrift Auftraggeber</Label>
          <SignatureSection
            canvasRef={sigRefs.abtretung}
            id="ortDatumUnterschriftAbtretung"
            label=""
          />

          {/* 4. Datenschutztext */}
          <p className="mt-6 mb-4 whitespace-pre-wrap">{textDatenschutz}</p>

          {/* 5. Unterschrift Datenschutz */}
          <Label className="font-medium">Unterschrift Auftraggeber</Label>
          <SignatureSection
            canvasRef={sigRefs.datenschutz}
            id="ortDatumUnterschriftDatenschutz"
            label=""
          />

          {/* 6. Werkvertrag mit Honorarvereinbarung */}
          <SectionTitle>Werkvertrag mit Honorarvereinbarung</SectionTitle>
          <LegalTextBox>
            <p className="mb-4">
              Das KFZ‑Prüfbüro NOA (Oral Nassery Özkan Kfz‑Sachverständige 
              Partnerschaftsgesellschaft, vertreten durch die Partner Herr Enis Oral, 
              Herr Manhajuddin Nassery und Herr Orhan Özkan, Schiersteiner Straße 94, 
              65187 Wiesbaden) (im Folgenden als Auftragnehmer bezeichnet) und der/die 
              Geschädigte (im Folgenden als Auftraggeber bezeichnet) treffen folgende 
              Vereinbarung bezüglich des Unfallschadens am Fahrzeug mit dem amtlichen 
              Kennzeichen: Der Auftraggeber beauftragt den Auftragnehmer mit der Erstellung 
              eines Kfz‑Schadengutachtens zur Bestimmung der Schadenhöhe am genannten 
              Fahrzeug. Dieses Gutachten dient als Grundlage für die Regulierung der 
              Ansprüche gegenüber dem Schädiger und dem Haftpflichtversicherer. Das 
              Gutachten umfasst die Untersuchung der Schäden am Fahrzeug, die Kalkulation 
              der voraussichtlichen Reparaturkosten und falls notwendig, die Bestimmung der 
              Wertminderung, die Ermittlung des Wiederbeschaffungswerts und die Festlegung 
              des Restwerts des Fahrzeugs. Die Vergütung setzt sich aus einem Grundhonorar 
              und Nebenkosten zusammen. Das Grundhonorar wird unter Berücksichtigung der 
              Schadenhöhe und einer internen Mischkalkulation gemäß der Honorartabelle des 
              Auftragnehmers berechnet und wird nachfolgend aufgelistet:
            </p>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr>
                  <th className="border p-1">Reparaturkosten…</th>
                  <th className="border p-1">Grundvergütung</th>
                  <th className="border p-1">Reparaturkosten…</th>
                  <th className="border p-1">Grundvergütung</th>
                </tr>
              </thead>
              <tbody>
                {honorarTableData.map((row, i) => (
                  <tr key={i}>
                    {row.map((cell, j) => (
                      <td key={j} className="border p-1">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4">
              Ausdrücklich nicht im Grundhonorar beinhaltet sind: Bereitstellungskosten 
              und Zerlegungsarbeiten zur Schadenfeststellung – Rechnungsprüfungen – 
              Schadenerweiterungen – Nachbesichtigungen – Anwesenheit bei Nachbesichtigungen, 
              welche vom Schädiger bzw. dessen Versicherung veranlasst wurden – 
              Fahrzeuggegenüberstellungen – Überprüfung von Fremdgutachten – Stellungnahmen 
              bei unberechtigt durch den Versicherer oder andere Institutionen angegriffene 
              Gutachten – Fremdleistungen für Datenbankabrufe – Eingabezeiten für 
              Kalkulationen und Bewertungen durch Büropersonal – Schreibkosten – Fahrzeiten 
              und Fahrzeugkosten – Telekommunikationskosten – Porto – Büromaterial – 
              Fotokosten – Restwertangebote – Fahrzeugbewertungen, wenn eine Bewertung 
              mit DAT (Deutsche Automobil Treuhand GmbH) / Schwacke nicht mehr möglich ist 
              (bei älteren Fahrzeugen). Zusätzlich nach Zeitaufwand berechnet werden: 
              Rechnungsprüfungen – Schadenerweiterungen – Nachbesichtigungen – Anwesenheit 
              bei Nachbesichtigungen, welche vom Schädiger bzw. dessen Versicherer veranlasst 
              wurden – Fahrzeuggegenüberstellungen – Überprüfungen von Fremdgutachten – 
              Stellungnahmen bei unberechtigt durch den Versicherer oder andere Institutionen 
              angegriffene Gutachten – etc. Nebenkosten (netto): An Fahrtkosten werden 
              0,70 Euro pro gefahrene km in Rechnung gestellt. Dem Gutachten wird ein 
              Lichtbildsatz beigefügt, der mit 2,00 Euro / Bild berechnet wird. Ein zweiter und 
              dritter Fotosatz (Farbkopie) wird mit 0,50 Euro / Bild berechnet. Originalseiten 
              werden mit 1,80 Euro / Seite berechnet, Porto‑, Telefon‑ und Versandkosten 
              werden mit 15,00 Euro, … (usw. wie in deinem honorarTableData‑Kommentar).
            </p>
          </LegalTextBox>
          <SignatureSection canvasRef={sigRefs.werkvertrag} id="ortDatumUnterschriftWerkvertrag" label="Unterschrift Auftraggeber" />
          <SignatureSection canvasRef={sigRefs.werkvertragSV} id="ortDatumUnterschriftSachverstaendiger" label="Unterschrift Sachverständiger" />

          {/* 7. Widerrufsbelehrung */}
          <SectionTitle>Widerrufsbelehrung</SectionTitle>
          <LegalTextBox>{textWiderruf1}</LegalTextBox>
          <SignatureSection canvasRef={sigRefs.widerruf1} id="ortDatumUnterschriftWiderruf1" label="Unterschrift Auftraggeber" />
          <LegalTextBox>{textWiderruf2}</LegalTextBox>
          <SignatureSection canvasRef={sigRefs.widerruf2} id="ortDatumUnterschriftWiderruf2" label="Unterschrift Auftraggeber" />
        </div>

        <DialogFooter className="pt-6 px-8 pb-4">
          <Button variant="outline" onClick={onClose}>Abbrechen</Button>
          <Button onClick={handleGeneratePdf} disabled={isLoading}>{isLoading ? 'Wird erstellt...' : 'PDF generieren & Speichern'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
