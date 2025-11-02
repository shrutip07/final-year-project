import React, { useEffect, useState } from "react";
import axios from "axios";

const Notifications = ({ title }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/principal/notifications",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotifications(res.data);
    } catch (error) {
      console.log("Error loading notifications", error);
    }
  };

  return (
    <div className="container p-4">
      <h2 className="font-bold mb-3">{title}</h2>

      {notifications.length === 0 ? (
        <p>No notifications found</p>
      ) : (
        notifications.map((note) => (
          <div key={note.id} className="p-3 mb-3 bg-white shadow rounded">
            <h4 className="font-semibold">{note.title}</h4>
            <p>{note.message}</p>
            <small className="text-gray-500">
              {new Date(note.created_at).toLocaleString()}
            </small>
          </div>
        ))
      )}
    </div>
  );
};

export default Notifications;
