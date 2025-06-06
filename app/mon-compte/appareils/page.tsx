'use client';

import { useState } from "react";
import { Smartphone, Monitor, Tablet, Laptop, Trash2, Wifi, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Device = {
  id: string;
  name: string;
  type: "mobile" | "desktop" | "tablet" | "laptop";
  platform: string;
  lastActive: string; // e.g. "Il y a 2 jours"
  active: boolean;
};

const iconMap = {
  mobile: Smartphone,
  desktop: Monitor,
  tablet: Tablet,
  laptop: Laptop,
};

const mockDevices: Device[] = [
  {
    id: "1",
    name: "iPhone 14 de Paul",
    type: "mobile",
    platform: "iOS",
    lastActive: "Il y a 2 heures",
    active: true,
  },
  {
    id: "2",
    name: "PC Bureau",
    type: "desktop",
    platform: "Windows",
    lastActive: "Aujourd'hui",
    active: true,
  },
  {
    id: "3",
    name: "iPad Pro",
    type: "tablet",
    platform: "iPadOS",
    lastActive: "Il y a 5 jours",
    active: false,
  },
];

export default function AppareilsPage() {
  const [devices, setDevices] = useState<Device[]>(mockDevices);

  function handleDisconnect(id: string) {
    setDevices(devices => devices.filter(device => device.id !== id));
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <h1 className="text-lg sm:text-3xl font-bold text-blue-500 mb-1 text-center flex items-center justify-center gap-2">
        <Wifi className="w-6 h-6 text-blue-400" />
        Appareils connectés
      </h1>
      <p className="text-gray-400 text-sm sm:text-base mb-8 text-center">
        Gérez les appareils ayant accès à votre compte StreamFlow.<br className="hidden sm:inline" />
        Retirez l’accès à un appareil ci-dessous si vous ne le reconnaissez pas.
      </p>
      {devices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <AlertCircle className="w-14 h-14 text-blue-700 mb-4 animate-pulse" />
          <p className="text-base sm:text-lg text-gray-300 text-center mb-2">
            Aucun appareil connecté
          </p>
          <p className="text-gray-500 text-sm text-center">
            Dès que vous vous connecterez sur un nouvel appareil, il apparaîtra ici.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {devices.map(device => {
            const Icon = iconMap[device.type];
            return (
              <div
                key={device.id}
                className={`flex flex-col sm:flex-row items-center justify-between gap-3 rounded-lg border bg-gray-900/60 p-4 shadow transition-all hover:shadow-lg hover:ring-2 hover:ring-blue-500/30 ${
                  device.active ? "" : "opacity-60"
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className={`rounded-full p-2 ${device.active ? "bg-blue-600/15" : "bg-gray-700"} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${device.active ? "text-blue-500" : "text-gray-500"}`} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-sm sm:text-base truncate">{device.name}</span>
                      {device.active ? (
                        <CheckCircle className="w-4 h-4 text-green-500 ml-1" title="Actif" />
                      ) : (
                        <span className="ml-1 px-2 py-0.5 bg-gray-700 text-gray-400 rounded-full text-xs">Inactif</span>
                      )}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400 flex gap-2 items-center flex-wrap">
                      <span>{device.platform}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{device.lastActive}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1 text-red-400 hover:bg-red-900/30 hover:text-red-500 focus-visible:ring-2 focus-visible:ring-red-400 transition-all px-2 py-1 text-xs sm:text-sm"
                  aria-label={`Dissocier ${device.name}`}
                  onClick={() => handleDisconnect(device.id)}
                >
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  Dissocier
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}