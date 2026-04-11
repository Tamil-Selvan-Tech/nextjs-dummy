const cutoffMinValue = 0;
const cutoffMaxValue = 9999;
const normalizeDash = (value: string) => String(value || "").replace(/[\u2013\u2014]/g, "-");

const normalizeCutoffPart = (value: string) => {
  const cleaned = String(value || "").replace(/[^\d.]/g, "");
  const hasDecimal = cleaned.includes(".");
  const [rawWhole = "", ...rawDecimalParts] = cleaned.split(".");
  const whole = rawWhole.slice(0, 4);
  const decimal = rawDecimalParts.join("").slice(0, 2);

  if (!hasDecimal) return whole;
  return decimal ? `${whole}.${decimal}` : `${whole}.`;
};

export const normalizeCutoffInput = (value: string) => {
  const cleaned = normalizeDash(value).replace(/[^\d.-]/g, "");
  const hasHyphen = cleaned.includes("-");
  const [rawStart = "", ...rawRest] = cleaned.split("-");
  const start = normalizeCutoffPart(rawStart);
  const end = normalizeCutoffPart(rawRest.join(""));

  if (!hasHyphen) return start;
  return `${start}-${end}`;
};

const parseCutoffPart = (value: string) => {
  const normalized = normalizeCutoffPart(value).replace(/\.$/, "");
  if (!normalized) return null;

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
};

export const parseCutoffValue = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) return null;
  const raw = String(value || "").trim();
  if (!raw) return null;

  const normalized = normalizeCutoffInput(raw).replace(/\s+/g, "");
  if (!normalized) return null;

  if (normalized.includes("-")) {
    const [startText = "", endText = ""] = normalized.split("-");
    const start = parseCutoffPart(startText);
    const end = parseCutoffPart(endText);

    if (!Number.isFinite(start) && !Number.isFinite(end)) return null;

    const resolvedStart = Number.isFinite(start) ? start : end;
    const resolvedEnd = Number.isFinite(end) ? end : start;

    if (!Number.isFinite(resolvedStart) || !Number.isFinite(resolvedEnd)) return null;
    return { start: resolvedStart, end: resolvedEnd };
  }

  const parsed = parseCutoffPart(normalized);
  if (!Number.isFinite(parsed)) return null;
  return { start: parsed, end: parsed };
};

export const isValidCutoffValue = (value: string | number | null | undefined) => {
  const parsed = parseCutoffValue(value);
  if (!parsed) return false;

  return (
    parsed.start >= cutoffMinValue &&
    parsed.start <= cutoffMaxValue &&
    parsed.end >= cutoffMinValue &&
    parsed.end <= cutoffMaxValue &&
    parsed.start <= parsed.end
  );
};

export const formatCutoffForSave = (value: string | number | null | undefined) => {
  const normalizedInput = normalizeCutoffInput(String(value || "")).replace(/\s+/g, "");
  const hadHyphen = normalizedInput.includes("-");
  const [startText = "", endText = ""] = normalizedInput.split("-");
  const parsed = parseCutoffValue(value);
  if (!parsed) return "";
  if (
    parsed.start < cutoffMinValue ||
    parsed.start > cutoffMaxValue ||
    parsed.end < cutoffMinValue ||
    parsed.end > cutoffMaxValue ||
    parsed.start > parsed.end
  ) {
    return "";
  }

  if (hadHyphen && (!startText || !endText)) {
    return `${startText ? parsed.start : ""}-${endText ? parsed.end : ""}`;
  }
  if (parsed.start === parsed.end && !hadHyphen) return String(parsed.start);
  return `${parsed.start}-${parsed.end}`;
};
