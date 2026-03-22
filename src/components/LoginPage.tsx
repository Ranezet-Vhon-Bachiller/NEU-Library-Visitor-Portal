import React from 'react';
import { useAuth } from './Auth';
import { ShieldCheck, LogIn } from 'lucide-react';
import { motion } from 'motion/react';

const LoginPage: React.FC = () => {
  const { login } = useAuth();

  return (
    <div className="max-w-md mx-auto py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden"
      >
        <div className="bg-stone-900 px-6 py-12 text-white text-center flex flex-col items-center">
          <div className="bg-white/10 p-4 rounded-full mb-6 backdrop-blur-sm">
            <ShieldCheck className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Admin Portal</h2>
          <p className="text-stone-400 mt-2">Please sign in to access the dashboard</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="text-center space-y-4">
            <p className="text-sm text-stone-500">
              Only authorized library administrators can access this portal. 
              Please use your official @neu.edu.ph account.
            </p>
            
            <button
              onClick={login}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-white border-2 border-stone-200 rounded-xl font-bold text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition-all shadow-sm active:scale-[0.98]"
            >
              <img 
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                alt="Google" 
                className="w-5 h-5"
              />
              Sign in with Google
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
