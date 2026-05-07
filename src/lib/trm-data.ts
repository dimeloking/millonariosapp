export type TrmData = {
  fechaActualizacion: string | null;
  valor: number;
};

type DolarApiTrmResponse = {
  fechaActualizacion?: unknown;
  valor?: unknown;
};

export async function getTrmData(): Promise<TrmData | null> {
  try {
    const response = await fetch('https://co.dolarapi.com/v1/trm', {
      next: { revalidate: 60 * 60 },
    });

    if (!response.ok) return null;

    const data = (await response.json()) as DolarApiTrmResponse;
    const valor = Number(data.valor);

    if (!Number.isFinite(valor) || valor <= 0) return null;

    return {
      fechaActualizacion:
        typeof data.fechaActualizacion === 'string'
          ? data.fechaActualizacion
          : null,
      valor,
    };
  } catch {
    return null;
  }
}
