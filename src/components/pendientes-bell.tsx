"use client";

import { useMemo, useState } from "react";
import { Bell } from "lucide-react";
import type { PendienteRecord } from "@/lib/movements-data";

export function PendientesBell({ pendientes }: { pendientes: PendienteRecord[] }) {
  const [open, setOpen] = useState(false);
  const active = useMemo(
    () => pendientes.filter((item) => !item.completado),
    [pendientes]
  );

  return (
    <div className="topbar-bell-wrap">
      <button
        className="icon-btn topbar-bell"
        type="button"
        aria-label="Ver pendientes"
        onClick={() => setOpen((value) => !value)}
      >
        <Bell size={17} />
        {active.length > 0 ? (
          <span
            className="mono"
            style={{
              alignItems: "center",
              background: "#e07575",
              borderRadius: 999,
              color: "#0a0b0d",
              display: "flex",
              fontSize: 10,
              fontWeight: 700,
              height: 18,
              justifyContent: "center",
              minWidth: 18,
              padding: "0 5px",
              position: "absolute",
              right: 0,
              top: 0,
            }}
          >
            {active.length}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          className="panel"
          style={{
            marginTop: 8,
            padding: 0,
            position: "absolute",
            right: 0,
            width: 340,
          }}
        >
          <div className="panel-header">
            <div>
              <div className="panel-title">Pendientes abiertos</div>
              <div className="panel-sub">{active.length} por completar</div>
            </div>
          </div>
          <div style={{ maxHeight: 320, overflowY: "auto", padding: 10 }}>
            {active.length === 0 ? (
              <div style={{ color: "#858a93", fontSize: 13, padding: 12 }}>
                Sin pendientes abiertos.
              </div>
            ) : (
              active.slice(0, 8).map((item) => (
                <div
                  key={String(item.id)}
                  style={{
                    borderBottom: "1px solid #22262d",
                    color: "#e07575",
                    padding: "10px 6px",
                  }}
                >
                  <div className="mono" style={{ color: "#858a93", fontSize: 10 }}>
                    {item.fecha}
                  </div>
                  <div style={{ fontSize: 13, marginTop: 3 }}>{item.texto}</div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
