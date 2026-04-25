"use client";

import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

type NavItem = { href: string; label: string; icon: React.ReactNode; count?: string };
type NavGroup = { section: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    section: "PRINCIPAL",
    items: [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: (
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="nav-icon"
          >
            <rect x="1" y="1" width="6" height="6" rx="1" />
            <rect x="9" y="1" width="6" height="6" rx="1" />
            <rect x="1" y="9" width="6" height="6" rx="1" />
            <rect x="9" y="9" width="6" height="6" rx="1" />
          </svg>
        ),
      },
    ],
  },
  {
    section: "MOVIMIENTOS",
    items: [
      {
        href: "/dashboard/envios",
        label: "Envíos",
        count: "26",
        icon: (
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="nav-icon"
          >
            <path d="M14 2L2 6l5 2 2 5 5-11z" />
          </svg>
        ),
      },
      {
        href: "/dashboard/entradas",
        label: "Entradas",
        count: "9",
        icon: (
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="nav-icon"
          >
            <path d="M8 2v9M4 7l4 4 4-4" />
            <path d="M2 14h12" />
          </svg>
        ),
      },
      {
        href: "/dashboard/salidas",
        label: "Salidas",
        count: "11",
        icon: (
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="nav-icon"
          >
            <path d="M8 14V5M4 9l4-4 4 4" />
            <path d="M2 2h12" />
          </svg>
        ),
      },
      {
        href: "/dashboard/creditos",
        label: "4×1000",
        count: "25",
        icon: (
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="nav-icon"
          >
            <rect x="1" y="3" width="14" height="10" rx="2" />
            <path d="M1 7h14" />
          </svg>
        ),
      },
    ],
  },
  {
    section: "REPORTES",
    items: [
      {
        href: "/dashboard/balance",
        label: "Balance",
        icon: (
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="nav-icon"
          >
            <path d="M8 2v12M3 5l5-3 5 3M3 11l5 3 5-3" />
          </svg>
        ),
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside
      style={{
        background: "#101215",
        borderRight: "1px solid #22262d",
        display: "flex",
        flexDirection: "column",
        padding: "20px 12px",
        width: 240,
        flexShrink: 0,
      }}
    >
      {/* Brand */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "4px 8px 20px",
          borderBottom: "1px solid #22262d",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: "linear-gradient(135deg, #d4a574, #8a6d4a)",
            display: "grid",
            placeItems: "center",
            color: "#0a0b0d",
            fontSize: 15,
            fontWeight: 700,
          }}
          className="serif"
        >
          D
        </div>
        <span className="serif" style={{ fontSize: 22, letterSpacing: "-0.01em" }}>
          Divisas
        </span>
      </div>

      {/* Period badge */}
      <div
        style={{
          margin: "0 4px 16px",
          padding: 12,
          background: "#16191e",
          border: "1px solid #22262d",
          borderRadius: 10,
        }}
      >
        <div
          className="mono"
          style={{
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "#5a5f68",
          }}
        >
          Período activo
        </div>
        <div className="serif" style={{ fontSize: 22, lineHeight: 1.1, marginTop: 4 }}>
          Marzo 2026
        </div>
        <div className="mono" style={{ fontSize: 11, color: "#858a93", marginTop: 2 }}>
          26 envíos · 11 salidas
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1 }}>
        {NAV.map((group) => (
          <div key={group.section}>
            <div
              className="mono"
              style={{
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: "#5a5f68",
                padding: "12px 12px 6px",
              }}
            >
              {group.section}
            </div>
            {group.items.map((item) => (
              <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                <button className={`nav-item ${isActive(item.href) ? "active" : ""}`}>
                  {item.icon}
                  <span>{item.label}</span>
                  {item.count && (
                    <span
                      className="mono"
                      style={{
                        marginLeft: "auto",
                        fontSize: 11,
                        color: "#5a5f68",
                      }}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer / User */}
      <div
        style={{
          marginTop: "auto",
          paddingTop: 12,
          borderTop: "1px solid #22262d",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 8px",
        }}
      >
        <UserButton
          appearance={{
            elements: {
              avatarBox: { width: 30, height: 30 },
            },
          }}
        />
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#e8eaed" }}>Royman</div>
          <div className="mono" style={{ fontSize: 10, color: "#5a5f68" }}>
            Operador
          </div>
        </div>
      </div>
    </aside>
  );
}
