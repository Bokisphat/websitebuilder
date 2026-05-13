type Props = { primary: string; secondary: string };

export function TemplatePreviewBlock({ primary, secondary }: Props) {
  return (
    <div className="aspect-[4/3] overflow-hidden rounded-xl border border-zinc-300/90 bg-zinc-100 p-2.5 shadow-inner">
      <div className="mb-2 flex h-2 items-center gap-1 rounded bg-white px-1 shadow-sm">
        <span className="h-1 w-1 rounded-full bg-zinc-300" />
        <span className="h-1 w-1 rounded-full bg-zinc-300" />
        <span className="h-1 w-1 rounded-full bg-zinc-300" />
      </div>
      <div
        className="mb-2 h-[28%] min-h-[48px] w-full rounded-lg"
        style={{
          background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
        }}
      />
      <div className="mb-1.5 h-1.5 w-4/5 rounded bg-zinc-300/90" />
      <div className="mb-2 h-1.5 w-3/5 rounded bg-zinc-300/60" />
      <div className="grid grid-cols-3 gap-1.5">
        <div className="col-span-2 h-10 rounded-md bg-zinc-200/90" />
        <div className="h-10 rounded-md bg-zinc-200/70" />
        <div className="col-span-3 h-6 rounded-md bg-zinc-200/50" />
      </div>
    </div>
  );
}
