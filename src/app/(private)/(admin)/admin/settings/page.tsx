import { AccountSecurity } from "@/features/account/AccountSecurity";

export const metadata = { title: "Security – DocDuniya" };

export default function AdminSettingsPage() {
  return <AccountSecurity role="admin" />;
}
