"use client";

import { useEffect, useRef, useState } from "react";
import type { ButtonHTMLAttributes, MouseEvent } from "react";

type ConfirmSubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  confirmMessage?: string;
  confirmTitle?: string;
  confirmText?: string;
  cancelText?: string;
};

export default function ConfirmSubmitButton({
  confirmMessage = "Are you sure you want to delete this item?",
  confirmTitle = "Confirm Delete",
  confirmText = "Yes, delete",
  cancelText = "No",
  onClick,
  type = "submit",
  disabled,
  ...props
}: ConfirmSubmitButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (disabled || isSubmitting) {
      event.preventDefault();
      return;
    }

    if (type === "submit") {
      event.preventDefault();
      setIsOpen(true);
      return;
    }

    onClick?.(event);
  };

  const handleConfirm = () => {
    const form = buttonRef.current?.form;
    if (!form) {
      setIsOpen(false);
      return;
    }

    setIsSubmitting(true);
    setIsOpen(false);
    form.requestSubmit();
  };

  return (
    <>
      <button
        {...props}
        ref={buttonRef}
        type={type}
        disabled={disabled || isSubmitting}
        onClick={handleClick}
      />

      {isOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <h3 className="text-lg font-semibold text-[var(--black)]">{confirmTitle}</h3>
            <p className="mt-2 text-sm text-[var(--darkgray)]">{confirmMessage}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg border border-[var(--lightgray)] px-3 py-2 text-sm font-medium text-[var(--black)] transition hover:bg-[var(--secondary)]"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
