'use client';

import type React from 'react';
import { UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { DashboardSummary } from '@/lib/balance-data';
import { fmtCOP, fmtUSD } from '@/lib/formatters';

type NavItem = {
  href: string;
  icon: React.ReactNode;
  label: string;
};
type NavGroup = { items: NavItem[]; section: string };

type SidebarProps = {
  summary: DashboardSummary;
};

const iconProps = {
  className: 'nav-icon',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '1.5',
  viewBox: '0 0 16 16',
};

export function Sidebar({ summary }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useUser();
  const userName =
    user?.fullName ??
    user?.firstName ??
    user?.primaryEmailAddress?.emailAddress ??
    'Operador';
  const nav: NavGroup[] = [
    {
      section: 'PRINCIPAL',
      items: [
        {
          href: '/dashboard',
          label: 'Dashboard',
          icon: (
            <svg {...iconProps}>
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
      section: 'MOVIMIENTOS',
      items: [
        {
          href: '/dashboard/envios',
          label: 'Envíos',
          icon: (
            <svg {...iconProps}>
              <path d="M14 2L2 6l5 2 2 5 5-11z" />
            </svg>
          ),
        },
        {
          href: '/dashboard/entradas',
          label: 'Entradas',
          icon: (
            <svg {...iconProps}>
              <path d="M8 2v9M4 7l4 4 4-4" />
              <path d="M2 14h12" />
            </svg>
          ),
        },
        {
          href: '/dashboard/salidas',
          label: 'Salidas',
          icon: (
            <svg {...iconProps}>
              <path d="M8 14V5M4 9l4-4 4 4" />
              <path d="M2 2h12" />
            </svg>
          ),
        },
        {
          href: '/dashboard/salidas-ext',
          label: 'Salidas ext.',
          icon: (
            <svg {...iconProps}>
              <path d="M2 8h9" />
              <path d="M8 5l3 3-3 3" />
              <path d="M3 3h10v10H3" />
            </svg>
          ),
        },
        {
          href: '/dashboard/pendientes',
          label: 'Pendientes',
          icon: (
            <svg {...iconProps}>
              <path d="M3 3h10v10H3z" />
              <path d="M5 7h6M5 10h4" />
            </svg>
          ),
        },
        {
          href: '/dashboard/creditos',
          label: '4×1000',
          icon: (
            <svg {...iconProps}>
              <rect x="1" y="3" width="14" height="10" rx="2" />
              <path d="M1 7h14" />
            </svg>
          ),
        },
      ],
    },
    {
      section: 'REPORTES',
      items: [
        {
          href: '/dashboard/balance',
          label: 'Balance',
          icon: (
            <svg {...iconProps}>
              <path d="M8 2v12M3 5l5-3 5 3M3 11l5 3 5-3" />
            </svg>
          ),
        },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <aside
      style={{
        background: '#101215',
        borderRight: '1px solid #22262d',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        padding: '20px 12px',
        width: 240,
      }}
    >
      <div
        style={{
          alignItems: 'center',
          borderBottom: '1px solid #22262d',
          display: 'flex',
          gap: 10,
          marginBottom: 16,
          padding: '4px 8px 20px',
        }}
      >
        <div
          className="serif"
          style={{
            background: 'linear-gradient(135deg, #d4a574, #8a6d4a)',
            borderRadius: 6,
            color: '#0a0b0d',
            display: 'grid',
            fontSize: 15,
            fontWeight: 700,
            height: 28,
            placeItems: 'center',
            width: 28,
          }}
        >
          D
        </div>
        <span className="serif" style={{ fontSize: 22 }}>
          Divisas
        </span>
      </div>

      <div
        style={{
          background: '#16191e',
          border: '1px solid #22262d',
          borderRadius: 10,
          margin: '0 4px 16px',
          padding: 12,
        }}
      >
        <div className="mono" style={{ color: '#5a5f68', fontSize: 10 }}>
          PERÍODO ACTIVO
        </div>
        <div className="serif" style={{ fontSize: 22, marginTop: 4 }}>
          {summary.periodLabel}
        </div>
        <div
          className="mono"
          style={{ color: '#d4a574', fontSize: 11, marginTop: 4 }}
        >
          COP {fmtCOP(summary.currentBalance)}
        </div>
        <div
          className="mono"
          style={{ color: '#d4a574', fontSize: 11, marginTop: 4 }}
        >
          USD {fmtUSD(summary.currentBalanceUsd)}
        </div>
      </div>

      <nav style={{ flex: 1 }}>
        {nav.map((group) => (
          <div key={group.section}>
            <div
              className="mono"
              style={{
                color: '#5a5f68',
                fontSize: 10,
                letterSpacing: '0.14em',
                padding: '12px 12px 6px',
              }}
            >
              {group.section}
            </div>
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={{ textDecoration: 'none' }}
              >
                <button
                  className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div
        style={{
          alignItems: 'center',
          borderTop: '1px solid #22262d',
          display: 'flex',
          gap: 10,
          marginTop: 'auto',
          padding: '12px 8px',
        }}
      >
        <UserButton
          appearance={{ elements: { avatarBox: { height: 30, width: 30 } } }}
        />
        <div>
          <div style={{ color: '#e8eaed', fontSize: 13, fontWeight: 500 }}>
            {userName}
          </div>
          <div className="mono" style={{ color: '#5a5f68', fontSize: 10 }}>
            Operador
          </div>
        </div>
      </div>
    </aside>
  );
}
