const toNumericValue = (value: unknown) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : Number.NaN;
  }

  if (typeof value !== "string" && value !== null && value !== undefined) {
    return Number.NaN;
  }

  const normalized = String(value ?? "")
    .replace(/[₹,\s]/g, "")
    .trim();
  if (!normalized) return Number.NaN;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

const trimTrailingZeros = (value: string) => value.replace(/\.0+$|(\.\d*[1-9])0+$/, "$1");

export const formatCompactIndianCurrency = (
  value: unknown,
  prefix = "Rs. ",
) => {
  const numeric = toNumericValue(value);
  if (!Number.isFinite(numeric)) return "-";

  const absolute = Math.abs(numeric);
  let compactValue = "";

  if (absolute >= 100000) {
    compactValue = `${trimTrailingZeros((numeric / 100000).toFixed(2))}L`;
  } else if (absolute >= 1000) {
    compactValue = `${trimTrailingZeros((numeric / 1000).toFixed(2))}K`;
  } else {
    compactValue = trimTrailingZeros(numeric.toFixed(0));
  }

  return `${prefix}${compactValue}`;
};

export const formatCompactIndianCurrencyRange = (
  min: unknown,
  max: unknown,
  prefix = "Rs. ",
) => {
  const start = formatCompactIndianCurrency(min, prefix);
  const end = formatCompactIndianCurrency(max, prefix);

  if (start === "-" && end === "-") return "Not available";
  if (start === end) return start;
  if (start === "-") return end;
  if (end === "-") return start;
  return `${start} - ${end}`;
};
