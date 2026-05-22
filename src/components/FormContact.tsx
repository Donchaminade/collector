import React, { useState, useEffect, useRef } from 'react';
import { Contact } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Phone, 
  Mail, 
  Briefcase, 
  PlusCircle, 
  Check, 
  AlertCircle, 
  Sparkles,
  Plus,
  Trash2,
  Settings,
  HelpCircle
} from 'lucide-react';

interface FormContactProps {
  onAddContact: (contact: Omit<Contact, 'id' | 'createdAt'>) => void;
  existingContacts: Contact[];
  customFieldDefinitions: string[];
  onAddCustomFieldDefinition: (title: string) => void;
  onDeleteCustomFieldDefinition: (title: string) => void;
}

export default function FormContact({ 
  onAddContact, 
  existingContacts,
  customFieldDefinitions = [],
  onAddCustomFieldDefinition,
  onDeleteCustomFieldDefinition
}: FormContactProps) {
  const [nom, setNom] = useState('');
  const [prenoms, setPrenoms] = useState('');
  const [telephone, setTelephone] = useState('');
  const [isWhatsapp, setIsWhatsapp] = useState(true);
  const [email, setEmail] = useState('');
  const [metier, setMetier] = useState('');

  // Values for the dynamic custom fields state
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});
  
  // Create field micro-form controller state
  const [isAddingField, setIsAddingField] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');

  // Touched states for in-line validations
  const [touched, setTouched] = useState({
    nom: false,
    prenoms: false,
    telephone: false,
    email: false,
    metier: false,
  });

  // Suggestion box for métiers
  const [metierSuggestions, setMetierSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Auto-generate suggestion list based on existing contacts
  useEffect(() => {
    if (metier.trim() === '') {
      // Show default popular métiers if nothing entered yet
      const allMetiers = existingContacts
        .map((c) => c.metier.trim())
        .filter((val, idx, self) => val && self.indexOf(val) === idx);
      setMetierSuggestions(allMetiers.slice(0, 5));
    } else {
      const filtered = existingContacts
        .map((c) => c.metier.trim())
        .filter((val, idx, self) => val && self.indexOf(val) === idx && val.toLowerCase().includes(metier.toLowerCase()))
        .filter((val) => val.toLowerCase() !== metier.toLowerCase());
      setMetierSuggestions(filtered.slice(0, 5));
    }
  }, [metier, existingContacts]);

  // Click outside suggestions handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Form Validations
  const validateNom = (val: string) => val.trim().length >= 2;
  const validatePrenoms = (val: string) => val.trim().length >= 2;
  
  // Accept standard formatting (numbers, space, +, dashes, min length 8)
  const validateTelephone = (val: string) => {
    const stripped = val.replace(/[\s\-\+]/g, '');
    return stripped.length >= 8 && /^[0-9]+$/.test(stripped);
  };

  const validateEmail = (val: string) => {
    if (val.trim() === '') return true; // Optional element in this design, but validate structure if formatted
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(val);
  };

  const validateMetier = (val: string) => val.trim().length >= 2;

  const isFormValid = 
    validateNom(nom) && 
    validatePrenoms(prenoms) && 
    validateTelephone(telephone) && 
    validateEmail(email) && 
    validateMetier(metier);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all as touched
    setTouched({
      nom: true,
      prenoms: true,
      telephone: true,
      email: true,
      metier: true,
    });

    if (!isFormValid) return;

    // Capitalize properly
    const capitalizedNom = nom.trim().toUpperCase();
    const capitalizedPrenoms = prenoms
      .trim()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    onAddContact({
      nom: capitalizedNom,
      prenoms: capitalizedPrenoms,
      telephone: telephone.trim(),
      isWhatsapp,
      email: email.trim().toLowerCase(),
      metier: metier.trim(),
      customFields: customFieldValues
    });

    // Reset Form fields
    setNom('');
    setPrenoms('');
    setTelephone('');
    setIsWhatsapp(true);
    setEmail('');
    setMetier('');
    setCustomFieldValues({});
    
    // Reset Touched
    setTouched({
      nom: false,
      prenoms: false,
      telephone: false,
      email: false,
      metier: false,
    });
  };  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all print:hidden" id="contact_form_container">
      <div className="flex items-center gap-2.5 pb-3.5 mb-5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
          <Sparkles size={16} className="animate-pulse" />
        </div>
        <div>
          <h3 className="font-sans font-bold text-slate-900 dark:text-white" id="contact_form_title">
            Saisie de données
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Ajoutez un nouveau contact à la base locale
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4.5" id="contact_form_dom">
        {/* Row 1: Nom et Prénoms */}
        <div className="grid grid-cols-2 gap-4">
          {/* Nom */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              <span>Nom</span>
              {touched.nom && (
                validateNom(nom) ? (
                  <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 normal-case tracking-normal">
                    <Check size={9} /> Validé
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5 text-[9px] font-bold text-red-500 normal-case tracking-normal">
                    <AlertCircle size={9} /> Trop court
                  </span>
                )
              )}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
                <User size={14} />
              </span>
              <input
                type="text"
                value={nom}
                onChange={(e) => {
                  setNom(e.target.value);
                  setTouched((prev) => ({ ...prev, nom: true }));
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, nom: true }))}
                placeholder="Ex. Dupont"
                className={`w-full rounded-lg border py-2 pl-9 pr-3 text-sm text-slate-800 transition-all focus:ring-2 focus:outline-hidden dark:bg-slate-950 dark:text-white ${
                  touched.nom
                    ? validateNom(nom)
                      ? 'border-emerald-300 bg-emerald-50/5 focus:border-emerald-500 focus:ring-emerald-100/50'
                      : 'border-red-300 bg-red-50/5 focus:border-red-500 focus:ring-red-100/50'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-indigo-100/50 dark:border-slate-800'
                }`}
                required
                id="form_input_nom"
              />
            </div>
          </div>

          {/* Prénoms */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
              <span>Prénoms</span>
              {touched.prenoms && (
                validatePrenoms(prenoms) ? (
                  <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 normal-case tracking-normal">
                    <Check size={9} /> Validé
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5 text-[9px] font-bold text-red-500 normal-case tracking-normal">
                    <AlertCircle size={9} /> Trop court
                  </span>
                )
              )}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
                <User size={14} />
              </span>
              <input
                type="text"
                value={prenoms}
                onChange={(e) => {
                  setPrenoms(e.target.value);
                  setTouched((prev) => ({ ...prev, prenoms: true }));
                }}
                onBlur={() => setTouched((prev) => ({ ...prev, prenoms: true }))}
                placeholder="Ex. Jean"
                className={`w-full rounded-lg border py-2 pl-9 pr-3 text-sm text-slate-800 transition-all focus:ring-2 focus:outline-hidden dark:bg-slate-950 dark:text-white ${
                  touched.prenoms
                    ? validatePrenoms(prenoms)
                      ? 'border-emerald-300 bg-emerald-50/5 focus:border-emerald-500 focus:ring-emerald-100/50'
                      : 'border-red-300 bg-red-50/5 focus:border-red-500 focus:ring-red-100/50'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-indigo-100/50 dark:border-slate-800'
                }`}
                required
                id="form_input_prenoms"
              />
            </div>
          </div>
        </div>

        {/* Row 2: Téléphone (+ Whatsapp toggle) */}
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
            <span>Numéro WhatsApp</span>
            {touched.telephone && (
              validateTelephone(telephone) ? (
                <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 normal-case tracking-normal">
                  <Check size={9} /> Valide
                </span>
              ) : (
                <span className="flex items-center gap-0.5 text-[9px] font-bold text-red-500 normal-case tracking-normal">
                  <AlertCircle size={9} /> Format incorrect
                </span>
              )
            )}
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3.5 rounded-l-lg border border-r-0 border-slate-200 bg-slate-50 text-slate-500 text-xs font-mono dark:border-slate-800 dark:bg-slate-950">
              WA
            </span>
            <input
              type="tel"
              value={telephone}
              onChange={(e) => {
                setTelephone(e.target.value);
                setTouched((prev) => ({ ...prev, telephone: true }));
              }}
              onBlur={() => setTouched((prev) => ({ ...prev, telephone: true }))}
              placeholder="+228 90 00 00 00"
              className={`flex-1 min-w-0 rounded-r-lg border py-2 px-3.5 text-sm text-slate-800 transition-all focus:ring-2 focus:outline-hidden dark:bg-slate-950 dark:text-white ${
                touched.telephone
                  ? validateTelephone(telephone)
                    ? 'border-emerald-300 bg-emerald-50/5 focus:border-emerald-500 focus:ring-emerald-100/50'
                    : 'border-red-300 bg-red-50/5 focus:border-red-500 focus:ring-red-100/50'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-indigo-100/50 dark:border-slate-800'
              }`}
              required
              id="form_input_telephone"
            />
          </div>
          
          {/* Quick toggle check for WA usage with label */}
          <label className="flex items-center gap-2 mt-1 cursor-pointer select-none" id="form_whatsapp_toggle_label">
            <input
              type="checkbox"
              checked={isWhatsapp}
              onChange={(e) => setIsWhatsapp(e.target.checked)}
              className="rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
              id="form_input_is_whatsapp"
            />
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Ce numéro est également mon canal de discussion principal</span>
          </label>
        </div>

        {/* Row 3: Métier (Profession) with Autocomplete */}
        <div className="flex flex-col gap-1.5 relative" ref={suggestionRef}>
          <label className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
            <span>Métier</span>
            {touched.metier && (
              validateMetier(metier) ? (
                <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 normal-case tracking-normal">
                  <Check size={9} /> Validé
                </span>
              ) : (
                <span className="flex items-center gap-0.5 text-[9px] font-bold text-red-500 normal-case tracking-normal">
                  <AlertCircle size={9} /> Trop court
                </span>
              )
            )}
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
              <Briefcase size={14} />
            </span>
            <input
              type="text"
              value={metier}
              onChange={(e) => {
                setMetier(e.target.value);
                setTouched((prev) => ({ ...prev, metier: true }));
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => {
                setTimeout(() => {
                  setTouched((prev) => ({ ...prev, metier: true }));
                }, 200);
              }}
              placeholder="Ex. Développeur Software"
              className={`w-full rounded-lg border py-2 pl-9 pr-3 text-sm text-slate-800 transition-all focus:ring-2 focus:outline-hidden dark:bg-slate-950 dark:text-white ${
                touched.metier
                  ? validateMetier(metier)
                    ? 'border-emerald-300 bg-emerald-50/5 focus:border-emerald-500 focus:ring-emerald-100/50'
                    : 'border-red-300 bg-red-50/5 focus:border-red-500 focus:ring-red-100/50'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-indigo-100/50 dark:border-slate-800'
              }`}
              required
              autoComplete="off"
              id="form_input_metier"
            />
          </div>

          <AnimatePresence>
            {showSuggestions && metierSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute left-0 right-0 z-20 mt-1 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-md dark:border-slate-800 dark:bg-slate-950"
                id="form_metier_suggestions_box"
              >
                <div className="px-2.5 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-1 mb-1">
                  Suggestions récentes
                </div>
                {metierSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => {
                      setMetier(suggestion);
                      setShowSuggestions(false);
                      setTouched((prev) => ({ ...prev, metier: true }));
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900 hover:text-indigo-600 transition-colors"
                  >
                    <Briefcase size={12} className="opacity-65" />
                    <span>{suggestion}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Row 4: Adresse Mail */}
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
            <span className="flex items-center gap-1">
              Adresse E-mail <span className="text-[9px] lowercase font-normal text-slate-400 dark:text-slate-500">(optionnelle)</span>
            </span>
            {touched.email && email.trim() !== '' && (
              validateEmail(email) ? (
                <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 normal-case tracking-normal">
                  <Check size={9} /> Validé
                </span>
              ) : (
                <span className="flex items-center gap-0.5 text-[9px] font-bold text-red-500 normal-case tracking-normal">
                  <AlertCircle size={9} /> Format incorrect
                </span>
              )
            )}
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500">
              <Mail size={14} />
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setTouched((prev) => ({ ...prev, email: true }));
              }}
              onBlur={() => {
                if (email.trim() !== '') {
                  setTouched((prev) => ({ ...prev, email: true }));
                }
              }}
              placeholder="jean.dupont@email.com"
              className={`w-full rounded-lg border py-2 pl-9 pr-3 text-sm text-slate-800 transition-all focus:ring-2 focus:outline-hidden dark:bg-slate-950 dark:text-white ${
                touched.email && email.trim() !== ''
                  ? validateEmail(email)
                    ? 'border-emerald-300 bg-emerald-50/5 focus:border-emerald-500 focus:ring-emerald-100/50'
                    : 'border-red-300 bg-red-50/5 focus:border-red-500 focus:ring-red-100/50'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-indigo-100/50 dark:border-slate-800'
              }`}
              id="form_input_email"
            />
          </div>
        </div>

        {/* Dynamic Custom Fields Section */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Settings size={11} />
              Champs personnalisés
            </span>
            {!isAddingField && (
              <button
                type="button"
                onClick={() => setIsAddingField(true)}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-350 hover:underline flex items-center gap-0.5 cursor-pointer"
                id="btn_toggle_add_field"
              >
                <Plus size={12} />
                Ajouter un champ
              </button>
            )}
          </div>

          {/* New Field Creator Inline Module */}
          <AnimatePresence>
            {isAddingField && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -5 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -5 }}
                className="overflow-hidden mb-3.5 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80"
                id="inline_field_creator"
              >
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400">
                    Titre du nouveau champ (ex: Ville, Âge, Pays, Notes...)
                  </span>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Ex. Ville"
                      value={newFieldName}
                      onChange={(e) => setNewFieldName(e.target.value)}
                      className="flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-100 focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      id="new_field_title_input"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newFieldName.trim()) {
                            onAddCustomFieldDefinition(newFieldName);
                            setNewFieldName('');
                            setIsAddingField(false);
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      disabled={!newFieldName.trim()}
                      onClick={() => {
                        if (newFieldName.trim()) {
                          onAddCustomFieldDefinition(newFieldName);
                          setNewFieldName('');
                          setIsAddingField(false);
                        }
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
                      id="submit_new_field_btn"
                    >
                      Créer
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingField(false);
                        setNewFieldName('');
                      }}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
                      id="cancel_new_field_btn"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Display Dynamic inputs */}
          {customFieldDefinitions.length === 0 ? (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 italic flex items-center gap-1 select-none">
              <HelpCircle size={12} className="opacity-60" />
              Aucun champ personnalisé créé.
            </p>
          ) : (
            <div className="space-y-3" id="custom_fields_inputs_grid">
              {customFieldDefinitions.map((field) => (
                <div key={field} className="flex flex-col gap-1.5" id={`custom_field_container_${field}`}>
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                    <span>{field}</span>
                    <button
                      type="button"
                      onClick={() => onDeleteCustomFieldDefinition(field)}
                      className="text-slate-400 hover:text-red-500 font-semibold p-0.5 rounded transition-colors cursor-pointer"
                      title={`Supprimer "${field}" de tous les contacts`}
                      id={`btn_delete_field_${field}`}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={customFieldValues[field] || ''}
                    onChange={(e) => setCustomFieldValues((prev) => ({ ...prev, [field]: e.target.value }))}
                    placeholder={`Saisir la valeur...`}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 px-3 py-2 text-sm text-slate-800 transition-all focus:ring-2 focus:ring-indigo-100/50 focus:bg-white focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                    id={`custom_field_input_${field}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Clear and Submit Buttons */}
        <div className="pt-2 flex flex-col gap-2">
          <button
            type="submit"
            disabled={!isFormValid}
            className="w-full bg-indigo-600 text-white font-bold py-3 text-sm rounded-xl shadow-lg hover:bg-indigo-700 active:scale-95 disabled:pointer-events-none disabled:opacity-40 hover:shadow-indigo-100 dark:shadow-none dark:hover:bg-indigo-500 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            id="form_submit_btn"
          >
            <PlusCircle size={15} />
            Enregistrer dans Collector
          </button>
          
          <button
            type="button"
            onClick={() => {
              setNom('');
              setPrenoms('');
              setTelephone('');
              setIsWhatsapp(true);
              setEmail('');
              setMetier('');
              setTouched({
                nom: false,
                prenoms: false,
                telephone: false,
                email: false,
                metier: false,
              });
            }}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800 active:scale-98 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 transition-all"
            id="form_clear_btn"
          >
            Réinitialiser les formulaires
          </button>
        </div>
      </form>
    </div>
  );
}
