import { Badge } from "@/components/ui/badge";

type PageHeaderProps = {
  title: string;
  eyebrow?: string;
  description: string;
  signal?: string;
};

export function PageHeader({ title, eyebrow = "Astra", description, signal }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
          {eyebrow}
        </p>
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400 sm:text-base">{description}</p>
      </div>
      {signal ? <Badge tone="violet">{signal}</Badge> : null}
    </div>
  );
}
