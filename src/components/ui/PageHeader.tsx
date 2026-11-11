import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Inner-page header: the page's name set large on the desk, its description and optional actions.
 * `eyebrow` is accepted for compatibility and shown as a plain line *under* the title (no labels above headings).
 */
export function PageHeader({ eyebrow, title, description, actions, children, className }: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  /** @deprecated Category washes were removed in the redesign. */
  wash?: string;
}) {
  return (
    <header className={cn("page-hero", className)}>
      <div className="container-page pb-8 pt-10 sm:pb-10 sm:pt-16">
        <div className="flex flex-wrap items-end gap-x-8 gap-y-5">
          <div className="me-auto min-w-0 max-w-4xl">
            <h1 className="page-title">{title}</h1>
            {description && <p className="lead mt-4">{description}</p>}
            {eyebrow && <p className="mt-2 text-meta text-muted">{eyebrow}</p>}
          </div>
          {actions}
        </div>
        {children}
      </div>
    </header>
  );
}
