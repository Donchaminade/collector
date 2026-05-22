import React from 'react';
import { Contact } from '../types';
import { motion } from 'motion/react';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  Briefcase, 
  Calendar, 
  Clock, 
  Tag, 
  ExternalLink,
  MessageSquare
} from 'lucide-react';

interface ContactDetailsModalProps {
  contact: Contact;
  onClose: () => void;
  customFieldDefinitions?: string[];
}

export default function ContactDetailsModal({ 
  contact, 
  onClose,
  customFieldDefinitions = [] 
}: ContactDetailsModalProps) {
  
  // Get initials for the avatar holder
  const getInitials = () => {
    const fn = contact.nom ? contact.nom.charAt(0) : '';
    const ln = contact.prenoms ? contact.prenoms.charAt(0) : '';
    return `${fn}${ln}`.toUpperCase() || '?';
  };

  // Human friendly formatting for creation date
  const formattedDate = new Date(contact.createdAt).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedTime = new Date(contact.createdAt).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden" id="contact_details_modal_root">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
        id="contact_details_modal_backdrop"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 flex flex-col"
        id="contact_details_modal_card"
      >
        {/* Header decoration band */}
        <div className="h-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600" />

        {/* Action Close Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
          aria-label="Fermer"
          id="contact_details_close_btn"
        >
          <X size={18} />
        </button>

        <div className="p-6 md:p-8 space-y-6 overflow-y-auto max-h-[85vh]">
          {/* Main Identity Area */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            {/* Initials Avatar */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-sans text-xl font-bold tracking-wider shadow-lg shadow-indigo-150 dark:shadow-none select-none">
              {getInitials()}
            </div>
            
            {/* Identity details */}
            <div className="text-center sm:text-left space-y-1.5 flex-1 min-w-0">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-600 dark:text-indigo-400">
                Fiche contact lecteur-seule
              </span>
              <h3 className="font-sans text-2xl font-black text-slate-900 dark:text-white leading-tight truncate">
                {contact.nom} <span className="font-normal text-slate-500 dark:text-slate-400 text-lg block sm:inline-block sm:mt-0">{contact.prenoms}</span>
              </h3>
              
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-0.5">
                <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 border border-slate-200/60 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-950/50 dark:border-slate-850 dark:text-slate-300">
                  <Briefcase size={12} className="text-slate-400 shrink-0" />
                  {contact.metier}
                </span>
                {contact.isWhatsapp && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900/30 dark:text-emerald-400">
                    <MessageSquare size={12} className="shrink-0" />
                    WhatsApp validé
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Standard Fields Grid */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 select-none">
              <User size={12} />
              Informations Principales
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Telephone row */}
              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800/60 dark:bg-slate-950/20">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Téléphone</span>
                <span className="text-sm font-semibold font-mono text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Phone size={14} className="text-indigo-500" />
                  {contact.telephone}
                </span>
              </div>

              {/* Email row */}
              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800/60 dark:bg-slate-950/20">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Email</span>
                {contact.email ? (
                  <a 
                    href={`mailto:${contact.email}`}
                    className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400 flex items-center gap-1.5 truncate group"
                  >
                    <Mail size={14} className="text-indigo-500 shrink-0" />
                    <span className="truncate">{contact.email}</span>
                    <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 shrink-0" />
                  </a>
                ) : (
                  <span className="text-sm text-slate-400 italic font-medium flex items-center gap-1.5">
                    <Mail size={14} className="text-slate-300 dark:text-slate-700 shrink-0" />
                    Non spécifié
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Custom Fields section (Render dynamic if matches or exists inside contact customFields) */}
          {(customFieldDefinitions.length > 0 || (contact.customFields && Object.keys(contact.customFields).length > 0)) && (
            <div className="space-y-4 pt-2">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 select-none">
                <Tag size={12} />
                Champs Personnalisés
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Find union of both custom field declarations + values */}
                {Array.from(new Set([
                  ...customFieldDefinitions,
                  ...(contact.customFields ? Object.keys(contact.customFields) : [])
                ])).map((field) => {
                  const val = contact.customFields?.[field];
                  return (
                    <div 
                      key={field} 
                      className="p-3.5 rounded-xl border border-slate-100 bg-indigo-50/10 dark:border-slate-800/40 dark:bg-slate-950/10 transition-colors"
                    >
                      <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1 truncate" title={field}>
                        {field}
                      </span>
                      {val ? (
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 block break-words">
                          {val}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic block">
                          Non spécifié
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Registration Date details */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500 space-y-1.5 select-none">
            <div className="flex items-center gap-1.5">
              <Calendar size={13} className="opacity-75 shrink-0" />
              <span>Inscrit le : <strong className="text-slate-600 dark:text-slate-400 font-medium capitalize">{formattedDate}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={13} className="opacity-75 shrink-0" />
              <span>Heure d'enregistrement : <strong className="text-slate-600 dark:text-slate-400 font-medium">{formattedTime}</strong></span>
            </div>
          </div>

          {/* Action buttons footer */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer hover:scale-102 active:scale-98"
              id="details_modal_footer_close"
            >
              Fermer la fiche
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
