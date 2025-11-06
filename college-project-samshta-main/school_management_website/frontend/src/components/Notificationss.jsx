import React, { useEffect, useState } from "react";
import { getNotifications, markAsRead } from "../api/notificationApi";
import { Bell } from "lucide-react"; // install if not: npm install lucide-react

const Notifications = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (userId) fetchNotifications();
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications(userId);
      setNotifications(data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const handleMarkRead = async (id) => {
    await markAsRead(id);
    fetchNotifications();
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="relative">
        <Bell size={22} />
        {notifications.some(n => n.status === "unread") && (
          <span className="absolute top-0 right-0 bg-red-500 rounded-full w-2 h-2"></span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-xl border z-10">
          <div className="p-3 font-semibold border-b">Notifications</div>
          {notifications.length === 0 ? (
            <div className="p-3 text-gray-500 text-sm">No notifications</div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                className={`p-3 cursor-pointer hover:bg-gray-100 ${
                  n.status === "unread" ? "font-semibold" : ""
                }`}
                onClick={() => handleMarkRead(n.id)}
              >
                {n.content}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
