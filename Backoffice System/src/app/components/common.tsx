import { ReactNode } from "react";

// ─── Status Badge ─────────────────────────────────────────────────────────────
// Shared across features. `variant` controls the color scheme.

type BadgeVariant = "pending" | "approved" | "cancel" | "draft" | "unpublished";

export function StatusBadge({
  label,
  variant = "pending",
}: {
  label: string;
  variant?: BadgeVariant;
}) {
  const styles: Record<BadgeVariant, string> = {
    pending: "bg-[#fef3c7] text-black",
    approved: "bg-green-100 text-green-700",
    cancel: "bg-red-100 text-[#dc3f5a]",
    draft: "bg-[#f3f4f6] text-[#6b7280]",
    unpublished: "bg-[#fde2e4] text-[#dc3f5a]",
  };
  return (
    <span
      className={`font-['Prompt',sans-serif] text-[14px] px-2 py-0.5 rounded-[4px] leading-[22px] whitespace-nowrap ${styles[variant]}`}
    >
      {label}
    </span>
  );
}

// ─── Confirmation Dialog ──────────────────────────────────────────────────────
// Generic confirm/cancel modal used by Cancel, Publish, and Unpublish flows.

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "primary",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "primary" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  const confirmClass =
    confirmVariant === "danger"
      ? "bg-[#dc3f5a] text-white hover:bg-red-600"
      : "bg-[#00bb03] text-white hover:bg-green-600";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl drop-shadow-[0px_4px_8px_rgba(0,0,0,0.25)] w-full max-w-[440px] px-8 py-10 flex flex-col items-center gap-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Warning icon */}
        <div className="size-24 rounded-full border-[3px] border-[#e3b884] flex items-center justify-center">
          <span className="font-['Prompt',sans-serif] text-[#e3b884] text-[56px] font-semibold leading-none">
            !
          </span>
        </div>

        <h3 className="font-['Prompt',sans-serif] text-[28px] font-bold text-[#5a5a5a] leading-[1.3]">
          {title}
        </h3>

        {message && (
          <p className="font-['Prompt',sans-serif] text-[18px] text-[#6b7280] leading-[1.6]">
            {message}
          </p>
        )}

        <div className="flex items-center gap-4 w-full pt-2">
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 rounded-full font-['Prompt',sans-serif] text-[18px] transition-colors ${confirmClass}`}
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-full font-['Prompt',sans-serif] text-[18px] text-[#9ca3af] bg-[#ececf0] hover:bg-[#e0e2e8] transition-colors"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
