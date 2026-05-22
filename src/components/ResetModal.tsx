import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ResetModal({ isOpen, onClose, onConfirm }: ResetModalProps) {
  const [safetyInput, setSafetyInput] = useState('');
  const [hasCheckedWarning, setHasCheckedWarning] = useState(false);
  const targetSafetyText = 'COLLECTOR';

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (safetyInput.toUpperCase() === targetSafetyText && hasCheckedWarning) {
      onConfirm();
      setSafetyInput('');
      setHasCheckedWarning(false);
      onClose();
    }
  };

  const handleClose = () => {
    setSafetyInput('');
    setHasCheckedWarning(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            id="reset_modal_backdrop"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-red-100 bg-white p-6 shadow-2xl dark:border-red-900/30 dark:bg-slate-900"
            id="reset_modal_container"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
              aria-label="Fermer"
              id="reset_modal_close_btn"
            >
              <X size={18} />
            </button>

            {/* Header Icon */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 mb-4">
              <AlertTriangle size={28} className="animate-pulse" />
            </div>

            <h3 className="text-center font-sans text-xl font-bold tracking-tight text-slate-900 dark:text-white" id="reset_modal_title">
              Confirmation de sécurité
            </h3>
            <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Attention : Cette action est irréversible. Toutes les données de saisie sauvegardées dans Collector seront définitivement supprimées du stockage local.
            </p>

            <form onSubmit={handleConfirm} className="mt-6 space-y-4">
              {/* Checkbox confirmation */}
              <label 
                className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-400 cursor-pointer hover:border-red-200 transition-colors"
                id="reset_modal_checkbox_label"
              >
                <input
                  type="checkbox"
                  checked={hasCheckedWarning}
                  onChange={(e) => setHasCheckedWarning(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded-sm border-slate-300 text-red-600 focus:ring-red-500"
                  id="reset_modal_checkbox"
                />
                <span className="select-none">
                  Je comprends que cette action videra définitivement la liste locale et que je ne pourrai pas récupérer ces informations.
                </span>
              </label>

              {/* Safety code typing */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Veuillez saisir <span className="font-extrabold text-red-600 tracking-wider dark:text-red-400">{targetSafetyText}</span> pour confirmer :
                </label>
                <input
                  type="text"
                  value={safetyInput}
                  onChange={(e) => setSafetyInput(e.target.value)}
                  placeholder={`Tapez ${targetSafetyText}`}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-center font-mono text-sm tracking-widest text-slate-800 uppercase focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-red-900/30"
                  required
                  autoComplete="off"
                  id="reset_modal_safety_input"
                />
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-950 active:scale-98 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white transition-all transform"
                  id="reset_modal_cancel_btn"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={safetyInput.toUpperCase() !== targetSafetyText || !hasCheckedWarning}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-red-700 active:scale-98 disabled:pointer-events-none disabled:opacity-40 transition-all transform"
                  id="reset_modal_confirm_btn"
                >
                  <Trash2 size={16} />
                  Réinitialiser
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
