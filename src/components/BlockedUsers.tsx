import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils';
import { ShieldAlert, UserMinus, UserPlus, Search, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Modal from './Modal';

interface BlockedEmail {
  id: string;
  email: string;
  blockedAt: any;
}

const BlockedUsers: React.FC = () => {
  const [blockedList, setBlockedList] = useState<BlockedEmail[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unblockModal, setUnblockModal] = useState<{ isOpen: boolean; email: string }>({
    isOpen: false,
    email: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'blockedEmails'), orderBy('blockedAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: BlockedEmail[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as BlockedEmail);
      });
      setBlockedList(list);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'blockedEmails');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    setIsSubmitting(true);
    try {
      const emailToBlock = newEmail.trim().toLowerCase();
      await setDoc(doc(db, 'blockedEmails', emailToBlock), {
        email: emailToBlock,
        blockedAt: serverTimestamp()
      });
      setNewEmail('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'blockedEmails');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnblock = async () => {
    const email = unblockModal.email;
    if (!email) return;

    try {
      await deleteDoc(doc(db, 'blockedEmails', email));
      setUnblockModal({ isOpen: false, email: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'blockedEmails');
    }
  };

  const filteredList = blockedList.filter(item => 
    item.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        <p className="mt-4 text-stone-500 font-medium">Loading blocked users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200">
        <div className="flex items-center gap-3 mb-6">
          <ShieldAlert className="w-6 h-6 text-red-600" />
          <h3 className="text-xl font-bold text-stone-800">Block User by Email</h3>
        </div>

        <form onSubmit={handleBlock} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter email address to block"
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-red-500 outline-none bg-stone-50"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:bg-stone-400"
          >
            <UserPlus className="w-5 h-5" />
            {isSubmitting ? 'Blocking...' : 'Block Email'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-stone-800">Blocked Emails List</h3>
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search blocked emails..."
              className="pl-10 pr-4 py-2 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-red-500 outline-none w-full sm:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Email Address</th>
                <th className="px-6 py-4 font-semibold">Date Blocked</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              <AnimatePresence>
                {filteredList.length > 0 ? (
                  filteredList.map((item) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-stone-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-medium text-stone-800">{item.email}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-500">
                        {item.blockedAt?.toDate ? item.blockedAt.toDate().toLocaleDateString() : 'Just now'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setUnblockModal({ isOpen: true, email: item.email })}
                          className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Unblock User"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-stone-400">
                      {searchQuery ? 'No matching blocked emails found.' : 'No users are currently blocked.'}
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={unblockModal.isOpen}
        onClose={() => setUnblockModal({ isOpen: false, email: '' })}
        onConfirm={handleUnblock}
        title="Unblock User"
        message={`Are you sure you want to unblock ${unblockModal.email}? This user will be able to log visits again.`}
        confirmText="Unblock User"
        type="danger"
      />
    </div>
  );
};

export default BlockedUsers;
