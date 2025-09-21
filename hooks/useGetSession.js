import { envConfig } from "@/config/env-config";
import axios from "axios";
import { useEffect, useState } from "react";

const useGetSeesion = () => {
  const [user, setUser] = useState();
  const [checking, setChecking] = useState(false);

  const getUser = async () => {
    setChecking(true);
    try {
      const res = await axios.get(envConfig.apiURL + "/auth/get-login-user", {
        withCredentials: true,
      });
      if (res.status === 200) {
        setUser(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  return {
    user,
    checking,
  };
};

export default useGetSeesion;
