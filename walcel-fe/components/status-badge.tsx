import {Label} from "@/components/ui/label";

type Status = 'pinned' | 'failed' | 'checked' | 'notfounded';

const statusStyles: Record<Status, { label: string; className: string }> = {
  pinned: {
    label: "Pinned",
    className: "bg-green-800",
  },
  failed: {
    label: "Failed",
    className: "bg-red-800",
  },
  checked: {
    label: "Pinning",
    className: "bg-blue-800",
  },
  notfounded: {
    label: "Not Found",
    className: "bg-yellow-800",
  },
};

export function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase() as Status;
  const info = statusStyles[key] || {
    label: status,
    className: "bg-gray-100 text-gray-800",
  };

  return (
    <Label className={`px-2 py-1 rounded text-xs font-bold ${info.className}`}>
      {info.label}
    </Label>
  );
}