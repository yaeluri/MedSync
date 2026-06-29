import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Chip,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Stack,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import BadgeIcon from "@mui/icons-material/Badge";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PhoneIcon from "@mui/icons-material/Phone";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import { registerDoctor, registerPatient, saveSession } from "../../api/auth";

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

const STEPS = ["פרטי חשבון", "פרטים אישיים"];

export const RegisterPage: React.FC = () => {
  const { role } = useParams<{ role: string }>();
  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.patient;
  const isTherapist = role === "therapist";
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [fullName, setFullName] = useState("");
  const [idOrLicense, setIdOrLicense] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [hmo, setHmo] = useState("");
  const [address, setAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    setError(null);
    if (!fullName || !email || !password) {
      setError("שם מלא, אימייל וסיסמה הם שדות חובה");
      return;
    }
    setStep(1);
  };

  const handleBack = () => {
    setError(null);
    setStep(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!agreed) {
      setError("יש לאשר את תנאי השימוש ומדיניות הפרטיות");
      return;
    }
    if (isTherapist && !specialization.trim()) {
      setError("התמחות היא שדה חובה");
      return;
    }
    if (!phone.trim()) {
      setError("טלפון הוא שדה חובה");
      return;
    }
    if (!isTherapist && !hmo.trim()) {
      setError("קופת חולים היא שדה חובה");
      return;
    }
    if (!isTherapist && !address.trim()) {
      setError("כתובת היא שדה חובה");
      return;
    }
    setSubmitting(true);
    try {
      const result = isTherapist
        ? await registerDoctor({ role: "doctor", fullName, email, password, licenseNumber: idOrLicense || "TBD", specialization: specialization || "General", phone: phone || undefined, birthDate: birthDate || undefined, gender: gender || undefined })
        : await registerPatient({ role: "patient", fullName, email, password, idNumber: idOrLicense || undefined, address: address || "", hmo: hmo || undefined, phone: phone || undefined, birthDate: birthDate || undefined, gender: gender || undefined });
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

      <Stepper
        activeStep={step}
        alternativeLabel
        dir="ltr"
        sx={{
          mb: 3,
          "& .MuiStepIcon-root.Mui-active": { color: config.color },
          "& .MuiStepIcon-root.Mui-completed": { color: config.color },
          "& .MuiStepLabel-label": { fontSize: 13, mt: 0.5 },
          "& .MuiStepLabel-label.Mui-active": { fontWeight: 700, color: "#1a1a2e" },
        }}
      >
        {STEPS.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
      >
        {step === 0 ? (
          <>
            <TextField required placeholder="שם מלא" autoComplete="name" value={fullName} onChange={e => setFullName(e.target.value)}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: "#adb5bd", fontSize: 18 }} /></InputAdornment> } }} />

            <TextField placeholder={isTherapist ? "מספר רישיון" : "תעודת זהות"} autoComplete="off" value={idOrLicense} onChange={e => setIdOrLicense(e.target.value)}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><BadgeIcon sx={{ color: "#adb5bd", fontSize: 18 }} /></InputAdornment> } }} />

            <TextField required type="email" placeholder="כתובת אימייל" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: "#adb5bd", fontSize: 18 }} /></InputAdornment> } }} />

            <TextField required type="password" placeholder="סיסמה" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: "#adb5bd", fontSize: 18 }} /></InputAdornment> } }} />

            <Button type="button" variant="contained" size="large" fullWidth onClick={handleNext}
              sx={{ mt: 0.5, py: 1.4, fontSize: 16, bgcolor: config.color, "&:hover": { bgcolor: config.color, filter: "brightness(0.9)" } }}>
              המשך
            </Button>
          </>
        ) : (
          <>
            {isTherapist && (
              <TextField required placeholder="התמחות" autoComplete="off" value={specialization} onChange={e => setSpecialization(e.target.value)} />
            )}

            <TextField required placeholder="טלפון" autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ color: "#adb5bd", fontSize: 18 }} /></InputAdornment> } }} />

            <TextField type="date" label="תאריך לידה" value={birthDate} onChange={e => setBirthDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }} />

            <TextField select label="מין" value={gender} onChange={e => setGender(e.target.value)}>
              <MenuItem value="">לא צוין</MenuItem>
              <MenuItem value="male">זכר</MenuItem>
              <MenuItem value="female">נקבה</MenuItem>
              <MenuItem value="other">אחר</MenuItem>
            </TextField>

            {!isTherapist && (
              <>
                <TextField required placeholder="קופת חולים" autoComplete="off" value={hmo} onChange={e => setHmo(e.target.value)} />
                <TextField required placeholder="כתובת" autoComplete="street-address" value={address} onChange={e => setAddress(e.target.value)} />
              </>
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

            <Stack direction="row" sx={{ mt: 0.5, gap: 2 }}>
              <Button type="button" variant="outlined" size="large" onClick={handleBack} disabled={submitting}
                sx={{ py: 1.4, fontSize: 16, borderColor: config.color, color: config.color, "&:hover": { borderColor: config.color } }}>
                חזרה
              </Button>
              <Button type="submit" variant="contained" size="large" fullWidth disabled={submitting}
                sx={{ py: 1.4, fontSize: 16, bgcolor: config.color, "&:hover": { bgcolor: config.color, filter: "brightness(0.9)" } }}>
                {submitting ? "יוצר חשבון…" : "יצירת חשבון"}
              </Button>
            </Stack>
          </>
        )}
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
};

export default RegisterPage;
