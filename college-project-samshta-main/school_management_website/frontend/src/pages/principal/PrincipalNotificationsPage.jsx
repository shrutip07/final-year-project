import React from "react";
import Notifications from "../Notifications";
import ChatWidget from "../../components/ChatWidget";

const PrincipalNotificationsPage = () => {
  return (
    <>
      <Notifications title="Principal Notifications" />
      <ChatWidget />
    </>
  );
};

export default PrincipalNotificationsPage;
