export const normalizeScientificIntegerText = (value: unknown) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  const compact = raw.replace(/,/g, "");
  if (!/[eE]/.test(compact)) return compact.replace(/\.0+$/, "");

  const parsed = Number(compact);
  if (!Number.isFinite(parsed)) return raw;

  return parsed.toLocaleString("en-US", {
    useGrouping: false,
    maximumFractionDigits: 0,
  });
};
