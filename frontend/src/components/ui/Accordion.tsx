import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

type AccordionProps = {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
  className?: string;
};

export function Accordion({
  title,
  defaultOpen = true,
  children,
  className = "",
}: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className={`rounded-lg border border-border-default overflow-hidden ${className}`}>
      <button
        type="button"
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-bg-secondary/40 text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <div className="text-sm font-medium text-text-secondary">{title}</div>
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span>{open ? "Hide" : "Show"}</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {open ? (
        <div id={panelId} className="px-4 py-3">
          {children}
        </div>
      ) : null}
    </div>
  );
}