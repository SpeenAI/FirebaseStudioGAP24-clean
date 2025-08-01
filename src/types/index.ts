// src/types/index.ts

/** Ein gespeichertes File mit Name und URL */
export interface StoredFile {
  name: string
  url: string
}

/** 
 * Ein Gutachten‐Fall mit Metadaten und Media‐Einträgen.
 * Optional: alle neuen Reifen‐Felder
 */
export interface Case {
  [x: string]: any
  /** Firestore‐Dokumenten‐ID */
  id: string

  /** Aktenzeichen (Pflichtfeld) */
  caseNumber: string

  /** Gutachten‐Typ (z.B. "accident", "property"... ) */
  caseType: string

  /** Freitext‐Beschreibung */
  description?: string

  /** Klienten‐Daten */
  clientName?: string
  clientEmail?: string
  clientAddress?: string
  customerPlate?: string;        // Kennzeichen Kunde
  accidentDate?: string;         // Datum
  inspectionLocation?: string;   // Besichtigungsort
  policeRecordNumber?: string;   // Polizei‑Aktenzeichen
  witnesses?: string;            // Zeugen
  serviceBook?: string;          // Scheckheft gepflegt
  accidentLocation?: string;     // Unfallort
  accidentDescription?: string;  // Unfallbeschreibung
  clientPhone?: string;          // Handynummer Kunde
  opponentPlate?: string;        // Kennzeichen Gegner
  opponentInsurance?: string;    // Versicherung Gegner
  opponentVnr?: string;          // VNR Gegner
  opponentSnr?: string;          // SNR Gegner

  /** --- NEUE FELDER für Reifen & Vorschäden --- */
  /** Hersteller / Marke des Reifens */
  tireBrandFront?: string
  tireBrandBack?: string

  /** Dimension, z.B. "205/55 R16" */
  tireSizeFront?: string
  tireSizeBack?: string

  /** Profiltiefe vorne rechts in mm */
  tireDepthVR?: number
  /** Profiltiefe vorne links in mm */
  tireDepthVL?: number
  /** Profiltiefe hinten rechts in mm */
  tireDepthHR?: number
  /** Profiltiefe hinten links in mm */
  tireDepthHL?: number

  /** Beschriebene, bereits reparierte Vorschäden */
  repairedDamage?: string

  partner?: {
    name?: string;
  };

  /** Alle in diesem Fall hochgeladenen Mediendateien */
  media?: {
    /** Bilder pro Kategorie */
    images?: Record<string, StoredFile[]>
    /** Dokumente pro Kategorie */
    documents?: Record<string, StoredFile[]>
  }
}
// src/types/index.ts
export interface CaseFormData {
  
}

// src/types/index.ts

export interface CaseFormData {
  caseNumber:       any;
}
