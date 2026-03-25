"use client"

import { motion, type Variants } from "framer-motion"

interface ConfirmModalProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

const modalVariants: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.18, ease: "easeOut" },
  },
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = true,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-app-bg/70 px-4 backdrop-blur-sm">
      <motion.div
        className="w-full max-w-sm rounded-2xl border border-border bg-surface p-4 shadow-lg"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="mb-4">
          <h3 className="text-base font-semibold text-text">{title}</h3>
          <p className="mt-1 text-sm text-muted">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-border bg-surface-2 px-3 py-1.5 text-xs font-medium text-text hover:bg-surface"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
              danger
                ? "border border-danger/40 bg-danger/10 text-danger hover:bg-danger/15"
                : "border border-accent/30 bg-accent-soft text-accent hover:bg-accent/20"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
