import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Chip,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import BadgeIcon from "@mui/icons-material/Badge";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import InputAdornment from "@mui/material/InputAdornment";

const roleConfig = {
  patient: {
    label: "Patient",
    hebrewLabel: "מטופל",
    icon: <PersonIcon sx={{ fontSize: 16 }} />,
    color: "#0ca678",
    heading: "Create Patient Account",
    subtitle: "Start managing your health records in one place.",
    fields: ["name", "id", "email", "password"],
  },
  therapist: {
    label: "Therapist",
    hebrewLabel: "מטפל",
    icon: <LocalHospitalIcon sx={{ fontSize: 16 }} />,
    color: "#7048e8",
    heading: "Create Therapist Account",
    subtitle: "Set up your practice and start managing patients.",
    fields: ["name", "license", "email", "password"],
  },
};

export default function RegisterPage() {
  const { role } = useParams<{ role: string }>();
  const config =
    roleConfig[role as keyof typeof roleConfig] || roleConfig.patient;
  const [agreed, setAgreed] = useState(false);

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
        onSubmit={(e) => e.preventDefault()}
        sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
      >
        <TextField
          placeholder="Full Name"
          autoComplete="name"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon sx={{ color: "#adb5bd", fontSize: 18 }} />
                </InputAdornment>
              ),
            },
          }}
        />

        {role === "therapist" ? (
          <TextField
            placeholder="License Number (מספר רישיון)"
            autoComplete="off"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeIcon sx={{ color: "#adb5bd", fontSize: 18 }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        ) : (
          <TextField
            placeholder="ID Number (תעודת זהות)"
            autoComplete="off"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeIcon sx={{ color: "#adb5bd", fontSize: 18 }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        )}

        <TextField
          type="email"
          placeholder="Email Address"
          autoComplete="email"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: "#adb5bd", fontSize: 18 }} />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          type="password"
          placeholder="Password"
          autoComplete="new-password"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: "#adb5bd", fontSize: 18 }} />
                </InputAdornment>
              ),
            },
          }}
        />

        {role === "therapist" && (
          <TextField placeholder="Specialization (התמחות)" autoComplete="off" />
        )}

        <FormControlLabel
          control={
            <Checkbox
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              size="small"
              sx={{
                color: config.color,
                "&.Mui-checked": { color: config.color },
              }}
            />
          }
          label={
            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
              I agree to the{" "}
              <Typography
                component="a"
                href="#"
                sx={{
                  fontSize: 13,
                  color: config.color,
                  fontWeight: 600,
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Terms
              </Typography>{" "}
              and{" "}
              <Typography
                component="a"
                href="#"
                sx={{
                  fontSize: 13,
                  color: config.color,
                  fontWeight: 600,
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Privacy Policy
              </Typography>
            </Typography>
          }
        />

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
          Create Account
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
        Already have an account?{" "}
        <Typography
          component={Link}
          to={`/login/${role}`}
          sx={{
            color: config.color,
            fontWeight: 600,
            textDecoration: "none",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Sign In
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
          to="/register"
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
