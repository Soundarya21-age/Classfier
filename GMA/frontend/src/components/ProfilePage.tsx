import { motion } from 'motion/react';
import { ArrowLeft, User, Mail, Calendar, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext'; // Updated context import
import { updateProfile } from 'firebase/auth';
import { useEffect, useState } from 'react';

interface ProfilePageProps {
  onBack: () => void;
}

interface ProfileFormValues {
  name: string;
  email: string;
}

export function ProfilePage({ onBack }: ProfilePageProps) {
  // Use new context values: doctorProfile for static data, refreshProfile for updating header
  const { currentUser, doctorProfile, refreshProfile } = useAuth(); 
  const [saving, setSaving] = useState(false);

  const form = useForm<ProfileFormValues>({
    defaultValues: {
      name: '',
      email: '',
    },
  });

  // Load user data from Firebase and doctorProfile when component mounts or user changes
  useEffect(() => {
    if (currentUser) {
      form.reset({
        name: currentUser.displayName || doctorProfile?.name || '', // Prioritize Firebase display name
        email: currentUser.email || doctorProfile?.email || '',
      });
    }
  }, [currentUser, doctorProfile, form]); // DEPENDS ON doctorProfile

  // MODIFIED: Use data from doctorProfile for static fields
  const role = doctorProfile?.role || 'Guest';
  const memberSince = doctorProfile?.created_at 
    ? new Date(doctorProfile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : 'N/A';
  
  // Stats (keeping static for now, would typically fetch from backend)
  const testsRun = 89;
  const videosProcessed = 247;
  const reportsGenerated = 89;

// ProfilePage.tsx - Focus on handleSave function

const handleSave = async (data: ProfileFormValues) => {
    if (!currentUser) {
      toast.error('No user logged in');
      return;
    }

    setSaving(true);
    
    try {
      // 1. Update Firebase Auth profile (This updates currentUser.displayName)
      await updateProfile(currentUser, {
        displayName: data.name,
      });
      
      // 2. Save/Update Profile in the FastAPI Backend (Ensures Doctor table is updated)
      const token = await currentUser.getIdToken(); 
      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/auth/profile`;
      
      const backendResponse = await fetch(apiUrl, { // Use dynamic apiUrl
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
              email: data.email, 
              name: data.name,   
          }),
      });

      if (!backendResponse.ok) {
          // If backend fails, throw an error with details
          const errorData = await backendResponse.json();
          console.error('Backend Profile Update Failed:', errorData);
          throw new Error(errorData.detail || 'Server failed to save profile.');
      }
      
      // 3. Force Context Refresh (FIXES THE HEADER/PROFILE RENDER)
      // This step reloads the Firebase user data (new display name) and fetches the Doctor profile.
      await refreshProfile(); 
      
      toast.success('Profile updated successfully! 🎉');

    } catch (error: any) {
      console.error('CRITICAL: Error during full profile update process:', error);
      // Ensure the error message is displayed
      toast.error(error.message || 'Failed to update profile. Check console for details.'); 
    } finally {
      setSaving(false);
    }
};

// ... (rest of the file remains the same)
  

  // Get user initials for avatar
  const userInitials = currentUser?.displayName
    ? currentUser.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : currentUser?.email
    ? currentUser.email.substring(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="min-h-[calc(100vh-73px)] bg-gradient-to-br from-[#1A1F25] via-[#0F1419] to-[#1A1F25] p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <h2 className="text-white text-2xl md:text-3xl mb-2">My Profile</h2>
          <p className="text-gray-400">Manage your account information</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-[#1F2937]/50 backdrop-blur-xl border-gray-800">
            <CardContent className="p-6 md:p-8">
              {/* Profile Picture Section */}
              <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-800">
                <Avatar className="w-24 h-24 shadow-lg shadow-[#00D9FF]/30">
                  <AvatarFallback className="bg-gradient-to-br from-[#00D9FF] to-[#0099FF] text-white">
                    {userInitials} {/* Use updated initials */}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-white text-xl mb-1">{form.watch('name')}</h3>
                  <p className="text-gray-400 mb-3">{form.watch('email')}</p>
                  <Button 
                    variant="outline"
                    className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white rounded-xl"
                  >
                    Change Photo
                  </Button>
                </div>
              </div>

                {/* Form Fields */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      rules={{
                        required: 'Name is required',
                        minLength: {
                          value: 2,
                          message: 'Name must be at least 2 characters',
                        },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Full Name</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              {...field}
                              className="bg-[#0F1419] border-gray-700 text-white rounded-xl h-12 focus:border-[#00D9FF] focus:ring-[#00D9FF]/20"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      rules={{
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Email Address</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              {...field}
                              className="bg-[#0F1419] border-gray-700 text-white rounded-xl h-12 focus:border-[#00D9FF] focus:ring-[#00D9FF]/20"
                              disabled // Email should typically be disabled or handled separately
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormItem>
                      <FormLabel className="text-gray-300">Role</FormLabel>
                      <div className="bg-[#0F1419] border border-gray-700 text-gray-400 rounded-xl h-12 px-4 flex items-center">
                        {role} {/* MODIFIED: Now dynamic */}
                      </div>
                    </FormItem>

                    <FormItem>
                      <FormLabel className="text-gray-300">Member Since</FormLabel>
                      <div className="bg-[#0F1419] border border-gray-700 text-gray-400 rounded-xl h-12 px-4 flex items-center">
                        {memberSince} {/* MODIFIED: Now dynamic */}
                      </div>
                    </FormItem>
                  </div>

                  {/* Stats Section */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 border-t border-gray-800">
                    <Card className="bg-[#0F1419] border-gray-800">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-lg bg-[#00D9FF]/20 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-[#00D9FF]" />
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Tests Run</p>
                            <p className="text-white text-xl">{testsRun}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-[#0F1419] border-gray-800">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Videos Processed</p>
                            <p className="text-white text-xl">{videosProcessed}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-[#0F1419] border-gray-800">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <Mail className="w-5 h-5 text-green-400" />
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Reports Generated</p>
                            <p className="text-white text-xl">{reportsGenerated}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end gap-3 mt-8">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onBack}
                      className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white rounded-xl px-6"
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-[#00D9FF] to-[#0099FF] hover:from-[#00BFFF] hover:to-[#0088EE] text-white rounded-xl px-6 shadow-lg shadow-[#00D9FF]/30 transition-all duration-200 hover:scale-[1.02]"
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save Changes'} {/* ADDED: Saving status */}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}