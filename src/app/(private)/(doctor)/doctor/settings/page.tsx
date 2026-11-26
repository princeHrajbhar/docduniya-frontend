import { AccountSecurity } from "@/features/account/AccountSecurity";

export const metadata = { title: "Security – DocDuniya" };

export default function DoctorSettingsPage() {
  return <AccountSecurity role="doctor" />;
}
