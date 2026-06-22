import { Link, useNavigate, useParams } from "react-router-dom";
import { Box, Typography, TextField, Button, Chip } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";

const roleConfig = {
  patient: {
    label: "Patient",
    hebrewLabel: "מטופל",
    icon: <PersonIcon sx={{ fontSize: 16 }} />,
    color: "#0ca678",
    heading: "Welcome Back",
    subtitle: "Sign in to access your health records and appointments.",
    redirect: "/dashboard",
  },
  therapist: {
    label: "Therapist",
    hebrewLabel: "מטפל",
    icon: <LocalHospitalIcon sx={{ fontSize: 16 }} />,
    color: "#7048e8",
    heading: "Welcome Back",
    subtitle: "Sign in to manage your patients and practice.",
    redirect: "/patients",
  },
};

export default function LoginPage() {
  const { role } = useParams<{ role: string }>();
  const config =
    roleConfig[role as keyof typeof roleConfig] || roleConfig.patient;
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("role", role === "therapist" ? "doctor" : "patient");
    navigate(config.redirect);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 420, p: 4 }}>
      <Chip
        icon={config.icon}
        label={`${config.label} · ${config.hebrewLabel}`}
        size="small"
        sx={{
          mb: 3,
          fontWeight: 600,
          bgcolor: `${config.color}14`,
          color: config.color,
          border: `1px solid ${config.color}30`,
          "& .MuiChip-icon": { color: config.color },
        }}
      />

      <Typography
        variant="h5"
        sx={{ fontWeight: 700, color: "#1a1a2e", mb: 0.5 }}
      >
        {config.heading}
      </Typography>
      <Typography sx={{ fontSize: 14, color: "text.secondary", mb: 2.5 }}>
        {config.subtitle}
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
      >
        <TextField
          type="email"
          placeholder="Email Address"
          autoComplete="email"
        />
        <TextField
          type="password"
          placeholder="Password"
          autoComplete="current-password"
        />
        <Box sx={{ textAlign: "right" }}>
          <Typography
            component="a"
            href="#"
            sx={{
              fontSize: 13,
              color: config.color,
              fontWeight: 500,
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Forgot password?
          </Typography>
        </Box>
        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          sx={{
            mt: 0.5,
            py: 1.4,
            fontSize: 16,
            bgcolor: config.color,
            "&:hover": { bgcolor: config.color, filter: "brightness(0.9)" },
          }}
        >
          Sign In
        </Button>
      </Box>

      <Typography
        sx={{
          textAlign: "center",
          mt: 2,
          fontSize: 14,
          color: "text.secondary",
        }}
      >
        Don't have an account?{" "}
        <Typography
          component={Link}
          to={`/register/${role}`}
          sx={{
            color: config.color,
            fontWeight: 600,
            textDecoration: "none",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Sign Up
        </Typography>
      </Typography>

      <Typography
        sx={{
          textAlign: "center",
          mt: 1.5,
          fontSize: 13,
          color: "text.secondary",
        }}
      >
        <Typography
          component={Link}
          to="/login"
          sx={{
            color: "text.secondary",
            textDecoration: "none",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          ← Switch role
        </Typography>
      </Typography>
    </Box>
  );
}
