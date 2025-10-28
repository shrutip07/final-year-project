// import React, { createContext, useState } from "react";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);

//   return (
//     <AuthContext.Provider value={{ user, setUser }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export default AuthContext;


import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);

  const setAuthData = (token, userInfo) => {
    setAccessToken(token);
    setUser(userInfo);
  };


  // try refresh on mount


  useEffect(() => {
    const refresh = async () => {
      try {
//         const res = await axios.post(
//   "http://localhost:5000/api/refresh-token",
//   {},
//   { withCredentials: true }
// );
      const res = await axios.post(
        "/api/refresh-token",   // ✅ no localhost:4000
        {},
        { withCredentials: true }
      );
        setAuthData(res.data.accessToken, res.data.user);
      } catch {}
    };
    refresh();
  }, []);

  const logout = async () => {
    try {
  //     await axios.post(
  //   "http://localhost:5000/api/logout",
  //   {},
  //   { withCredentials: true }
  // );
      await axios.post(
      "/api/logout",   // ✅ no localhost:4000
      {},
      { withCredentials: true }
    );


    } catch {}
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ accessToken, user, setAuthData, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;