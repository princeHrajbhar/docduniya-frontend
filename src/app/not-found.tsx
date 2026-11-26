import { SearchIcon } from "@/components/ui/icons";
import { ButtonLink } from "@/components/ui/primitives";

export const metadata = { title: "Page not found – DocDuniya" };

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
        <SearchIcon className="h-7 w-7" />
      </span>
      <h1 className="mt-5 text-2xl font-bold text-slate-900">We couldn&apos;t find that page</h1>
      <p className="mt-2 text-sm text-slate-500">The link may be old, or the doctor may no longer be listed.</p>
      <div className="mt-6 flex gap-2">
        <ButtonLink href="/doctors">Find a doctor</ButtonLink>
        <ButtonLink href="/" variant="secondary">
          Home
        </ButtonLink>
      </div>
    </div>
  );
}
