import { useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Camera, Upload, Trash2, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAvatarUrl, getInitials } from '@/lib/utils';
import { toast } from 'sonner';
import api from '@/lib/axios';

export default function ProfilePage() {
  const { user, mutateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpdatePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setIsUploading(true);
    try {
      const res = await api.post('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // The backend returns the updated user object
      mutateUser(res.data);
      toast.success('Profile picture updated!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    setIsUploading(true);
    try {
      const res = await api.delete('/users/me/avatar');
      mutateUser(res.data);
      toast.success('Profile picture removed!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = () => {
    toast.info("Profile updates coming soon!");
  };

  const handleChangePassword = () => {
    toast.info("Password change flow coming soon!");
  };

  // Get initials for the fallback avatar
  const initials = getInitials(user?.name);

  return (
    <div className="font-jakarta pb-24 md:pb-6">
      <div className="mb-8">
        <h2 className="text-[24px] font-bold text-foreground mb-1 tracking-tight">Profile Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your account details and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card & Photo */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* Account Settings (Photo) */}
          <section className="bg-card border border-border rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(70,72,212,0.04)] p-6">
            <h3 className="text-lg font-bold text-foreground mb-6">Account Profile</h3>
            
            <div className="flex flex-col items-center mb-6">
              <input 
                type="file" 
                accept="image/jpeg, image/png, image/webp" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileChange}
              />
              <div className="relative mb-4 group cursor-pointer" onClick={handleUpdatePhotoClick}>
                <Avatar className="w-24 h-24 rounded-full border border-border shadow-md">
                  <AvatarImage src={user?.avatarUrl ? getAvatarUrl(user.avatarUrl) : ''} alt="Profile Avatar" className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-3xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute inset-0 bg-foreground/40 rounded-full flex items-center justify-center transition-opacity ${isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  {isUploading ? <Loader2 className="text-background animate-spin" size={24} /> : <Camera className="text-background" size={24} />}
                </div>
              </div>
              <h4 className="text-lg font-bold text-foreground">{user?.name}</h4>
              <p className="text-sm text-muted-foreground">@{user?.username}</p>
            </div>
            
            <div className="space-y-2 w-full">
              <button 
                onClick={handleUpdatePhotoClick}
                disabled={isUploading}
                className="w-full bg-background border border-border text-foreground py-2 px-4 rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} 
                {isUploading ? 'Uploading...' : 'Update Photo'}
              </button>
              <button 
                onClick={handleRemovePhoto}
                className="w-full bg-background border border-destructive text-destructive py-2 px-4 rounded-lg text-sm font-medium hover:bg-destructive/20 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={16} /> Remove Photo
              </button>
            </div>
          </section>

          {/* System Preferences Minimal */}
          <section className="bg-card border border-border rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(70,72,212,0.04)] p-6">
            <h3 className="text-lg font-bold text-foreground mb-6">Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Email Notifications</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-9 h-5 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Dark Mode</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-9 h-5 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Forms */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          
          {/* Profile Information */}
          <section className="bg-card border border-border rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(70,72,212,0.04)] p-6">
            <h3 className="text-lg font-bold text-foreground mb-6 border-b border-border pb-2">Profile Information</h3>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
                  <input 
                    type="text" 
                    defaultValue={user?.name}
                    className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Username</label>
                  <input 
                    type="text" 
                    defaultValue={user?.username}
                    readOnly
                    className="bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground opacity-70 cursor-not-allowed focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
                <input 
                  type="email" 
                  defaultValue={user?.email}
                  readOnly
                  className="bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground opacity-70 cursor-not-allowed focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Role</label>
                <input 
                  type="text" 
                  defaultValue={user?.role}
                  readOnly
                  className="bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground opacity-70 cursor-not-allowed focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Bio</label>
                <textarea 
                  rows={3}
                  placeholder="Tell us about yourself..."
                  className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  type="submit"
                  className="bg-primary text-primary-foreground py-2 px-6 rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm hover:shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </section>

          {/* Security */}
          <section className="bg-card border border-border rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(70,72,212,0.04)] p-6">
            <h3 className="text-lg font-bold text-foreground mb-6 border-b border-border pb-2">Security</h3>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h4 className="text-base text-foreground font-bold mb-1">Password</h4>
                <p className="text-sm text-muted-foreground">Update your password regularly to keep your account secure.</p>
              </div>
              <button 
                onClick={handleChangePassword}
                className="bg-background border border-border text-foreground py-2 px-4 rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors shrink-0"
              >
                Change Password
              </button>
            </div>
            
          </section>

        </div>
      </div>
    </div>
  );
}
