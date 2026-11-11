import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/** An empty leaf: the frame stays, with one plain icon and one sentence. */
export function EmptyState({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <Icon className="mb-4 size-8 text-muted" strokeWidth={1.5} aria-hidden />
      <h3 className="text-lead font-bold">{title}</h3>
      {children && <div className="mt-2 max-w-md text-body text-muted">{children}</div>}
    </div>
  );
}
