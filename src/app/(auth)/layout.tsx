import { Logo } from "@/components/Logo";

export default function LoginLayout({ children }: LayoutProps<"/login">) {
  return (
    <div className="flex flex-1 flex-col bg-gradient-to-br from-teal-50 via-white to-sky-50">
      <header className="mx-auto w-full max-w-6xl px-6 py-6">
        <Logo />
      </header>
      <main className="flex flex-1 items-center justify-center px-6 pb-20">
        {children}
      </main>
    </div>
  );
}
