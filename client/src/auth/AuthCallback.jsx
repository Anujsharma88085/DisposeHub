import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMe } from "../apis/userApi";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      const data = await getMe();
      const user = data?.data?.data;

      if (!user) {
        navigate("/login");
        return;
      }

      if (user.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/dashboard");
      }
    };

    handleAuth();
  }, []);

  return <p>Signing you in...</p>;
};

export default AuthCallback;
