const rankingMinValue = 1;
const rankingMaxValue = 9999;

const normalizeDash = (value: string) => String(value || "").replace(/[\u2013\u2014]/g, "-");

export const normalizeRankingRangeInput = (value: string) => {
  const cleaned = normalizeDash(value).replace(/[^\d-]/g, "");
  const hasHyphen = cleaned.includes("-");
  const [rawStart = "", ...rawRest] = cleaned.split("-");
  const start = rawStart.slice(0, 4);
  const end = rawRest.join("").slice(0, 4);

  if (!hasHyphen) return start;
  return `${start}-${end}`;
};

export const parseRankingRange = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) return null;
  const raw = String(value || "").trim();
  if (!raw) return null;

  const normalized = normalizeDash(raw).replace(/[^\d-]/g, "");
  if (!normalized) return null;

  if (normalized.includes("-")) {
    const [startText = "", endText = ""] = normalized.split("-");
    const start = Number(startText);
    const end = Number(endText);
    if (!Number.isFinite(start) && !Number.isFinite(end)) return null;

    const resolvedStart = Number.isFinite(start) ? start : end;
    const resolvedEnd = Number.isFinite(end) ? end : start;
    if (!Number.isFinite(resolvedStart) || !Number.isFinite(resolvedEnd)) return null;

    return { start: resolvedStart, end: resolvedEnd };
  }

  const digits = normalized.replace(/\D/g, "");
  if (!digits) return null;

  if (digits.length <= 4) {
    const num = Number(digits);
    return Number.isFinite(num) ? { start: num, end: num } : null;
  }

  let best: { start: number; end: number; score: number } | null = null;
  for (let split = 1; split <= 4; split += 1) {
    const startText = digits.slice(0, split);
    const endText = digits.slice(split);
    if (endText.length < 1 || endText.length > 4) continue;

    const start = Number(startText);
    const end = Number(endText);
    if (!Number.isFinite(start) || !Number.isFinite(end)) continue;
    if (start < rankingMinValue || start > rankingMaxValue) continue;
    if (end < rankingMinValue || end > rankingMaxValue) continue;
    if (start > end) continue;

    const score = Math.abs(end - start);
    if (!best || score < best.score) {
      best = { start, end, score };
    }
  }

  return best ? { start: best.start, end: best.end } : null;
};

export const isValidRankingRange = (value: string | number | null | undefined) => {
  const normalized = normalizeRankingRangeInput(String(value || "")).replace(/\s+/g, "");
  if (!normalized) return true;
  if (!/^\d+-\d+$/.test(normalized)) return false;

  const [startText, endText] = normalized.split("-");
  const start = Number(startText);
  const end = Number(endText);

  return (
    Number.isFinite(start) &&
    Number.isFinite(end) &&
    start >= rankingMinValue &&
    start <= rankingMaxValue &&
    end >= rankingMinValue &&
    end <= rankingMaxValue &&
    start <= end
  );
};

export const formatRankingRangeForSave = (value: string | number | null | undefined) => {
  const parsed = parseRankingRange(value);
  if (!parsed) return "";
  return `${parsed.start}-${parsed.end}`;
};

export const formatRankingRangeForDisplay = (value: string | number | null | undefined) => {
  const parsed = parseRankingRange(value);
  if (!parsed) return "N/A";
  if (parsed.start === parsed.end) return String(parsed.start);
  return `${parsed.start}-${parsed.end}`;
};
