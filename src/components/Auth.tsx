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

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  // We don't throw here to avoid crashing the app, but we log it as required
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRoleState] = useState<AppRole>('User');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          // Block check
          const blockedPath = `blockedEmails/${currentUser.email?.toLowerCase() || ''}`;
          let blockedDoc;
          try {
            blockedDoc = await getDoc(doc(db, 'blockedEmails', currentUser.email?.toLowerCase() || ''));
          } catch (error) {
            handleFirestoreError(error, OperationType.GET, blockedPath);
            // If we can't check if they are blocked, we should probably be safe and sign them out
            // but for now let's just log it.
          }

          if (blockedDoc?.exists()) {
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
          let userDoc;
          try {
            userDoc = await getDoc(userDocRef);
          } catch (error) {
            handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
          }
          
          if (userDoc?.exists()) {
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

            if (!adminEmails.includes(currentUser.email || '')) {
              await signOut(auth);
              setUser(null);
              alert('Access denied. Only administrators can log in to the dashboard.');
              setLoading(false);
              return;
            }

            const initialRole: AppRole = 'Admin';
            try {
              await setDoc(userDocRef, {
                email: currentUser.email,
                role: initialRole
              });
            } catch (error) {
              handleFirestoreError(error, OperationType.WRITE, `users/${currentUser.uid}`);
            }
            setRoleState(initialRole);
          }
        } else {
          setUser(null);
          setRoleState('User');
        }
      } catch (error) {
        console.error('Auth state change error:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.code === 'auth/popup-blocked') {
        alert('The login popup was blocked by your browser. Please allow popups for this site.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        // Ignore, user closed the popup
      } else {
        alert(`Login failed: ${error.message}`);
      }
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
