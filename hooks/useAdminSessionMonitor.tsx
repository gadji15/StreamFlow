import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export function useAdminSessionMonitor() {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        setShowModal(true);
      }
    });
    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  if (!showModal) return null;

  return (
    <div className="fixed z-50 inset-0 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 p-6 rounded-xl shadow-xl w-full max-w-xs border border-gray-800">
        <h2 className="text-lg font-bold text-white mb-2">Session expirée</h2>
        <p className="text-sm text-gray-300 mb-4">
          Votre session d’administration a expiré.<br />
          Cliquez sur “Se reconnecter” pour reprendre sans perdre votre travail.
        </p>
        <button
          className="rounded bg-indigo-600 px-4 py-2 text-white font-semibold hover:bg-indigo-700 w-full"
          onClick={() => {
            setShowModal(false);
            router.push("/login?redirect=/admin");
          }}
        >
          Se reconnecter
        </button>
      </div>
    </div>
  );
}