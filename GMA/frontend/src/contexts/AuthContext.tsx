import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '../config/firebase';

// NEW: Define the structure for the backend Doctor Profile
interface DoctorProfile {
    id: number;
    firebase_uid: string;
    email: string;
    name: string | null;
    role: string; // From models.py
    created_at: string; // From models.py
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  doctorProfile: DoctorProfile | null; // NEW: Backend profile data
  refreshProfile: () => Promise<void>; // NEW: Function to force refresh profile data
  signup: (email: string, password: string) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  googleLogin: () => Promise<User>;
  logout: () => Promise<void>;
  getAuthToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null); // NEW STATE

  // NEW FUNCTION: Fetches the Doctor profile from your FastAPI backend
  const fetchProfile = async (user: User) => {
      try {
          const token = await user.getIdToken();
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/profile`, {
              headers: {
                  'Authorization': `Bearer ${token}`,
              },
          });

          if (response.ok) {
              const data: DoctorProfile = await response.json();
              setDoctorProfile(data);
          } else {
              setDoctorProfile(null);
          }
      } catch (e) {
          console.error('Error fetching backend profile:', e);
          setDoctorProfile(null);
      }
  };
  
  // NEW FUNCTION: Refreshes both Firebase and backend context, crucial for header updates
  const refreshProfile = async () => {
    if (currentUser) {
        // Force Firebase to reload user data (updates display name in currentUser)
        await currentUser.reload();
        // Force React state update for Header/UI
        setCurrentUser({ ...currentUser }); 
        
        // Fetch the latest backend profile data
        await fetchProfile(currentUser);
    }
  };

  // UPDATED EFFECT: When Firebase user changes (login/signup), fetch the backend profile
  useEffect(() => {
    // Check for redirect results from Google Sign-In
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          try {
            const token = await result.user.getIdToken();
            await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/profile`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                email: result.user.email,
                name: result.user.displayName,
              }),
            });
            await refreshProfile();
          } catch (e) {
            console.warn('Profile API failed after redirect:', e);
          }
        }
      })
      .catch((error) => console.error('Redirect result error:', error));

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
          await fetchProfile(user); // Fetch profile on login
      } else {
          setDoctorProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // --------- SIGNUP FUNCTION: updated to use refreshProfile
  const signup = async (email: string, password: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      // Backend profile creation is optional and won't block Firebase signup
      try {
        const token = await result.user.getIdToken();
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: result.user.email,
            name: result.user.displayName || "",
          }),
        });
        await refreshProfile(); // ADDED: Refresh context after successful backend interaction

      } catch (e) {
        // Ignore backend errors - user account is created in Firebase
        console.warn('Profile API failed, but Firebase sign-up succeeded:', e);
      }
      return result.user;
    } catch (error: any) {
      let message = error.message || 'Signup failed';
      if (error.code === 'auth/email-already-in-use') {
        message = 'This email is already registered';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password is too weak';
      }
      throw new Error(message);
    }
  };

  // --------- LOGIN FUNCTION
  const login = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error: any) {
      let message = error.message || 'Login failed';
      if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Incorrect password';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address';
      } else if (error.code === 'auth/user-disabled') {
        message = 'Account has been disabled';
      }
      throw new Error(message);
    }
  };

  // --------- GOOGLE LOGIN: updated to use refreshProfile
  const googleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      let result;
      
      // Try popup first, fall back to redirect if popup fails
      try {
        result = await signInWithPopup(auth, provider);
      } catch (popupError: any) {
        // If popup is blocked, use redirect instead
        if (popupError.code === 'auth/popup-blocked' || 
            popupError.code === 'auth/popup-closed-by-user' ||
            popupError.message.includes('CORS')) {
          await signInWithRedirect(auth, provider);
          return;
        }
        throw popupError;
      }
      
      try {
        const token = await result.user.getIdToken();
        await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: result.user.email,
            name: result.user.displayName,
          }),
        });
        await refreshProfile(); // ADDED: Refresh context after successful backend interaction

      } catch (e) {
        console.warn('Profile API failed, but Firebase google login succeeded:', e);
      }
      return result.user;
    } catch (error: any) {
      let message = error.message || 'Google sign-in failed';
      throw new Error(message);
    }
  };

  const logout = async () => signOut(auth);

  const getAuthToken = async (): Promise<string> => {
    if (!currentUser) throw new Error('No user logged in');
    return currentUser.getIdToken();
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    doctorProfile, // NEW
    refreshProfile, // NEW
    signup,
    login,
    googleLogin,
    logout,
    getAuthToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}