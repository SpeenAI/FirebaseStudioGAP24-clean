'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, ChevronLeft, XCircle, FileIcon, Edit } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, FC, ChangeEvent } from 'react';
import { auth, db, storage } from '@/firebaseConfig';
import type { DocumentReference } from 'firebase/firestore';
import { doc, onSnapshot, updateDoc, collectionGroup, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { Case, CaseFormData } from '@/types';
import { AbtretungForm } from '@/components/AbtretungForm';
import SketchForm from 'src/components/SketchForm';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import EditCaseForm from '@/components/EditCaseForm'
import { Textarea } from '@/components/ui/textarea'

// --- Interfaces ---
interface StoredFile { name: string; url: string; }

// --- FileUploadSection Component ---
interface FileUploadSectionProps {
  label: string
  category: string
  onFileUpload: (category: string, file: File) => void
  uploadedFiles?: StoredFile[]
  onRemoveFile: (category: string, fileName: string, fileUrl: string) => void
  fileType: 'image' | 'document'
}




const FileUploadSection: FC<FileUploadSectionProps> = ({
  label,
  category,
  onFileUpload,
  uploadedFiles = [],
  onRemoveFile,
  fileType,
}) => (
  <div className="grid gap-2">
    <Label>{label}</Label>
    <div className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-6 flex flex-col items-center justify-center text-center relative">
      <Upload className="h-10 w-10 text-muted-foreground" />
      <p className="mt-2 text-sm text-muted-foreground">Datei auswählen</p>
      <Input
        id={`${category}-upload`}
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={(e) =>
          e.target.files?.[0] && onFileUpload(category, e.target.files[0])
        }
        accept={fileType === 'image' ? 'image/*' : '.pdf,.doc,.docx,.txt'}
      />
    </div>

    <div className="grid gap-2 mt-2">
      {uploadedFiles.map((file) => (
        <div
          key={file.name}
          className="flex items-center justify-between p-2 border rounded-md min-w-0"
        >
          {fileType === 'image' ? (
            <img
              src={file.url}
              alt={file.name}
              className="h-16 w-16 object-cover rounded flex-shrink-0"
            />
          ) : (
            <Link
              href={file.url}
              target="_blank"
              className="flex items-center gap-2 flex-1 min-w-0 hover:underline"
            >
              <FileIcon className="h-6 w-6 text-muted-foreground flex-shrink-0" />
              <span className="text-sm truncate">{file.name}</span>
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemoveFile(category, file.name, file.url)}
            className="text-destructive hover:text-destructive flex-shrink-0 ml-2"
          >
            <XCircle className="h-5 w-5" />
          </Button>
        </div>
      ))}
    </div>
  </div>
)


// --- Main Page Component ---
export default function CaseDetailsClient({ caseId }: { caseId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [customFields, setCustomFields] = useState<{ id: string; label: string }[]>([]);
  const [isEditOpen,  setIsEditOpen]  = useState(false);
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<Case>({
    id: '',
    caseNumber:     '',
    caseType:       '',
    description:    '',
    clientName:     '',
    clientEmail:    '',
    clientAddress:  '',
    customerPlate: '',       // Kennzeichen Kunde
    accidentDate:   '',        // Datum
    inspectionLocation: '',   // Besichtigungsort
    policeRecordNumber: '',   // Polizei‑Aktenzeichen
    witnesses:      '',           // Zeugen
    serviceBook:    '',         // Scheckheft gepflegt
    accidentLocation:   '',    // Unfallort
    accidentDescription:  '',// Unfallbeschreibung
    clientPhone:    '',      // Handynummer Kunde
    opponentPlate:      '',   // Kennzeichen Gegner
    opponentInsurance:  '',  // Versicherung Gegner
    opponentVnr:       '',  // VNR Gegner
    opponentSnr:        '',   // SNR Gegner
    tireBrandFront:      '',
    tireBrandBack:      '',
    tireSizeFront:       '',
    tireSizeBack:       '',
    tireDepthVR:    0,
    tireDepthVL:    0,
    tireDepthHR:    0,
    tireDepthHL:    0,
    repairedDamage: '',
    media:          {}
  });

  const handleEditOpen = () => {
    if (!caseData) return
    setEditData(caseData)   // Kopie des aktuellen Falls in editData
    setIsEditing(true)
  }

  // handler to save edited fields back to Firestore
 const handleEditSave = async () => {
  if (!ownerId || !editData) return
  const caseRef = doc(db, "cases", ownerId, "user_cases", caseId)
  await updateDoc(caseRef, {
    // — Basis-Daten
    caseNumber:         editData.caseNumber,
    clientName:         editData.clientName,
    clientAddress:      editData.clientAddress,
    customerPlate:      editData.customerPlate,
    accidentDate:       editData.accidentDate,
    // 
    inspectionLocation: editData.inspectionLocation,
    policeRecordNumber: editData.policeRecordNumber,
    witnesses:          editData.witnesses,
    serviceBook:        editData.serviceBook,
    accidentLocation:   editData.accidentLocation,
    accidentDescription:editData.accidentDescription,
    clientPhone:        editData.clientPhone,
    clientEmail:        editData.clientEmail,
    // — Gegner-Infos
    opponentPlate:      editData.opponentPlate,
    opponentInsurance:  editData.opponentInsurance,
    opponentVnr:        editData.opponentVnr,
    opponentSnr:        editData.opponentSnr,
  })
  // UI updaten
  setCaseData(editData)
  setIsEditing(false)
  toast({ title: "Fall aktualisiert!", description: "Deine Änderungen wurden gespeichert." })
}
  const [isSketchOpen, setIsSketchOpen]  = useState(false);
  const handleSketchOpen = () => setIsSketchOpen(true);
  const handleSketchClose = () => setIsSketchOpen(false);
  const handleSketchSave = (pdfFile: File) => {
    handleFileUpload('sketch', pdfFile);
    setIsSketchOpen(false);
  };

  

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) { router.push('/login'); return; }
  
    const findAndListenToCase = async () => {
      let caseRef: DocumentReference<Case> | undefined;    // ← typisiert
      const idTokenResult = await user.getIdTokenResult();
      const isAdmin = idTokenResult.claims.admin === true;
  
      if (isAdmin) {
        const q = query(
          collectionGroup(db, 'user_cases'),
          where('caseId', '==', caseId)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const caseDoc = querySnapshot.docs[0];
          // ← gecastet auf DocumentReference<Case>
          caseRef = caseDoc.ref as DocumentReference<Case>;
          setOwnerId(caseDoc.ref.parent.parent!.id);
        }
      } else {
        // ← auch hier gecastet
        caseRef = doc(
          db,
          "cases",
          user.uid,
          "user_cases",
          caseId
        ) as DocumentReference<Case>;
        setOwnerId(user.uid);
      }
  
      if (caseRef) {
        // ↓ Callback ohne manuelle Typ‐Annotation
        const unsubscribe = onSnapshot(caseRef, (docSnap) => {
          if (docSnap.exists()) {
            setCaseData({
              ...docSnap.data(),
              id: docSnap.id,         // id ganz zuletzt
            } as Case);
          }
          setIsLoading(false);
        });
        return unsubscribe;
      } else {
        setIsLoading(false);
        toast({
          title: "Fehler",
          description: "Fall nicht gefunden.",
          variant: "destructive"
        });
        router.push('/dashboard');
      }
    };
  
    findAndListenToCase();
  }, [caseId, router, toast]);  

  const handleFileUpload = async (category: string, file: File) => {
    if (!ownerId) return;
    setIsUploading(true);
    const fileType = file.type.startsWith('image/') ? 'images' : 'documents';
    const storageRef = ref(storage, `cases/${ownerId}/${caseId}/${fileType}/${category}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    toast({ title: "Upload gestartet...", description: `Datei ${file.name} wird hochgeladen.` });

    uploadTask.on('state_changed', () => {}, 
      (error: { message: any; }) => {
        toast({ title: "Upload fehlgeschlagen", description: error.message, variant: "destructive" });
        setIsUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        // const caseRef = doc(db, "cases", caseId) as DocumentReference<Case>;
        const caseRef = doc(db, "cases", ownerId!, "user_cases", caseId ) as DocumentReference<Case>;
        const newFile = { name: file.name, url: downloadURL };
        const currentFiles = caseData?.media?.[fileType]?.[category] || [];
        await updateDoc(caseRef, { [`media.${fileType}.${category}`]: [...currentFiles, newFile] });
        toast({ title: "Upload erfolgreich!", description: `${file.name} wurde hinzugefügt.` });
        setIsUploading(false);
        setIsFormOpen(false);
      }
    );
  };

    /**
   * Lädt alle media.images und media.documents als ZIP herunter
   */
    const handleDownloadAll = async () => {
      if (!caseData) return;
      const zip = new JSZip();
    
      // Helper: alle Kategorien und Dateien zusammenführen
      const categories = [
        ...(caseData.media?.images   ? Object.entries(caseData.media.images)   : []),
        ...(caseData.media?.documents? Object.entries(caseData.media.documents): []),
      ] as [string, StoredFile[]][];
    
      // jede Datei fetchen und flach ins ZIP legen
      for (const [, files] of categories) {
        for (const file of files) {
          try {
            const resp = await fetch(file.url);
            const blob = await resp.blob();
            // ↑ flach im Root, keine Unterordner
            zip.file(file.name, blob);
          } catch (e) {
            console.error(`Download ${file.name} fehlgeschlagen`, e);
          }
        }
      }
    
      // ZIP erzeugen und speichern
      try {
        const content = await zip.generateAsync({
          type: 'blob',
          compression: 'DEFLATE',
          compressionOptions: { level: 6 }
        });
        saveAs(content, `${caseData.caseNumber}-all.zip`);
      } catch (e) {
        console.error('ZIP‑Generierung fehlgeschlagen', e);
        toast({
          title: 'Fehler',
          description: 'Download fehlgeschlagen.',
          variant: 'destructive'
        });
      }
    };

  const handleFileRemove = async (category: string, fileName: string, fileUrl: string) => {
    if (!ownerId) return;
    try {
      await deleteObject(ref(storage, fileUrl));
      const fileType = Object.keys(caseData?.media?.images || {}).includes(category) ? 'images' : 'documents';
      const caseRef = doc(db, "cases", ownerId, "user_cases", caseId);
      const updatedFiles = (caseData?.media?.[fileType]?.[category] || []).filter((f: StoredFile) => f.name !== fileName);
      await updateDoc(caseRef, { [`media.${fileType}.${category}`]: updatedFiles });
      toast({ title: "Datei entfernt", description: `${fileName} wurde entfernt.` });
    } catch (error: any) {
      toast({ title: "Fehler", description: "Datei konnte nicht entfernt werden.", variant: "destructive" });
    }
  };

  if (isLoading) return <div className="text-center p-10">Laden...</div>;
  if (!caseData) return <div className="text-center p-10">Fall konnte nicht geladen werden.</div>;

  const abtretungFile = caseData.media?.documents?.assignment?.[0];



  return (
    <>
      <AbtretungForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={(pdfFile) => handleFileUpload('assignment', pdfFile)}
        caseData={{
          caseNumber: caseData.caseNumber,
          clientName: caseData.clientName ?? '',
          clientAddress: caseData.clientAddress ?? '',
        }}
        isLoading={isUploading}
      />
      
        {/* ← SKETCH FORM */}
        <SketchForm
        isOpen={isSketchOpen}
        onClose={handleSketchClose}
        onSave={handleSketchSave}
         caseData={{
          caseNumber: caseData.caseNumber,
          clientName:  caseData.clientName ?? '',
          clientAddress: caseData.clientAddress ?? '',
        }}
        isLoading={isUploading}
      />

        {/* Titelzeile mit Back- und Edit-Button */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon" className="h-7 w-7">
              <Link href="/dashboard">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Zurück</span>
              </Link>
            </Button>
            <h1 className="text-xl font-semibold">
              Fallansicht: {caseData.caseNumber}
            </h1>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              setIsEditing(true)
              setEditData(caseData!)
            }}
          >
            Bearbeiten
          </Button>
        </div>

        {/* Grid mit 3 Spalten */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* — linke Spalte */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Falldetails</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm">
                {isEditing ? (
                  <>
                    {/* — Editierbare Felder */}
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Aktenzeichen:</span>
                      <Input
                        value={editData.caseNumber}
                        onChange={e =>
                          setEditData({ ...editData, caseNumber: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Name des Kunden:</span>
                      <Input
                        value={editData.clientName}
                        onChange={e =>
                          setEditData({ ...editData, clientName: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Adresse des Kunden:</span>
                      <Input
                        value={editData.clientAddress}
                        onChange={e =>
                          setEditData({ ...editData, clientAddress: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Kennzeichen des Kunden:</span>
                      <Input
                        value={editData.customerPlate}
                        onChange={e =>
                          setEditData({ ...editData, customerPlate: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Unfalltag:</span>
                      <Input
                        type="date"
                        value={editData.accidentDate}
                        onChange={e =>
                          setEditData({ ...editData, accidentDate: e.target.value })
                        }
                      />
                    </div>

                    <hr className="my-2 border-dashed" />

                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Besichtigungsort:</span>
                      <Input
                        value={editData.inspectionLocation}
                        onChange={e =>
                          setEditData({
                            ...editData,
                            inspectionLocation: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Polizei-Aktenzeichen:</span>
                      <Input
                        value={editData.policeRecordNumber}
                        onChange={e =>
                          setEditData({
                            ...editData,
                            policeRecordNumber: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold">Zeugen:</span>
                      <Textarea
                        rows={3}
                        value={editData.witnesses}
                        onChange={e =>
                          setEditData({ ...editData, witnesses: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Scheckheft gepflegt:</span>
                      <Input
                        value={editData.serviceBook}
                        onChange={e =>
                          setEditData({ ...editData, serviceBook: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Unfallort:</span>
                      <Input
                        value={editData.accidentLocation}
                        onChange={e =>
                          setEditData({ ...editData, accidentLocation: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold">Unfallbeschreibung:</span>
                      <Textarea
                        rows={4}
                        value={editData.accidentDescription}
                        onChange={e =>
                          setEditData({
                            ...editData,
                            accidentDescription: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Handynummer des Kunden:</span>
                      <Input
                        value={editData.clientPhone}
                        onChange={e =>
                          setEditData({ ...editData, clientPhone: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">E-Mail des Kunden:</span>
                      <Input
                        type="email"
                        value={editData.clientEmail}
                        onChange={e =>
                          setEditData({ ...editData, clientEmail: e.target.value })
                        }
                      />
                    </div>

                  {/* — Gegner-Informationen */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Gegner-Informationen</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2 text-sm">
                      {isEditing ? (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Kennzeichen Gegner:</span>
                            <Input
                              value={editData.opponentPlate}
                              onChange={e =>
                                setEditData({ ...editData, opponentPlate: e.target.value })
                              }
                            />
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">Versicherung Gegner:</span>
                            <Input
                              value={editData.opponentInsurance}
                              onChange={e =>
                                setEditData({ ...editData, opponentInsurance: e.target.value })
                              }
                            />
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">VNR Gegner:</span>
                            <Input
                              value={editData.opponentVnr}
                              onChange={e =>
                                setEditData({ ...editData, opponentVnr: e.target.value })
                              }
                            />
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">SNR Gegner:</span>
                            <Input
                              value={editData.opponentSnr}
                              onChange={e =>
                                setEditData({ ...editData, opponentSnr: e.target.value })
                              }
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between">
                            <span className="font-semibold">Kennzeichen Gegner:</span>
                            <span>{caseData.opponentPlate || '–'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-semibold">Versicherung Gegner:</span>
                            <span>{caseData.opponentInsurance || '–'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-semibold">VNR Gegner:</span>
                            <span>{caseData.opponentVnr || '–'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-semibold">SNR Gegner:</span>
                            <span>{caseData.opponentSnr || '–'}</span>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                    {/* — Speichern / Abbrechen */}
                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false)
                          setEditData(caseData!)
                        }}
                      >
                        Abbrechen
                      </Button>
                      <Button onClick={handleEditSave}>Speichern</Button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* — Nur-Anzeige-Modus */}
                    <div className="flex justify-between">
                      <span className="font-semibold">Aktenzeichen:</span>
                      <span>{caseData.caseNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Name des Kunden:</span>
                      <span>{caseData.clientName || '–'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Adresse des Kunden:</span>
                      <span>{caseData.clientAddress || '–'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Kennzeichen des Kunden:</span>
                      <span>{caseData.customerPlate || '–'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Unfalltag:</span>
                      <span>{caseData.accidentDate || '–'}</span>
                    </div>

                    <hr className="my-2 border-dashed" />

                    <div className="flex justify-between">
                      <span className="font-semibold">Besichtigungsort:</span>
                      <span>{caseData.inspectionLocation || '–'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Polizei-Aktenzeichen:</span>
                      <span>{caseData.policeRecordNumber || '–'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Zeugen:</span>
                      <span>{caseData.witnesses || '–'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Scheckheft gepflegt:</span>
                      <span>{caseData.serviceBook || '–'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Unfallort:</span>
                      <span>{caseData.accidentLocation || '–'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold">Unfallbeschreibung:</span>
                      <p className="ml-4 mt-1 text-sm">
                        {caseData.accidentDescription || '–'}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Handynummer des Kunden:</span>
                      <span>{caseData.clientPhone || '–'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">E-Mail des Kunden:</span>
                      <span>{caseData.clientEmail || '–'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Kennzeichen Gegner:</span>
                      <span>{caseData.opponentPlate || '–'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Versicherung Gegner:</span>
                      <span>{caseData.opponentInsurance || '–'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">VNR Gegner:</span>
                      <span>{caseData.opponentVnr || '–'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">SNR Gegner:</span>
                      <span>{caseData.opponentSnr || '–'}</span>
                   </div>
                  </>
                )}
              </CardContent>
            </Card>

          {/* Rechte Spalte: Sektionen komplett (Abtretung unverändert) */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Medien */}
            <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>Medien</CardTitle>
                <CardDescription>
                  Laden Sie hier die zugehörigen Bilder und Dokumente hoch.
                </CardDescription>
              </div>
              <Button variant="secondary" size="sm" onClick={handleDownloadAll}>
                Alle herunterladen
              </Button>
            </CardHeader>

            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <FileUploadSection
                label="Vorne Links Diagonal"
                category="frontLeftDiagonal"
                onFileUpload={handleFileUpload}
                uploadedFiles={caseData.media?.images?.frontLeftDiagonal}
                onRemoveFile={handleFileRemove}
                fileType="image"
              />
              <FileUploadSection
                label="Vorne Rechts Diagonal"
                category="frontRightDiagonal"
                onFileUpload={handleFileUpload}
                uploadedFiles={caseData.media?.images?.frontRightDiagonal}
                onRemoveFile={handleFileRemove}
                fileType="image"
              />
              <FileUploadSection
                label="Hinten Rechts Diagonal"
                category="rearRightDiagonal"
                onFileUpload={handleFileUpload}
                uploadedFiles={caseData.media?.images?.rearRightDiagonal}
                onRemoveFile={handleFileRemove}
                fileType="image"
              />
              <FileUploadSection
                label="Hinten Links Diagonal"
                category="rearLeftDiagonal"
                onFileUpload={handleFileUpload}
                uploadedFiles={caseData.media?.images?.rearLeftDiagonal}
                onRemoveFile={handleFileRemove}
                fileType="image"
              />
              <FileUploadSection
                label="Seitenansicht Links"
                category="sideLeftHorizontal"
                onFileUpload={handleFileUpload}
                uploadedFiles={caseData.media?.images?.sideLeftHorizontal}
                onRemoveFile={handleFileRemove}
                fileType="image"
              />
              <FileUploadSection
                label="Seitenansicht Rechts"
                category="sideRightHorizontal"
                onFileUpload={handleFileUpload}
                uploadedFiles={caseData.media?.images?.sideRightHorizontal}
                onRemoveFile={handleFileRemove}
                fileType="image"
              />
              <FileUploadSection
                label="Tachostand"
                category="odometer"
                onFileUpload={handleFileUpload}
                uploadedFiles={caseData.media?.images?.odometer}
                onRemoveFile={handleFileRemove}
                fileType="image"
              />
              <FileUploadSection
                label="Fahrgestellnummer"
                category="vin"
                onFileUpload={handleFileUpload}
                uploadedFiles={caseData.media?.images?.vin}
                onRemoveFile={handleFileRemove}
                fileType="image"
              />
              <FileUploadSection
                label="Vorschäden"
                category="preDamage"
                onFileUpload={handleFileUpload}
                uploadedFiles={caseData.media?.images?.preDamage}
                onRemoveFile={handleFileRemove}
                fileType="image"
              />
              <FileUploadSection
                label="Innenraum Fahrerseite"
                category="interiorDriverSide"
                onFileUpload={handleFileUpload}
                uploadedFiles={caseData.media?.images?.interiorDriverSide}
                onRemoveFile={handleFileRemove}
                fileType="image"
              />
              <FileUploadSection
                label="Schäden"
                category="damageOverview"
                onFileUpload={handleFileUpload}
                uploadedFiles={caseData.media?.images?.damageOverview}
                onRemoveFile={handleFileRemove}
                fileType="image"
              />
            </CardContent>
            </Card>
  
            {/* Abtretungserklärung */}
            <Card>
              <CardHeader>
                <CardTitle>Abtretungserklärung</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                {abtretungFile ? (
                  <div className="flex items-center justify-between p-2 border rounded-md">
                    <Link
                      href={abtretungFile.url}
                      target="_blank"
                      className="flex items-center gap-2 overflow-hidden hover:underline"
                    >
                      <FileIcon className="h-6 w-6 flex-shrink-0" />
                      <span className="text-sm font-medium truncate">
                        {abtretungFile.name}
                      </span>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleFileRemove(
                          'assignment',
                          abtretungFile.name,
                          abtretungFile.url
                        )
                      }
                      className="text-destructive flex-shrink-0"
                    >
                      <XCircle className="h-5 w-5" />
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 p-4 border rounded-md bg-slate-50">
                    <div className="flex flex-col items-center justify-center gap-2 text-center relative">
                      <Upload className="h-8 w-8" />
                      <p className="text-sm font-medium">Dokument hochladen</p>
                      <Input
                        id="assignment-upload"
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) =>
                          e.target.files?.[0] &&
                          handleFileUpload('assignment', e.target.files[0])
                        }
                        accept="image/*,.pdf"
                      />
                    </div>
                    <div className="flex flex-col items-center justify-center gap-2 text-center">
                      <Edit className="h-8 w-8" />
                      <p className="text-sm font-medium">
                        Online ausfüllen & erstellen
                      </p>
                      <Button
                        size="sm"
                        onClick={() => setIsFormOpen(true)}
                      >
                        Formular öffnen
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
  
            <Card>
            <CardHeader>
              <CardTitle>Versicherungsunterlagen</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <FileUploadSection
                label="Versicherungsunterlagen"
                category="insuranceDocuments"
                onFileUpload={handleFileUpload}
                uploadedFiles={caseData.media?.images?.insuranceDocuments}
                onRemoveFile={handleFileRemove}
                fileType="image"
              />
            </CardContent>
            </Card>
  
            {/* Polizeibericht */}
            <Card>
              <CardHeader>
                <CardTitle>Polizeibericht</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                <FileUploadSection
                  label="Polizeibericht"
                  category="policeReport"
                  onFileUpload={handleFileUpload}
                  uploadedFiles={caseData.media?.images?.policeReport}
                  onRemoveFile={handleFileRemove}
                  fileType="image"
                />
              </CardContent>
            </Card>
  
            {/* Technisches Datenblatt */}
            <Card>
              <CardHeader>
                <CardTitle>Scheckheft</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                <FileUploadSection
                  label="Scheckheft"
                  category="scheckheft"
                  onFileUpload={handleFileUpload}
                  uploadedFiles={caseData.media?.images?.policeReport}
                  onRemoveFile={handleFileRemove}
                  fileType="image"
                />
              </CardContent>
            </Card>

            {/* Sonstiges */}
            <Card>
              <CardHeader>
                <CardTitle>Sonstiges</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col items-center justify-center gap-2 border rounded-md p-4">
                  <Edit className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium">Skizze erstellen</p>
                  <Button size="sm" onClick={handleSketchOpen}>
                    Skizze öffnen
                  </Button>
                </div>
                <FileUploadSection
                  label="Sonstige Bilder"
                  category="miscImages"
                  onFileUpload={handleFileUpload}
                  uploadedFiles={caseData.media?.images?.miscImages}
                  onRemoveFile={handleFileRemove}
                  fileType="image"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );

}
