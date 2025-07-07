
import { useEffect } from "react";

declare global {
  interface Window {
    PaystackPop?: any;
  }
}

type PaystackParams = {
  email: string;
  amount: number; // amount in kobo
  reference?: string;
  onSuccess: (reference: string) => void;
  onClose?: () => void;
};

// Use your actual Paystack public key here
export const PAYSTACK_PUBLIC_KEY = "pk_test_26e5168ed9653ff2e7a704a424acc9b71a755916";

export default function usePaystack() {
  // Load the Paystack script once
  useEffect(() => {
    if (!window.PaystackPop) {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const payWithPaystack = ({
    email,
    amount,
    reference,
    onSuccess,
    onClose,
  }: PaystackParams) => {
    if (!window.PaystackPop) {
      alert("Loading Paystack. Please try again in a moment.");
      return;
    }
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email,
      amount,
      currency: "KES",
      ref: reference,
      callback: function(response: any) {
        onSuccess(response.reference);
      },
      onClose: function() {
        if (onClose) onClose();
      },
    });
    handler.openIframe();
  };

  return { payWithPaystack };
}
