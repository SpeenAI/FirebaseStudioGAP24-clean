'use client';

import CaseDetailsClient from './CaseDetailsClient';

export default function CaseDetailPage({ params }: { params: { id: string } }) {
  return <CaseDetailsClient caseId={params.id} />;
}
