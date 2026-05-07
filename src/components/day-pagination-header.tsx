import { fmtDayLabel } from '@/lib/formatters';

type DayPaginationHeaderProps = {
  currentDay: string;
  currentPage: number;
  totalPages: number;
};

export function DayPaginationHeader({
  currentDay,
  currentPage,
  totalPages,
}: DayPaginationHeaderProps) {
  return (
    <div className="day-pagination-title">
      Día {currentPage} de {totalPages} · {fmtDayLabel(currentDay)}
    </div>
  );
}

type DayPaginationControlsProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function DayPaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: DayPaginationControlsProps) {
  const hasNextDay = currentPage > 1;
  const hasPreviousDay = currentPage < totalPages;

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <button
        className="btn btn-ghost"
        disabled={!hasNextDay}
        style={{ fontSize: 12, opacity: hasNextDay ? 1 : 0.45 }}
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
      >
        Día siguiente
      </button>
      <button
        className="btn btn-ghost"
        disabled={!hasPreviousDay}
        style={{ fontSize: 12, opacity: hasPreviousDay ? 1 : 0.45 }}
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
      >
        Día anterior
      </button>
    </div>
  );
}
