'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, ChevronLeft, XCircle, FileIcon, Edit } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect, FC, ChangeEvent } from 'react';
import { auth, db, storage } from '@/firebaseConfig';
import { doc, onSnapshot, updateDoc, collectionGroup, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import type { Case } from '@/types';
import { AbtretungForm } from '@/components/AbtretungForm';


// --- Interfaces ---
interface StoredFile { name: string; url: string; }

// --- FileUploadSection Component ---
interface FileUploadSectionProps {
  label: string; category: string; onFileUpload: (category: string, file: File) => void;
  uploadedFiles?: StoredFile[]; onRemoveFile: (category: string, fileName: string, fileUrl: string) => void;
  fileType: 'image' | 'document';
}

const FileUploadSection: FC<FileUploadSectionProps> = ({ label, category, onFileUpload, uploadedFiles = [], onRemoveFile, fileType }) => (
  <div className="grid gap-2">
    <Label>{label}</Label>
    <div className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-6 flex flex-col items-center justify-center text-center relative">
      <Upload className="h-10 w-10 text-muted-foreground" />
      <p className="mt-2 text-sm text-muted-foreground">Datei auswählen</p>
      <Input
        id={`${category}-upload`} type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={(e) => e.target.files && e.target.files[0] && onFileUpload(category, e.target.files[0])}
        accept={fileType === 'image' ? 'image/*' : '.pdf,.doc,.docx,.txt'}
      />
    </div>
    <div className="grid gap-2 mt-2">
      {uploadedFiles.map(file => (
        <div key={file.name} className="flex items-center justify-between p-2 border rounded-md">
          <Link href={file.url} target="_blank" className="flex items-center gap-2 overflow-hidden hover:underline">
            <FileIcon className="h-6 w-6 text-muted-foreground flex-shrink-0" />
            <span className="text-sm truncate">{file.name}</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => onRemoveFile(category, file.name, file.url)} className="text-destructive hover:text-destructive flex-shrink-0">
            <XCircle className="h-5 w-5" />
          </Button>
        </div>
      ))}
    </div>
  </div>
);



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


  useEffect(() => {
    const user = auth.currentUser;
    if (!user) { router.push('/login'); return; }

    const findAndListenToCase = async () => {
      let caseRef;
      const idTokenResult = await user.getIdTokenResult();
      const isAdmin = idTokenResult.claims.admin === true;

      if (isAdmin) {
        const q = query(collectionGroup(db, 'user_cases'), where('caseId', '==', caseId));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const caseDoc = querySnapshot.docs[0];
          caseRef = caseDoc.ref;
          setOwnerId(caseDoc.ref.parent.parent!.id);
        }
      } else {
        caseRef = doc(db, "cases", user.uid, "user_cases", caseId);
        setOwnerId(user.uid);
      }

      if (caseRef) {
        const unsubscribe = onSnapshot(caseRef, (docSnap) => {
          if (docSnap.exists()) setCaseData({ id: docSnap.id, ...docSnap.data() } as Case);
          else {
            toast({ title: "Fehler", description: "Fall nicht gefunden.", variant: "destructive" });
            router.push('/dashboard');
          }
          setIsLoading(false);
        });
        return unsubscribe;
      } else {
        setIsLoading(false);
        toast({ title: "Fehler", description: "Fall nicht gefunden.", variant: "destructive" });
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
      (error) => {
        toast({ title: "Upload fehlgeschlagen", description: error.message, variant: "destructive" });
        setIsUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        const caseRef = doc(db, "cases", ownerId, "user_cases", caseId);
        const newFile = { name: file.name, url: downloadURL };
        const currentFiles = caseData?.media?.[fileType]?.[category] || [];
        await updateDoc(caseRef, { [`media.${fileType}.${category}`]: [...currentFiles, newFile] });
        toast({ title: "Upload erfolgreich!", description: `${file.name} wurde hinzugefügt.` });
        setIsUploading(false);
        setIsFormOpen(false);
      }
    );
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
        caseData={{ caseNumber: caseData.caseNumber, clientName: caseData.clientName, clientAddress: caseData.clientAddress }}
        isLoading={isUploading}
      />
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon" className="h-7 w-7"><Link href="/dashboard"><ChevronLeft className="h-4 w-4" /><span className="sr-only">Zurück</span></Link></Button>
          <h1 className="text-xl font-semibold">Fallansicht: {caseData.caseNumber}</h1>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 grid gap-6 content-start">
            <Card><CardHeader><CardTitle>Falldetails</CardTitle></CardHeader><CardContent className="grid gap-2 text-sm"><p><strong>Aktenzeichen:</strong> {caseData.caseNumber}</p><p><strong>Fallart:</strong> {caseData.caseType || 'N/A'}</p><p><strong>Beschreibung:</strong> {caseData.description || 'Keine'}</p></CardContent></Card>
            <Card><CardHeader><CardTitle>Klienteninformationen</CardTitle></CardHeader><CardContent className="grid gap-2 text-sm"><p><strong>Name:</strong> {caseData.clientName}</p><p><strong>E-Mail:</strong> {caseData.clientEmail}</p><p><strong>Adresse:</strong> {caseData.clientAddress}</p></CardContent></Card>
          </div>
          <div className="lg:col-span-2 grid gap-6">
            <Card>
              <CardHeader><CardTitle>Medien</CardTitle><CardDescription>Laden Sie hier die zugehörigen Bilder und Dokumente hoch.</CardDescription></CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                
                {/* --- Vehicle Images (RESTORED) --- */}
                <FileUploadSection label="Vorne Links Diagonal" category="frontLeftDiagonal" onFileUpload={handleFileUpload} uploadedFiles={caseData.media?.images?.frontLeftDiagonal} onRemoveFile={handleFileRemove} fileType="image" />
                <FileUploadSection label="Vorne Rechts Diagonal" category="frontRightDiagonal" onFileUpload={handleFileUpload} uploadedFiles={caseData.media?.images?.frontRightDiagonal} onRemoveFile={handleFileRemove} fileType="image" />
                <FileUploadSection label="Hinten Rechts Diagonal" category="rearRightDiagonal" onFileUpload={handleFileUpload} uploadedFiles={caseData.media?.images?.rearRightDiagonal} onRemoveFile={handleFileRemove} fileType="image" />
                <FileUploadSection label="Hinten Links Diagonal" category="rearLeftDiagonal" onFileUpload={handleFileUpload} uploadedFiles={caseData.media?.images?.rearLeftDiagonal} onRemoveFile={handleFileRemove} fileType="image" />
                <FileUploadSection label="Seitenansicht Links" category="sideLeftHorizontal" onFileUpload={handleFileUpload} uploadedFiles={caseData.media?.images?.sideLeftHorizontal} onRemoveFile={handleFileRemove} fileType="image" />
                <FileUploadSection label="Seitenansicht Rechts" category="sideRightHorizontal" onFileUpload={handleFileUpload} uploadedFiles={caseData.media?.images?.sideRightHorizontal} onRemoveFile={handleFileRemove} fileType="image" />
                <FileUploadSection label="Tachostand" category="odometer" onFileUpload={handleFileUpload} uploadedFiles={caseData.media?.images?.odometer} onRemoveFile={handleFileRemove} fileType="image" />
                <FileUploadSection label="Fahrgestellnummer" category="vin" onFileUpload={handleFileUpload} uploadedFiles={caseData.media?.images?.vin} onRemoveFile={handleFileRemove} fileType="image" />
                <FileUploadSection label="Vorschäden" category="preDamage" onFileUpload={handleFileUpload} uploadedFiles={caseData.media?.images?.preDamage} onRemoveFile={handleFileRemove} fileType="image" />
                <FileUploadSection label="Innenraum Fahrrerseite"  category="interiorDriverSide"  onFileUpload={handleFileUpload} uploadedFiles={caseData.media?.images?.interiorDriverSide}  onRemoveFile={handleFileRemove}  fileType="image" />
                <FileUploadSection label="Schäden" category="damageOverview" onFileUpload={handleFileUpload} uploadedFiles={caseData.media?.images?.damageOverview} onRemoveFile={handleFileRemove} fileType="image" />
                
                {/* --- Other Documents --- */}
                <FileUploadSection label="Versicherungsunterlagen" category="insuranceDocuments" onFileUpload={handleFileUpload} uploadedFiles={caseData.media?.documents?.insuranceDocuments} onRemoveFile={handleFileRemove} fileType="document" />
                <FileUploadSection label="Polizeibericht" category="policeReport" onFileUpload={handleFileUpload} uploadedFiles={caseData.media?.documents?.policeReport} onRemoveFile={handleFileRemove} fileType="document" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
