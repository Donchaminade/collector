import { Contact } from '../types';
import { Users, Phone, Briefcase, Percent } from 'lucide-react';
import { motion } from 'motion/react';

interface StatsProps {
  contacts: Contact[];
}

export default function Stats({ contacts }: StatsProps) {
  const total = contacts.length;
  const whatsappCount = contacts.filter((c) => c.isWhatsapp).length;
  const whatsappPercentage = total > 0 ? Math.round((whatsappCount / total) * 100) : 0;
  
  // Unique careers
  const uniqueMetiers = Array.from(new Set(contacts.map((c) => c.metier.trim().toLowerCase()))).filter(Boolean).length;

  const statItems = [
    {
      id: 'stat_total',
      label: 'Contacts',
      value: total,
      subtext: `${total === 1 ? 'fiche' : 'fiches'} enregistrée${total === 1 ? '' : 's'}`,
      icon: Users,
      color: 'text-slate-700 dark:text-slate-300',
      bgColor: 'bg-slate-50 dark:bg-slate-950/40 dark:text-slate-400',
      ringColor: 'border-slate-200 dark:border-slate-800',
    },
    {
      id: 'stat_whatsapp',
      label: 'WhatsApp',
      value: whatsappCount,
      subtext: `${whatsappPercentage}% du total`,
      icon: Phone,
      color: 'text-slate-700 dark:text-slate-300',
      bgColor: 'bg-slate-50 dark:bg-slate-950/40 dark:text-slate-400',
      ringColor: 'border-slate-200 dark:border-slate-800',
    },
    {
      id: 'stat_ratio',
      label: 'Taux WhatsApp',
      value: `${whatsappPercentage}%`,
      subtext: 'Couverture messagerie',
      icon: Percent,
      color: 'text-slate-700 dark:text-slate-300',
      bgColor: 'bg-slate-50 dark:bg-slate-950/40 dark:text-slate-400',
      ringColor: 'border-slate-200 dark:border-slate-800',
    },
    {
      id: 'stat_metiers',
      label: 'Secteurs d\'activité',
      value: uniqueMetiers,
      subtext: `${uniqueMetiers === 1 ? 'métier identifié' : 'métiers identifiés'}`,
      icon: Briefcase,
      color: 'text-slate-700 dark:text-slate-300',
      bgColor: 'bg-slate-50 dark:bg-slate-950/40 dark:text-slate-400',
      ringColor: 'border-slate-200 dark:border-slate-800',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 print:hidden" id="stats_dashboard_grid">
      {statItems.map((item, index) => {
        const IconComponent = item.icon;
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.35 }}
            className={`rounded-xl border ${item.ringColor} bg-white p-4.5 shadow-sm dark:bg-slate-900 transition-shadow`}
            id={item.id}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase dark:text-slate-500">
                  {item.label}
                </p>
                <h4 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {item.value}
                </h4>
              </div>
              <div className={`p-2 rounded-lg ${item.bgColor}`}>
                <IconComponent size={16} className={item.color} />
              </div>
            </div>
            <div className="mt-2.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">
              {item.subtext}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
