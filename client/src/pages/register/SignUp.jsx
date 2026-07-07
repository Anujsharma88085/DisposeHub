import { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Paper,
  Divider,
  Box,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import {
  Visibility,
  VisibilityOff,     
  Google as GoogleIcon,
  Facebook as FacebookIcon,
} from "@mui/icons-material";

import { signupUser } from "../../apis/authApi";
import Lottie from "lottie-react";
import backgroundAnimation from "../../assets/animations/background-animation.json";
import { Typewriter } from "react-simple-typewriter";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../redux/slices/authSlice";
import {connectSocket} from "../../socket/socket"

const SignupPage = () => {
  const [input, setInput] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
    vehicleNumber: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrors({
      email: "",
      password: "",
      general: "",
    });

    if (input.password !== input.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        password: "Passwords do not match",
      }));
      return;
    }

    try {
      const res = await signupUser({
        name: input.name,
        email: input.email,
        password: input.password,
        passwordConfirm: input.confirmPassword,
        role: input.role,
        vehicleNumber: input.role === "driver" ? input.vehicleNumber : undefined,
      });

      const user = res.data.user;
      dispatch(
        loginSuccess({
          name: user.name,
          email: user.email,
          role: user.role,
          vehicleNumber: user.vehicleNumber || null,
          avatar: user.avatar || "/default-avatar.png",
        })
      );
      connectSocket();
      navigate("/dashboard");
    } catch (err) {
        const field = err.response?.data?.field;
        const message =
          err.response?.data?.message || "Something went wrong.";

        if (field) {
          setErrors((prev) => ({
            ...prev,
            [field]: message,
          }));
        } else {
          setErrors((prev) => ({
            ...prev,
            general: message,
          }));
        }
      }
  };

  const handleGoogleSignup = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/google`;
  };


  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
            justifyContent: {
          xs: "center",
          md: "flex-start",
        },
        position: "relative",
        overflowY: "auto",
        overflowX: "hidden",
        px: 2,
        py: 4,
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
          top: "5%",
          left: "10%",
          fontWeight: "bold",
          color: "#ffffff",
          textShadow: "0px 0px 10px rgba(255, 255, 255, 0.8)",
        }}
      >
        <Typewriter
          words={["Hello there! Sign Up Now"]}
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
          width: "500px",
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
          Create Your Account
        </Typography>

        <form onSubmit={handleSignup} style={{ width: "100%" }}>
          <TextField
            fullWidth
            label="Name"
            variant="outlined"
            margin="normal"
            value={input.name}
            onChange={(e) => setInput({ ...input, name: e.target.value })}
            required
            sx={inputStyles}
          />

          <TextField
            fullWidth
            label="Email"
            type="email"
            variant="outlined"
            margin="normal"
            value={input.email}
            onChange={(e) => {
              setInput({ ...input, email: e.target.value });

              setErrors((prev) => ({
                ...prev,
                email: "",
              }));
            }}
            required
            error={Boolean(errors.email)}
            helperText={errors.email}
            sx={inputStyles}
          />

          <FormControl fullWidth margin="normal" sx={inputStyles}>
            <InputLabel id="role-select-label" sx={{ color: "#ffffff" }}>
              Role
            </InputLabel>
            <Select
              labelId="role-select-label"
              value={input.role}
              onChange={(e) => setInput({ ...input, role: e.target.value })}
              label="Role"
              sx={{ color: "#ffffff" }}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="driver">Driver</MenuItem>
            </Select>
          </FormControl>

          {input.role === "driver" && (
            <TextField
              fullWidth
              label="Vehicle Number"
              variant="outlined"
              margin="normal"
              value={input.vehicleNumber}
              onChange={(e) =>
                setInput({ ...input, vehicleNumber: e.target.value })
              }
              required
              sx={inputStyles}
            />
          )}

          <Box sx={{ display: "flex", gap: "1rem", width: "100%" }}>
            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              margin="normal"
              value={input.password}
              onChange={(e) => setInput({ ...input, password: e.target.value })}
              required
              sx={{ ...inputStyles, flex: 1 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
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
            <TextField
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              variant="outlined"
              margin="normal"
              value={input.confirmPassword}
              onChange={(e) => {
                setInput({ ...input, confirmPassword: e.target.value });

                setErrors((prev) => ({
                  ...prev,
                  password: "",
                }));
              }}
              error={Boolean(errors.password)}
              helperText={errors.password}
              required
              sx={{ ...inputStyles, flex: 1 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      edge="end"
                    >
                      {showConfirmPassword ? (
                        <VisibilityOff sx={{ color: "#ffffff" }} />
                      ) : (
                        <Visibility sx={{ color: "#ffffff" }} />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {errors.general && (
            <Typography color="error" sx={{ mt: 1 }}>
              {errors.general}
            </Typography>
          )}

          <Button fullWidth variant="contained" type="submit" sx={buttonStyles}>
            Sign Up
          </Button>
        </form>

        <Divider sx={{ my: 3, borderColor: "#ffffff" }}>OR</Divider>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<GoogleIcon />}
          sx={socialButtonStyles}
          onClick={handleGoogleSignup}
        >
          Continue with Google
        </Button>

        <Button
          disabled
          fullWidth
          variant="outlined"
          startIcon={<FacebookIcon />}
          sx={socialButtonStyles}
        >
          Continue with Facebook
        </Button>

        <Typography variant="body2" sx={{ mt: 2, color: "#ffffff" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#6E1EFF", fontWeight: "bold" }}>
            Login here
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

const inputStyles = {
  "& label.Mui-focused": { color: "#ffffff" },
  "& .MuiOutlinedInput-root": {
    "& fieldset": { borderColor: "#6E1EFF" },
    "&:hover fieldset": { borderColor: "#ffffff" },
    "&.Mui-focused fieldset": { borderColor: "#ffffff" },
  },
  "& .MuiInputBase-input": { color: "#ffffff" },
};

const buttonStyles = {
  mt: 2,
  backgroundColor: "#6E1EFF",
  color: "#ffffff",
  "&:hover": { backgroundColor: "#5714D9" },
};

const socialButtonStyles = {
  mb: 2,
  borderColor: "#ffffff",
  color: "#ffffff",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "#ffffff",
  },
};

export default SignupPage;
