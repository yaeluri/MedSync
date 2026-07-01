import React from 'react';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { VisitSummaryObject } from '../../api/visits';

export type ToastState = { severity: 'success' | 'error' | 'warning'; message: string } | null;
export type DiagnosisItem = { code: string; description: string };
export type MedicineItem = { name: string; dosage: string; frequency: string; duration: string; instructions?: string };
export type PatientInfo = { name: string; phone?: string; idNumber?: string; dob?: string; hmo?: string; bloodType?: string };

export const formatRecordingTime = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

export const SUMMARY_SECTIONS: Array<{ key: keyof VisitSummaryObject; label: string; icon: React.ReactNode; color: string; bg: string }> = [
  { key: 'patientComplaints',      label: 'תלונות המטופל', icon: <FavoriteIcon sx={{ fontSize: 14 }} />,     color: '#e64980', bg: '#fff0f6' },
  { key: 'diagnosis',              label: 'אבחנה',          icon: <MonitorHeartIcon sx={{ fontSize: 14 }} />, color: '#7048e8', bg: '#f3f0ff' },
  { key: 'doctorsRecommendations', label: 'המלצות הרופא',  icon: <TaskAltIcon sx={{ fontSize: 14 }} />,      color: '#2f9e44', bg: '#ebfbee' },
];

export const RTL_TEXT_DIRECTION = { dir: 'rtl' as const, style: { textAlign: 'right' as const } };
