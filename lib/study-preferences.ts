export const STUDY_PREFERENCE_KEY = "collegehub_study_preference";

export type StudyPreference = {
  city: string;
  college: string;
};

export const defaultStudyPreference: StudyPreference = {
  city: "Coimbatore",
  college: "All Colleges",
};

export const readStudyPreference = (): StudyPreference => {
  if (typeof window === "undefined") return defaultStudyPreference;

  try {
    const raw = window.localStorage.getItem(STUDY_PREFERENCE_KEY);
    if (!raw) return defaultStudyPreference;
    const parsed = JSON.parse(raw) as Partial<StudyPreference>;
    return {
      city: parsed.city || defaultStudyPreference.city,
      college: parsed.college || defaultStudyPreference.college,
    };
  } catch {
    return defaultStudyPreference;
  }
};

export const persistStudyPreference = (value: StudyPreference) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STUDY_PREFERENCE_KEY, JSON.stringify(value));
};
