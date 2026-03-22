import { motion } from 'framer-motion';
import TopBar from '../components/TopBar';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-base text-slate-200">
      <div className="fixed inset-0 bg-grid pointer-events-none" />
      <TopBar />
      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
