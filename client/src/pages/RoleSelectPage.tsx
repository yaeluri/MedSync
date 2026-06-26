import React from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Typography, Paper } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";

export const RoleSelectPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isRegister = location.pathname.includes("register");
  const basePath = isRegister ? "/register" : "/login";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
        p: 3,
      }}
    >
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: "14px",
          mb: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 26,
          fontWeight: 800,
          background: "linear-gradient(135deg, #3b5bdb, #5c7cfa)",
          color: "#fff",
        }}
      >
        M
      </Box>
      <Typography
        variant="h4"
        sx={{ fontWeight: 800, color: "#1a1a2e", mb: 0.5, textAlign: "center" }}
      >
        {isRegister ? "יצירת חשבון" : "ברוכים הבאים ל-MedSync"}
      </Typography>
      <Typography
        sx={{
          fontSize: 16,
          color: "text.secondary",
          mb: 5,
          textAlign: "center",
        }}
      >
        {isRegister
          ? "בחרו את התפקיד שלכם להתחלה"
          : "בחרו כיצד ברצונכם להתחבר"}
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 3,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Paper
          onClick={() => navigate(`${basePath}/patient`)}
          elevation={0}
          sx={{
            width: 260,
            p: 4,
            cursor: "pointer",
            borderRadius: "20px",
            border: "2px solid transparent",
            transition: "all 0.25s ease",
            background: "#fff",
            "&:hover": {
              borderColor: "#0ca678",
              transform: "translateY(-4px)",
              boxShadow: "0 12px 40px rgba(12,166,120,0.15)",
            },
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "16px",
              mb: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #0ca678, #38d9a9)",
            }}
          >
            <PersonIcon sx={{ fontSize: 28, color: "#fff" }} />
          </Box>
          <Typography
            sx={{ fontWeight: 700, fontSize: 18, color: "#1a1a2e", mb: 0.5 }}
          >
            מטופל
          </Typography>
          <Typography
            sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.5 }}
          >
            גישה לרשומות הרפואיות שלך, ניהול פגישות ותקשורת עם צוות הטיפול שלך.
          </Typography>
        </Paper>

        <Paper
          onClick={() => navigate(`${basePath}/therapist`)}
          elevation={0}
          sx={{
            width: 260,
            p: 4,
            cursor: "pointer",
            borderRadius: "20px",
            border: "2px solid transparent",
            transition: "all 0.25s ease",
            background: "#fff",
            "&:hover": {
              borderColor: "#7048e8",
              transform: "translateY(-4px)",
              boxShadow: "0 12px 40px rgba(112,72,232,0.15)",
            },
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "16px",
              mb: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #5f3dc4, #7950f2)",
            }}
          >
            <LocalHospitalIcon sx={{ fontSize: 28, color: "#fff" }} />
          </Box>
          <Typography
            sx={{ fontWeight: 700, fontSize: 18, color: "#1a1a2e", mb: 0.5 }}
          >
            רופא
          </Typography>
          <Typography
            sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.5 }}
          >
            ניהול מטופלים, תיעוד ביקורים בסיוע בינה מלאכותית ייעול הפרקטיקה שלך.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default RoleSelectPage;
