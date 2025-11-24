import axios, { AxiosInstance } from 'axios';

let apiInstance: AxiosInstance;

export const initializeAPI = (getAuthToken: () => Promise<string>) => {
  apiInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  });

  apiInstance.interceptors.request.use(
    async (config) => {
      try {
        const token = await getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Failed to get auth token:', error);
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  return apiInstance;
};

// Upload APIs
export const uploadAPI = {
  uploadVideos: async (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await apiInstance.post('/api/uploads/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  listUploads: async (skip = 0, limit = 10) => {
    const response = await apiInstance.get(`/api/uploads/?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  deleteUpload: async (uploadId: number) => {
    const response = await apiInstance.delete(`/api/uploads/${uploadId}`);
    return response.data;
  },

  updateUpload: async (uploadId: number, data: any) => {
    const response = await apiInstance.put(`/api/uploads/${uploadId}`, data);
    return response.data;
  },
};

// Test APIs
export const testAPI = {
  createInstantTest: async (videoIds: number[]) => {
    const response = await apiInstance.post('/api/tests/instant', {
      test_type: 'instant',
      video_ids: videoIds,
    });
    return response.data;
  },

  createFullTest: async (videoIds: number[]) => {
    const response = await apiInstance.post('/api/tests/full', {
      test_type: 'full',
      video_ids: videoIds,
    });
    return response.data;
  },

  getTestHistory: async () => {
    const response = await apiInstance.get('/api/tests/history');
    return response.data;
  },
};

// Profile APIs
export const profileAPI = {
  getProfile: async () => {
    const response = await apiInstance.get('/api/auth/profile');
    return response.data;
  },
};
