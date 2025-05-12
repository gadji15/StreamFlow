// app/confirmation-email/page.tsx

'use client';

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function ConfirmationEmailPage() {
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get("email") || "";
  const [email, setEmail] = useState(emailFromUrl);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  // Pour que l'email soit bien mis à jour si le user recharge l'URL
  useEffect(() => {
    setEmail(emailFromUrl);
  }, [emailFromUrl]);

  async function handleResend() {
    if (!email) {
      setStatus("error");
      setMessage("Impossible de retrouver votre adresse e-mail.");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      // Supabase v2: renvoi du mail via signInWithOtp (magic link confirmation)
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) {
        setStatus("error");
        setMessage("Erreur lors de l'envoi du lien. " + (error.message || ""));
      } else {
        setStatus("success");
        setMessage("Un nouveau lien de confirmation a été envoyé !");
      }
    } catch (err: any) {
      setStatus("error");
      setMessage("Erreur technique lors de l'envoi du mail.");
    }
  }

  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 shadow-lg rounded-xl p-8 flex flex-col items-center gap-6 border border-zinc-200 dark:border-zinc-800">
        <svg className="w-16 h-16 text-green-500 mb-2" fill="none" viewBox="0 0 48 48" stroke="currentColor">
          <circle cx="24" cy="24" r="22" strokeWidth="2" className="text-green-200" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M16 24l6 6 10-12" />
        </svg>
        <h1 className="text-2xl font-bold text-center text-zinc-900 dark:text-zinc-100">Confirmez votre adresse e-mail</h1>
        <p className="text-center text-zinc-600 dark:text-zinc-300">
          {email ? (
            <>
              Un e-mail de confirmation vient d&apos;être envoyé à&nbsp;
              <span className="font-semibold">{email}</span>.<br />
              Cliquez sur le lien reçu pour activer votre compte et accéder à toutes les fonctionnalités de la plateforme.
            </>
          ) : (
            <>
              Un e-mail de confirmation vient d&apos;être envoyé à votre adresse.<br />
              Cliquez sur le lien reçu pour activer votre compte.
            </>
          )}
        </p>
        <div className="flex flex-col gap-2 w-full">
          <Link
            href="/login"
            className="w-full py-2 rounded-md font-semibold bg-primary text-white text-center hover:bg-primary/90 transition"
          >
            Se connecter
          </Link>
          <button
            onClick={handleResend}
            disabled={status === "loading"}
            className="w-full py-2 rounded-md border border-primary text-primary font-semibold bg-transparent hover:bg-primary/10 transition mt-2"
          >
            {status === "loading" ? "Envoi en cours..." : "Renvoyer le lien de confirmation"}
          </button>
          {status === "success" && (
            <p className="text-green-600 text-sm text-center mt-2">{message}</p>
          )}
          {status === "error" && (
            <p className="text-red-600 text-sm text-center mt-2">{message}</p>
          )}
        </div>
      </div>
    </main>
  );
}