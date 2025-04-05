import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '../components/ui/use-toast';

interface AvatarProps {
  url: string | null;
  size: number;
  onUpload: (url: string) => void;
}

const Avatar: React.FC<AvatarProps> = ({ url, size, onUpload }) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    console.log('Avatar component received url prop:', url);
    if (url) {
      console.log('Setting avatarUrl state to:', url);
      setAvatarUrl(url);
      
      // Reset retry count when URL changes
      setRetryCount(0);
    } else {
      console.log('Avatar url prop is null or empty');
    }
  }, [url]);

  // Attempt to fetch user profile avatar if URL is missing
  useEffect(() => {
    const fetchUserAvatar = async () => {
      if (!avatarUrl && retryCount < 3) {
        console.log(`Attempting to fetch user avatar (retry ${retryCount + 1}/3)`);
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            // Try to get avatar from user metadata
            if (user.user_metadata?.avatar_url) {
              console.log('Found avatar URL in user metadata:', user.user_metadata.avatar_url);
              setAvatarUrl(user.user_metadata.avatar_url);
              return;
            }
            
            // If not in metadata, try to get from profile
            const { data, error } = await supabase
              .from('user_profiles')
              .select('avatar_url')
              .eq('user_id', user.id)
              .single();
              
            if (error) {
              console.error('Error fetching user profile for avatar:', error);
            } else if (data?.avatar_url) {
              console.log('Found avatar URL in user profile:', data.avatar_url);
              setAvatarUrl(data.avatar_url);
              
              // Also update user metadata for consistency
              await supabase.auth.updateUser({
                data: { avatar_url: data.avatar_url }
              });
            }
          }
        } catch (error) {
          console.error('Error in fetchUserAvatar:', error);
        } finally {
          setRetryCount(prev => prev + 1);
        }
      }
    };
    
    if (!avatarUrl) {
      fetchUserAvatar();
    }
  }, [avatarUrl, retryCount]);

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      setUploading(true);
      setError(null);
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      
      // Validate file type
      const allowedFileTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      if (!allowedFileTypes.includes(fileExt?.toLowerCase() || '')) {
        setError('Invalid file type. Please upload an image file (jpg, jpeg, png, gif, webp).');
        setUploading(false);
        return;
      }
      
      // Check file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError('File size too large. Maximum size is 5MB.');
        setUploading(false);
        return;
      }
      
      // Always use 'avatars' bucket
      const bucketName = 'avatars';
      
      console.log('Uploading avatar to bucket:', bucketName);
      
      // Generate random filename to avoid collisions
      const fileName = `${Math.random()}.${fileExt}`;
      
      // Upload file to storage
      const { error: uploadError, data } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error('Avatar upload error:', uploadError.message);
        
        // Check if the error is due to missing bucket
        if (uploadError.message.includes('bucket') && uploadError.message.toLowerCase().includes('not found')) {
          setError('Storage not configured properly. Please contact support. (Missing avatars bucket)');
        } else {
          setError(`Error uploading avatar: ${uploadError.message}`);
        }
        
        setUploading(false);
        return;
      }
      
      console.log('Avatar uploaded successfully:', data);
      
      // Get public URL
      const { data: { publicUrl } } = await supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);
      
      console.log('Avatar public URL:', publicUrl);
      
      // Update local state
      setAvatarUrl(publicUrl);
      
      // Pass URL to parent component
      onUpload(publicUrl);
      
      // Also update user metadata directly for redundancy
      try {
        const { error: updateError } = await supabase.auth.updateUser({
          data: { avatar_url: publicUrl }
        });
        
        if (updateError) {
          console.error('Error updating user metadata with avatar URL:', updateError);
        } else {
          console.log('User metadata updated with new avatar URL');
        }
      } catch (error) {
        console.error('Unexpected error updating user metadata:', error);
      }
      
      // Show success message
      toast({
        title: "Avatar Updated",
        description: "Your avatar has been updated successfully.",
        variant: "success"
      });
      
    } catch (error) {
      console.error('Unexpected error during avatar upload:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className="overflow-hidden rounded-full border-2 border-gray-200"
        style={{ height: size, width: size }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="object-cover w-full h-full"
            onError={(e) => {
              console.error('Avatar image failed to load:', avatarUrl);
              e.currentTarget.onerror = null; // Prevent infinite error loop
              e.currentTarget.src = ''; // Clear the src
              
              // Try to recover by resetting URL and triggering retry mechanism
              setAvatarUrl(null);
              setRetryCount(0); // Reset retry count to trigger a new fetch attempt
              
              // Show error message
              toast({
                title: "Avatar Error",
                description: "Failed to load avatar image. Attempting to recover...",
                variant: "destructive"
              });
            }}
          />
        ) : (
          <div 
            className="flex items-center justify-center bg-gray-100 w-full h-full text-gray-400"
            style={{ fontSize: size / 2 }}
          >
            👤
          </div>
        )}
      </div>
      <div className="mt-2">
        <label
          className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors"
          htmlFor="avatar-upload"
        >
          {uploading ? 'Uploading...' : 'Upload Avatar'}
        </label>
        <input
          type="file"
          id="avatar-upload"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
          className="hidden"
        />
      </div>
      {error && (
        <div className="text-red-500 text-sm mt-2">{error}</div>
      )}
    </div>
  );
};

export default Avatar;
