export interface Contact {
  id: string;
  nom: string;
  prenoms: string;
  telephone: string;
  isWhatsapp: boolean; // Indicates if this phone number is also used for WhatsApp
  email: string;
  metier: string;
  createdAt: string; // ISO date string
  customFields?: Record<string, string>; // Dynamic user-defined field key-value pairs
}

export interface ContactFilters {
  search: string;
  metier: string;
}

export type SortField = 'nom' | 'prenoms' | 'createdAt' | 'metier' | 'email' | 'telephone';
export type SortOrder = 'asc' | 'desc';
