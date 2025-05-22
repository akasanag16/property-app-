
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const { user, userRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [accountForm, setAccountForm] = useState({
    firstName: user?.user_metadata?.first_name || "",
    lastName: user?.user_metadata?.last_name || "",
    email: user?.email || "",
    phone: user?.user_metadata?.phone || ""
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    appNotifications: true,
    maintenanceAlerts: true,
    paymentReminders: true
  });

  const handleAccountUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success("Account information updated successfully");
    }, 1000);
  };

  const handleNotificationUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success("Notification preferences updated successfully");
    }, 1000);
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        <Tabs defaultValue="account" className="w-full">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            {userRole === "owner" && <TabsTrigger value="billing">Billing</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Update your personal information here. This information will be displayed in your profile.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleAccountUpdate}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First name</Label>
                      <Input 
                        id="firstName" 
                        value={accountForm.firstName}
                        onChange={(e) => setAccountForm({...accountForm, firstName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last name</Label>
                      <Input 
                        id="lastName" 
                        value={accountForm.lastName}
                        onChange={(e) => setAccountForm({...accountForm, lastName: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={accountForm.email}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone number</Label>
                    <Input 
                      id="phone" 
                      value={accountForm.phone}
                      onChange={(e) => setAccountForm({...accountForm, phone: e.target.value})}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save changes"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current">Current password</Label>
                  <Input id="current" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new">New password</Label>
                  <Input id="new" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm password</Label>
                  <Input id="confirm" type="password" />
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={() => toast.info("This feature is coming soon")}>
                  Change password
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how and when you want to be notified.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleNotificationUpdate}>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="emailNotifications" className="flex-1">Email notifications</Label>
                    <Switch 
                      id="emailNotifications" 
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({...notificationSettings, emailNotifications: checked})
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="appNotifications" className="flex-1">In-app notifications</Label>
                    <Switch 
                      id="appNotifications" 
                      checked={notificationSettings.appNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({...notificationSettings, appNotifications: checked})
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="maintenanceAlerts" className="flex-1">Maintenance alerts</Label>
                    <Switch 
                      id="maintenanceAlerts" 
                      checked={notificationSettings.maintenanceAlerts}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({...notificationSettings, maintenanceAlerts: checked})
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="paymentReminders" className="flex-1">Payment reminders</Label>
                    <Switch 
                      id="paymentReminders" 
                      checked={notificationSettings.paymentReminders}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({...notificationSettings, paymentReminders: checked})
                      }
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save preferences"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          {userRole === "owner" && (
            <TabsContent value="billing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Billing Information</CardTitle>
                  <CardDescription>
                    Manage your billing information and subscription plan.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Current Plan</p>
                        <p className="text-sm text-muted-foreground">Free Tier</p>
                      </div>
                      <Button variant="outline" onClick={() => toast.info("Upgrade feature coming soon")}>
                        Upgrade
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    The billing feature is under development. Check back soon for updates.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
}
