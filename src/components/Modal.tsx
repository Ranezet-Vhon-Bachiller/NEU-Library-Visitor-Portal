import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertTriangle } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info' | 'warning';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info'
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          
          {/* Modal Content */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[101] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-md overflow-hidden pointer-events-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {type === 'danger' && (
                      <div className="bg-red-100 p-2 rounded-full">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-stone-900">{title}</h3>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-1 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <p className="text-stone-600 mb-8 leading-relaxed">
                  {message}
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-3 rounded-xl font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-all"
                  >
                    {cancelText}
                  </button>
                  {onConfirm && (
                    <button
                      onClick={() => {
                        onConfirm();
                        onClose();
                      }}
                      className={`flex-1 px-4 py-3 rounded-xl font-bold text-white transition-all ${
                        type === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-stone-900 hover:bg-black'
                      }`}
                    >
                      {confirmText}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;
