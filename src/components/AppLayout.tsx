import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { motion } from 'framer-motion';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background gradient-bg flex">
      <Sidebar />
      
      <main className="flex-1 lg:ml-64 pb-20 lg:pb-0 min-h-screen overflow-x-hidden">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="container mx-auto p-4 lg:p-8"
        >
          <Outlet />
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}
