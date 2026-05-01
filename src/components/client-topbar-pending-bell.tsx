"use client";

import { useEffect, useState } from "react";
import { PendientesBell } from "@/components/pendientes-bell";
import type { PendienteRecord } from "@/lib/movements-data";

export function ClientTopbarPendingBell() {
  const [pendientes, setPendientes] = useState<PendienteRecord[]>([]);

  useEffect(() => {
    let alive = true;

    fetch("/api/pendientes", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: PendienteRecord[]) => {
        if (alive) setPendientes(data);
      })
      .catch(() => {
        if (alive) setPendientes([]);
      });

    return () => {
      alive = false;
    };
  }, []);

  return <PendientesBell pendientes={pendientes} />;
}
