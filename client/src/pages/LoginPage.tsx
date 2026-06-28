import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Box, Typography, TextField, Button, Chip, Alert } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import { login, saveSession } from "../api/auth";
import { homeForRole } from "../components/RequireRole";

const roleConfig = {
  patient: {
    label: "מטופל",
    icon: <PersonIcon sx={{ fontSize: 16 }} />,
    color: "#0ca678",
    heading: "ברוך הבא",
    subtitle: "התחבר לחשבונך כדי לצפות ברשומות הבריאות שלך.",
    redirect: "/dashboard",
  },
  therapist: {
    label: "רופא",
    icon: <MedicalServicesIcon sx={{ fontSize: 16 }} />,
    color: "#7048e8",
    heading: "ברוך הבא",
    subtitle: "התחבר לחשבונך לניהול מטופלים.",
    redirect: "/patients",
  },
};

export const LoginPage: React.FC = () => {
  const { role } = useParams<{ role: string }>();
  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.patient;
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("נדרשים אימייל וסיסמה");
      return;
    }
    setSubmitting(true);
    try {
      const result = await login(email, password);
      if (role === "therapist" && result.role !== "doctor") {
        setError("אין לך הרשאות מטפל");
        return;
      }
      if (role === "patient" && result.role !== "patient") {
        setError("אין לך הרשאות מטופל");
        return;
      }
      saveSession(result);
      navigate(homeForRole(result.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "התחברות נכשלה");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 420, p: 4, direction: "rtl", textAlign: "right" }}>
      <Chip
        icon={config.icon}
        label={config.label}
        size="small"
        sx={{
          mb: 3,
          fontWeight: 600,
          bgcolor: `${config.color}14`,
          color: config.color,
          border: `1px solid ${config.color}30`,
          direction: "ltr",
          "& .MuiChip-icon": { color: config.color },
        }}
      />

      <Typography variant="h5" sx={{ fontWeight: 700, color: "#1a1a2e", mb: 0.5 }}>
        {config.heading}
      </Typography>
      <Typography sx={{ fontSize: 14, color: "text.secondary", mb: 2.5 }}>
        {config.subtitle}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <TextField
          type="email"
          name="email"
          placeholder="כתובת אימייל"
          autoComplete="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <TextField
          type="password"
          name="password"
          placeholder="סיסמה"
          autoComplete="current-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <Box sx={{ textAlign: "right" }}>
          <Typography
            component="a"
            href="#"
            sx={{ fontSize: 13, color: config.color, fontWeight: 500, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
          >
            שכחתי סיסמה
          </Typography>
        </Box>
        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={submitting}
          sx={{ mt: 0.5, py: 1.4, fontSize: 16, bgcolor: config.color, "&:hover": { bgcolor: config.color, filter: "brightness(0.9)" } }}
        >
          {submitting ? "מתחבר…" : "התחברות"}
        </Button>
      </Box>

      <Typography sx={{ textAlign: "center", mt: 2, fontSize: 14, color: "text.secondary" }}>
        אין לך חשבון?{" "}
        <Typography
          component={Link}
          to={`/register/${role}`}
          sx={{ color: config.color, fontWeight: 600, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
        >
          הרשמה
        </Typography>
      </Typography>

      <Typography sx={{ textAlign: "center", mt: 1.5, fontSize: 13, color: "text.secondary" }}>
        <Typography
          component={Link}
          to="/login"
          sx={{ color: "text.secondary", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
        >
          החלף תפקיד ↩
        </Typography>
      </Typography>
    </Box>
  );
};

export default LoginPage;
