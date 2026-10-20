import type { StaffAttendanceStatus } from "../types/staff";
import {
  CalendarMinus,
  CircleCheck,
  CircleX,
  Clock3,
  MoonStar,
  Sparkles,
  Timer,
  type LucideIcon,
} from "lucide-react";

export const STAFF_ATTENDANCE_STATUS_STYLES: Record<
  StaffAttendanceStatus,
  {
    label: string;
    badge: string;
    tile: string;
    value: string;
    icon: LucideIcon;
  }
> = {
  PRESENT: {
    label: "Present",
    icon: CircleCheck,
    badge:
      "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300",
    tile: "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/40",
    value: "text-emerald-800 dark:text-emerald-300",
  },
  ABSENT: {
    label: "Absent",
    icon: CircleX,
    badge:
      "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300",
    tile: "border-rose-200 bg-rose-50/70 dark:border-rose-900 dark:bg-rose-950/40",
    value: "text-rose-800 dark:text-rose-300",
  },
  HALF_DAY: {
    label: "Half day",
    icon: Clock3,
    badge:
      "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-300",
    tile: "border-amber-200 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/40",
    value: "text-amber-800 dark:text-amber-300",
  },
  NIGHT_SHIFT: {
    label: "Night shift",
    icon: MoonStar,
    badge:
      "border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300",
    tile: "border-indigo-200 bg-indigo-50/70 dark:border-indigo-900 dark:bg-indigo-950/40",
    value: "text-indigo-800 dark:text-indigo-300",
  },
  OVERTIME: {
    label: "Overtime",
    icon: Timer,
    badge:
      "border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-900 dark:bg-teal-950/60 dark:text-teal-300",
    tile: "border-teal-200 bg-teal-50/70 dark:border-teal-900 dark:bg-teal-950/40",
    value: "text-teal-800 dark:text-teal-300",
  },
  WEEK_OFF: {
    label: "Week off",
    icon: CalendarMinus,
    badge:
      "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/60 dark:text-sky-300",
    tile: "border-sky-200 bg-sky-50/70 dark:border-sky-900 dark:bg-sky-950/40",
    value: "text-sky-800 dark:text-sky-300",
  },
  FESTIVAL_LEAVE: {
    label: "Festival leave",
    icon: Sparkles,
    badge:
      "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-900 dark:bg-orange-950/60 dark:text-orange-300",
    tile: "border-orange-200 bg-orange-50/70 dark:border-orange-900 dark:bg-orange-950/40",
    value: "text-orange-800 dark:text-orange-300",
  },
};
