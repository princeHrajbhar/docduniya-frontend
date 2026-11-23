import { RoleChooser } from "@/features/auth/components/RoleChooser";

export const metadata = { title: "Sign Up – DocDuniya" };

export default function ChooseRolePage() {
  return (
    <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
      <RoleChooser mode="signup" />
    </div>
  );
}
