type Operator = "ROYMAN" | "ERIKA" | "LINA" | "JUAN PABLO";

const CLASS_MAP: Record<Operator, string> = {
  ROYMAN: "chip chip-royman",
  ERIKA: "chip chip-erika",
  LINA: "chip chip-lina",
  "JUAN PABLO": "chip chip-juanpablo",
};

export function OperatorChip({ name }: { name: string }) {
  const cls = CLASS_MAP[name as Operator] ?? "chip chip-default";
  return <span className={cls}>{name}</span>;
}
