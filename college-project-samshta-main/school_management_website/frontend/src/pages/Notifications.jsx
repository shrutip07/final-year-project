

// import React, { useEffect, useState } from "react";
// import axiosInstance from "../api/axiosInstance";
// import { useTranslation } from "react-i18next";

// const Notifications = ({ title }) => {
//   const { t } = useTranslation();
//   const [notifications, setNotifications] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchNotifications = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         console.log('Auth token:', token ? 'Present' : 'Missing');

//         const res = await axiosInstance.get("/notifications", {
//           params: { role: 'principal' }
//         });
        
//         console.log("API Response:", res);

//         if (res.data) {
//           const sortedNotifications = res.data.sort((a, b) =>
//             new Date(b.created_at) - new Date(a.created_at)
//           );
//           setNotifications(sortedNotifications);
//         }
//       } catch (error) {
//         console.error("Error details:", {
//           message: error.message,
//           response: error.response,
//           status: error.response?.status
//         });
//         const errorMessage = error.response?.data?.message 
//           || error.message 
//           || "Failed to load notifications";
//         setError(errorMessage);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchNotifications();
//   }, []);

//   const markAsRead = async (notificationId) => {
//     try {
//       await axiosInstance.put(`/notifications/${notificationId}/read`);
//       setNotifications((prev) =>
//         prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
//       );
//     } catch (error) {
//       console.error("Error marking notification as read:", error);
//     }
//   };

//   // --- Change: Render URLs as clickable links ---
//   const renderMessage = (message) => {
//     // Only split by space and check prefix; safe/simple approach for form URLs
//     return (
//       <span>
//         {message.split(" ").map((word, idx) =>
//           word.startsWith("http://") || word.startsWith("https://") ? (
//             <a key={idx} href={word} target="_blank" rel="noopener noreferrer">{word}</a>
//           ) : (
//             word + " "
//           )
//         )}
//       </span>
//     );
//   };

//   if (loading) {
//     return (
//       <div className="d-flex justify-content-center p-4">
//         <div className="spinner-border text-primary" role="status">
//           <span className="visually-hidden">Loading...</span>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="alert alert-danger m-4">
//         <i className="bi bi-exclamation-triangle-fill me-2"></i>
//         {error}
//       </div>
//     );
//   }

//   return (
//     <div className="container p-4">
//       <h2 className="mb-4">{title}</h2>
//       <div className="notifications-list">
//         {notifications.length === 0 ? (
//           <div className="alert alert-info">
//             <i className="bi bi-info-circle me-2"></i>
//             {t("no_notifications")}
//           </div>
//         ) : (
//           notifications.map((note) => (
//             <div
//               key={note.id}
//               className={`card mb-3 shadow-sm ${!note.is_read ? "border-primary" : ""}`}
//               style={{ cursor: "pointer" }}
//               onClick={() => markAsRead(note.id)}
//             >
//               <div className="card-body">
//                 <div className="d-flex justify-content-between align-items-center">
//                   <h5 className="card-title mb-0">{note.title}</h5>
//                   {!note.is_read && <span className="badge bg-primary">New</span>}
//                 </div>
//                 <p className="card-text mt-2 mb-1">{renderMessage(note.message)}</p>
//                 <small className="text-muted">
//                   <i className="bi bi-clock me-1"></i>
//                   {new Date(note.created_at).toLocaleString()}
//                 </small>
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default Notifications;
import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom"; // <-- ADD THIS

const Notifications = ({ title }) => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Auth token:', token ? 'Present' : 'Missing');

        const res = await axiosInstance.get("/notifications", {
          params: { role: 'principal' }
        });

        console.log("API Response:", res);

        if (res.data) {
          const sortedNotifications = res.data.sort((a, b) =>
            new Date(b.created_at) - new Date(a.created_at)
          );
          setNotifications(sortedNotifications);
        }
      } catch (error) {
        console.error("Error details:", {
          message: error.message,
          response: error.response,
          status: error.response?.status
        });
        const errorMessage = error.response?.data?.message
          || error.message
          || "Failed to load notifications";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await axiosInstance.put(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Updated: URL detection to use <Link> for internal form links, <a> for others
  const renderMessage = (message) => (
    <span>
      {message.split(" ").map((word, idx) => {
        // If it's a forms link on this domain, use <Link>
        if (word.startsWith("http://localhost:3000/forms/")) {
          const path = word.replace("http://localhost:3000", "");
          return <Link key={idx} to={path}>{word}</Link>;
        }
        // Other URLs as normal links (new tab)
        if (word.startsWith("http://") || word.startsWith("https://")) {
          return <a key={idx} href={word} target="_blank" rel="noopener noreferrer">{word}</a>;
        }
        return word + " ";
      })}
    </span>
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-4">
        <i className="bi bi-exclamation-triangle-fill me-2"></i>
        {error}
      </div>
    );
  }

  return (
    <div className="container p-4">
      <h2 className="mb-4">{title}</h2>
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="alert alert-info">
            <i className="bi bi-info-circle me-2"></i>
            {t("no_notifications")}
          </div>
        ) : (
          notifications.map((note) => (
            <div
              key={note.id}
              className={`card mb-3 shadow-sm ${!note.is_read ? "border-primary" : ""}`}
              style={{ cursor: "pointer" }}
              onClick={() => markAsRead(note.id)}
            >
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">{note.title}</h5>
                  {!note.is_read && <span className="badge bg-primary">New</span>}
                </div>
                <p className="card-text mt-2 mb-1">{renderMessage(note.message)}</p>
                <small className="text-muted">
                  <i className="bi bi-clock me-1"></i>
                  {new Date(note.created_at).toLocaleString()}
                </small>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
