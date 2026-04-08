import type { College, Course } from "@/lib/site-data";

const SEARCH_STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "at",
  "best",
  "by",
  "college",
  "colleges",
  "for",
  "in",
  "near",
  "of",
  "on",
  "or",
  "the",
  "top",
  "with",
]);

export const normalizeSearchText = (value: string) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const getSearchTokens = (value: string) =>
  normalizeSearchText(value)
    .split(" ")
    .map((token) => token.trim())
    .filter(Boolean);

const getIntentTokens = (value: string) => getSearchTokens(value).filter((token) => !SEARCH_STOPWORDS.has(token));

const includesAllTokens = (haystack: string, tokens: string[]) => tokens.every((token) => haystack.includes(token));

const countMatchingTokens = (haystack: string, tokens: string[]) =>
  tokens.reduce((count, token) => count + (haystack.includes(token) ? 1 : 0), 0);

const meetsTokenCoverage = (haystack: string, tokens: string[]) => {
  if (!tokens.length) return false;
  const matchedCount = countMatchingTokens(haystack, tokens);
  const requiredMatches = tokens.length === 1 ? 1 : Math.max(2, Math.ceil(tokens.length * 0.6));
  return matchedCount >= Math.min(requiredMatches, tokens.length);
};

export type SearchCity = {
  id: string;
  name: string;
  state: string;
};

const scoreCity = (city: SearchCity, query: string, tokens: string[]) => {
  const cityName = normalizeSearchText(city.name);
  const cityState = normalizeSearchText(city.state);
  const haystack = normalizeSearchText(`${city.name} ${city.state}`);

  let score = 0;
  if (query === cityName) score += 120;
  if (query === haystack) score += 100;
  if (haystack.includes(query)) score += 60;
  if (includesAllTokens(haystack, tokens)) score += 45;
  score += countMatchingTokens(haystack, tokens) * 12;
  if (tokens.some((token) => cityName.startsWith(token))) score += 10;
  if (tokens.some((token) => cityState.includes(token))) score += 6;

  return score;
};

const isRelevantCity = (city: SearchCity, query: string, tokens: string[]) => {
  const cityName = normalizeSearchText(city.name);
  const cityState = normalizeSearchText(city.state);
  const haystack = normalizeSearchText(`${city.name} ${city.state}`);

  if (query === cityName || query === haystack) return true;
  if (haystack.includes(query) && query.length >= 3) return true;
  if (tokens.some((token) => cityName.includes(token) || cityState.includes(token))) {
    return meetsTokenCoverage(haystack, tokens);
  }

  return false;
};

const scoreCollege = (college: College, query: string, tokens: string[]) => {
  const name = normalizeSearchText(college.name);
  const district = normalizeSearchText(college.district);
  const state = normalizeSearchText(college.state);
  const university = normalizeSearchText(college.university);
  const description = normalizeSearchText(college.description);
  const streamText = normalizeSearchText(college.streams.join(" "));
  const haystack = normalizeSearchText(
    `${college.name} ${college.university} ${college.description} ${college.district} ${college.state} ${college.streams.join(" ")}`,
  );

  let score = 0;
  if (query === name) score += 170;
  if (haystack.includes(query)) score += 75;
  if (includesAllTokens(haystack, tokens)) score += 60;
  score += countMatchingTokens(haystack, tokens) * 14;
  if (tokens.some((token) => name.startsWith(token))) score += 18;
  if (tokens.some((token) => district.includes(token))) score += 18;
  if (tokens.some((token) => state.includes(token))) score += 10;
  if (tokens.some((token) => university.includes(token))) score += 8;
  if (tokens.some((token) => streamText.includes(token))) score += 8;
  if (tokens.some((token) => description.includes(token))) score += 4;
  if (college.isBestCollege && /(best|top)/.test(query)) score += 20;
  if (college.isBestCollege) score += 6;
  score += Math.min(college.placementRate || 0, 100) / 20;

  return score;
};

