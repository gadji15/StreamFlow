"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

// Type simple de notification
type Notification = {
  id: number;
  type: "success" | "error" | "info";
  message: string;
};

type NotificationContextType = {
  notify: (n: { type: Notification["type"]; message: string }) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

let notifId = 0;

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifs, setNotifs] = useState<Notification[]>([]);

  const notify = useCallback(
    ({ type, message }: { type: Notification["type"]; message: string }) => {
      const id = ++notifId;
      setNotifs((n) => [...n, { id, type, message }]);
      setTimeout(() => {
        setNotifs((n) => n.filter((notif) => notif.id !== id));
      }, 3500);
    },
    []
  );

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      {/* Zone d'affichage des notifications */}
      <div
        className="fixed top-4 right-4 z-[9999] flex flex-col gap-3"
        aria-live="polite"
        aria-atomic="true"
      >
        {notifs.map((notif) => (
          <div
            key={notif.id}
            className={`px-5 py-3 rounded shadow-lg text-white font-medium text-sm animate-fade-in-up
              ${notif.type === "success"
                ? "bg-green-600"
                : notif.type === "error"
                ? "bg-red-600"
                : "bg-gray-800"
              }`}
            role="alert"
          >
            {notif.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotification must be used within a NotificationProvider");
  return ctx.notify;
}