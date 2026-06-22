import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Box, Typography, TextField, Button, FormControlLabel, Checkbox, Chip, Alert } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import BadgeIcon from "@mui/icons-material/Badge";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import InputAdornment from "@mui/material/InputAdornment";
import { registerDoctor, registerPatient, saveSession } from "../api/auth";

const roleConfig = {
  patient: {
    label: "מטופל",
    icon: <PersonIcon sx={{ fontSize: 16 }} />,
    color: "#0ca678",
    heading: "יצירת חשבון מטופל",
    subtitle: "נהל את הרשומות הרפואיות שלך במקום אחד.",
  },
  therapist: {
    label: "רופא",
    icon: <LocalHospitalIcon sx={{ fontSize: 16 }} />,
    color: "#7048e8",
    heading: "יצירת חשבון רופא",
    subtitle: "הגדר את הפרקטיקה שלך ונהל מטופלים.",
  },
};

export default function RegisterPage() {
  const { role } = useParams<{ role: string }>();
  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.patient;
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);
  const [fullName, setFullName] = useState("");
  const [idOrLicense, setIdOrLicense] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!agreed) { setError("יש לאשר את תנאי השימוש ומדיניות הפרטיות"); return; }
    if (!fullName || !email || !password) { setError("שם מלא, אימייל וסיסמה הם שדות חובה"); return; }
    setSubmitting(true);
    try {
      const result = role === "therapist"
        ? await registerDoctor({ fullName, email, password, licenseNumber: idOrLicense || "TBD", specialization: specialization || "General" })
        : await registerPatient({ fullName, email, password, idNumber: idOrLicense || undefined, address: "" });
      saveSession(result);
      navigate(result.role === "patient" ? "/dashboard" : "/patients");
    } catch (err) {
      setError(err instanceof Error ? err.message : "הרשמה נכשלה");
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
        <TextField placeholder="שם מלא" autoComplete="name" value={fullName} onChange={e => setFullName(e.target.value)}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: "#adb5bd", fontSize: 18 }} /></InputAdornment> } }} />

        {role === "therapist" ? (
          <TextField placeholder="מספר רישיון" autoComplete="off" value={idOrLicense} onChange={e => setIdOrLicense(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><BadgeIcon sx={{ color: "#adb5bd", fontSize: 18 }} /></InputAdornment> } }} />
        ) : (
          <TextField placeholder="תעודת זהות" autoComplete="off" value={idOrLicense} onChange={e => setIdOrLicense(e.target.value)}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><BadgeIcon sx={{ color: "#adb5bd", fontSize: 18 }} /></InputAdornment> } }} />
        )}

        <TextField type="email" placeholder="כתובת אימייל" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: "#adb5bd", fontSize: 18 }} /></InputAdornment> } }} />
        <TextField type="password" placeholder="סיסמה" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: "#adb5bd", fontSize: 18 }} /></InputAdornment> } }} />

        {role === "therapist" && (
          <TextField placeholder="התמחות" autoComplete="off" value={specialization} onChange={e => setSpecialization(e.target.value)} />
        )}

        <FormControlLabel
          control={<Checkbox checked={agreed} onChange={e => setAgreed(e.target.checked)} size="small" sx={{ color: config.color, "&.Mui-checked": { color: config.color } }} />}
          label={
            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
              אני מסכים ל<Typography component="a" href="#" sx={{ fontSize: 13, color: config.color, fontWeight: 600, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>תנאי שימוש</Typography>
              {" "}ו<Typography component="a" href="#" sx={{ fontSize: 13, color: config.color, fontWeight: 600, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>מדיניות פרטיות</Typography>
            </Typography>
          }
        />

        <Button type="submit" variant="contained" size="large" fullWidth disabled={submitting}
          sx={{ mt: 0.5, py: 1.4, fontSize: 16, bgcolor: config.color, "&:hover": { bgcolor: config.color, filter: "brightness(0.9)" } }}>
          {submitting ? "יוצר חשבון…" : "יצירת חשבון"}
        </Button>
      </Box>

      <Typography sx={{ textAlign: "center", mt: 2, fontSize: 14, color: "text.secondary" }}>
        כבר יש לך חשבון?{" "}
        <Typography component={Link} to={`/login/${role}`}
          sx={{ color: config.color, fontWeight: 600, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
          התחברות
        </Typography>
      </Typography>

      <Typography sx={{ textAlign: "center", mt: 1.5, fontSize: 13, color: "text.secondary" }}>
        <Typography component={Link} to="/register"
          sx={{ color: "text.secondary", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
          ← החלף תפקיד
        </Typography>
      </Typography>
    </Box>
  );
}
