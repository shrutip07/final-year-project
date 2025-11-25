import React from "react";
import Notifications from "../Notifications";
import ChatWidget from "../../components/ChatWidget";
import "./Dashboard.scss";

const TeacherNotificationsPage = () => {
  return (
    <div className="teacher-notifications-page">
      <div className="teacher-main-content">
        <Notifications title="Teacher Notifications" />
      </div>
      <ChatWidget />
    </div>
  );
};

export default TeacherNotificationsPage;
