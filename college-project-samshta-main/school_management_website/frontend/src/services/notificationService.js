import axiosInstance from '../api/axiosInstance';

export const notificationService = {
  async getPrincipalNotifications() {
    try {
      const response = await axiosInstance.get('/api/notifications', {
        params: { role: 'principal' }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
    }
  },

  async markAsRead(notificationId) {
    try {
      const response = await axiosInstance.put(`/api/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to mark notification as read');
    }
  }
};