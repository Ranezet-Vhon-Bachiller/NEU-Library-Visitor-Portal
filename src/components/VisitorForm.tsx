import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { COLLEGES, REASONS, handleFirestoreError, OperationType } from '../utils';
import { UserRole, EmployeeType } from '../types';
import { CheckCircle2, AlertCircle, ShieldX, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VisitorFormProps {
  onAdminClick?: () => void;
}

const VisitorForm: React.FC<VisitorFormProps> = ({ onAdminClick }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Student');
  const [college, setCollege] = useState('');
  const [reason, setReason] = useState('');
  const [employeeType, setEmployeeType] = useState<EmployeeType>('Teacher');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setError(null);
    setIsBlocked(false);

    try {
      const emailToCheck = email.trim().toLowerCase();
      
      // Check if blocked
      const blockedDoc = await getDoc(doc(db, 'blockedEmails', emailToCheck));
      if (blockedDoc.exists()) {
        setIsBlocked(true);
        setError('Your email address has been blocked from logging visits. Please contact the library administrator.');
        setIsSubmitting(false);
        return;
      }

      const logData = {
        fullName,
        email: emailToCheck,
        role,
        college,
        reason,
        timestamp: serverTimestamp(),
        ...(role === 'Employee' || role === 'Faculty' ? { employeeType } : {})
      };

      await addDoc(collection(db, 'visitorLogs'), logData);
      setSuccess(true);
      
      // Reset form
      setFullName('');
      setEmail('');
      setCollege('');
      setReason('');
      
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'visitorLogs');
      setError('Failed to log visit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="bg-emerald-600 px-6 py-8 text-white text-center flex flex-col items-center">
          <div className="bg-white p-3 rounded-full mb-4 shadow-md">
            <img 
              src="https://upload.wikimedia.org/wikipedia/en/c/c6/New_Era_University.svg" 
              alt="NEU Logo" 
              className="w-12 h-12 object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome to NEU Library!</h2>
          <p className="text-emerald-100 mt-2">Please log your visit below.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <p className="text-sm font-medium">Welcome to NEU Library! Visit logged successfully.</p>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`px-4 py-3 rounded-xl flex items-center gap-3 border ${
                  isBlocked ? 'bg-red-50 border-red-200 text-red-800' : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                {isBlocked ? <ShieldX className="w-5 h-5 text-red-600" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
                <p className="text-sm font-medium">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-stone-50"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your @neu.edu.ph email"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-stone-50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Role */}
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-2">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-stone-50"
                >
                  <option value="Student">Student</option>
                  <option value="Faculty">Faculty</option>
                  <option value="Employee">Employee</option>
                </select>
              </div>

              {/* Employee Type (Conditional) */}
              {(role === 'Employee' || role === 'Faculty') && (
                <div>
                  <label className="block text-sm font-semibold text-stone-700 mb-2">Employee Type</label>
                  <select
                    value={employeeType}
                    onChange={(e) => setEmployeeType(e.target.value as EmployeeType)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-stone-50"
                  >
                    <option value="Teacher">Teacher</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>
              )}
            </div>

            {/* College */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">College / Department</label>
              <select
                required
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-stone-50"
              >
                <option value="" disabled>Select your college</option>
                {COLLEGES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-2">Reason for Visit</label>
              <select
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-stone-50"
              >
                <option value="" disabled>Select reason</option>
                {REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-md hover:shadow-lg ${
              isSubmitting ? 'bg-stone-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98]'
            }`}
          >
            {isSubmitting ? 'Logging Visit...' : 'Log Visit'}
          </button>
        </form>
      </div>

      {onAdminClick && (
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-stone-200 p-2 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-stone-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-800">Library Administrator?</h4>
              <p className="text-xs text-stone-500">Access the dashboard to manage logs and users.</p>
            </div>
          </div>
          <button
            onClick={onAdminClick}
            className="w-full sm:w-auto px-6 py-2 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all shadow-sm active:scale-[0.95]"
          >
            Login as Admin
          </button>
        </div>
      )}
    </div>
  );
};

export default VisitorForm;
