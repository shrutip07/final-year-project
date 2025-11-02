import axios from "axios";

const API_URL = "http://localhost:5000/api/notifications";

export const getNotifications = async (recipientId) => {
  const res = await axios.get(`${API_URL}/${recipientId}`);
  return res.data;
};

export const addNotification = async (data) => {
  const res = await axios.post(API_URL, data);
  return res.data;
};

export const markAsRead = async (notificationId) => {
  const res = await axios.put(`${API_URL}/mark-read/${notificationId}`);
  return res.data;
};
