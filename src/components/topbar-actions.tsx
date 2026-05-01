import { NewEnvioButton } from "@/components/new-envio-button";
import { PendientesBell } from "@/components/pendientes-bell";
import { getPendientesData } from "@/lib/movements-data";

export async function TopbarActions({
  showNewEnvio = false,
}: {
  showNewEnvio?: boolean;
}) {
  const pendientes = await getPendientesData();

  return (
    <div style={{ alignItems: "center", display: "flex", gap: 8, marginLeft: "auto" }}>
      <PendientesBell pendientes={pendientes} />
      {showNewEnvio ? <NewEnvioButton label="+ Nuevo envío" style={{ fontSize: 12 }} /> : null}
    </div>
  );
}
