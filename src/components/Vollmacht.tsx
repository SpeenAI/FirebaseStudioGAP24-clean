import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import SignatureCanvas from 'react-signature-canvas';
import html2canvas from 'html2canvas';
import { PDFDocument, PageSizes } from 'pdf-lib';

interface VollmachtFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (pdfFile: File) => void;
  caseData: {
    caseNumber: string;
    clientName: string;
    accidentDate?: string;
  };
  isLoading: boolean;
}

export const VollmachtForm: React.FC<VollmachtFormProps> = ({ isOpen, onClose, onSave, caseData, isLoading }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const sigRef = useRef<SignatureCanvas>(null);
  const [locationDate, setLocationDate] = useState('');

  useEffect(() => {
    const now = new Date();
    const date = now.toLocaleDateString('de-DE');
    setLocationDate(`den ${date}`);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async ({ coords }) => {
        try {
          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.latitude}&longitude=${coords.longitude}&localityLanguage=de`);
          const data = await res.json();
          const city = data.city || data.principalSubdivision || data.locality;
          setLocationDate(`${city}, den ${date}`);
        } catch {
          // ignore location failure
        }
      });
    }
  }, []);

  const generatePdf = async () => {
    if (!printRef.current) return;
    const canvas = await html2canvas(printRef.current, { scale: 2, backgroundColor: '#fff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = await PDFDocument.create();
    const pngImage = await pdf.embedPng(imgData);
    const page = pdf.addPage(PageSizes.A4);
    const { width, height } = page.getSize();
    const scale = width / canvas.width;
    page.drawImage(pngImage, {
      x: 0,
      y: 0,
      width,
      height: canvas.height * scale,
    });
    const pdfBytes = await pdf.save();
    const pdfFile = new File([pdfBytes], `Vollmacht_${caseData.caseNumber}.pdf`, { type: 'application/pdf' });
    onSave(pdfFile);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <div ref={printRef} className="p-6 text-sm bg-white text-black">
          <h2 className="text-center text-xl font-bold mb-4">VOLLMACHT</h2>
          <p className="text-right text-xs mb-2">Zustellungen werden nur an den/die Bevollmächtigte(n) erbeten!</p>

          <p>Den Rechtsanwälten Dr. Berchtold, Hahn, Wiese<br />
            Humboldtstraße 14, 65189 Wiesbaden<br />
            Telefon 0611/301701 • Telefax 0611/370065<br />
            E-Mail: kanzlei@dr-berchtold.de
          </p>

          <p className="mt-4">
            wird hiermit in Sachen <strong>{caseData.clientName}</strong><br />
            wegen <strong>Verkehrsunfall am {caseData.accidentDate}</strong>
          </p>

          <ol className="list-decimal ml-6 mt-4 space-y-2">
            <li>zur Prozeßführung (u. a. nach §§ 81 ff. ZPO)...</li>
            <li>zur Antragstellung in Scheidungs- und Scheidungsfolgesachen...</li>
            <li>zur Vertretung und Verteidigung in Strafsachen...</li>
            <li>Zur Vertretung in sonstigen Verfahren und Verhandlungen...</li>
            <li>zur Begründung und Aufhebung von Vertragsverhältnissen...</li>
          </ol>

          <p className="mt-4 text-justify">
            Die Vollmacht gilt für alle Instanzen... (vollständiger Paragraph wie auf dem Original)
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4 items-end">
            <div>
              <Label>Unterschrift Mandant</Label>
              <div className="border rounded bg-white">
                <SignatureCanvas ref={sigRef} canvasProps={{ className: 'w-full h-[100px]' }} />
              </div>
            </div>
            <div>
              <Label>Ort &amp; Datum</Label>
              <Input value={locationDate} readOnly />
            </div>
          </div>
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={onClose}>Abbrechen</Button>
          <Button onClick={generatePdf} disabled={isLoading}>
            {isLoading ? 'Wird erstellt...' : 'PDF generieren & Speichern'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};