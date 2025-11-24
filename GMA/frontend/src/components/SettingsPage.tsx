import { motion } from 'motion/react';
import { ArrowLeft, Bell, Lock, Palette, Database } from 'lucide-react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useForm } from 'react-hook-form@7.55.0';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from './ui/form';
import { toast } from 'sonner@2.0.3';

interface SettingsPageProps {
  onBack: () => void;
}

interface SettingsFormValues {
  emailNotifications: boolean;
  pushNotifications: boolean;
  autoSaveReports: boolean;
  darkMode: boolean;
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  const form = useForm<SettingsFormValues>({
    defaultValues: {
      emailNotifications: true,
      pushNotifications: false,
      autoSaveReports: true,
      darkMode: true,
    },
  });

  const handleSave = (data: SettingsFormValues) => {
    console.log('Saving settings:', data);
    toast.success('Settings saved successfully!');
  };

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
          <h2 className="text-white text-2xl md:text-3xl mb-2">Settings</h2>
          <p className="text-gray-400">Manage your application preferences</p>
        </motion.div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
            {/* Notifications Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-[#1F2937]/50 backdrop-blur-xl border-gray-800">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00D9FF] to-[#0099FF] flex items-center justify-center">
                      <Bell className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white">Notifications</CardTitle>
                      <CardDescription className="text-gray-400">Manage how you receive updates</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="emailNotifications"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between py-3 border-b border-gray-800">
                        <div className="space-y-0.5">
                          <FormLabel className="text-gray-300">Email Notifications</FormLabel>
                          <FormDescription className="text-gray-500 text-sm">
                            Receive email updates about test results
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pushNotifications"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between py-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-gray-300">Push Notifications</FormLabel>
                          <FormDescription className="text-gray-500 text-sm">
                            Get real-time alerts in your browser
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Appearance Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-[#1F2937]/50 backdrop-blur-xl border-gray-800">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                      <Palette className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white">Appearance</CardTitle>
                      <CardDescription className="text-gray-400">Customize your visual experience</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="darkMode"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between py-3">
                        <div className="space-y-0.5">
                          <FormLabel className="text-gray-300">Dark Mode</FormLabel>
                          <FormDescription className="text-gray-500 text-sm">
                            Use dark theme throughout the app
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Data & Storage Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-[#1F2937]/50 backdrop-blur-xl border-gray-800">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                      <Database className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white">Data & Storage</CardTitle>
                      <CardDescription className="text-gray-400">Manage your data and reports</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="autoSaveReports"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between py-3 border-b border-gray-800">
                        <div className="space-y-0.5">
                          <FormLabel className="text-gray-300">Auto-save Reports</FormLabel>
                          <FormDescription className="text-gray-500 text-sm">
                            Automatically download test reports
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-gray-300">Storage Used</p>
                      <p className="text-gray-500 text-sm">2.4 GB of 10 GB used</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white rounded-xl"
                    >
                      Manage
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Security Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-[#1F2937]/50 backdrop-blur-xl border-gray-800">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white">Security</CardTitle>
                      <CardDescription className="text-gray-400">Protect your account</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white rounded-xl"
                  >
                    Change Password
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white rounded-xl"
                  >
                    Two-Factor Authentication
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white rounded-xl px-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-[#00D9FF] to-[#0099FF] hover:from-[#00BFFF] hover:to-[#0088EE] text-white rounded-xl px-6 shadow-lg shadow-[#00D9FF]/30 transition-all duration-200 hover:scale-[1.02]"
              >
                Save Settings
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
