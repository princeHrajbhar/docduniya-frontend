/** Title band at the top of simple public pages. */
export function PageHero({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <section className="bg-gradient-to-br from-brand-50 via-white to-accent-50">
      <div className="mx-auto max-w-4xl px-6 py-16 text-center">
        <p className="text-sm font-semibold tracking-widest text-brand-600 uppercase">{eyebrow}</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
        {sub && <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">{sub}</p>}
      </div>
    </section>
  );
}
