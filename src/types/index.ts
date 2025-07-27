// src/types/index.ts

/** Ein einzelnes hochgeladenes File */
export interface StoredFile {
  name: string;
  url: string;
}
/** Alle Bilder und Dokumente zu einem Case, nach Kategorie geordnet */
export interface CaseMedia {
  images: {
    [category: string]: StoredFile[];
  };
  documents: {
    [category: string]: StoredFile[];
  };
}

/** Dein Case–Model, exakt passend zu deinen Component‑Props */
export type Case = {
  id: string;
  caseNumber: string;

  /** entspricht dem Feld caseType in deinem JSX */
  caseType?: string;
  description?: string;

  /** entspricht caseData.clientName */
  clientName: string;
  /** entspricht caseData.clientEmail */
  clientEmail: string;
  /** entspricht caseData.clientAddress */
  clientAddress: string;

  /** wenn du es noch brauchst, sonst kannst du das rauswerfen */
  date: string;
  status: 'Open' | 'In Progress' | 'Closed' | 'Pending';

  partner: {
    id: string;
    name: string;
  };

  /** optional, weil anfangs vielleicht noch keins existiert */
  media?: CaseMedia;
};
