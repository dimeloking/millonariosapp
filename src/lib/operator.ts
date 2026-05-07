export const OPERATOR_NAMES = [
  'ROYMAN',
  'ERIKA',
  'LINA',
  'CAMILO',
  'JUAN PABLO',
] as const;

export type OperatorName = (typeof OPERATOR_NAMES)[number];

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();
}

export function resolveOperatorName(
  ...values: Array<null | string | undefined>
) {
  const source = values.find((value) => value?.trim())?.trim();
  if (!source) return 'OPERADOR';

  const normalized = normalize(source);
  const match = OPERATOR_NAMES.find((operator) =>
    normalized.includes(operator)
  );

  if (match) return match;

  return normalized.split(/[\s@._-]+/)[0] || 'OPERADOR';
}
