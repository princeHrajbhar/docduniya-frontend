import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-bold text-xl">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white text-lg">
        ✚
      </span>
      <span>
        Doc<span className="text-brand-600">Duniya</span>
      </span>
    </Link>
  );
}
