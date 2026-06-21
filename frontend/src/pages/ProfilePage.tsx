import { useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Camera, Upload, Trash2, Mail, Shield, User, Loader2 } from 'lucide-react';
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

  const handleRemovePhoto = () => {
    toast.info("Profile picture removal coming soon!");
  };

  const handleSaveProfile = () => {
    toast.info("Profile updates coming soon!");
  };

  const handleChangePassword = () => {
    toast.info("Password change flow coming soon!");
  };

  // Get initials for the fallback avatar
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '?';
  // Construct full URL if needed (axios usually handles relative to base URL, but for images we need the full host)
  // Assuming the backend is running on the API base URL port
  const getAvatarUrl = (path: string) => {
    // If the path is already a full URL, return it
    if (path.startsWith('http')) return path;
    // Otherwise prepend the backend origin (e.g. http://localhost:5000)
    // We can infer this from import.meta.env.VITE_API_URL, dropping the /api part
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const baseUrl = apiUrl.replace('/api', '');
    return `${baseUrl}${path}`;
  };

  return (
    <div className="font-jakarta pb-24 md:pb-6">
      <div className="mb-8">
        <h2 className="text-[24px] font-bold text-ip-on-surface mb-1 tracking-tight">Profile Settings</h2>
        <p className="text-sm text-ip-on-surface-variant">Manage your account details and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card & Photo */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* Account Settings (Photo) */}
          <section className="bg-ip-surface-container-lowest border border-ip-outline-variant rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(70,72,212,0.04)] p-6">
            <h3 className="text-lg font-bold text-ip-on-surface mb-6">Account Profile</h3>
            
            <div className="flex flex-col items-center mb-6">
              <input 
                type="file" 
                accept="image/jpeg, image/png, image/webp" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileChange}
              />
              <div className="relative mb-4 group cursor-pointer" onClick={handleUpdatePhotoClick}>
                {user?.avatarUrl ? (
                  <img 
                    src={getAvatarUrl(user.avatarUrl)} 
                    alt="Profile Avatar" 
                    className="w-24 h-24 rounded-full border border-ip-outline-variant object-cover shadow-md"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full border border-ip-outline-variant flex items-center justify-center text-ip-on-primary text-3xl font-bold bg-gradient-to-br from-ip-primary to-ip-primary-container shadow-md">
                    {initials}
                  </div>
                )}
                <div className={`absolute inset-0 bg-ip-on-surface/40 rounded-full flex items-center justify-center transition-opacity ${isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  {isUploading ? <Loader2 className="text-ip-surface-container-lowest animate-spin" size={24} /> : <Camera className="text-ip-surface-container-lowest" size={24} />}
                </div>
              </div>
              <h4 className="text-lg font-bold text-ip-on-surface">{user?.name}</h4>
              <p className="text-sm text-ip-on-surface-variant">@{user?.username}</p>
            </div>
            
            <div className="space-y-2 w-full">
              <button 
                onClick={handleUpdatePhotoClick}
                disabled={isUploading}
                className="w-full bg-ip-surface border border-ip-outline-variant text-ip-on-surface py-2 px-4 rounded-lg text-sm font-medium hover:bg-ip-surface-container-low transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} 
                {isUploading ? 'Uploading...' : 'Update Photo'}
              </button>
              <button 
                onClick={handleRemovePhoto}
                className="w-full bg-ip-surface border border-ip-error text-ip-error py-2 px-4 rounded-lg text-sm font-medium hover:bg-ip-error-container transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={16} /> Remove Photo
              </button>
            </div>
          </section>

          {/* System Preferences Minimal */}
          <section className="bg-ip-surface-container-lowest border border-ip-outline-variant rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(70,72,212,0.04)] p-6">
            <h3 className="text-lg font-bold text-ip-on-surface mb-6">Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ip-on-surface">Email Notifications</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-9 h-5 bg-ip-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-ip-primary"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ip-on-surface">Dark Mode</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-9 h-5 bg-ip-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-ip-primary"></div>
                </label>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Forms */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          
          {/* Profile Information */}
          <section className="bg-ip-surface-container-lowest border border-ip-outline-variant rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(70,72,212,0.04)] p-6">
            <h3 className="text-lg font-bold text-ip-on-surface mb-6 border-b border-ip-outline-variant pb-2">Profile Information</h3>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-ip-on-surface-variant uppercase tracking-wider">Full Name</label>
                  <input 
                    type="text" 
                    defaultValue={user?.name}
                    className="bg-ip-surface-container-lowest border border-ip-outline-variant rounded-lg px-3 py-2 text-sm text-ip-on-surface focus:outline-none focus:border-ip-primary focus:ring-1 focus:ring-ip-primary transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-ip-on-surface-variant uppercase tracking-wider">Username</label>
                  <input 
                    type="text" 
                    defaultValue={user?.username}
                    readOnly
                    className="bg-ip-surface-container-low border border-ip-outline-variant rounded-lg px-3 py-2 text-sm text-ip-on-surface opacity-70 cursor-not-allowed focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-ip-on-surface-variant uppercase tracking-wider">Email Address</label>
                <input 
                  type="email" 
                  defaultValue={user?.email}
                  readOnly
                  className="bg-ip-surface-container-low border border-ip-outline-variant rounded-lg px-3 py-2 text-sm text-ip-on-surface opacity-70 cursor-not-allowed focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-ip-on-surface-variant uppercase tracking-wider">Role</label>
                <input 
                  type="text" 
                  defaultValue={user?.role}
                  readOnly
                  className="bg-ip-surface-container-low border border-ip-outline-variant rounded-lg px-3 py-2 text-sm text-ip-on-surface opacity-70 cursor-not-allowed focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-ip-on-surface-variant uppercase tracking-wider">Bio</label>
                <textarea 
                  rows={3}
                  placeholder="Tell us about yourself..."
                  className="bg-ip-surface-container-lowest border border-ip-outline-variant rounded-lg px-3 py-2 text-sm text-ip-on-surface focus:outline-none focus:border-ip-primary focus:ring-1 focus:ring-ip-primary transition-colors resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  type="submit"
                  className="bg-ip-primary text-ip-on-primary py-2 px-6 rounded-lg text-sm font-bold hover:bg-ip-on-primary-fixed-variant transition-colors shadow-sm hover:shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </section>

          {/* Security */}
          <section className="bg-ip-surface-container-lowest border border-ip-outline-variant rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(70,72,212,0.04)] p-6">
            <h3 className="text-lg font-bold text-ip-on-surface mb-6 border-b border-ip-outline-variant pb-2">Security</h3>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h4 className="text-base text-ip-on-surface font-bold mb-1">Password</h4>
                <p className="text-sm text-ip-on-surface-variant">Update your password regularly to keep your account secure.</p>
              </div>
              <button 
                onClick={handleChangePassword}
                className="bg-ip-surface border border-ip-outline-variant text-ip-on-surface py-2 px-4 rounded-lg text-sm font-medium hover:bg-ip-surface-container-low transition-colors shrink-0"
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
