import { AccountSecurity } from "@/features/account/AccountSecurity";

export const metadata = { title: "Security – DocDuniya" };

export default function PatientSettingsPage() {
  return <AccountSecurity role="patient" />;
}
