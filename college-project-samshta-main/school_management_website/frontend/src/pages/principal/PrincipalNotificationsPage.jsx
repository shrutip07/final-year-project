import React from "react";
import Notifications from "../Notifications";

const PrincipalNotificationsPage = () => {
  return (
    <div className="notifications-page section-card">
      {/* The outer PageHeader is already shown in the principal layout */}
      <Notifications title="Principal Notifications" />
    </div>
  );
};

export default PrincipalNotificationsPage;
