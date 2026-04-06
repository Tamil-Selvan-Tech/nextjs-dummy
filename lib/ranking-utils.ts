const normalizeDash = (value: string) => String(value || "").replace(/[\u2013\u2014]/g, "-");

export const normalizeRankingRangeInput = (value: string) => {
  const sanitized = normalizeDash(value).replace(/[^\d-]/g, "");
  const [start = "", end = ""] = sanitized.split("-");
  const left = start.slice(0, 4);
  const right = end.slice(0, 4);

  if (!sanitized.includes("-")) {
    return left;
  }

  return `${left}-${right}`.replace(/-$/, left ? `${left}-` : "");
};

export const parseRankingRange = (value: string) => {
  const normalized = normalizeRankingRangeInput(value);
  const [start, end] = normalized.split("-");
  if (!start || !end) return null;

  const startNumber = Number(start);
  const endNumber = Number(end);
  if (!Number.isFinite(startNumber) || !Number.isFinite(endNumber)) return null;
  if (startNumber <= 0 || endNumber <= 0 || endNumber < startNumber) return null;

  return { start: startNumber, end: endNumber };
};

export const formatRankingRangeForSave = (value: string) => {
  const parsed = parseRankingRange(value);
  if (!parsed) {
    return String(value || "").replace(/[^\d-]/g, "").replace(/-$/, "");
  }
  return `${parsed.start}-${parsed.end}`;
};
