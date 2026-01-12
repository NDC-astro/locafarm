import api from './api';

export const equipmentService = {
  searchNearby: async (params: {
    latitude: number;
    longitude: number;
    equipmentType?: string;
    radius?: number;
    minPrice?: number;
    maxPrice?: number;
  }) => {
    const response = await api.get('/search', { params: { lat: params.latitude, lng: params.longitude, type: params.equipmentType, radius: params.radius } });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/equipment/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/equipment', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await api.patch(`/equipment/${id}`, data);
    return response.data;
  },

  uploadPhotos: async (id: string, photos: any[]) => {
    const formData = new FormData();
    photos.forEach((photo, index) => {
      formData.append('photos', {
        uri: photo.uri,
        type: 'image/jpeg',
        name: `photo_${index}.jpg`,
      } as any);
    });
    const response = await api.post(`/equipment/${id}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getMyEquipment: async () => {
    const response = await api.get('/equipment/my-equipment');
    return response.data;
  },
};