const isRelevantCollege = (college: College, query: string, tokens: string[]) => {
  const name = normalizeSearchText(college.name);
  const district = normalizeSearchText(college.district);
  const state = normalizeSearchText(college.state);
  const university = normalizeSearchText(college.university);
  const streamText = normalizeSearchText(college.streams.join(" "));
  const haystack = normalizeSearchText(
    `${college.name} ${college.university} ${college.description} ${college.district} ${college.state} ${college.streams.join(" ")}`,
  );

  if (query === name) return true;
  if (haystack.includes(query) && query.length >= 4) return true;

  const hasStrongFieldMatch = tokens.some(
    (token) =>
      name.includes(token) ||
      district.includes(token) ||
      state.includes(token) ||
      university.includes(token) ||
      streamText.includes(token),
  );

  return hasStrongFieldMatch && meetsTokenCoverage(haystack, tokens);
};

const scoreCourse = (course: Course, query: string, tokens: string[]) => {
  const courseName = normalizeSearchText(course.course);
  const specialization = normalizeSearchText(course.specialization);
  const college = normalizeSearchText(course.college);
  const university = normalizeSearchText(course.university);
  const category = normalizeSearchText(course.courseCategory);
  const haystack = normalizeSearchText(
    `${course.course} ${course.specialization} ${course.college} ${course.university} ${course.courseCategory} ${course.stream || ""}`,
  );

  let score = 0;
  if (query === courseName) score += 160;
  if (haystack.includes(query)) score += 70;
  if (includesAllTokens(haystack, tokens)) score += 55;
  score += countMatchingTokens(haystack, tokens) * 14;
  if (tokens.some((token) => courseName.startsWith(token))) score += 16;
  if (tokens.some((token) => specialization.includes(token))) score += 10;
  if (tokens.some((token) => category.includes(token))) score += 8;
  if (tokens.some((token) => college.includes(token))) score += 8;
  if (tokens.some((token) => university.includes(token))) score += 6;
  if (course.isTopCourse && /(best|top)/.test(query)) score += 16;
  if (course.isTopCourse) score += 4;

  return score;
};

const isRelevantCourse = (course: Course, query: string, tokens: string[]) => {
  const courseName = normalizeSearchText(course.course);
  const specialization = normalizeSearchText(course.specialization);
  const college = normalizeSearchText(course.college);
  const university = normalizeSearchText(course.university);
  const category = normalizeSearchText(course.courseCategory);
  const haystack = normalizeSearchText(
    `${course.course} ${course.specialization} ${course.college} ${course.university} ${course.courseCategory} ${course.stream || ""}`,
  );

  if (query === courseName) return true;
  if (haystack.includes(query) && query.length >= 4) return true;

  const hasStrongFieldMatch = tokens.some(
    (token) =>
      courseName.includes(token) ||
      specialization.includes(token) ||
      category.includes(token) ||
      college.includes(token) ||
      university.includes(token),
  );

  return hasStrongFieldMatch && meetsTokenCoverage(haystack, tokens);
};

export const getRankedSearchResults = (
  queryValue: string,
  colleges: College[],
  courses: Course[],
  cities: SearchCity[],
) => {
  const query = normalizeSearchText(queryValue);
  const tokens = getIntentTokens(queryValue);
  const searchableTokens = tokens.length ? tokens : getSearchTokens(queryValue);

  if (!query || !searchableTokens.length) {
    return { courses: [] as Course[], colleges: [] as College[], cities: [] as SearchCity[] };
  }

  const rankedCourses = courses
    .filter((course) => isRelevantCourse(course, query, searchableTokens))
    .map((course) => ({ item: course, score: scoreCourse(course, query, searchableTokens) }))
    .filter((entry) => entry.score >= 20)
    .sort((left, right) => right.score - left.score || left.item.course.localeCompare(right.item.course))
    .map((entry) => entry.item);

  const rankedColleges = colleges
    .filter((college) => isRelevantCollege(college, query, searchableTokens))
    .map((college) => ({ item: college, score: scoreCollege(college, query, searchableTokens) }))
    .filter((entry) => entry.score >= 20)
    .sort((left, right) => right.score - left.score || left.item.name.localeCompare(right.item.name))
    .map((entry) => entry.item);

  const rankedCities = cities
    .filter((city) => isRelevantCity(city, query, searchableTokens))
    .map((city) => ({ item: city, score: scoreCity(city, query, searchableTokens) }))
    .filter((entry) => entry.score >= 12)
    .sort((left, right) => right.score - left.score || left.item.name.localeCompare(right.item.name))
    .map((entry) => entry.item);

  return {
    courses: rankedCourses,
    colleges: rankedColleges,
    cities: rankedCities,
  };
};
