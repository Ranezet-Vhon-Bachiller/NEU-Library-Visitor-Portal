/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AuthProvider, useAuth } from './components/Auth';
import Layout from './components/Layout';
import VisitorForm from './components/VisitorForm';
import AdminDashboard from './components/AdminDashboard';
import LoginPage from './components/LoginPage';
import { LogIn, Library, ShieldCheck, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function MainApp() {
  const { user, loading, role } = useAuth();
  const [activeTab, setActiveTab] = useState<'form' | 'admin'>('form');

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full"
        />
        <p className="mt-4 text-stone-600 font-medium animate-pulse">Initializing NEU Library Portal...</p>
      </div>
    );
  }

  const showAdminContent = activeTab === 'admin';
  const isAdminLoggedIn = user && role === 'Admin';

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <AnimatePresence mode="wait">
        {!showAdminContent ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <VisitorForm onAdminClick={() => setActiveTab('admin')} />
          </motion.div>
        ) : isAdminLoggedIn ? (
          <motion.div
            key="admin"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <AdminDashboard />
          </motion.div>
        ) : (
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <LoginPage />
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
