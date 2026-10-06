"use client";

import { useFormStatus } from "react-dom";
import { buttonClass } from "./ui";

export function SubmitButton({ children, pendingText = "저장 중…" }: { children: React.ReactNode; pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={buttonClass.primary}>
      {pending ? pendingText : children}
    </button>
  );
}

function DeleteSubmit({ label, small }: { label: string; small: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={small ? "text-sm font-medium text-red-600 hover:underline disabled:opacity-50" : buttonClass.danger}
    >
      {pending ? "삭제 중…" : label}
    </button>
  );
}

export function DeleteButton({
  action,
  confirmMessage,
  label = "삭제",
  small = false,
}: {
  action: () => Promise<void>;
  confirmMessage: string;
  label?: string;
  small?: boolean;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmMessage)) e.preventDefault();
      }}
    >
      <DeleteSubmit label={label} small={small} />
    </form>
  );
}
