import type { Case } from '@/types';

export const mockCases: Case[] = [
  {
    id: '1',
    caseNumber: 'CASE-2024-001',
    client: {
      name: 'John Doe',
      address: '123 Main St, Anytown, USA',
      contact: 'john.doe@example.com',
    },
    date: '2024-07-21',
    status: 'Open',
    partner: {
      id: 'partner-1',
      name: 'Partner A',
    },
    images: [
      { url: 'https://placehold.co/600x400', hint: 'car damage' },
      { url: 'https://placehold.co/600x400', hint: 'document scan' },
    ],
    documents: [
      { name: 'Initial Report.pdf', url: '#' },
      { name: 'Witness Statement.docx', url: '#' },
    ],
    description: 'Initial assessment of vehicle damage from a minor collision. Client reports no injuries.',
  },
  {
    id: '2',
    caseNumber: 'CASE-2024-002',
    client: {
      name: 'Jane Smith',
      address: '456 Oak Ave, Anytown, USA',
      contact: 'jane.smith@example.com',
    },
    date: '2024-07-20',
    status: 'In Progress',
    partner: {
      id: 'partner-1',
      name: 'Partner A',
    },
    images: [
      { url: 'https://placehold.co/600x400', hint: 'property damage' },
      { url: 'https://placehold.co/600x400', hint: 'location photo' },
    ],
    documents: [{ name: 'Police Report.pdf', url: '#' }],
    description: 'Property damage claim following a storm. Awaiting final assessment from the insurance company.',
  },
  {
id: '3',
    caseNumber: 'CASE-2024-003',
    client: {
      name: 'Peter Jones',
      address: '789 Pine Ln, Anytown, USA',
      contact: 'peter.jones@example.com',
    },
    date: '2024-07-18',
    status: 'Closed',
    partner: {
      id: 'partner-2',
      name: 'Partner B',
    },
    images: [],
    documents: [
      { name: 'Final Settlement.pdf', url: '#' },
      { name: 'Case Summary.docx', url: '#' },
    ],
    description: 'Case closed. Full settlement reached between all parties involved.',
  },
  {
    id: '4',
    caseNumber: 'CASE-2024-004',
    client: {
      name: 'Mary Williams',
      address: '101 Maple Dr, Anytown, USA',
      contact: 'mary.williams@example.com',
    },
    date: '2024-07-15',
    status: 'Pending',
    partner: {
      id: 'partner-1',
      name: 'Partner A',
    },
    images: [{ url: 'https://placehold.co/600x400', hint: 'medical record' }],
    documents: [{ name: 'Medical Records Request.pdf', url: '#' }],
    description: 'Pending review of medical records to determine the extent of injuries.',
  },
];
