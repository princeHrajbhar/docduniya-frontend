import { RoleChooser } from "@/features/auth/components/RoleChooser";

export const metadata = { title: "Create an account – DocDuniya" };

export default function ChooseSignupPage() {
  return (
    <div className="w-full max-w-2xl rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-9">
      <RoleChooser mode="signup" />
    </div>
  );
}
