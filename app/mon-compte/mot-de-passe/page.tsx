'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function MotDePassePage() {
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");
    if (!newPwd || !confirmPwd) {
      setErrorMsg("Veuillez remplir tous les champs.");
      return;
    }
    if (newPwd.length < 8) {
      setErrorMsg("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (newPwd !== confirmPwd) {
      setErrorMsg("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      // Supabase ne requiert pas le mot de passe actuel pour update, mais il faut être connecté.
      const { error } = await supabase.auth.updateUser({ password: newPwd });
      if (error) {
        setErrorMsg(error.message || "Erreur lors du changement de mot de passe.");
      } else {
        setSuccessMsg("Mot de passe mis à jour avec succès !");
        setCurrentPwd("");
        setNewPwd("");
        setConfirmPwd("");
      }
    } catch (err: any) {
      setErrorMsg("Erreur inattendue.");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-[60vh] flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md bg-gray-900/80 rounded-xl shadow-lg p-6 space-y-6">
        <div className="flex flex-col items-center gap-2 mb-4">
          <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-500" />
          <h1 className="text-lg sm:text-3xl font-bold text-yellow-500 text-center">Sécurité</h1>
          <p className="text-gray-400 text-sm sm:text-base text-center">
            Changez votre mot de passe pour sécuriser votre compte.
          </p>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Ancien mot de passe (optionnel selon politique) */}
          {/*<div>
            <label htmlFor="currentPwd" className="block text-sm text-gray-300 mb-1">Mot de passe actuel</label>
            <div className="relative">
              <input
                id="currentPwd"
                type={showOld ? "text" : "password"}
                className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 pr-10 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
                value={currentPwd}
                onChange={e => setCurrentPwd(e.target.value)}
                autoComplete="current-password"
                disabled
              />
              <button type="button" tabIndex={-1}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                onClick={() => setShowOld(v => !v)}
                aria-label={showOld ? "Masquer" : "Afficher"}
                disabled
              >
                {showOld ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>*/}
          {/* Nouveau mot de passe */}
          <div>
            <label htmlFor="newPwd" className="block text-sm text-gray-300 mb-1">Nouveau mot de passe</label>
            <div className="relative">
              <input
                id="newPwd"
                type={showNew ? "text" : "password"}
                className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 pr-10 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
                value={newPwd}
                onChange={e => setNewPwd(e.target.value)}
                minLength={8}
                autoComplete="new-password"
                required
              />
              <button type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                onClick={() => setShowNew(v => !v)}
                aria-label={showNew ? "Masquer" : "Afficher"}
                tabIndex={-1}
              >
                {showNew ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>
          {/* Confirmation */}
          <div>
            <label htmlFor="confirmPwd" className="block text-sm text-gray-300 mb-1">Confirmer le nouveau mot de passe</label>
            <div className="relative">
              <input
                id="confirmPwd"
                type={showConfirm ? "text" : "password"}
                className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 pr-10 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition"
                value={confirmPwd}
                onChange={e => setConfirmPwd(e.target.value)}
                minLength={8}
                autoComplete="new-password"
                required
              />
              <button type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                onClick={() => setShowConfirm(v => !v)}
                aria-label={showConfirm ? "Masquer" : "Afficher"}
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>
          {errorMsg && (
            <div className="flex items-center gap-2 text-red-400 bg-red-900/40 rounded px-2 py-1 text-sm">
              <AlertTriangle className="w-5 h-5" />
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="flex items-center gap-2 text-green-400 bg-green-900/40 rounded px-2 py-1 text-sm">
              <CheckCircle className="w-5 h-5" />
              {successMsg}
            </div>
          )}
          <Button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-4 rounded transition text-base sm:text-lg flex items-center justify-center gap-2"
            loading={loading ? "true" : undefined}
            disabled={loading}
          >
            <Shield className="w-5 h-5 mr-1" />
            {loading ? "Mise à jour..." : "Changer le mot de passe"}
          </Button>
        </form>
      </div>
    </div>
  );
}