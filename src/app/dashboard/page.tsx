'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Case } from '@/types';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/firebaseConfig';
import { collection, query, onSnapshot, orderBy, collectionGroup, getDocs } from 'firebase/firestore';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';



export default function DashboardPage() {
  const router = useRouter();
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false); // State to hold admin status
  const [userMap, setUserMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (user) {
        user.getIdTokenResult().then(idTokenResult => {
          const userIsAdmin = idTokenResult.claims.admin === true;
          setIsAdmin(userIsAdmin);
          
          let q;
          if (userIsAdmin) {
            q = query(collectionGroup(db, 'user_cases'), orderBy('createdAt', 'desc'));
          } else {
            q = query(collection(db, 'cases', user.uid, 'user_cases'), orderBy('createdAt', 'desc'));
          }

          const unsubscribeFirestore = onSnapshot(q, (snapshot) => {
            const fetchedCases = snapshot.docs.map(doc => {
              const data = doc.data();
              const ownerId = doc.ref.parent.parent?.id; // <- User-ID
              return {
                id: doc.id,
                ...(data as Omit<Case, 'id'>),
                ownerId,
                date: data.createdAt?.toDate().toLocaleDateString('de-DE') || 'N/A',
              };
            });
            setCases(fetchedCases);
            setIsLoading(false);

          }, (error) => {
            console.error("Error fetching cases: ", error);
            setIsLoading(false);
          });

          return () => unsubscribeFirestore();
        });
      } else {
        setIsLoading(false);
        router.push('/login');
      }
    });
    return () => unsubscribeAuth();
  }, [router]);

  const handleDownloadCase = async (caseItem: Case) => {
    const zip = new JSZip();
  
    // 1. Textdatei mit Fallinfos
    const lines = [
      `Aktenzeichen: ${caseItem.caseNumber}`,
      `Name: ${caseItem.clientName}`,
      `Adresse: ${caseItem.clientAddress}`,
      `Kennzeichen: ${caseItem.customerPlate}`,
      `Unfalltag: ${caseItem.accidentDate}`,
      `Besichtigungsort: ${caseItem.inspectionLocation}`,
      `Polizei-Aktenzeichen: ${caseItem.policeRecordNumber}`,
      `Zeugen: ${caseItem.witnesses}`,
      `Scheckheft: ${caseItem.serviceBook}`,
      `Unfallort: ${caseItem.accidentLocation}`,
      `Unfallbeschreibung: ${caseItem.accidentDescription}`,
      `Telefon: ${caseItem.clientPhone}`,
      `E-Mail: ${caseItem.clientEmail}`,
      `Gegner-Kennzeichen: ${caseItem.opponentPlate}`,
      `Gegner-Versicherung: ${caseItem.opponentInsurance}`,
      `Gegner-VNR: ${caseItem.opponentVnr}`,
      `Gegner-SNR: ${caseItem.opponentSnr}`
    ];
    zip.file('Fallinfo.txt', lines.join('\n'));
  
    // 2. Medien aus media.images & media.documents
    const mediaGroups = [
      ...(caseItem.media?.images ? Object.entries(caseItem.media.images) : []),
      ...(caseItem.media?.documents ? Object.entries(caseItem.media.documents) : [])
    ] as [string, { name: string, url: string }[]][];
  
    for (const [category, files] of mediaGroups) {
      for (const file of files) {
        try {
          const res = await fetch(file.url);
          const blob = await res.blob();
          zip.file(`${category}/${file.name}`, blob);
        } catch (err) {
          console.warn(`Fehler beim Laden von ${file.name}:`, err);
        }
      }
    }
  
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `Fall_${caseItem.caseNumber || caseItem.id}.zip`);
  };  

  const getStatusVariant = (status: Case['status']) => {
    switch (status) {
      case 'Open': return 'default';
      case 'In Progress': return 'secondary';
      case 'Closed': return 'outline';
      case 'Pending': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="flex flex-col gap-4">
       <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-headline">Fallübersicht</h1>
        <Button asChild className="gap-2">
          <Link href="/dashboard/cases/new">
            <PlusCircle className="h-5 w-5" />
            Neuen Fall anlegen
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Ihre Fälle</CardTitle>
          <CardDescription>
            Verwalten Sie alle Ihre Fälle an einem Ort. Administratoren können alle Fälle sehen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aktenzeichen</TableHead>
                {/* Conditionally render the Partner column only for admins */}
                {isAdmin && <TableHead>Partner</TableHead>}
                <TableHead>Klient</TableHead>
                <TableHead>Datum hinzugefügt</TableHead>
                <TableHead>Status</TableHead>
                <TableHead><span className="sr-only">Aktionen</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={isAdmin ? 6 : 5} className="text-center">Laden...</TableCell></TableRow>
              ) : cases.length > 0 ? (
                cases.map((caseItem) => (
                  <TableRow key={caseItem.id}>
                    <TableCell className="font-medium">{caseItem.caseNumber}</TableCell>
                    {/* Conditionally render the Partner cell only for admins */}
                    {isAdmin && <TableCell>{userMap[caseItem.ownerId!] || 'Unbekannt'}</TableCell>}
                    <TableCell>{caseItem.clientName || 'N/A'}</TableCell>
                    <TableCell>{caseItem.date}</TableCell>
                    <TableCell><Badge variant={getStatusVariant(caseItem.status)}>{caseItem.status}</Badge></TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Menü</span></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() => handleDownloadCase(caseItem)}
                        >
                          Fall & Dateien herunterladen
                        </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => router.push(`/dashboard/cases/${caseItem.id}`)}>Ansehen & Bearbeiten</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={isAdmin ? 6 : 5} className="text-center">Keine Fälle gefunden.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
