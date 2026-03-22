import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { AppRole } from '../types';

interface AuthContextType {
  user: User | null;
  role: AppRole;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  setRole: (role: AppRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRoleState] = useState<AppRole>('User');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Block check
        const blockedDoc = await getDoc(doc(db, 'blockedEmails', currentUser.email?.toLowerCase() || ''));
        if (blockedDoc.exists()) {
          await signOut(auth);
          setUser(null);
          alert('Your account has been blocked by an administrator.');
          setLoading(false);
          return;
        }

        // Domain validation
        if (!currentUser.email?.endsWith('@neu.edu.ph')) {
          await signOut(auth);
          setUser(null);
          alert('Access denied. Only @neu.edu.ph emails are allowed.');
          setLoading(false);
          return;
        }

        setUser(currentUser);
        
        // Fetch or initialize user profile
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userRole = userDoc.data().role as AppRole;
          if (userRole !== 'Admin') {
            await signOut(auth);
            setUser(null);
            alert('Access denied. Only administrators can log in to the dashboard.');
            setLoading(false);
            return;
          }
          setRoleState(userRole);
        } else {
          // Check special admin list for new accounts
          const adminEmails = [
            'ranezetvhon.bachiller@neu.edu.ph',
            'jcesperanza@neu.edu.ph'
          ];

          if (!adminEmails.includes(currentUser.email)) {
            await signOut(auth);
            setUser(null);
            alert('Access denied. Only administrators can log in to the dashboard.');
            setLoading(false);
            return;
          }

          const initialRole: AppRole = 'Admin';
          await setDoc(userDocRef, {
            email: currentUser.email,
            role: initialRole
          });
          setRoleState(initialRole);
        }
      } else {
        setUser(null);
        setRoleState('User');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const setRole = (newRole: AppRole) => {
    setRoleState(newRole);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout, setRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
