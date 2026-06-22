import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Box, Typography, TextField, Button, Chip, Alert } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import { login, saveSession } from "../api/auth";

const roleConfig = {
  patient: {
    label: "?????",
    icon: <PersonIcon sx={{ fontSize: 16 }} />,
    color: "#0ca678",
    heading: "???? ???",
    subtitle: "????? ??????? ??? ????? ??????? ??????? ???.",
    redirect: "/dashboard",
  },
  therapist: {
    label: "????",
    icon: <LocalHospitalIcon sx={{ fontSize: 16 }} />,
    color: "#7048e8",
    heading: "???? ???",
    subtitle: "????? ??????? ?????? ???????.",
    redirect: "/patients",
  },
};

export default function LoginPage() {
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
      setError("?????? ?????? ??????");
      return;
    }
    setSubmitting(true);
    try {
      const result = await login(email, password);
      saveSession(result);
      navigate(result.role === "patient" ? "/dashboard" : "/patients");
    } catch (err) {
      setError(err instanceof Error ? err.message : "??????? ?????");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 420, p: 4 }}>
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
          placeholder="????? ??????"
          autoComplete="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <TextField
          type="password"
          placeholder="?????"
          autoComplete="current-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <Box sx={{ textAlign: "left" }}>
          <Typography
            component="a"
            href="#"
            sx={{ fontSize: 13, color: config.color, fontWeight: 500, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
          >
            ????? ?????
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
          {submitting ? "?????…" : "???????"}
        </Button>
      </Box>

      <Typography sx={{ textAlign: "center", mt: 2, fontSize: 14, color: "text.secondary" }}>
        ??? ?? ??????{" "}
        <Typography
          component={Link}
          to={`/register/${role}`}
          sx={{ color: config.color, fontWeight: 600, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
        >
          ?????
        </Typography>
      </Typography>

      <Typography sx={{ textAlign: "center", mt: 1.5, fontSize: 13, color: "text.secondary" }}>
        <Typography
          component={Link}
          to="/login"
          sx={{ color: "text.secondary", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
        >
          ? ???? ?????
        </Typography>
      </Typography>
    </Box>
  );
}
