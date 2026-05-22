import React, { useState, useMemo } from 'react';
import { Contact, SortField, SortOrder } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import ContactDetailsModal from './ContactDetailsModal';
import { 
  Search, 
  Trash2, 
  FileSpreadsheet, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Briefcase, 
  ArrowUpDown, 
  PhoneCall, 
  Mail, 
  X,
  RefreshCw,
  ChevronsUpDown,
  Phone,
  ExternalLink,
  Printer,
  AlertCircle
} from 'lucide-react';

interface ContactTableProps {
  contacts: Contact[];
  onDeleteContact: (id: string) => void;
  onOpenResetModal: () => void;
  customFieldDefinitions?: string[];
  onDeleteCustomFieldDefinition?: (title: string) => void;
}

export default function ContactTable({ 
  contacts, 
  onDeleteContact, 
  onOpenResetModal,
  customFieldDefinitions = [],
  onDeleteCustomFieldDefinition
}: ContactTableProps) {
  // State for print feedback inside iframe container
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // State for showing contact details in read-only mode
  const [selectedContactForDetails, setSelectedContactForDetails] = useState<Contact | null>(null);

  // Search state
  const [search, setSearch] = useState('');
  const [selectedMetier, setSelectedMetier] = useState('All');
  
  // Sorting state
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter list of Métiers for dropdown selector
  const allMetiers = useMemo(() => {
    const list = contacts.map((c) => c.metier.trim());
    return ['All', ...Array.from(new Set(list))];
  }, [contacts]);

  // Handle Sort Change
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1); // Reset page on sorting
  };

  // Filter and Sort contacts
  const processedContacts = useMemo(() => {
    let result = [...contacts];

    // 1. Filter by keyword
    if (search.trim() !== '') {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.nom.toLowerCase().includes(q) ||
          c.prenoms.toLowerCase().includes(q) ||
          c.telephone.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.metier.toLowerCase().includes(q)
      );
    }

    // 2. Filter by selected profession
    if (selectedMetier !== 'All') {
      result = result.filter((c) => c.metier.trim().toLowerCase() === selectedMetier.trim().toLowerCase());
    }

    // 3. Sort
    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'createdAt') {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      }

      const stringA = String(valA).toLowerCase();
      const stringB = String(valB).toLowerCase();

      if (stringA < stringB) return sortOrder === 'asc' ? -1 : 1;
      if (stringA > stringB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [contacts, search, selectedMetier, sortField, sortOrder]);

  // Paginated elements
  const paginatedContacts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedContacts.slice(startIndex, startIndex + itemsPerPage);
  }, [processedContacts, currentPage]);

  const totalPages = Math.ceil(processedContacts.length / itemsPerPage) || 1;

  // Export to Excel format (CSV semicolon-separated with Byte-Order-Mark for immediate French Excel recognition)
  const exportToExcel = () => {
    if (contacts.length === 0) {
      alert('La base de données est vide. Aucun contact à exporter.');
      return;
    }

    // Headers matching requirements including dynamic custom fields
    const headers = [
      'Nom', 
      'Prénoms', 
      'Téléphone', 
      'WhatsApp?', 
      'Adresse Email', 
      'Métier', 
      'Date d\'enregistrement',
      ...customFieldDefinitions
    ];
    
    // Build rows ensuring values for custom fields map correctly to definitions
    const rows = contacts.map((c) => [
      c.nom,
      c.prenoms,
      c.telephone,
      c.isWhatsapp ? 'Oui' : 'Non',
      c.email ? c.email : 'N/A',
      c.metier,
      new Date(c.createdAt).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      ...customFieldDefinitions.map((field) => c.customFields?.[field] || '')
    ]);

    // CSV format constructor
    const csvContent = [
      headers.join(';'),
      ...rows.map((row) => row.map((val) => `"${val.replace(/"/g, '""')}"`).join(';'))
    ].join('\n');

    // Add BOM (Byte-Order-Mark) to enforce UTF-8 in Excel
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const timestamp = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `Collector_Contacts_${timestamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF view logic
  const triggerPdfPrint = () => {
    // Detect sandbox browser restrictions inside nested standard frame contexts
    let isIframe = false;
    try {
      isIframe = window.self !== window.top;
    } catch {
      isIframe = true;
    }

    if (isIframe) {
      setIsPrintModalOpen(true);
    } else {
      window.print();
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all overflow-hidden" id="contact_table_panel">
      
      {/* Table Action Controls Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 print:hidden" id="table_controls_hdr">
        <div className="space-y-1">
          <h3 className="font-sans font-bold text-slate-900 dark:text-white" id="list_title">
            Enregistrements
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {processedContacts.length} contact{processedContacts.length > 1 ? 's' : ''} trouvé{processedContacts.length > 1 ? 's' : ''} sur {contacts.length} au total
          </p>
        </div>

        {/* Multi-export and Clear Button tools */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sémantique : "Réinitialiser" */}
          <button
            onClick={onOpenResetModal}
            className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40 transition-all cursor-pointer"
            title="Vider la base de données entière"
            id="clear_db_btn"
          >
            <RefreshCw size={13} className="transition-transform hover:rotate-180 duration-500" />
            Réinitialiser
          </button>

          {/* Export to Excel */}
          <button
            onClick={exportToExcel}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-950 transition-all cursor-pointer"
            id="export_excel_btn"
          >
            <FileSpreadsheet size={13} className="text-slate-400" />
            Excel
          </button>

          {/* Export to PDF */}
          <button
            onClick={triggerPdfPrint}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-950 transition-all cursor-pointer"
            id="export_pdf_btn"
          >
            <FileText size={13} className="text-slate-400" />
            Imprimer PDF
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Row */}
      <div className="grid grid-cols-1 gap-3 p-4 bg-slate-50/50 border-b border-slate-200 sm:grid-cols-12 dark:bg-slate-950/10 dark:border-slate-800 print:hidden" id="filters_row">
        {/* Search keyword input */}
        <div className="relative sm:col-span-8">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Rechercher par nom, téléphone, métier, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-9 text-xs text-slate-800 placeholder-slate-400 transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100/50 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            id="search_field_input"
          />
          {search && (
            <button
              onClick={() => {
                setSearch('');
                setCurrentPage(1);
              }}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
              id="clear_search_field_btn"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Métier dropdown filter */}
        <div className="relative sm:col-span-4">
          <select
            value={selectedMetier}
            onChange={(e) => {
              setSelectedMetier(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3.5 pr-10 text-xs font-semibold text-slate-700 transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100/50 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 cursor-pointer"
            id="filter_metier_select"
          >
            <option value="All">Tous les métiers</option>
            {allMetiers.filter((item) => item !== 'All').map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
            <ChevronDown size={13} />
          </span>
        </div>
      </div>

      {/* Main Table Interface */}
      <div className="overflow-x-auto" id="responsive_table_container">
        <table className="w-full table-auto text-left text-xs" id="contact_data_table">
          <thead className="border-b border-slate-200 bg-slate-50/40 text-[10px] font-bold tracking-wider text-slate-500 uppercase dark:border-slate-800 dark:bg-slate-950/20 dark:text-slate-400">
            <tr>
              <th 
                className="p-4 cursor-pointer select-none hover:bg-slate-50/60 dark:hover:bg-slate-800/40 hover:text-indigo-600 transition-colors"
                onClick={() => handleSort('nom')}
                id="th_identity"
              >
                <div className="flex items-center gap-1.5">
                  Nom & Prénoms
                  {sortField === 'nom' ? (
                    sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                  ) : <ChevronsUpDown size={12} className="opacity-40" />}
                </div>
              </th>
              
              <th 
                className="p-4 cursor-pointer select-none hover:bg-slate-50/60 dark:hover:bg-slate-800/40 hover:text-indigo-600 transition-colors"
                onClick={() => handleSort('telephone')}
                id="th_telephone"
              >
                <div className="flex items-center gap-1.5">
                  Téléphone / WhatsApp
                  {sortField === 'telephone' ? (
                    sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                  ) : <ChevronsUpDown size={12} className="opacity-40" />}
                </div>
              </th>

              <th 
                className="p-4 cursor-pointer select-none hover:bg-slate-50/60 dark:hover:bg-slate-800/40 hover:text-indigo-600 transition-colors"
                onClick={() => handleSort('email')}
                id="th_email"
              >
                <div className="flex items-center gap-1.5">
                  Adresse Mail
                  {sortField === 'email' ? (
                    sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                  ) : <ChevronsUpDown size={12} className="opacity-40" />}
                </div>
              </th>

              <th 
                className="p-4 cursor-pointer select-none hover:bg-slate-50/60 dark:hover:bg-slate-800/40 hover:text-indigo-600 transition-colors"
                onClick={() => handleSort('metier')}
                id="th_metier"
              >
                <div className="flex items-center gap-1.5">
                  Métier
                  {sortField === 'metier' ? (
                    sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                  ) : <ChevronsUpDown size={12} className="opacity-40" />}
                </div>
              </th>

              <th 
                className="p-4 cursor-pointer select-none hover:bg-slate-50/60 dark:hover:bg-slate-800/40 hover:text-indigo-600 transition-colors print:table-cell"
                onClick={() => handleSort('createdAt')}
                id="th_created_at"
              >
                <div className="flex items-center gap-1.5">
                  Date
                  {sortField === 'createdAt' ? (
                    sortOrder === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                  ) : <ChevronsUpDown size={12} className="opacity-40" />}
                </div>
              </th>

              {/* Dynamic Columns for Custom Fields */}
              {customFieldDefinitions.map((field) => (
                <th
                  key={field}
                  className="p-4 text-slate-500 font-semibold tracking-wider dark:text-slate-400 select-none min-w-[110px] lowercase first-letter:uppercase"
                  id={`th_custom_${field}`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span>{field}</span>
                    {onDeleteCustomFieldDefinition && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCustomFieldDefinition(field);
                        }}
                        className="text-slate-400 hover:text-red-500 p-0.5 rounded transition-colors print:hidden cursor-pointer"
                        title={`Supprimer le champ "${field}"`}
                        id={`btn_delete_col_${field}`}
                      >
                        <X size={10} />
                      </button>
                    )}
                  </div>
                </th>
              ))}

              <th className="p-4 text-center print:hidden" style={{ width: '80px' }} id="th_actions">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200/60 bg-white dark:divide-slate-800/60 dark:bg-slate-900" id="table_rows_body">
            <AnimatePresence initial={false}>
              {paginatedContacts.length > 0 ? (
                paginatedContacts.map((contact) => (
                  <motion.tr
                    key={contact.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => setSelectedContactForDetails(contact)}
                    className="group border-b border-transparent hover:bg-slate-50/70 dark:hover:bg-slate-950/40 hover:shadow-2xs transition-all cursor-pointer"
                    title="Cliquer pour voir la fiche complète"
                  >
                    {/* Nom and Prénom Identity block */}
                    <td className="p-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <span>{contact.nom}</span>
                      </div>
                      <div className="text-slate-400 dark:text-slate-500">
                        {contact.prenoms}
                      </div>
                    </td>

                    {/* Phone with WhatsApp Indicator badge */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-slate-700 dark:text-slate-300">
                          {contact.telephone}
                        </span>
                        {contact.isWhatsapp && (
                          <span 
                            className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                            title="Numéro WhatsApp validé"
                          >
                            <Phone size={8} fill="currentColor" />
                            WA
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Email address */}
                    <td className="p-4 max-w-[150px] truncate">
                      {contact.email ? (
                        <a 
                          href={`mailto:${contact.email}`} 
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-indigo-600 hover:underline hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 relative z-10"
                        >
                          <Mail size={12} className="opacity-60 shrink-0" />
                          <span>{contact.email}</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 italic">Non spécifié</span>
                      )}
                    </td>

                    {/* Profession / Métier badge */}
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-slate-50 border border-slate-100 px-2 py-0.5 font-medium text-slate-600 dark:bg-slate-950/40 dark:border-slate-800 dark:text-slate-300">
                        <Briefcase size={10} className="text-slate-400" />
                        {contact.metier}
                      </span>
                    </td>

                    {/* Creation Date */}
                    <td className="p-4 text-slate-400 dark:text-slate-500">
                      {new Date(contact.createdAt).toLocaleDateString('fr-FR', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>

                    {/* Dynamic Custom Fields cells */}
                    {customFieldDefinitions.map((field) => {
                      const val = contact.customFields?.[field];
                      return (
                        <td key={field} className="p-4 max-w-[150px] truncate text-slate-700 dark:text-slate-300" id={`td_${contact.id}_${field}`}>
                          {val ? (
                            <span className="font-semibold">{val}</span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 italic">Non spécifié</span>
                          )}
                        </td>
                      );
                    })}

                    {/* Actions tools element (Delete item) */}
                    <td className="p-4 text-center print:hidden">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteContact(contact.id);
                        }}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600 dark:hover:bg-slate-800 dark:hover:text-red-400 transition-all opacity-80 group-hover:opacity-100 relative z-10"
                        title="Supprimer ce contact"
                        aria-label="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6 + customFieldDefinitions.length} className="p-10 text-center text-slate-400 dark:text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search size={28} className="text-slate-300 dark:text-slate-700 animate-pulse" />
                      <p className="font-medium text-sm text-slate-500 dark:text-slate-400">Aucun contact trouvé</p>
                      <p className="text-xs text-slate-400">
                        {contacts.length === 0 
                          ? "Saisissez votre tout premier membre via le formulaire de gauche." 
                          : "Ajustez vos filtres ou mots-clés de recherche."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-50 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 print:hidden" id="table_pagination_group">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Page <span className="font-semibold text-slate-800 dark:text-white">{currentPage}</span> sur{' '}
            <span className="font-semibold text-slate-800 dark:text-white">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-950 transition-colors"
              id="pagination_prev"
            >
              Précédent
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-40 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-950 transition-colors"
              id="pagination_next"
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* Unique printable view block for physical media layout or native Save To PDF generation */}
      <div className="hidden print:block p-8 border border-slate-200 rounded-3xl m-4 bg-white text-slate-950" id="print_overlay_layout">
        <div className="flex justify-between items-start border-b border-slate-200 pb-5 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-indigo-900">COLLECTOR</h1>
            <p className="text-sm text-slate-500 mt-1">Plateforme de Saisie et de Collecte locale</p>
            <p className="text-xs text-slate-400">Rapport généré le {new Date().toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
            </p>
          </div>
          <div className="text-right">
            <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase block">Total Contacts</span>
              <span className="text-2xl font-bold text-slate-900">{contacts.length}</span>
            </div>
          </div>
        </div>

        <table className="w-full text-left text-xs border border-collapse border-slate-200">
          <thead>
            <tr className="bg-slate-100 text-slate-700">
              <th className="p-3 border border-slate-200">Nom</th>
              <th className="p-3 border border-slate-200">Prénoms</th>
              <th className="p-3 border border-slate-200">Téléphone</th>
              <th className="p-3 border border-slate-200">WhatsApp</th>
              <th className="p-3 border border-slate-200">Adresse Email</th>
              <th className="p-3 border border-slate-200">Métier</th>
              <th className="p-3 border border-slate-200">Date d'inscription</th>
              {customFieldDefinitions.map((field) => (
                <th key={field} className="p-3 border border-slate-200 font-semibold lowercase first-letter:uppercase">{field}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact.id} className="border-b border-slate-200">
                <td className="p-3 border border-slate-200 font-semibold">{contact.nom}</td>
                <td className="p-3 border border-slate-200">{contact.prenoms}</td>
                <td className="p-3 border border-slate-200 font-mono">{contact.telephone}</td>
                <td className="p-3 border border-slate-200 font-semibold text-slate-700">{contact.isWhatsapp ? 'Oui' : 'Non'}</td>
                <td className="p-3 border border-slate-200">{contact.email || 'N/A'}</td>
                <td className="p-3 border border-slate-200 font-medium">{contact.metier}</td>
                <td className="p-3 border border-slate-200 text-slate-500">
                  {new Date(contact.createdAt).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                  })}
                </td>
                {customFieldDefinitions.map((field) => (
                  <td key={field} className="p-3 border border-slate-200 text-slate-700 font-semibold">
                    {contact.customFields?.[field] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-16 flex justify-between text-xs text-slate-400">
          <div>Document officiel généré par Collector App.</div>
          <div>Signature de l'administrateur : ___________________________</div>
        </div>
      </div>

      {/* Dynamic Print Help Modal inside standard iFrame browser wrapper */}
      <AnimatePresence>
        {isPrintModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden" id="print_help_modal">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPrintModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
              id="print_modal_backdrop"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl dark:border-slate-850 dark:bg-slate-900"
              id="print_modal_box"
            >
              {/* Close close button */}
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="absolute top-4 right-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-250 transition-colors cursor-pointer animate-none"
                aria-label="Fermer"
                id="print_modal_close"
              >
                <X size={18} />
              </button>

              {/* Icon layout */}
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 mb-4">
                <Printer size={28} className="animate-pulse" />
              </div>

              <h3 className="text-center font-sans text-xl font-bold tracking-tight text-slate-900 dark:text-white" id="print_modal_caption">
                Impression sous cadre (iFrame)
              </h3>
              
              <div className="mt-4 space-y-3.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                <p>
                  Par mesure de sécurité, les navigateurs bloquent la commande d'impression <strong>window.print()</strong> lorsque l'application s'exécute au sein du cadre d'aperçu de Google AI Studio.
                </p>
                <p className="bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800 p-3.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400">
                  💡 <strong>Pour imprimer :</strong> C'est très simple ! Ouvrez l'application en plein écran en cliquant sur le bouton ci-dessous, puis cliquez de nouveau sur <strong>Imprimer PDF</strong>. L'aperçu avant impression s'ouvrira en <strong>mode Paysage</strong> de façon impeccable !
                </p>
              </div>

              {/* Interaction buttons */}
              <div className="mt-6 flex flex-col gap-2">
                <button
                  onClick={() => {
                    window.open(window.location.href, '_blank');
                    setIsPrintModalOpen(false);
                  }}
                  className="w-full bg-indigo-600 text-white font-bold py-3 text-xs rounded-xl shadow-lg hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  id="print_open_tab_btn"
                >
                  <ExternalLink size={14} />
                  Ouvrir en plein écran & Imprimer
                </button>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsPrintModalOpen(false);
                      setTimeout(() => {
                        window.print();
                      }, 150);
                    }}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 font-semibold py-2.5 text-xs rounded-lg transition-all cursor-pointer"
                    id="print_force_here_btn"
                  >
                    Forcer ici
                  </button>
                  <button
                    onClick={() => setIsPrintModalOpen(false)}
                    className="flex-1 border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/40 font-semibold py-2.5 text-xs rounded-lg transition-all cursor-pointer"
                    id="print_cancel_btn"
                  >
                    Fermer
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic Contact Details Sheet / Modal */}
      <AnimatePresence>
        {selectedContactForDetails && (
          <ContactDetailsModal
            contact={selectedContactForDetails}
            onClose={() => setSelectedContactForDetails(null)}
            customFieldDefinitions={customFieldDefinitions}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
