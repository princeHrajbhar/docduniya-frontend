import { redirect } from "next/navigation";

/** The console itself lives under /admin; signed-out visitors are sent to the portal sign-in. */
export default function AdministratorIndex() {
  redirect("/admin/dashboard");
}
