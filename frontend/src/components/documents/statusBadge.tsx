import { CheckCircle2, CircleAlert, Clock3, LoaderCircle } from "lucide-react";
import type { DocumentStatus } from "@/lib/types";

const statusConfig: Record<
  DocumentStatus,
  { label: string; className: string; icon: typeof Clock3 }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 ring-amber-600/20",
    icon: Clock3,
  },
  processing: {
    label: "Processing",
    className: "bg-blue-50 text-blue-700 ring-blue-600/20",
    icon: LoaderCircle,
  },
  completed: {
    label: "Ready",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    icon: CheckCircle2,
  },
  failed: {
    label: "Failed",
    className: "bg-red-50 text-red-700 ring-red-600/20",
    icon: CircleAlert,
  },
};

export function StatusBadge({ status }: { status: DocumentStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${config.className}`}
    >
      <Icon
        size={13}
        className={status === "processing" ? "animate-spin" : undefined}
      />
      {config.label}
    </span>
  );
}
