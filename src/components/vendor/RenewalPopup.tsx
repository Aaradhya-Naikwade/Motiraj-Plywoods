"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

type RenewalPopupProps = {
  initialOpen?: boolean;
};

const RENEWAL_MESSAGE = "You have completed one year with us. To renew your ID, please contact us.";
const CONTACT_NUMBER = "08269211234";
const WHATSAPP_NUMBER = "918269211234";
const WHATSAPP_RENEWAL_MESSAGE = encodeURIComponent(
  "Hello Ratlami Interio, I want to renew my vendor ID."
);

export default function RenewalPopup({ initialOpen = false }: RenewalPopupProps) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  useEffect(() => {
    setIsOpen(initialOpen);
  }, [initialOpen]);

  return (
    <>
      {isOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex justify-end">
              <button
                type="button"
                aria-label="Close popup"
                onClick={() => setIsOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--lightgray)] text-[var(--black)] transition hover:bg-[var(--secondary)]"
              >
                <X size={16} />
              </button>
            </div>

            <h3 className="text-lg font-semibold text-[var(--black)]">ID Renewal Required</h3>
            <p className="mt-2 text-sm text-[var(--darkgray)]">{RENEWAL_MESSAGE}</p>

            <a
              href={`tel:${CONTACT_NUMBER}`}
              className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Contact Now
            </a>

            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_RENEWAL_MESSAGE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-95"
            >
              <FaWhatsapp size={18} />
              Contact on WhatsApp
            </a>
          </div>
        </div>
      ) : null}
    </>
  );
}
