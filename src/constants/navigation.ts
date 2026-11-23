import type { ComponentType, SVGProps } from "react";
import {
  CalendarIcon,
  ChartIcon,
  ClipboardIcon,
  DashboardIcon,
  IdCardIcon,
  PillIcon,
  ReceiptIcon,
  SettingsIcon,
  StethoscopeIcon,
  UserIcon,
  UsersIcon,
  VideoIcon,
} from "@/components/ui/icons";
import type { Role } from "@/types/auth";

export type NavItem = {
  href: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

/** Sidebar links for each signed-in area. */
export const navigation: Record<Role, NavItem[]> = {
  patient: [
    { href: "/patient/dashboard", label: "Dashboard", Icon: DashboardIcon },
    { href: "/patient/appointments", label: "Appointments", Icon: CalendarIcon },
    { href: "/patient/records", label: "Health Records", Icon: ClipboardIcon },
    { href: "/patient/prescriptions", label: "Prescriptions", Icon: PillIcon },
    { href: "/patient/profile", label: "Profile", Icon: UserIcon },
  ],
  doctor: [
    { href: "/doctor/dashboard", label: "Dashboard", Icon: DashboardIcon },
    { href: "/doctor/appointments", label: "Appointments", Icon: CalendarIcon },
    { href: "/doctor/patients", label: "Patients", Icon: UsersIcon },
    { href: "/doctor/consultations", label: "Consultations", Icon: VideoIcon },
    { href: "/doctor/prescriptions", label: "Prescriptions", Icon: PillIcon },
  ],
  admin: [
    { href: "/admin/dashboard", label: "Dashboard", Icon: DashboardIcon },
    { href: "/admin/doctors", label: "Doctors", Icon: StethoscopeIcon },
    { href: "/admin/patients", label: "Patients", Icon: UsersIcon },
    { href: "/admin/staff", label: "Staff", Icon: IdCardIcon },
    { href: "/admin/appointments", label: "Appointments", Icon: CalendarIcon },
    { href: "/admin/billing", label: "Billing", Icon: ReceiptIcon },
    { href: "/admin/reports", label: "Reports", Icon: ChartIcon },
    { href: "/admin/settings", label: "Settings", Icon: SettingsIcon },
  ],
};

/** Links in the public site's navbar and footer. */
export const publicNavigation = [
  { href: "/", label: "Home" },
  { href: "/doctors", label: "Doctors" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
  { href: "/privacy-policy", label: "Privacy Policy" },
];
