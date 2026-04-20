import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Divider,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import {connectSocket} from "../../socket/socket"
import { loginUser } from "../../apis/authApi";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../redux/authSlice"; 
import Lottie from "lottie-react";
import backgroundAnimation from "../../assets/animations/background-animation.json";
import { Typewriter } from "react-simple-typewriter";
import GoogleIcon from "@mui/icons-material/Google";
import FacebookIcon from "@mui/icons-material/Facebook";
import { getMe } from "../../apis/userApi";



const LoginPage = () => {
  const [input, setInput] = useState({ email: "", password: "" });
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchUser = async () => {
    const user = await getMe();

    if (!user) {
      return;
    }

    setRole(user.role);

    if (user.role === "admin") {
      navigate("/admin-dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleChange = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await loginUser({
        email: input.email,
        password: input.password,
      });

      const user = res.data.user;

      dispatch(
        loginSuccess(user)
      );

      connectSocket();

      if (user.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error.message);
      setError(error.response?.data?.message || "Invalid credentials. Try again.");
    }
  };

    const handleGoogleLogin = () => {
      window.location.href = "http://localhost:3000/api/auth/google";
    };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        alignItems: "center",
        justifyContent: "left",
        position: "relative",
        overflow: "hidden",
        margin: 0,
        padding: 0,
      }}
    >

      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1,
        }}
      >
        <Lottie animationData={backgroundAnimation} loop autoPlay />
      </Box>

      <Typography
        variant="h4"
        sx={{
          position: "absolute",
          top: "15%",
          left: "10%",
          fontWeight: "bold",
          color: "#ffffff",
          textShadow: "0px 0px 10px rgba(255, 255, 255, 0.8)",
        }}
      >
        <Typewriter
          words={["Hello there! Login Now"]}
          loop={true}
          cursor
          cursorStyle="|"
          typeSpeed={50}
          deleteSpeed={30}
        />
      </Typography>

      <Paper
        elevation={10}
        sx={{
          width: "400px",
          padding: "2rem",
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          borderRadius: "20px",
          boxShadow: "0px 4px 30px rgba(110, 30, 255, 0.5)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          textAlign: "center",
          marginLeft: "10%",
          marginTop: "5%",
        }}
      >
        <Typography
          variant="h5"
          sx={{ mb: 2, fontWeight: "bold", color: "#ffffff" }}
        >
          Welcome Back
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <form onSubmit={handleLogin} style={{ width: "100%" }}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            variant="outlined"
            margin="normal"
            value={input.email}
            onChange={handleChange}
            required
            sx={{
              "& label.Mui-focused": { color: "#ffffff" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#6E1EFF" },
                "&:hover fieldset": { borderColor: "#ffffff" },
                "&.Mui-focused fieldset": { borderColor: "#ffffff" },
              },
            }}
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            variant="outlined"
            margin="normal"
            value={input.password}
            onChange={handleChange}
            required
            sx={{
              "& label.Mui-focused": { color: "#ffffff" },
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "#6E1EFF" },
                "&:hover fieldset": { borderColor: "#ffffff" },
                "&.Mui-focused fieldset": { borderColor: "#ffffff" },
              },
            }}
          />
          <Button
            fullWidth
            variant="contained"
            type="submit"
            sx={{
              mt: 2,
              backgroundColor: "#6E1EFF",
              color: "#ffffff",
              "&:hover": { backgroundColor: "#5714D9" },
            }}
          >
            Login
          </Button>
          <Typography
            variant="body2"
            sx={{
              textAlign: "right",
              color: "#ffffff",
              cursor: "pointer",
              mt: 1,
            }}
            onClick={() => navigate("/forgot-password")}
          >
            Forgot password?
          </Typography>
        </form>

        <Typography variant="body2" sx={{ mt: 2, color: "#ffffff" }}>
          First time here?{" "}
          <Link
            to="/signup"
            style={{
              color: "#6E1EFF",
              fontWeight: "bold",
              cursor: "pointer",
              textDecoration: "none",
            }}
          >
            Sign up now
          </Link>
        </Typography>

        <Divider sx={{ my: 3, borderColor: "#ffffff" }}>OR</Divider>

        <Button
          fullWidth
          variant="outlined"
          color="inherit"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleLogin}

          sx={{
            mb: 2,
            borderColor: "#ffffff",
            color: "#ffffff",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderColor: "#ffffff",
            },
          }}
        >
          Continue with Google
        </Button>

        <Button disabled
          fullWidth
          variant="outlined"
          color="inherit"
          startIcon={<FacebookIcon />}
          sx={{
            borderColor: "#ffffff",
            color: "#ffffff",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderColor: "#ffffff",
            },
          }}
        >
          Continue with Facebook
        </Button>
      </Paper>
    </Box>
  );
};

export default LoginPage;
