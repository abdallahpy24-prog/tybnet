export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-black text-navy">{title}</h1>
      {description ? <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p> : null}
    </div>
  );
}
