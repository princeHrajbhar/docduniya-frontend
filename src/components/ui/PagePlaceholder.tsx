/** Temporary content for sections that haven't been built yet. */
export function PagePlaceholder({ title, description }: { title: string; description: string }) {
  return (
    <div className="mx-auto max-w-7xl">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      <div className="mt-8 grid place-items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
        <p className="font-medium text-slate-700">Coming soon</p>
        <p className="mt-1 text-sm text-slate-500">This section is under construction.</p>
      </div>
    </div>
  );
}
