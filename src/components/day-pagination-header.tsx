import { fmtDayLabel } from "@/lib/formatters";

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
