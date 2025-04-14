'use client';

import type React from 'react';

import { useState } from 'react';
import {
  ArrowLeft,
  Camera,
  Edit,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
  ArrowUp,
  ArrowDown,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';

interface ProfileData {
  name: string;
  username: string;
  email: string;
  phone: string;
  location: string;
  profileImage: string;
  isVerified?: boolean;
}

interface ProfilePageProps {
  initialData: ProfileData;
}

export default function ProfilePage({ initialData }: ProfilePageProps) {
  const router = useRouter();
  const { toast } = useToast();

  // Profile state - ensure we have default values
  const [profileData, setProfileData] = useState<ProfileData>({
    name: initialData?.name || 'Guest User',
    username: initialData?.username || 'guest',
    email: initialData?.email || 'guest@example.com',
    phone: initialData?.phone || '',
    location: initialData?.location || '',
    profileImage:
      initialData?.profileImage || '/placeholder.svg?height=96&width=96',
    isVerified: initialData?.isVerified || false,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Edit profile dialog state - ensure we have default values
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ ...profileData });

  // Settings state
  const [settings, setSettings] = useState({
    priceAlerts: true,
    transactionUpdates: true,
    newsletter: false,
  });

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Handle profile image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      toast({
        title: 'Image selected',
        description:
          'Your profile picture will be updated when you save changes.',
      });
    }
  };

  // Handle edit form input changes
  const handleEditFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle save profile changes
  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // Update profile data
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedData = await response.json();
      setProfileData(updatedData);

      // If there's a new profile image, upload it separately
      if (previewUrl) {
        const imageResponse = await fetch('/api/profile/image', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ profileImage: previewUrl }),
        });

        if (imageResponse.ok) {
          const { profileImage } = await imageResponse.json();
          setProfileData((prev) => ({ ...prev, profileImage }));
        }
      }

      setIsEditDialogOpen(false);
      toast({
        title: 'Profile updated',
        description: 'Your profile information has been saved successfully.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update failed',
        description: 'There was a problem updating your profile.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle settings toggle
  const handleSettingToggle = (setting: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  // Handle save settings
  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // In a real app, you would save settings to the backend
      // For now, we'll just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast({
        title: 'Settings saved',
        description: 'Your notification preferences have been updated.',
      });
    } catch (error) {
      toast({
        title: 'Failed to save settings',
        description: 'There was a problem updating your settings.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      // In a real app, you would call your logout API
      // For now, we'll just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast({
        title: 'Signing out',
        description: 'You have been signed out successfully.',
      });

      // In a real app, you would clear auth state here
      setTimeout(() => {
        router.push('/');
      }, 1000);
    } catch (error) {
      toast({
        title: 'Sign out failed',
        description: 'There was a problem signing you out.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-6 md:py-10">
      <div className="mb-6 flex items-center">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold">Profile</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="relative pb-0">
              <div className="absolute right-4 top-4 flex gap-2">
                <Dialog
                  open={isEditDialogOpen}
                  onOpenChange={setIsEditDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit profile</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="flex flex-col items-center gap-2">
                        <div className="relative h-20 w-20 overflow-hidden rounded-full bg-muted">
                          <img
                            src={
                              previewUrl ||
                              profileData?.profileImage ||
                              '/placeholder.svg?height=96&width=96'
                            }
                            alt="Profile"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <Label
                          htmlFor="picture"
                          className="cursor-pointer text-sm text-primary"
                        >
                          Change picture
                          <input
                            id="picture"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleImageChange}
                          />
                        </Label>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={editFormData.name}
                          onChange={handleEditFormChange}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          name="username"
                          value={editFormData.username}
                          onChange={handleEditFormChange}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={editFormData.email}
                          onChange={handleEditFormChange}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={editFormData.phone}
                          onChange={handleEditFormChange}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          name="location"
                          value={editFormData.location}
                          onChange={handleEditFormChange}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditDialogOpen(false)}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSaveProfile} disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save changes'
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="h-20 w-20 md:h-24 md:w-24 overflow-hidden rounded-full bg-muted">
                    <img
                      src={profileData?.profileImage || '/placeholder.svg'}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <label
                    htmlFor="profile-picture"
                    className="absolute bottom-0 right-0 cursor-pointer"
                  >
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-6 w-6 md:h-7 md:w-7 rounded-full"
                      onClick={() =>
                        document.getElementById('profile-picture')?.click()
                      }
                    >
                      <Camera className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="sr-only">Change profile picture</span>
                    </Button>
                    <input
                      id="profile-picture"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
                <CardTitle className="text-lg md:text-xl">
                  {profileData.name}
                </CardTitle>
                <CardDescription>@{profileData.username}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs md:text-sm break-all">
                    {profileData.email}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs md:text-sm">
                    {profileData.phone}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs md:text-sm">
                    {profileData.location}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleSignOut}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing out...
                  </>
                ) : (
                  <>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg">
                Account Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs md:text-sm">
                    Two-factor authentication
                  </span>
                </div>
                <span className="text-xs md:text-sm font-medium text-green-500">
                  Enabled
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs md:text-sm">
                    Account verification
                  </span>
                </div>
                <span className="text-xs md:text-sm font-medium text-green-500">
                  {profileData.isVerified ? 'Verified' : 'Pending'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Tabs defaultValue="investments" className="w-full">
            <TabsList className="w-full grid grid-cols-3 h-auto">
              <TabsTrigger
                value="investments"
                className="text-xs md:text-sm py-2"
              >
                Investments
              </TabsTrigger>
              <TabsTrigger
                value="transactions"
                className="text-xs md:text-sm py-2"
              >
                Transactions
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-xs md:text-sm py-2">
                Settings
              </TabsTrigger>
            </TabsList>
            <TabsContent value="investments" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Investment Summary</CardTitle>
                  <CardDescription>
                    Overview of your investment portfolio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          Total Invested
                        </div>
                        <div className="text-xl md:text-2xl font-bold">
                          $20,242.27
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          Current Value
                        </div>
                        <div className="text-xl md:text-2xl font-bold">
                          $24,563.82
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          Total Profit/Loss
                        </div>
                        <div className="text-xl md:text-2xl font-bold text-green-500">
                          +$4,321.55 (21.3%)
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-4">
                      <div className="text-sm font-medium">
                        Asset Allocation
                      </div>
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                              BTC
                            </div>
                            <div>
                              <div className="font-medium">Bitcoin</div>
                              <div className="text-xs text-muted-foreground">
                                51.9% of portfolio
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">$12,755.55</div>
                            <div className="text-xs text-green-500">+3.45%</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                              ETH
                            </div>
                            <div>
                              <div className="font-medium">Ethereum</div>
                              <div className="text-xs text-muted-foreground">
                                22.9% of portfolio
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">$5,637.79</div>
                            <div className="text-xs text-green-500">+1.87%</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                              XRP
                            </div>
                            <div>
                              <div className="font-medium">XRP</div>
                              <div className="text-xs text-muted-foreground">
                                13.7% of portfolio
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">$3,367.97</div>
                            <div className="text-xs text-green-500">+2.34%</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                              USDT
                            </div>
                            <div>
                              <div className="font-medium">Tether</div>
                              <div className="text-xs text-muted-foreground">
                                10.2% of portfolio
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">$2,500.00</div>
                            <div className="text-xs text-green-500">+0.01%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="transactions" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>
                    Your recent deposit and withdrawal history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-lg border">
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-green-100 text-green-500 flex items-center justify-center">
                            <ArrowUp className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium">Deposit</div>
                            <div className="text-xs text-muted-foreground">
                              Apr 28, 2023 • 10:24 AM
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">+$1,000.00</div>
                          <div className="text-xs text-muted-foreground">
                            Bank Transfer
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg border">
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center">
                            <ArrowDown className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium">Buy Bitcoin</div>
                            <div className="text-xs text-muted-foreground">
                              Apr 26, 2023 • 2:34 PM
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">0.015 BTC</div>
                          <div className="text-xs text-muted-foreground">
                            $432.78
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg border">
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center">
                            <ArrowDown className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium">Buy XRP</div>
                            <div className="text-xs text-muted-foreground">
                              Apr 24, 2023 • 9:12 AM
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">500 XRP</div>
                          <div className="text-xs text-muted-foreground">
                            $310.00
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg border">
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-green-100 text-green-500 flex items-center justify-center">
                            <ArrowUp className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium">Deposit</div>
                            <div className="text-xs text-muted-foreground">
                              Apr 20, 2023 • 3:45 PM
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">+$2,500.00</div>
                          <div className="text-xs text-muted-foreground">
                            Bank Transfer
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="settings" className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>
                    Manage your account preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <div className="font-medium">Email Notifications</div>
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <div className="font-medium">Price Alerts</div>
                          <div className="text-sm text-muted-foreground">
                            Get notified when assets reach your target price
                          </div>
                        </div>
                        <Switch
                          checked={settings.priceAlerts}
                          onCheckedChange={() =>
                            handleSettingToggle('priceAlerts')
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <div className="font-medium">Transaction Updates</div>
                          <div className="text-sm text-muted-foreground">
                            Receive emails for deposits, withdrawals, and trades
                          </div>
                        </div>
                        <Switch
                          checked={settings.transactionUpdates}
                          onCheckedChange={() =>
                            handleSettingToggle('transactionUpdates')
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                          <div className="font-medium">Newsletter</div>
                          <div className="text-sm text-muted-foreground">
                            Weekly insights and investment opportunities
                          </div>
                        </div>
                        <Switch
                          checked={settings.newsletter}
                          onCheckedChange={() =>
                            handleSettingToggle('newsletter')
                          }
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    className="ml-auto"
                    onClick={handleSaveSettings}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
