import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const AuthCallback = () => {
  const navigate = useNavigate();

  const { user, authLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (user.role === "admin") {
      navigate("/admin-dashboard", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  }, [user, authLoading, navigate]);

  return <p>Signing you in...</p>;
};

export default AuthCallback;
