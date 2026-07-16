import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,     
  Google as GoogleIcon,
  Facebook as FacebookIcon,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../apis/authApi";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "../../redux/slices/authSlice"; 
import Lottie from "lottie-react";
import backgroundAnimation from "../../assets/animations/background-animation.json";
import { Typewriter } from "react-simple-typewriter";

const LoginPage = () => {
  const [input, setInput] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (!user) return;

    if (user.role === "admin") {
      navigate("/admin-dashboard", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await loginUser({
        email: input.email,
        password: input.password,
      });

      const user = res?.data?.user;

      dispatch(
        loginSuccess(user)
      );

    } catch (error) {
      setError(error.response?.data?.message || "Invalid credentials. Try again.");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/google`;
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: {
          xs: "center",
          md: "flex-start",
        },
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        px: {
          xs: 2,
          md: 0,
        },
      }}
    >

      {!isMobile ? (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: -1,
            overflow: "hidden",
          }}
        >
          <Lottie animationData={backgroundAnimation} loop autoPlay />
        </Box>
      ) : (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: -1,
            background: `
              radial-gradient(circle at top right, rgba(124,58,237,0.35) 0%, transparent 35%),
              radial-gradient(circle at bottom left, rgba(37,99,235,0.25) 0%, transparent 35%),
              linear-gradient(135deg, #0F172A 0%, #111827 50%, #1E1B4B 100%)
            `,
          }}
        />
      )}

      <Typography
        variant="h4"
        sx={{
          position: "absolute",
          display: {
            xs: "none",
            md: "block",
          },
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
          width: {
            xs: "100%",
            sm: "400px",
          },
          maxWidth: "400px",
          p: 4,
          background: "rgba(255,255,255,0.1)",
          backdropFilter: "blur(10px)",
          borderRadius: "20px",
          boxShadow: "0px 4px 30px rgba(110,30,255,0.5)",
          border: "1px solid rgba(255,255,255,0.2)",
          textAlign: "center",
          ml: {
            md: "10%",
          },
          mt: {
            xs: 0,
            md: "5%",
          },
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
            type={showPassword ? "text" : "password"}
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
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? (
                      <VisibilityOff sx={{ color: "#ffffff" }} />
                    ) : (
                      <Visibility sx={{ color: "#ffffff" }} />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
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
