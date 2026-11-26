import type { ComponentType, SVGProps } from "react";
import {
  ActivityIcon,
  CalendarIcon,
  ClipboardIcon,
  DashboardIcon,
  IdCardIcon,
  MessageIcon,
  PillIcon,
  SearchIcon,
  SettingsIcon,
  ShieldCheckIcon,
  StarIcon,
  StethoscopeIcon,
  BuildingIcon,
  UserIcon,
  UsersIcon,
} from "@/components/ui/icons";
import type { Role } from "@/types/auth";

export type NavItem = {
  href: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Admin links appear only for accounts holding this platform permission. */
  permission?: string;
};

export type NavSection = { title?: string; items: NavItem[] };

/** Sidebar links for each signed-in area. */
export const navigation: Record<Role, NavSection[]> = {
  patient: [
    {
      items: [
        { href: "/patient/dashboard", label: "Overview", Icon: DashboardIcon },
        { href: "/patient/appointments", label: "Appointments", Icon: CalendarIcon },
        { href: "/doctors", label: "Find a doctor", Icon: SearchIcon },
      ],
    },
    {
      title: "Health",
      items: [
        { href: "/patient/records", label: "Health records", Icon: ClipboardIcon },
        { href: "/patient/prescriptions", label: "Prescriptions", Icon: PillIcon },
      ],
    },
    {
      title: "Account",
      items: [
        { href: "/patient/profile", label: "Profile", Icon: UserIcon },
        { href: "/patient/support", label: "Help & support", Icon: MessageIcon },
        { href: "/patient/settings", label: "Security", Icon: SettingsIcon },
      ],
    },
  ],
  doctor: [
    {
      items: [
        { href: "/doctor/dashboard", label: "Overview", Icon: DashboardIcon },
        { href: "/doctor/appointments", label: "Appointments", Icon: CalendarIcon },
        { href: "/doctor/patients", label: "Patients", Icon: UsersIcon },
      ],
    },
    {
      title: "Practice",
      items: [
        { href: "/doctor/profile", label: "Profile & verification", Icon: ShieldCheckIcon },
        { href: "/doctor/practice", label: "Clinics & invitations", Icon: BuildingIcon },
      ],
    },
    {
      title: "Account",
      items: [{ href: "/doctor/settings", label: "Security", Icon: SettingsIcon }],
    },
  ],
  admin: [
    {
      items: [{ href: "/admin/dashboard", label: "Overview", Icon: DashboardIcon }],
    },
    {
      title: "Verification",
      items: [
        { href: "/admin/doctors", label: "Doctor reviews", Icon: StethoscopeIcon, permission: "doctors.verify" },
        { href: "/admin/providers", label: "Provider reviews", Icon: BuildingIcon, permission: "providers.verify" },
      ],
    },
    {
      title: "Marketplace",
      items: [
        { href: "/admin/reviews", label: "Patient reviews", Icon: StarIcon, permission: "reviews.moderate" },
        { href: "/admin/support", label: "Support tickets", Icon: MessageIcon, permission: "support.manage" },
      ],
    },
    {
      title: "Platform",
      items: [
        { href: "/admin/users", label: "Users", Icon: IdCardIcon, permission: "users.manage" },
        { href: "/admin/operations", label: "Operations", Icon: ActivityIcon, permission: "operations.manage" },
        { href: "/admin/settings", label: "Security", Icon: SettingsIcon },
      ],
    },
  ],
};

/** Links in the public site's navbar and footer. */
export const publicNavigation = [
  { href: "/", label: "Home" },
  { href: "/doctors", label: "Find doctors" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];
