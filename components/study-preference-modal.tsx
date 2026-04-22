"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, MapPin, Search, Sparkles, X } from "lucide-react";
import { fetchPublicPanelData } from "@/lib/public-data";
import { colleges } from "@/lib/site-data";

type StudyPreferenceModalProps = {
  isOpen: boolean;
  selectedCity: string;
  selectedCollege: string;
  onClose: () => void;
  onApply: (payload: { city: string; college: string; collegeId?: string }) => void;
};

const cityOfCollege = (college: (typeof colleges)[number]) =>
  String((college as { city?: string })?.city || college?.district || college?.state || "").trim();

export function StudyPreferenceModal({
  isOpen,
  selectedCity,
  selectedCollege,
  onClose,
  onApply,
}: StudyPreferenceModalProps) {
  const [cityQuery, setCityQuery] = useState("");
  const [collegeQuery, setCollegeQuery] = useState("");
  const [chosenCity, setChosenCity] = useState(selectedCity !== "Select City" ? selectedCity : "");
  const [chosenCollege, setChosenCollege] = useState(
    selectedCollege !== "All Colleges" ? selectedCollege : "",
  );
  const [chosenCollegeId, setChosenCollegeId] = useState<string>("");
  const [availableColleges, setAvailableColleges] = useState(colleges);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    let active = true;
    if (!isOpen) return;

    const loadColleges = async () => {
      try {
        const panelData = await fetchPublicPanelData();
        if (!active) return;
        setAvailableColleges(panelData.colleges.length ? panelData.colleges : colleges);
      } catch {
        if (!active) return;
        setAvailableColleges(colleges);
      }
    };

    void loadColleges();

    return () => {
      active = false;
    };
  }, [isOpen]);

  const cityList = useMemo(() => {
    const unique = [...new Set(availableColleges.map((item) => cityOfCollege(item)).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b),
    );

    const query = cityQuery.trim().toLowerCase();
    if (!query) return unique;
    return unique.filter((city) => city.toLowerCase().includes(query));
  }, [availableColleges, cityQuery]);

  const cityColleges = useMemo(() => {
    if (!chosenCity) return [];

    const query = collegeQuery.trim().toLowerCase();
    return availableColleges
      .filter((item) => cityOfCollege(item) === chosenCity)
      .filter((item) => {
        if (!query) return true;
        return String(item.name || "").toLowerCase().includes(query);
      })
      .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
  }, [availableColleges, chosenCity, collegeQuery]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-start justify-center bg-[rgba(7,20,38,0.42)] px-3 pb-4 pt-10 backdrop-blur-[4px] sm:px-4 sm:pb-6 sm:pt-16"
      onClick={onClose}
    >
      <div
        className="mx-auto flex max-h-[calc(100vh-2rem)] w-full max-w-5xl flex-col overflow-hidden rounded-[1.6rem] border border-[rgba(15,76,129,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(243,248,255,0.97))] text-[color:var(--text-dark)] shadow-[0_30px_80px_rgba(4,12,26,0.18)] sm:max-h-[calc(100vh-4rem)] sm:rounded-[2rem]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative overflow-hidden border-b border-[rgba(15,76,129,0.08)] px-4 py-4 sm:px-6 sm:py-5">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(237,246,255,0.96))]" />
          <div className="absolute left-[-2rem] top-0 h-28 w-28 rounded-full bg-[rgba(60,126,182,0.12)] blur-3xl" />
          <div className="absolute right-[-1rem] top-2 h-24 w-24 rounded-full bg-[rgba(255,138,61,0.14)] blur-3xl" />

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(15,76,129,0.08)] bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-primary)]">
                <Sparkles className="size-3.5 text-[color:var(--brand-accent)]" />
                Study Preference
              </div>
              <h2 className="mt-3 font-[family:var(--font-display)] text-2xl text-[color:var(--text-dark)] sm:text-3xl">
                Select City And College
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--text-muted)]">
                Choose your preferred city first, then optionally narrow the results to one college.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="relative z-10 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[rgba(15,76,129,0.1)] bg-white text-[color:var(--text-muted)] transition hover:bg-[rgba(15,76,129,0.04)]"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        <div className="grid flex-1 gap-0 overflow-y-auto lg:grid-cols-[0.95fr_1.05fr]">
          <section className="border-b border-[rgba(15,76,129,0.08)] p-4 sm:p-5 lg:border-b-0 lg:border-r lg:p-6">
            <div className="mb-4 flex items-start gap-3">
              <div className="rounded-2xl bg-[rgba(15,76,129,0.08)] p-3 text-[color:var(--brand-primary)]">
                <MapPin className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[color:var(--text-dark)] sm:text-lg">1. Choose City</h3>
                <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                  Start with the city where you want to explore colleges.
                </p>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-3 rounded-[1rem] border border-[rgba(15,76,129,0.1)] bg-white px-3.5 py-3 shadow-[0_10px_24px_rgba(22,50,79,0.04)]">
              <Search className="size-4 text-[color:var(--brand-primary)]" />
              <input
                type="text"
                placeholder="Search city"
                value={cityQuery}
                onChange={(event) => setCityQuery(event.target.value)}
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="grid max-h-[17rem] grid-cols-2 gap-2.5 overflow-y-auto pr-1 sm:max-h-[21rem]">
              {cityList.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    setChosenCity(city);
                    setChosenCollege("");
                    setChosenCollegeId("");
                  }}
                  className={`rounded-[1rem] border px-3 py-3 text-left text-sm font-medium transition ${
                    chosenCity === city
                      ? "border-[rgba(60,126,182,0.35)] bg-[rgba(60,126,182,0.1)] text-[color:var(--brand-primary)] shadow-[0_10px_24px_rgba(60,126,182,0.12)]"
                      : "border-[rgba(15,76,129,0.08)] bg-white hover:border-[rgba(15,76,129,0.16)] hover:bg-[rgba(15,76,129,0.03)]"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </section>

          <section className="p-4 sm:p-5 lg:p-6">
            <div className="mb-4 flex items-start gap-3">
              <div className="rounded-2xl bg-[rgba(255,138,61,0.12)] p-3 text-[color:var(--brand-accent-deep)]">
                <Building2 className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[color:var(--text-dark)] sm:text-lg">
                  2. Choose College
                  <span className="ml-2 text-sm font-medium text-[color:var(--text-muted)]">(Optional)</span>
                </h3>
                <p className="mt-1 text-sm text-[color:var(--text-muted)]">
                  Pick one college or keep all colleges in the selected city.
                </p>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-3 rounded-[1rem] border border-[rgba(15,76,129,0.1)] bg-white px-3.5 py-3 shadow-[0_10px_24px_rgba(22,50,79,0.04)]">
              <Search className="size-4 text-[color:var(--brand-primary)]" />
              <input
                type="text"
                placeholder="Search college in selected city"
                value={collegeQuery}
                onChange={(event) => setCollegeQuery(event.target.value)}
                disabled={!chosenCity}
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
              />
            </div>

            {!chosenCity ? (
              <div className="rounded-[1.2rem] border border-dashed border-[rgba(15,76,129,0.14)] bg-[rgba(15,76,129,0.03)] px-4 py-6 text-sm text-[color:var(--text-muted)]">
                Select a city first to view colleges.
              </div>
            ) : (
              <div className="space-y-2.5 overflow-y-auto pr-1 sm:max-h-[21rem]">
                <button
                  type="button"
                  onClick={() => {
                    setChosenCollege("");
                    setChosenCollegeId("");
                  }}
                  className={`w-full rounded-[1.1rem] border px-4 py-3 text-left transition ${
                    chosenCollege === ""
                      ? "border-[rgba(255,138,61,0.34)] bg-[rgba(255,138,61,0.12)] shadow-[0_10px_24px_rgba(255,138,61,0.1)]"
                      : "border-dashed border-[rgba(255,138,61,0.24)] bg-[rgba(255,138,61,0.05)] hover:bg-[rgba(255,138,61,0.08)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-white/80 p-2.5 text-[color:var(--brand-accent-deep)]">
                      <Building2 className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[color:var(--text-dark)]">All Colleges In {chosenCity}</p>
                      <p className="text-xs text-[color:var(--text-muted)]">Show every college in the selected city</p>
                    </div>
                  </div>
                </button>

                {cityColleges.map((college) => (
                  <button
                    key={college.id}
                    type="button"
                    onClick={() => {
                      setChosenCollege(college.name);
                      setChosenCollegeId(college.id);
                    }}
                    className={`w-full rounded-[1rem] border px-3.5 py-3 text-left text-sm font-medium transition ${
                      chosenCollege === college.name
                        ? "border-[rgba(60,126,182,0.35)] bg-[rgba(60,126,182,0.1)] text-[color:var(--brand-primary)] shadow-[0_10px_24px_rgba(60,126,182,0.12)]"
                        : "border-[rgba(15,76,129,0.08)] bg-white hover:border-[rgba(15,76,129,0.16)] hover:bg-[rgba(15,76,129,0.03)]"
                    }`}
                  >
                    {college.name}
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="flex flex-col gap-3 border-t border-[rgba(15,76,129,0.08)] bg-white/70 px-4 py-4 sm:px-6 sm:py-5 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-[color:var(--text-muted)]">
            {chosenCity
              ? `City: ${chosenCity}${chosenCollege ? ` | College: ${chosenCollege}` : " | College: All Colleges"}`
              : "City: Choose City | College: Choose College"}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[rgba(15,76,129,0.1)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--brand-primary)] transition hover:bg-[rgba(15,76,129,0.04)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onApply({ city: chosenCity, college: chosenCollege, collegeId: chosenCollegeId })}
              disabled={!chosenCity}
              className="shine-button rounded-full bg-[color:var(--brand-primary)] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[color:var(--brand-primary-soft)]"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
