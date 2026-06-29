import React from "react";
import { Avatar, Box, Stack, Typography } from "@mui/material";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "בוקר טוב";
  if (h < 18) return "צהריים טובים";
  return "ערב טוב";
}

interface DashboardHeaderProps {
  userName: string;
  userInitials: string;
  firstName: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userName,
  userInitials,
  firstName,
}) => {
  return (
    <Box
      component="header"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 4,
        height: 68,
        borderBottom: "1px solid #e9ecef",
        bgcolor: "#fff",
        flexShrink: 0,
      }}
    >
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a2e" }}>
          {getGreeting()}, {firstName} 👋
        </Typography>
        <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
          זהו סיכום הבריאות שלך.
        </Typography>
      </Box>

      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
        <Box sx={{ textAlign: "right" }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e" }}>
            {userName}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            דף המטופל
          </Typography>
        </Box>
        <Avatar
          sx={{
            bgcolor: "primary.main",
            width: 38,
            height: 38,
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {userInitials}
        </Avatar>
      </Stack>
    </Box>
  );
};
