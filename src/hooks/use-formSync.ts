import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updatePersonalInfo, updateAddress, updatePreferences } from '@/lib/features/form-slice';

export const useFormSync = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const syncInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/form-data');
        const data = await response.json();
        
        if (data.personalInfo) {
          dispatch(updatePersonalInfo(data.personalInfo));
        }
        if (data.address) {
          dispatch(updateAddress(data.address));
        }
        if (data.preferences) {
          dispatch(updatePreferences(data.preferences));
        }
      } catch (error) {
        console.error('Failed to sync form data:', error);
      }
    }, 5000); // Sync every 5 seconds

    return () => clearInterval(syncInterval);
  }, [dispatch]);
};