import { useState, useEffect, useRef } from 'react';
import { Contact } from './types';
import FormContact from './components/FormContact';
import ContactTable from './components/ContactTable';
import Stats from './components/Stats';
import ResetModal from './components/ResetModal';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, 
  Trash2, 
  Download, 
  Layers, 
  Sparkles, 
  Moon, 
  Sun,
  X,
  AlertCircle,
  CheckCircle2,
  Info,
  Wifi,
  WifiOff
} from 'lucide-react';

// Sample dynamic database content on first-ever load
const SAMPLE_CONTACTS: Contact[] = [
  {
    id: 'sample_1',
    nom: 'DONDAH',
    prenoms: 'Chaminade Claude',
    telephone: '+228 90 12 34 56',
    isWhatsapp: true,
    email: 'chaminade.dondah@gmail.com',
    metier: 'Développeur Software',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  {
    id: 'sample_2',
    nom: 'ADJOLOU',
    prenoms: 'Élisabeth',
    telephone: '+228 92 45 67 89',
    isWhatsapp: true,
    email: 'elisabeth.adjolou@yahoo.fr',
    metier: 'Médecin Coordinatrice',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: 'sample_3',
    nom: 'AGBOTA',
    prenoms: 'Yawo Mawuli',
    telephone: '+33 6 12 34 56 78',
    isWhatsapp: false,
    email: 'y.agbota@outlook.com',
    metier: 'Enseignant-Chercheur',
    createdAt: new Date(Date.now() - 4 * 60 * 65 * 1000).toISOString(), // 4 hours ago
  }
];

export default function App() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('collector_dark_mode');
      return saved ? saved === 'true' : false;
    } catch {
      return false;
    }
  });

  const [customFields, setCustomFields] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('collector_custom_field_definitions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync Dark Mode class to documentElement
  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('collector_dark_mode', 'true');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('collector_dark_mode', 'false');
      }
    } catch (e) {
      console.warn('LocalStorage error with dark theme:', e);
    }
  }, [isDarkMode]);

  // Floating responsive notification states
  const [toast, setToast] = useState<{
    id: string;
    message: string;
    type: 'success' | 'danger' | 'info';
  } | null>(null);

  // Synchronized online/offline internet connection status state
  const [isOnline, setIsOnline] = useState(() => {
    try {
      return typeof navigator !== 'undefined' ? navigator.onLine : true;
    } catch {
      return true;
    }
  });

  // Load database from localStorage on startup
  useEffect(() => {
    try {
      const stored = localStorage.getItem('collector_contacts');
      if (stored) {
        setContacts(JSON.parse(stored));
      } else {
        // Hydrate with elegant samples so the app doesn't start completely blank
        setContacts(SAMPLE_CONTACTS);
        localStorage.setItem('collector_contacts', JSON.stringify(SAMPLE_CONTACTS));
      }
    } catch (e) {
      console.warn('LocalStorage error, using defaults:', e);
      setContacts(SAMPLE_CONTACTS);
    }
  }, []);

  // Sync to database
  const saveToLocalStorage = (newContacts: Contact[]) => {
    setContacts(newContacts);
    localStorage.setItem('collector_contacts', JSON.stringify(newContacts));
  };

  const handleAddCustomField = (title: string) => {
    const formatted = title.trim();
    if (!formatted) return;
    
    // Prevent overriding default field names
    const forbidden = ['nom', 'prenoms', 'telephone', 'email', 'metier', 'whatsapp', 'createdAt', 'id'];
    if (forbidden.includes(formatted.toLowerCase())) {
      showToast(`Le nom "${formatted}" est réservé par le système.`, 'danger');
      return;
    }

    if (customFields.some(f => f.toLowerCase() === formatted.toLowerCase())) {
      showToast(`Le champ "${formatted}" existe déjà !`, 'info');
      return;
    }

    const updated = [...customFields, formatted];
    setCustomFields(updated);
    localStorage.setItem('collector_custom_field_definitions', JSON.stringify(updated));
    showToast(`Champ "${formatted}" ajouté ! Renseignez-le directement dans le formulaire.`, 'success');
  };

  const handleDeleteCustomField = (title: string) => {
    const updated = customFields.filter((f) => f !== title);
    setCustomFields(updated);
    localStorage.setItem('collector_custom_field_definitions', JSON.stringify(updated));
    
    // Clean up stored contacts' properties for this field to save space (optional, but keep active list simple to synchronize)
    const cleanedContacts = contacts.map(c => {
      if (c.customFields && title in c.customFields) {
        const copy = { ...c.customFields };
        delete copy[title];
        return { ...c, customFields: copy };
      }
      return c;
    });
    saveToLocalStorage(cleanedContacts);
    
    showToast(`Le champ "${title}" a été supprimé des formulaires et tableaux.`, 'info');
  };

  // Toast helper
  const showToast = (message: string, type: 'success' | 'danger' | 'info' = 'success') => {
    setToast({
      id: Math.random().toString(),
      message,
      type
    });
  };

  // Toast automatic dismiss timer
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Listen for active window connection status changes
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast("Connexion Internet rétablie avec succès !", "success");
    };

    const handleOffline = () => {
      setIsOnline(false);
      showToast("Vous êtes hors ligne. Toutes vos saisies restent 100% fonctionnelles et sécurisées dans votre base locale (localStorage).", "danger");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Action: Add new contact
  const handleAddContact = (rawContact: Omit<Contact, 'id' | 'createdAt'>) => {
    const newContact: Contact = {
      ...rawContact,
      id: `contact_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const updated = [newContact, ...contacts];
    saveToLocalStorage(updated);
    showToast(`Le contact "${newContact.nom} ${newContact.prenoms}" a été enregistré !`, 'success');
  };

  // Action: Delete contact
  const handleDeleteContact = (id: string) => {
    const target = contacts.find((c) => c.id === id);
    const updated = contacts.filter((c) => c.id !== id);
    saveToLocalStorage(updated);
    if (target) {
      showToast(`Le contact "${target.nom}" a été supprimé.`, 'info');
    }
  };

  // Action: Reset entire DB
  const handleResetDatabase = () => {
    saveToLocalStorage([]);
    showToast('Toutes les données locales ont été effacées définitivement !', 'danger');
  };

  return (
    <div className={`min-h-screen bg-[#F8FAFC] font-sans tracking-tight transition-colors duration-250 dark:bg-slate-950 ${isDarkMode ? 'dark' : ''}`}>
      
      {/* Toast Notification Overlay */}
      <AnimatePresence>
        {toast && (
          <div className="fixed right-6 top-6 z-50 w-full max-w-sm" id="toast_container">
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className={`flex items-center gap-3 rounded-xl border p-4 shadow-xl ${
                toast.type === 'success'
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-950 dark:bg-emerald-900/95 dark:border-emerald-800 dark:text-emerald-200'
                  : toast.type === 'danger'
                    ? 'bg-red-50 border-red-100 text-red-950 dark:bg-red-900/95 dark:border-red-800 dark:text-red-200'
                    : 'bg-indigo-50 border-indigo-100 text-indigo-950 dark:bg-indigo-900/95 dark:border-indigo-800 dark:text-indigo-200'
              }`}
              id="toast_body"
            >
              <div className="shrink-0">
                {toast.type === 'success' && <CheckCircle2 size={18} className="text-emerald-500" />}
                {toast.type === 'danger' && <AlertCircle size={18} className="text-red-500" />}
                {toast.type === 'info' && <Info size={18} className="text-indigo-500" />}
              </div>
              <p className="flex-1 text-xs font-semibold leading-relaxed">{toast.message}</p>
              <button
                onClick={() => setToast(null)}
                className="rounded-lg p-0.5 hover:bg-black/5 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 dark:text-slate-505 dark:hover:text-slate-300"
                id="toast_dismiss_btn"
              >
                <X size={14} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Page Layout Wrapper */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* Connection status notification banner */}
        <AnimatePresence>
          {!isOnline && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-amber-900 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200 backdrop-blur-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 print:hidden"
              id="offline_reassurance_banner"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-slate-950 shadow-sm">
                  <WifiOff size={20} className="animate-pulse" />
                </div>
                <div>
                  <h4 className="font-sans text-sm font-semibold tracking-tight text-amber-950 dark:text-amber-100">
                    Mode Hors Ligne Activé
                  </h4>
                  <p className="text-xs text-amber-800/90 dark:text-amber-300/90 mt-0.5 leading-relaxed">
                    La connexion réseau est perdue. Aucun problème ! L'application stocke et gère toutes vos données en temps réel dans votre navigateur via <strong>localStorage</strong>. Rien ne sera perdu.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0 justify-end">
                <span className="rounded-lg bg-amber-200/60 dark:bg-amber-950/55 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200 select-none">
                  Sauvegarde locale OK
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* App Header Bar */}
        <header className="flex items-center justify-between border-b border-slate-200 pb-6 dark:border-slate-800 print:hidden" id="app_header">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <span className="font-bold text-lg select-none">C</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-sans text-xl font-bold tracking-tight text-slate-900 dark:text-white" id="brand_name">
                  Collector
                </span>
                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                  v1.2
                </span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                Formulaire de saisie locale & exportation dynamique
              </p>
            </div>
          </div>

          {/* Quick utility actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end pr-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Total Entrées</span>
              <span className="text-sm font-extrabold text-indigo-600 mt-0.5">{contacts.length}</span>
            </div>
            <div className="hidden sm:block h-8 w-px bg-slate-200 dark:bg-slate-800"></div>

            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-950 transition-all cursor-pointer"
              title={isDarkMode ? 'Basculer vers le mode clair' : 'Basculer vers le mode sombre'}
              id="theme_toggle_btn"
            >
              {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </header>

        {/* Dynamic Interactive statistics at the top */}
        <Stats contacts={contacts} />

        {/* Form and List bento grid */}
        <main className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          
          {/* Left pane: Collect form */}
          <section className="lg:col-span-4 lg:sticky lg:top-8" id="left_form_column">
            <FormContact 
              onAddContact={handleAddContact} 
              existingContacts={contacts}
              customFieldDefinitions={customFields}
              onAddCustomFieldDefinition={handleAddCustomField}
              onDeleteCustomFieldDefinition={handleDeleteCustomField}
            />
          </section>

          {/* Right pane: Database tables & Export actions */}
          <section className="lg:col-span-8 space-y-4" id="right_table_column">
            <ContactTable
              contacts={contacts}
              onDeleteContact={handleDeleteContact}
              onOpenResetModal={() => setIsResetModalOpen(true)}
              customFieldDefinitions={customFields}
              onDeleteCustomFieldDefinition={handleDeleteCustomField}
            />
          </section>

        </main>

        {/* Footer */}
        <footer className="pt-8 pb-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-450 dark:border-slate-800 dark:text-slate-500 print:hidden" id="app_footer">
          <div>
            © {new Date().getFullYear()} <span className="font-semibold text-slate-700 dark:text-slate-450 text-slate-800">Collector</span>. Tous droits réservés.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500 dark:text-slate-400">
              {isOnline ? (
                <>
                  <Wifi size={10} className="text-emerald-500 shrink-0" />
                  Base locale : Active & En ligne (localStorage)
                </>
              ) : (
                <>
                  <WifiOff size={10} className="text-amber-500 animate-pulse shrink-0" />
                  Base locale : Active & Mode Hors ligne (localStorage)
                </>
              )}
            </span>
            <div className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-indigo-600 transition-colors"
            >
              Support technique
            </a>
          </div>
        </footer>

      </div>

      {/* Safety Confirm Reset Modal */}
      <ResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleResetDatabase}
      />

    </div>
  );
}
