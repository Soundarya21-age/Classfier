import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Card, CardContent } from './ui/card';
import { motion } from 'motion/react';
import { useForm } from 'react-hook-form';
import { Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { useTheme } from './ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface LoginFormValues {
  email: string;
  password: string;
}

export function LoginPage() {
  const { theme, toggleTheme } = useTheme();
  const { login, signup, googleLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const form = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError('');
    try {
      if (isSignUp) {
        await signup(data.email, data.password);
      } else {
        await login(data.email, data.password);
      }
    } catch (err: any) {
      setError(err.message || (isSignUp ? 'Signup failed. Please try again.' : 'Login failed. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      await googleLogin();
    } catch (err: any) {
      setError(err.message || 'Google login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

   return (
    <div className="min-h-screen bg-gradient-to-br dark:from-[#1A1F25] dark:via-[#0F1419] dark:to-[#1A1F25] from-gray-50 via-white to-gray-50 flex items-center justify-center p-4 relative">
      {/* Theme Toggle Button - Top Right */}
      <div className="absolute top-6 right-6">
        <Button
          onClick={toggleTheme}
          variant="outline"
          size="icon"
          className="rounded-xl dark:border-gray-700 border-gray-300 dark:bg-[#1F2937]/50 bg-white dark:hover:bg-gray-800 hover:bg-gray-100 transition-all duration-200"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-yellow-400" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600" />
          )}
        </Button>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-block mb-4"
          >
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#00D9FF] to-[#0099FF] rounded-2xl flex items-center justify-center shadow-lg shadow-[#00D9FF]/30">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </motion.div>
          <h1 className="dark:text-white text-gray-900 text-3xl mb-2">GMA Classifier</h1>
          <p className="dark:text-gray-400 text-gray-600">Sign in to continue to your dashboard</p>
        </div>
       
        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="dark:bg-[#1F2937]/50 bg-white backdrop-blur-xl dark:border-gray-800 border-gray-200">
            <CardContent className="p-8">
              {/* Google Sign In Button */}
              <Button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full bg-white hover:bg-gray-100 text-gray-900 rounded-xl h-12 mb-6 transition-all duration-200 hover:scale-[1.02]"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

              <div className="relative mb-6">
                <Separator className="dark:bg-gray-700 bg-gray-300" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="dark:bg-[#1F2937] bg-white px-3 dark:text-gray-500 text-gray-600 text-sm">or sign in with email</span>
                </div>
              </div>

              {/* Email/Password Form */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
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
                        <FormLabel className="dark:text-gray-300 text-gray-700">Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@example.com"
                            {...field}
                            className="dark:bg-[#0F1419] bg-gray-50 dark:border-gray-700 border-gray-300 dark:text-white text-gray-900 placeholder:text-gray-500 rounded-xl h-12 focus:border-[#00D9FF] focus:ring-[#00D9FF]/20"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    rules={{
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="dark:text-gray-300 text-gray-700">Password</FormLabel>
                          <button
                            type="button"
                            className="text-sm text-[#00D9FF] hover:text-[#00BFFF] transition-colors"
                          >
                            Forgot?
                          </button>
                        </div>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                            className="dark:bg-[#0F1419] bg-gray-50 dark:border-gray-700 border-gray-300 dark:text-white text-gray-900 placeholder:text-gray-500 rounded-xl h-12 focus:border-[#00D9FF] focus:ring-[#00D9FF]/20"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#00D9FF] to-[#0099FF] hover:from-[#00BFFF] hover:to-[#0088EE] text-white rounded-xl h-12 shadow-lg shadow-[#00D9FF]/30 transition-all duration-200 hover:scale-[1.02]"
                  >
                    Sign In
                  </Button>
                </form>
              </Form>

              {/* Sign Up Link */}
              <div className="mt-6 text-center">
                <p className="dark:text-gray-400 text-gray-600 text-sm">
                  Don't have an account?{' '}
                  <button className="text-[#00D9FF] hover:text-[#00BFFF] transition-colors">
                    Sign up
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <p className="text-center dark:text-gray-500 text-gray-400 text-sm mt-6">
          Protected by industry-standard encryption
        </p>
      </motion.div>
    </div>
  );
}

