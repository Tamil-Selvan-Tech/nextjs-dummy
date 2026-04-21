export type ExamResource = {
  label: string;
  href: string;
  note: string;
};

export type ExamBlock = {
  title: string;
  items: string[];
};

export type ExamInfoRow = {
  key: string;
  value: string;
};

export type ExamTableRow = {
  label: string;
  value: string;
};

export type ExamDateRow = {
  date: string;
  event: string;
};

export type ExamEligibilityRow = {
  criteria: string;
  eligibility: string;
};

export type ExamUpdate = {
  date: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export type ExamOverviewCard = {
  title: string;
  value: string;
};

export type ExamSection = {
  id:
    | "overview"
    | "registration"
    | "exam-pattern"
    | "admit-card"
    | "answer-key"
    | "question-paper"
    | "cutoff"
    | "preparation"
    | "mock-test"
    | "news";
  label: string;
  eyebrow: string;
  title: string;
  summary: string;
  highlights?: string[];
  bullets?: string[];
  steps?: string[];
  introParagraphs?: string[];
  ctaLabel?: string;
  ctaHref?: string;
  paragraphs?: string[];
  tableTitle?: string;
  tableColumns?: [string, string];
  tableRows?: ExamInfoRow[];
  note?: string;
  followupTitle?: string;
  followupParagraphs?: string[];
  alsoCheckLabel?: string;
  alsoCheckHref?: string;
  postTableParagraphs?: string[];
  postTableBullets?: string[];
  postTableNote?: string;
  postTableFollowupTitle?: string;
  postTableFollowupParagraphs?: string[];
  postTableAlsoCheckLabel?: string;
  postTableAlsoCheckHref?: string;
  blocks?: ExamBlock[];
  resources?: ExamResource[];
};

export type ExamTimelineItem = {
  label: string;
  date: string;
  displayDate: string;
  tone?: "primary" | "warning" | "success";
};

export type ExamDetails = {
  slug: string;
  title: string;
  short: string;
  logo: string;
  mode: string;
  date: string;
  level: string;
  colleges: string;
  authority: string;
  examMode: string;
  coursesOffered: string;
  totalCandidates: string;
  seatsAvailable: string;
  applicationStart: string;
  applicationEnd: string;
  applicationStartLabel: string;
  applicationEndLabel: string;
  examDateISO: string;
  officialSite: string;
  heroGradient: string;
  overviewHighlights: string[];
  latestUpdates: ExamUpdate[];
  keySummary: string[];
  aboutTitle: string;
  aboutParagraphs: string[];
  overviewCards: ExamOverviewCard[];
  highlightsTable: ExamTableRow[];
  importantDatesTable: ExamDateRow[];
  eligibilityTable?: ExamEligibilityRow[];
  relatedArticles?: string[];
  relatedQuestions?: string[];
  timeline: ExamTimelineItem[];
  sections: ExamSection[];
};

const commonTabs = [
  "overview",
  "registration",
  "exam-pattern",
  "admit-card",
  "answer-key",
  "question-paper",
  "cutoff",
  "preparation",
  "mock-test",
  "news",
] as const;

function googleSearch(query: string) {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

function ensureSections(sections: ExamSection[]) {
  return commonTabs.map((id) => {
    const match = sections.find((section) => section.id === id);
    if (!match) {
      throw new Error(`Missing exam section: ${id}`);
    }
    return match;
  });
}

export const examContent: Record<string, ExamDetails> = {
  "jee-main": {
    slug: "jee-main",
    title: "JEE Main 2026",
    short: "Engineering, architecture, and planning aspirants-kku exam dates, pattern, cutoff, and preparation roadmap in one place.",
    logo: "/exams/jee-main.svg",
    mode: "Online Exam",
    date: "April 02, 2026",
    level: "National",
    colleges: "2031",
    authority: "National Testing Agency (NTA)",
    examMode: "Computer Based Test",
    coursesOffered: "B.E / B.Tech / B.Arch / B.Planning",
    totalCandidates: "13.1 lakh+ expected",
    seatsAvailable: "38,000+ seats across NITs, IIITs, and CFTIs",
    applicationStart: "January 05, 2026",
    applicationEnd: "March 10, 2026",
    applicationStartLabel: "Applications Open",
    applicationEndLabel: "Application Deadline",
    examDateISO: "2026-04-02T09:00:00+05:30",
    officialSite: "https://jeemain.nta.nic.in",
    heroGradient: "linear-gradient(135deg, #0f4c81 0%, #15639f 52%, #f28b39 100%)",
    overviewHighlights: [
      "NTA conducts the exam for NIT, IIIT, and CFTI admissions.",
      "Paper 1 is for B.E/B.Tech and Paper 2A/2B is for B.Arch/B.Planning.",
      "Best score across sessions helps in final ranking for many candidates.",
    ],
    latestUpdates: [
      {
        date: "31 Dec, 2025",
        body: "JEE Main 2026 application and fee details have been released.",
        ctaLabel: "Check Here",
        ctaHref: "https://jeemain.nta.nic.in",
      },
      {
        date: "29 Dec, 2025",
        body: "JEE Main 2026 exam schedule and session window have been updated.",
        ctaLabel: "Check Dates Here",
        ctaHref: "https://jeemain.nta.nic.in",
      },
    ],
    keySummary: [
      "The article covers registration, eligibility, syllabus, exam pattern, preparation strategy, and previous year papers.",
      "JEE Main is the gateway for NIT, IIIT, and CFTI admissions, and also the qualifying stage for JEE Advanced.",
      "Candidates should track session-wise dates, correction window, admit card release, and result timeline carefully.",
      "Paper pattern includes MCQ and numerical questions, and percentile trends may vary by shift.",
    ],
    aboutTitle: "What is JEE Main?",
    aboutParagraphs: [
      "The Joint Entrance Examination (JEE) Main is a national-level entrance examination conducted by the National Testing Agency for admissions to undergraduate engineering, architecture, and planning programs across India.",
      "It serves as the primary admission route for NITs, IIITs, and other centrally funded technical institutions, and it also acts as the qualifying exam for JEE Advanced.",
    ],
    overviewCards: [
      { title: "Conducting Body", value: "NTA" },
      { title: "Mode of Examination", value: "CBT Mode" },
      { title: "Exam Dates", value: "April 2026" },
      { title: "Total Papers", value: "Paper 1, 2A, 2B" },
      { title: "Subjects", value: "PCM / Aptitude / Drawing" },
      { title: "Attempts Allowed", value: "As per NTA policy" },
    ],
    highlightsTable: [
      { label: "Governing Body", value: "National Testing Agency" },
      { label: "Exam Level", value: "National Entrance Test" },
      { label: "Exam Mode", value: "Online (CBT)" },
      { label: "Papers", value: "Paper 1, Paper 2A, Paper 2B" },
      { label: "Subjects", value: "Physics, Chemistry, Mathematics, Aptitude, Drawing / Planning" },
      { label: "Exam Date", value: "April 02 to 09, 2026" },
      { label: "Registration Dates", value: "January 05, 2026 to March 10, 2026" },
      { label: "Eligibility", value: "Class 12 with PCM / appearing candidates" },
      { label: "Official Website", value: "jeemain.nta.nic.in" },
    ],
    importantDatesTable: [
      { date: "January 05, 2026", event: "Online application start date" },
      { date: "March 10, 2026", event: "Registration end date" },
      { date: "March 13 to 15, 2026", event: "Correction window" },
      { date: "March 24, 2026", event: "Admit card release" },
      { date: "April 02 to 09, 2026", event: "JEE Main exam window" },
      { date: "April 19, 2026", event: "Result window" },
    ],
    eligibilityTable: [
      { criteria: "Academic Qualification", eligibility: "Class 12 passed or appearing with Physics, Chemistry, and Mathematics" },
      { criteria: "Age Limit", eligibility: "As per NTA notification" },
      { criteria: "Attempts", eligibility: "As per latest JEE Main eligibility rules" },
      { criteria: "Courses Covered", eligibility: "B.E / B.Tech / B.Arch / B.Planning" },
    ],
    relatedArticles: [
      "How to apply for JEE Main 2026?",
      "JEE Main 2026 syllabus chapter-wise",
      "Best books for JEE Main preparation",
    ],
    relatedQuestions: [
      "How many sessions of JEE Main 2026 will be conducted?",
      "What is the difference between JEE Main Paper 2A and 2B?",
    ],
    timeline: [
      { label: "Application Start", date: "2026-01-05T09:00:00+05:30", displayDate: "January 05, 2026", tone: "success" },
      { label: "Last Date", date: "2026-03-10T23:59:00+05:30", displayDate: "March 10, 2026", tone: "warning" },
      { label: "Correction Window", date: "2026-03-13T10:00:00+05:30", displayDate: "March 13 to 15, 2026" },
      { label: "Admit Card", date: "2026-03-24T10:00:00+05:30", displayDate: "March 24, 2026" },
      { label: "Exam Day", date: "2026-04-02T09:00:00+05:30", displayDate: "April 02 to 09, 2026", tone: "primary" },
      { label: "Result Window", date: "2026-04-19T10:00:00+05:30", displayDate: "April 19, 2026" },
    ],
    sections: ensureSections([
      {
        id: "overview",
        label: "Overview",
        eyebrow: "Exam Snapshot",
        title: "JEE Main 2026 overview",
        summary: "JEE Main page-la exam date, registration, eligibility, paper pattern, and counselling-ku useful core facts clear-a collect pannirukkom.",
        highlights: [
          "JEE Main score NIT, IIIT, and CFTI admissions-ku direct-a use aagum.",
          "JEE Advanced eligibility-ku JEE Main qualification mandatory.",
          "Shift-wise difficulty and percentile conversion differ aagalam.",
        ],
        blocks: [
          {
            title: "Where to refer",
            items: [
              "Official brochure and NTA notices first check pannunga.",
              "Shift-wise updates and session news-ku official portal dhaan reliable source.",
            ],
          },
        ],
        resources: [
          { label: "Official JEE Main portal", href: "https://jeemain.nta.nic.in", note: "Primary source for brochure, notices, and login." },
          { label: "Google: JEE Main latest updates", href: googleSearch("JEE Main 2026 latest updates"), note: "Quick search reference." },
        ],
      },
      {
        id: "registration",
        label: "Registration",
        eyebrow: "Application Process",
        title: "Registration and application process",
        summary: "Start date, last date, correction window, fees, and required documents one place-la highlight pannirukkom.",
        steps: ["Register", "Fill Application Form", "Upload Documents", "Pay Fees"],
        blocks: [
          {
            title: "Important dates",
            items: ["Start Date: January 05, 2026", "Last Date: March 10, 2026", "Correction Window: March 13 to 15, 2026"],
          },
          {
            title: "Application fees",
            items: ["General / OBC fee higher band", "SC / ST / PwD / EWS concessions apply", "Paper combinations basis-la fee vary aagalam"],
          },
          {
            title: "Required documents",
            items: ["Photo and signature", "Class 10 / 12 details", "Category / PwD certificate if applicable", "Email, mobile number, and ID proof"],
          },
        ],
        resources: [
          { label: "Apply on official portal", href: "https://jeemain.nta.nic.in", note: "Registration, correction, and fee payment." },
        ],
      },
      {
        id: "admit-card",
        label: "Admit Card",
        eyebrow: "Hall Ticket",
        title: "Admit card release and exam day flow",
        summary: "Hall ticket release, download steps, and exam day instructions clear-a include pannirukkom.",
        blocks: [
          {
            title: "Download checklist",
            items: ["Login with application number and password / DOB", "Verify centre, shift, and personal details", "Download PDF and keep multiple copies"],
          },
          {
            title: "Exam day instructions",
            items: ["Reach centre early with valid photo ID", "Follow CBT rules and prohibited-items notice", "Session timing strictly follow pannunga"],
          },
        ],
        resources: [
          { label: "Official admit card login", href: "https://jeemain.nta.nic.in", note: "Hall ticket download source." },
        ],
      },
      {
        id: "answer-key",
        label: "Answer Key",
        eyebrow: "Response Challenge",
        title: "Answer key and objection process",
        summary: "Provisional key, response sheet, challenge window, and final key tracking section.",
        blocks: [
          {
            title: "Flow",
            items: ["Provisional answer key release", "Response sheet access", "Objection window with fee per question", "Final answer key after review"],
          },
        ],
        resources: [
          { label: "Official answer key portal", href: "https://jeemain.nta.nic.in", note: "Use for response sheet and challenge." },
        ],
      },
      {
        id: "question-paper",
        label: "Question Paper",
        eyebrow: "PYQ Bank",
        title: "Question paper and previous year practice",
        summary: "Year-wise and shift-wise paper reference with solutions prepare pannrathukku curated pointers.",
        blocks: [
          { title: "What to collect", items: ["Previous year papers year-wise", "Shift-wise memory-based papers", "Video / PDF solutions for review"] },
          { title: "How to use them", items: ["Time-bound practice", "Topic tagging with error notebook", "Easy vs tricky questions separate-a analyze pannunga"] },
        ],
        resources: [
          { label: "Google: JEE Main previous year papers", href: googleSearch("JEE Main previous year papers with solutions pdf"), note: "Quick practice search." },
        ],
      },
      {
        id: "cutoff",
        label: "Cutoff",
        eyebrow: "Score Targets",
        title: "Category-wise cutoff and rank trends",
        summary: "Qualifying cutoff, opening-closing ranks, and safe score context by category.",
        blocks: [
          { title: "Track these", items: ["Category-wise qualifying percentile", "JoSAA opening-closing ranks", "Safe score analysis for NIT / IIIT preference bands"] },
        ],
        resources: [
          { label: "Google: JEE Main cutoff", href: googleSearch("JEE Main 2026 cutoff category wise"), note: "Fast cutoff reference." },
        ],
      },
      {
        id: "preparation",
        label: "Preparation",
        eyebrow: "Study Strategy",
        title: "Preparation plan for PCM aspirants",
        summary: "Subject-wise strategy, important topics, books, and a simple study-plan framework.",
        blocks: [
          { title: "Subject-wise strategy", items: ["Physics: formulas + mixed concept application", "Chemistry: NCERT-heavy revision", "Maths: daily problem-solving speed drills"] },
          { title: "Recommended routine", items: ["NCERT first, then coaching modules / PYQs", "Weekly mock + analysis day", "Revision slots for weak chapters"] },
        ],
        resources: [
          { label: "Google: JEE Main preparation strategy", href: googleSearch("JEE Main 2026 preparation strategy subject wise"), note: "Quick tips search." },
        ],
      },
      {
        id: "mock-test",
        label: "Mock Test",
        eyebrow: "Practice Mode",
        title: "Mock test and simulation routine",
        summary: "Free mock tests, practice links, and actual CBT simulation flow.",
        blocks: [
          { title: "Mock routine", items: ["Full-length mock every week", "Alternate days chapter tests", "Same exam time slot-la simulation pannunga"] },
        ],
        resources: [
          { label: "Google: JEE Main free mock test", href: googleSearch("JEE Main free mock test online"), note: "Quick mock search." },
        ],
      },
      {
        id: "exam-pattern",
        label: "Exam Pattern",
        eyebrow: "Paper Structure",
        title: "What is the JEE Main Exam Pattern?",
        introParagraphs: [
          "The JEE Main Exam Pattern 2026 is live through the official NTA portal and continues to guide aspirants appearing for engineering, architecture, and planning papers.",
          "JEE Main is conducted in Computer-Based Test (CBT) mode, with separate structures for Paper 1, Paper 2A, and Paper 2B depending on the course chosen by the candidate.",
        ],
        ctaLabel: "Click here to know in detail about the JEE Main Exam Pattern 2026",
        ctaHref: "https://jeemain.nta.nic.in",
        summary: "JEE Main 2026-la Paper 1, Paper 2A, and Paper 2B structure, question mix, and marking scheme clear-a purinjukaradhu score planning-ku important.",
        paragraphs: [
          "JEE Main is conducted in CBT mode, with separate paper formats for B.E. / B.Tech, B.Arch, and B.Planning aspirants.",
          "Paper 1 usually includes Physics, Chemistry, and Mathematics with MCQ and numerical value questions, while Paper 2 papers include aptitude plus drawing or planning-based sections as notified.",
        ],
        bullets: [
          "Questions per Paper: varies by paper type and latest NTA notification",
          "Total Papers: Paper 1, Paper 2A, and Paper 2B",
          "Total Marks: as per the latest official exam structure for each paper",
        ],
        note: "JEE Main 2026 follows the notified NTA structure. Candidates should always verify the latest brochure for paper-wise question count and marking scheme.",
        followupTitle: "JEE Main Exam Pattern: Recent Structure Overview",
        followupParagraphs: [
          "JEE Main pattern remains organized around separate papers for engineering, architecture, and planning aspirants, with CBT-based assessment continuing as the standard format.",
          "NTA can issue paper-wise refinements in question distribution or instructions, so candidates must cross-check the most recent information bulletin before the exam.",
        ],
        alsoCheckLabel: "JEE Main 2026 Syllabus and Previous Year Question Papers",
        blocks: [
          {
            title: "Key Summary",
            items: [
              "JEE Main exam pattern includes separate formats for Paper 1, Paper 2A, and Paper 2B.",
              "Physics, Chemistry, and Mathematics remain the core scoring subjects across the engineering paper.",
              "Candidates should verify the latest official marking scheme and question distribution before the exam.",
              "Shift-wise paper format and numerical question mix can affect time management and final score planning.",
            ],
          },
        ],
        tableTitle: "JEE Main 2026 Exam Pattern",
        tableColumns: ["Parameter", "Details"],
        tableRows: [
          { key: "Exam Mode", value: "Computer-Based Test (CBT)" },
          { key: "Papers", value: "Paper 1, Paper 2A, Paper 2B" },
          { key: "Subjects", value: "Physics, Chemistry, Mathematics, Aptitude, Drawing / Planning" },
          { key: "Question Type", value: "MCQ and numerical value questions as applicable" },
          { key: "Marking Scheme", value: "+4 for correct answers and -1 for incorrect MCQs, as notified" },
          { key: "Sessions", value: "Shift-wise papers across the exam window" },
        ],
      },
      {
        id: "news",
        label: "News",
        eyebrow: "Latest Updates",
        title: "JEE Main news and alerts",
        summary: "Latest updates, result announcements, and alert-tracking reference section.",
        blocks: [
          { title: "What to watch", items: ["Correction window announcement", "City intimation and admit card update", "Result / rank card notice", "Counselling and JoSAA updates"] },
        ],
        resources: [
          { label: "Official notices", href: "https://jeemain.nta.nic.in", note: "Most reliable exam alerts." },
        ],
      },
    ]),
  },
  "jee-advanced": {
    slug: "jee-advanced",
    title: "JEE Advanced 2026",
    short: "IIT admission target panna aspirants-kku eligibility, paper structure, registration, and score interpretation checkpoints in a single detailed page.",
    logo: "/exams/jee-advanced.svg",
    mode: "Online Exam",
    date: "May 17, 2026",
    level: "National",
    colleges: "23 IITs",
    authority: "IIT Roorkee / Joint Admission Board",
    examMode: "Computer Based Test",
    coursesOffered: "B.Tech / BS / Dual Degree at IITs",
    totalCandidates: "1.85 lakh to 1.9 lakh expected registrations",
    seatsAvailable: "18,200 seats across 23 IITs",
    applicationStart: "April 23, 2026",
    applicationEnd: "May 02, 2026",
    applicationStartLabel: "Registration Opens",
    applicationEndLabel: "Registration Deadline",
    examDateISO: "2026-05-17T09:00:00+05:30",
    officialSite: "https://jeeadv.ac.in",
    heroGradient: "linear-gradient(135deg, #1b1f5e 0%, #274690 52%, #f39237 100%)",
    overviewHighlights: [
      "Only eligible JEE Main 2026 qualified candidates can apply.",
      "Paper 1 and Paper 2 both are compulsory on the same day.",
      "Competition is intense with limited IIT seats and high-level questions.",
    ],
    latestUpdates: [
      {
        date: "31 Dec, 2025",
        body: "JEE (Advanced) 2026 registration fee has been announced.",
        ctaLabel: "Check Here",
        ctaHref: "https://jeeadv.ac.in",
      },
      {
        date: "29 Dec, 2025",
        body: "JEE (Advanced) 2026 will be held on Sunday, 17th May, 2026.",
        ctaLabel: "Check Dates Here",
        ctaHref: "https://jeeadv.ac.in",
      },
    ],
    keySummary: [
      "This article covers registration, eligibility, syllabus, exam pattern, preparation strategy, and previous year papers or mock papers.",
      "Around 1,85,000 JEE Main-qualified candidates may compete for nearly 18,200 seats at 23 IITs in 2026.",
      "The syllabus comes from Class 11 and 12, but numerical and multi-correct questions carry major weightage.",
      "Candidates need 75% aggregate in Boards or be within the Top 20 Percentile of their respective boards for admission.",
      "Minimum subject-wise qualifying marks are important even if the aggregate is high.",
    ],
    aboutTitle: "What is JEE Advanced?",
    aboutParagraphs: [
      "The Joint Entrance Examination (JEE) Advanced is a national-level entrance examination conducted for students seeking admission to the IITs in India.",
      "The exam is conducted in two mandatory papers, Paper 1 and Paper 2, on the same day in two shifts. Both papers are held in CBT mode and include Physics, Chemistry, and Mathematics questions.",
      "After qualifying, candidates can get admission into undergraduate engineering and science programs at IITs and also other institutes like IISc, IIST, IIPE, and RGIPT through their respective processes.",
      "Last year, around 1,87,223 candidates registered for the exam, while only 18,188 seats were available across 23 IITs, showing the high competition level.",
    ],
    overviewCards: [
      { title: "Conducting Body", value: "IIT Roorkee" },
      { title: "Mode of Examination", value: "CBT Mode" },
      { title: "Exam Dates", value: "17 May 2026" },
      { title: "Total Papers", value: "Paper 1 and Paper 2" },
      { title: "Subjects", value: "Physics, Chemistry, Mathematics" },
      { title: "Attempts Allowed", value: "Maximum 2 attempts" },
    ],
    highlightsTable: [
      { label: "Governing Body", value: "IIT Council" },
      { label: "Exam Level", value: "National Entrance Test" },
      { label: "Exam Mode", value: "Online (CBT)" },
      { label: "Papers", value: "Paper 1 and Paper 2" },
      { label: "Subjects", value: "Physics, Chemistry, Mathematics" },
      { label: "Medium", value: "English & Hindi" },
      { label: "Exam Date", value: "17 May 2026" },
      { label: "Registration Dates", value: "23 April 2026, 10 am to 02 May 2026" },
      { label: "Eligibility", value: "Top 2,50,000 JEE Main 2026 qualifiers" },
      { label: "No. of Attempts Allowed", value: "2 attempts in consecutive years" },
      { label: "Total Questions", value: "102 questions (51 questions in each paper)" },
      { label: "Expected Seat Intake", value: "18,200 across 23 IITs" },
      { label: "Official Website", value: "jeeadv.ac.in" },
    ],
    importantDatesTable: [
      { date: "6 April 2026, 10 am", event: "Online Registration Start Date for Foreign National and OCI/PIO (F) candidates" },
      { date: "23 April 2026, 10 am", event: "Online Registration Start Date for JEE Main 2026 qualified candidates" },
      { date: "2 May 2026", event: "Registration end date" },
      { date: "4 May 2026", event: "Last date for fee payment" },
      { date: "11 May 2026, 10 am - 17 May 2026, 2:30 pm", event: "Admit card availability window" },
      { date: "16 May 2026", event: "Choosing of scribe by PwD candidates" },
      { date: "17 May 2026", event: "JEE Advanced exam date" },
      { date: "Paper 1: 9 am-12 pm / Paper 2: 2:30 pm-5:30 pm", event: "Paper timing slots" },
    ],
    eligibilityTable: [
      { criteria: "Performance in JEE Main 2026", eligibility: "Top 2,50,000 JEE Main 2026 qualified candidates across all categories" },
      { criteria: "Age Limit", eligibility: "Candidates born on or after October 1, 2001 with 5-year relaxation for SC/ST/PwD" },
      { criteria: "Number of Attempts", eligibility: "A maximum of two times in two consecutive years" },
      { criteria: "Appearance in Class 12", eligibility: "Candidates passing Class 12 in 2025 or 2026 with PCM or 12th results after 18 June 2024 are also eligible" },
      { criteria: "Earlier Admission at IITs", eligibility: "Candidates should not have been admitted to an IIT under any academic program listed in JoSAA Business Rules 2025" },
      { criteria: "Foreign Nationals and OCI/PIO Candidates", eligibility: "They are not required to write JEE Main 2026 and may register for JEE Advanced 2026 directly under the relevant category" },
    ],
    relatedArticles: [
      "How to apply for the JEE Advanced 2026 Exam?",
      "Check the category-wise eligibility and the overall criteria",
      "Which topics are included in the 2026 syllabus for JEE Advanced?",
      "What is the Top 20 Percentile for JEE Advanced 2026?",
    ],
    relatedQuestions: [
      "What is the criterion to decide which IIT will conduct the JEE Advanced exam?",
      "How is the exam pattern of JEE Advanced different from JEE Main?",
      "If I passed Class 12 in 2025, am I eligible for JEE Advanced 2026 even if I dropped a year?",
      "If I reappear only in some subjects of Class 12, can I still use the Top 20 Percentile criterion?",
    ],
    timeline: [
      { label: "Registration Start", date: "2026-04-23T10:00:00+05:30", displayDate: "April 23, 2026", tone: "success" },
      { label: "Last Date", date: "2026-05-02T23:59:00+05:30", displayDate: "May 02, 2026", tone: "warning" },
      { label: "Fee Payment", date: "2026-05-04T23:59:00+05:30", displayDate: "May 04, 2026" },
      { label: "Admit Card", date: "2026-05-11T10:00:00+05:30", displayDate: "May 11, 2026" },
      { label: "Exam Day", date: "2026-05-17T09:00:00+05:30", displayDate: "May 17, 2026", tone: "primary" },
      { label: "Response Sheet", date: "2026-05-22T10:00:00+05:30", displayDate: "May 22, 2026" },
    ],
    sections: ensureSections([
      {
        id: "overview",
        label: "Overview",
        eyebrow: "IIT Track",
        title: "JEE Advanced 2026 overview",
        summary: "JEE Advanced page-la registration, eligibility, syllabus, exam pattern, preparation, and IIT seat competition summary clear-a collect pannirukkom.",
        highlights: [
          "IIT Roorkee will conduct JEE Advanced 2026 on 17 May 2026.",
          "Only JEE Main-qualified candidates meeting all eligibility rules can apply.",
          "Question pattern varies section-wise and may include partial marking and numerical answers.",
        ],
        blocks: [
          {
            title: "Related News Link",
            items: ["What is the Top 20 Percentile for JEE Advanced 2026?", "Source: jeeadv.ac.in"],
          },
        ],
        resources: [
          { label: "Official JEE Advanced portal", href: "https://jeeadv.ac.in", note: "Brochure, registration, admit card, and answer key notices." },
          { label: "Google: JEE Advanced latest updates", href: googleSearch("JEE Advanced 2026 latest updates"), note: "Quick news reference." },
        ],
      },
      {
        id: "registration",
        label: "Registration",
        eyebrow: "Application Process",
        title: "JEE Advanced 2026 registration",
        summary: "Registration starts after JEE Main results. Portal opens on 23 April 2026 and closes on 2 May 2026.",
        steps: ["Register", "Verify JEE Main eligibility", "Upload category / class details", "Pay Fees"],
        blocks: [
          {
            title: "Registration details",
            items: [
              "The registration process starts on 23 April 2026 after JEE Main results are declared.",
              "The registration portal closes by 2 May 2026.",
              "Candidates should verify eligibility carefully before fee payment.",
            ],
          },
          {
            title: "Registration fees",
            items: [
              "The registration fee is expected to be similar to the previous year.",
              "Fee structure differs according to category, gender, and nationality.",
              "Foreign national / OCI / PIO candidates have a separate fee structure.",
            ],
          },
          {
            title: "Required documents",
            items: [
              "JEE Main credentials",
              "Class 10 / 12 details",
              "Category / PwD certificates if applicable",
              "Passport-size photograph and signature",
            ],
          },
        ],
        resources: [
          { label: "Official registration portal", href: "https://jeeadv.ac.in", note: "Use for login and final application submission." },
        ],
      },
      {
        id: "admit-card",
        label: "Admit Card",
        eyebrow: "Hall Ticket",
        title: "Admit card and exam day checklist",
        summary: "Admit card dates, paper timings, and exam day instructions for the compulsory two-paper format.",
        blocks: [
          {
            title: "Key points",
            items: [
              "Admit card dates: 11 May 2026 to 17 May 2026, 2:30 pm",
              "Paper 1 and Paper 2 timings must be checked carefully",
              "Same-day attendance for both papers is compulsory",
            ],
          },
          {
            title: "Exam day instructions",
            items: [
              "Carry printed admit card and valid photo ID",
              "Report early for biometric and frisking procedures",
              "Follow CBT instructions carefully during both papers",
            ],
          },
        ],
        resources: [
          { label: "Official admit card link", href: "https://jeeadv.ac.in", note: "Primary source." },
        ],
      },
      {
        id: "answer-key",
        label: "Answer Key",
        eyebrow: "Response Review",
        title: "Answer key and objection handling",
        summary: "Candidate response sheet, provisional key, final key, and result follow-up.",
        blocks: [
          {
            title: "Usual flow",
            items: [
              "Candidate response sheet release",
              "Provisional answer key publication",
              "Challenge / feedback opportunity if opened",
              "Final answer key before result",
            ],
          },
        ],
        resources: [
          { label: "Official answer key updates", href: "https://jeeadv.ac.in", note: "Most reliable source." },
        ],
      },
      {
        id: "question-paper",
        label: "Question Paper",
        eyebrow: "Paper Bank",
        title: "Previous papers and solutions",
        summary: "IIT-level problem solving build panna previous year papers and solution review romba useful.",
        blocks: [
          { title: "Practice set", items: ["Previous year papers year-wise", "Subject-wise difficult problem collection", "Detailed text / video solutions"] },
        ],
        resources: [
          { label: "Google: JEE Advanced previous papers", href: googleSearch("JEE Advanced previous year papers pdf with solution"), note: "Quick PYQ search." },
        ],
      },
      {
        id: "cutoff",
        label: "Cutoff",
        eyebrow: "Rank Benchmarks",
        title: "Qualifying marks and IIT rank expectations",
        summary: "Category-wise cutoff, subject-wise minimum marks, CRL benchmarks, and IIT branch rank trends.",
        blocks: [
          { title: "Track these metrics", items: ["Subject-wise and aggregate qualifying marks", "CRL and category rank range", "IIT branch opening-closing rank trends"] },
        ],
        resources: [
          { label: "Google: JEE Advanced cutoff", href: googleSearch("JEE Advanced 2026 cutoff category wise"), note: "Fast cutoff search." },
        ],
      },
      {
        id: "preparation",
        label: "Preparation",
        eyebrow: "Advanced Strategy",
        title: "Preparation strategy for IIT-level problem solving",
        summary: "Concept depth, mixed-topic solving, and two-paper stamina training should be the core of preparation.",
        blocks: [
          { title: "High-value plan", items: ["Daily mixed PCM advanced problem set", "Two-paper stamina training", "Theory recall plus creative application balance", "Maintain a mistake log"] },
        ],
        resources: [
          { label: "Google: JEE Advanced preparation strategy", href: googleSearch("JEE Advanced 2026 preparation strategy"), note: "Quick prep search." },
        ],
      },
      {
        id: "mock-test",
        label: "Mock Test",
        eyebrow: "Simulation",
        title: "Mock test and pressure handling routine",
        summary: "Back-to-back paper simulation dhaan score stability-ku mukkiyam.",
        blocks: [
          { title: "Simulation flow", items: ["Paper 1 + Paper 2 same day practice", "Break management rehearse pannunga", "Partial marking pattern analyze pannunga"] },
        ],
        resources: [
          { label: "Google: JEE Advanced mock test", href: googleSearch("JEE Advanced mock test free online"), note: "Quick mock search." },
        ],
      },
      {
        id: "exam-pattern",
        label: "Exam Pattern",
        eyebrow: "Paper Structure",
        title: "What is the JEE Advanced Exam Pattern?",
        introParagraphs: [
          "The JEE Advanced Exam Pattern 2026 is live and has been published on the official JEE Advanced website, jeeadv.ac.in. The exam is scheduled on Sunday, 17 May 2026, in two shifts.",
          "IIT Roorkee is conducting the JEE Advanced 2026 Exam and it will be held in Computer-Based Test (CBT) mode. The exam consists of 2 papers with each of 3 hours duration.",
        ],
        ctaLabel: "Click here to know in detail about the JEE Advanced Exam Pattern 2026",
        ctaHref: "https://jeeadv.ac.in",
        summary: "JEE Advanced pattern fixed template madhiri irukkaadhu; every year Paper 1 and Paper 2 structure slightly vary aagalam, aana both papers compulsory.",
        paragraphs: [
          "JEE Advanced 2026 will be conducted in CBT mode with two compulsory papers on the same day. Both papers include Physics, Chemistry, and Mathematics.",
          "Question types may include single correct, multiple correct, numerical answer, paragraph-based, and match-the-following style questions with partial marking or negative marking depending on the section.",
        ],
        bullets: [
          "Questions per Paper: 51 (17 per subject)",
          "Total Questions (Both Papers): 102",
          "Total Marks: 360 (180 marks per paper)",
        ],
        note: "JEE Advanced 2026 follows the same pattern as the previous years. There is no major change in the overall structure.",
        followupTitle: "JEE Advanced Exam Pattern: Minor Changes in the Last 5 Years",
        followupParagraphs: [
          "Mostly 54 questions (18 per subject) were used in 2022 and 2023. It was reduced to 51 questions per paper (17 per subject) from 2024 onwards and remained the same in 2025 and 2026.",
          "IIT Roorkee has officially clarified that there will be no major changes, including no adaptive testing, for JEE Advanced 2026. The pattern remains consistent with 2025.",
        ],
        alsoCheckLabel: "JEE Advanced 2026: Syllabus, Pattern Updates and Previous Year Papers",
        blocks: [
          {
            title: "Key Summary",
            items: [
              "JEE Advanced has two compulsory papers conducted on the same day in CBT mode.",
              "Question types and marking scheme can vary every year, including full marks, partial marks, and negative marks.",
              "Candidates should prepare for multiple-correct, numerical, and mixed concept questions across Physics, Chemistry, and Mathematics.",
              "Understanding the paper pattern is essential for balancing speed, accuracy, and risk during both papers.",
            ],
          },
        ],
        tableTitle: "JEE Advanced 2026 Exam Pattern",
        tableColumns: ["Parameter", "Details"],
        tableRows: [
          { key: "Exam Mode", value: "Computer-Based Test (CBT)" },
          { key: "Total Papers", value: "Paper 1 and Paper 2" },
          { key: "Duration", value: "3 hours per paper" },
          { key: "Subjects", value: "Physics, Chemistry, Mathematics" },
          { key: "Question Type", value: "Single correct, multiple correct, numerical, and mixed formats" },
          { key: "Marking Scheme", value: "Varies by section and may include full, partial, or negative marking" },
        ],
      },
      {
        id: "news",
        label: "News",
        eyebrow: "Latest Updates",
        title: "JEE Advanced alerts and result watch",
        summary: "Response sheet, answer key, result, and JoSAA counselling updates watch panna use pannunga.",
        blocks: [
          { title: "Watchlist", items: ["Registration deadline alerts", "Admit card release notice", "Answer key and result timeline", "JoSAA counselling updates"] },
        ],
        resources: [
          { label: "Official notices", href: "https://jeeadv.ac.in", note: "Primary update source." },
        ],
      },
    ]),
  },
  cuet: {
    slug: "cuet",
    title: "CUET UG 2026",
    short: "Central and participating university admissions-kku subject selection, application, score interpretation, and counselling-ready overview guide.",
    logo: "/exams/cuet.svg",
    mode: "Subject-based Exam",
    date: "May 11, 2026",
    level: "National",
    colleges: "584",
    authority: "National Testing Agency (NTA)",
    examMode: "Subject-based mode as notified",
    coursesOffered: "UG programs across central and participating universities",
    totalCandidates: "14 lakh+ expected registrations",
    seatsAvailable: "2.5 lakh+ seats across universities",
    applicationStart: "February 27, 2026",
    applicationEnd: "April 02, 2026",
    applicationStartLabel: "Application Opens",
    applicationEndLabel: "Application Deadline",
    examDateISO: "2026-05-11T09:00:00+05:30",
    officialSite: "https://cuet.nta.nic.in",
    heroGradient: "linear-gradient(135deg, #0a6c74 0%, #138a8f 52%, #e0a100 100%)",
    overviewHighlights: [
      "CUET UG is used by central and participating universities for UG admissions.",
      "Candidates must choose subjects based on the course and university eligibility.",
      "Language, domain, and general test sections matter depending on the chosen program.",
    ],
    latestUpdates: [
      {
        date: "31 Dec, 2025",
        body: "CUET UG 2026 application fee and subject selection rules have been updated.",
        ctaLabel: "Check Here",
        ctaHref: "https://cuet.nta.nic.in",
      },
      {
        date: "29 Dec, 2025",
        body: "CUET UG 2026 exam window and correction schedule have been announced.",
        ctaLabel: "Check Dates Here",
        ctaHref: "https://cuet.nta.nic.in",
      },
    ],
    keySummary: [
      "This article discusses registration, university and subject selection, exam pattern, preparation strategy, answer key, and score usage.",
      "Candidates should check the university-wise eligibility before selecting domain subjects during registration.",
      "CUET score acceptance, cutoff, and counselling differ from one university and course to another.",
      "Application dates, city slip, admit card, and result timeline must be tracked carefully.",
    ],
    aboutTitle: "What is CUET UG?",
    aboutParagraphs: [
      "The Common University Entrance Test Undergraduate, known as CUET UG, is a national-level entrance examination conducted for admission to undergraduate courses in central universities and many other participating universities.",
      "It allows students to compete through a common exam while selecting subjects according to their target course requirements such as language papers, domain-specific subjects, and the general test.",
      "The final admission process still depends on each university's eligibility rules, merit list preparation, and counselling schedule.",
    ],
    overviewCards: [
      { title: "Conducting Body", value: "NTA" },
      { title: "Mode of Examination", value: "Subject-based test" },
      { title: "Exam Window", value: "May 2026" },
      { title: "Course Type", value: "UG Admissions" },
      { title: "Sections", value: "Language / Domain / GT" },
      { title: "Universities", value: "Central + Participating" },
    ],
    highlightsTable: [
      { label: "Governing Body", value: "National Testing Agency" },
      { label: "Exam Level", value: "National Entrance Test" },
      { label: "Exam Mode", value: "Subject-based mode as notified" },
      { label: "Courses Covered", value: "UG programs across central and participating universities" },
      { label: "Sections", value: "Language, Domain Subjects, General Test" },
      { label: "Exam Window", value: "May 11 to 28, 2026" },
      { label: "Registration Dates", value: "February 27, 2026 to April 02, 2026" },
      { label: "Expected Registrations", value: "14 lakh+ expected" },
      { label: "Official Website", value: "cuet.nta.nic.in" },
    ],
    importantDatesTable: [
      { date: "February 27, 2026", event: "Online application start date" },
      { date: "April 02, 2026", event: "Registration end date" },
      { date: "April 05 to 07, 2026", event: "Correction window" },
      { date: "May 02, 2026", event: "City intimation slip release" },
      { date: "May 11 to 28, 2026", event: "CUET UG exam window" },
      { date: "June 20, 2026", event: "Result window" },
    ],
    eligibilityTable: [
      { criteria: "Academic Qualification", eligibility: "Class 12 passed or appearing candidates are generally eligible subject to university-wise rules" },
      { criteria: "Subject Combination", eligibility: "Candidates must choose domain subjects according to target course and university eligibility" },
      { criteria: "Age Limit", eligibility: "Usually no separate CUET age limit, but university rules must be checked" },
      { criteria: "University Eligibility", eligibility: "Each university may prescribe additional marks or subject requirements" },
    ],
    relatedArticles: [
      "How to choose subjects in CUET UG 2026?",
      "University-wise CUET eligibility criteria",
      "Best strategy to prepare for CUET domain subjects",
    ],
    relatedQuestions: [
      "Is the General Test compulsory for all CUET courses?",
      "How do universities use CUET scores differently for admission?",
    ],
    timeline: [
      { label: "Application Start", date: "2026-02-27T09:00:00+05:30", displayDate: "February 27, 2026", tone: "success" },
      { label: "Last Date", date: "2026-04-02T23:59:00+05:30", displayDate: "April 02, 2026", tone: "warning" },
      { label: "Correction Window", date: "2026-04-05T10:00:00+05:30", displayDate: "April 05 to 07, 2026" },
      { label: "City Intimation", date: "2026-05-02T10:00:00+05:30", displayDate: "May 02, 2026" },
      { label: "Exam Window", date: "2026-05-11T09:00:00+05:30", displayDate: "May 11 to 28, 2026", tone: "primary" },
      { label: "Result Window", date: "2026-06-20T10:00:00+05:30", displayDate: "June 20, 2026" },
    ],
    sections: ensureSections([
      {
        id: "overview",
        label: "Overview",
        eyebrow: "University Admission",
        title: "CUET UG 2026 overview",
        summary: "CUET page-la subject selection, university eligibility, exam window, score usage, and counselling-ready core details show aagum.",
        highlights: [
          "Central universities and many participating institutions CUET score accept pannura common entrance idhu.",
          "Course eligibility-ku subject combination carefully select panna venum.",
          "University-by-university admission rules and cutoff differ aagalam.",
        ],
        blocks: [
          {
            title: "What to keep in mind",
            items: [
              "University eligibility PDF check pannaama subject select panna koodadhu.",
              "Language and domain combinations course-wise vary aagum.",
            ],
          },
        ],
        resources: [
          { label: "Official CUET portal", href: "https://cuet.nta.nic.in", note: "Primary source for form, syllabus, and notices." },
          { label: "Google: CUET latest updates", href: googleSearch("CUET UG 2026 latest updates"), note: "Quick search reference." },
        ],
      },
      {
        id: "registration",
        label: "Registration",
        eyebrow: "Application Process",
        title: "CUET application process and dates",
        summary: "Registration, subject choice, fee bands, correction window, and document checklist.",
        steps: ["Register", "Choose Universities and Subjects", "Upload Documents", "Pay Fees"],
        blocks: [
          { title: "Important dates", items: ["Start Date: February 27, 2026", "Last Date: April 02, 2026", "Correction Window: April 05 to 07, 2026"] },
          { title: "Application fees", items: ["Fee depends on number of subjects selected", "Reserved category concessional rates apply", "Additional papers add extra fee"] },
          { title: "Required documents", items: ["Photo, signature, ID proof", "Class 10 / 12 details", "Category certificate if needed", "Valid email and phone number"] },
        ],
        resources: [
          { label: "Official apply link", href: "https://cuet.nta.nic.in", note: "Registration and correction use." },
        ],
      },
      {
        id: "admit-card",
        label: "Admit Card",
        eyebrow: "Hall Ticket",
        title: "CUET admit card and city slip flow",
        summary: "City intimation slip, admit card release, and subject schedule check points.",
        blocks: [
          { title: "Checklist", items: ["City Intimation: May 02, 2026", "Admit card release follows city slip", "Subject-wise exam slot verify pannunga"] },
          { title: "Exam day instructions", items: ["Correct subject code and reporting time check pannunga", "Photo ID and printed hall ticket carry pannunga", "NTA instructions follow pannunga"] },
        ],
        resources: [
          { label: "Official CUET admit card portal", href: "https://cuet.nta.nic.in", note: "Primary source." },
        ],
      },
      {
        id: "answer-key",
        label: "Answer Key",
        eyebrow: "Response Review",
        title: "CUET provisional and final answer key",
        summary: "Answer key release, objection process, and final scorecard follow-up.",
        blocks: [
          { title: "Flow", items: ["Provisional key publication", "Challenge / objection process", "Final answer key before scorecard"] },
        ],
        resources: [
          { label: "Official answer key notices", href: "https://cuet.nta.nic.in", note: "Reliable key updates." },
        ],
      },
      {
        id: "question-paper",
        label: "Question Paper",
        eyebrow: "Paper Library",
        title: "Question paper archive and solutions",
        summary: "Domain-wise PYQs and solution review build panna use pannunga.",
        blocks: [
          { title: "Collect these", items: ["Subject-wise previous year papers", "Section-wise solutions", "Domain and language practice sets"] },
        ],
        resources: [
          { label: "Google: CUET previous year papers", href: googleSearch("CUET UG previous year question papers with solutions"), note: "Quick PYQ search." },
        ],
      },
      {
        id: "cutoff",
        label: "Cutoff",
        eyebrow: "Score Planning",
        title: "University-wise cutoff and safe score tracking",
        summary: "Course plus university combination-ku expected safe score and trend compare pannunga.",
        blocks: [
          { title: "Track these", items: ["University-wise cutoff scores", "Course and category-based trends", "Safe score analysis for top universities"] },
        ],
        resources: [
          { label: "Google: CUET cutoff university wise", href: googleSearch("CUET UG 2026 cutoff university wise"), note: "Quick cutoff search." },
        ],
      },
      {
        id: "preparation",
        label: "Preparation",
        eyebrow: "Study Plan",
        title: "CUET preparation strategy",
        summary: "NCERT alignment, domain revision, and course-specific subject mix strategy.",
        blocks: [
          { title: "Preparation focus", items: ["Class 12 NCERT revision strong-a pannunga", "Selected domains-ku targeted mocks", "Language speed and comprehension practice", "General test aptitude practice"] },
        ],
        resources: [
          { label: "Google: CUET preparation strategy", href: googleSearch("CUET UG 2026 preparation strategy subject wise"), note: "Quick prep search." },
        ],
      },
      {
        id: "mock-test",
        label: "Mock Test",
        eyebrow: "Practice Mode",
        title: "Mock tests and subject-based practice",
        summary: "Domain-wise mock tests and timed section practice track pannunga.",
        blocks: [
          { title: "Mock routine", items: ["Subject-specific timed tests", "Weekly full-paper practice", "Weak subjects improve panna structured review"] },
        ],
        resources: [
          { label: "Google: CUET free mock test", href: googleSearch("CUET UG free mock test online"), note: "Quick mock search." },
        ],
      },
      {
        id: "exam-pattern",
        label: "Exam Pattern",
        eyebrow: "Paper Structure",
        title: "What is the CUET Exam Pattern 2026?",
        introParagraphs: [
          "The CUET UG 2026 exam pattern is available through the official CUET portal and continues with the common university entrance structure used for undergraduate admissions.",
          "CUET will be conducted in CBT mode across multiple days and shifts, with section-wise subject selection based on university and course requirements.",
        ],
        ctaLabel: "Click here to know in detail about the CUET UG 2026 Exam Pattern",
        ctaHref: "https://cuet.nta.nic.in",
        summary: "The CUET Exam Pattern includes the structure and format, the exam will be MCQ-based, a fixed time limit and a common marking scheme. The CUET Pattern will focus more on concept application and comprehension questions, rather than rote learning, especially in NCERT-Based subjects.",
        paragraphs: [
          "The CUET Exam Pattern 2026 is the same as 2025, and will be conducted in a CBT Mode in multiple days and shifts. The CUET Exam includes 3 Sections: Section 1 (Language Section), Section 2 (Domain Subjects), and Section 3 (General Test).",
          "As per the CUET Exam Pattern, each subject will have 50 compulsory MCQ Questions, in which each correct answer will have +5 marks, and -1 mark will be deducted for an incorrect answer.",
          "As per the latest update, the total number of available subjects has been reduced from 63 to 37, and you can choose any subject regardless of your class 12 stream.",
          "In CUET UG, each subject will be of 250 marks; if you select 5 subjects, your score will be calculated out of a total of 1250 marks.",
          "The NCERT Class 12 format will be used for the CUET Domain Subjects; you can choose from 13 languages in the language section.",
        ],
        bullets: [
          "Questions per Test: 50 compulsory MCQ questions",
          "Marking Scheme: +5 for each correct answer and -1 for each incorrect answer",
          "Maximum Marks: 250 marks per subject and 1250 marks for 5 subjects",
        ],
        note: "CUET UG 2026 follows the same pattern as 2025 for CBT mode, section structure, and common marking rules across the selected subjects.",
        followupTitle: "CUET Exam Pattern: Recent Updates and Section Structure",
        followupParagraphs: [
          "The available subject list has been reduced from 63 to 37, and candidates can now choose subjects regardless of their Class 12 stream, subject to university eligibility.",
          "The language section, domain subjects, and general test continue to define the core structure of CUET, with equal attention needed for university-specific subject combinations.",
        ],
        alsoCheckLabel: "CUET Previous Year Paper Analysis and Previous Year Question Paper",
        blocks: [
          {
            title: "Key Summary",
            items: [
              "In this Article, we have discussed the CUET Exam Pattern, including the Section-Wise Pattern, Marking Scheme & Previous-Year Papers.",
              "In CUET, you can select 5 subjects; 1 language subject is mandatory along with a domain subject and a general test as per the course and university requirements.",
              "In CUET, there is equal weightage in all sections with equal score contribution, as per the section-type.",
              "As there are no sectional cutoffs in CUET, the exam pattern is important for post-exam counselling rules.",
              "With a negative marking of -1 mark, uniformity will be applied in all sections; with 10% mistakes, your score can be reduced to 20 marks.",
            ],
          },
        ],
        tableTitle: "CUET UG 2026 Exam Pattern",
        tableColumns: ["Parameter", "Details"],
        tableRows: [
          { key: "Exam Name", value: "Common University Entrance Test (CUET UG) 2026" },
          { key: "Conducting Body", value: "National Testing Agency (NTA)" },
          { key: "Exam Mode", value: "Computer-Based Test (CBT)" },
          { key: "Exam Duration", value: "60 minutes per test" },
          { key: "Total Sections", value: "3 (Languages, Domain Subjects, General Test)" },
          { key: "Question Type", value: "Multiple Choice Questions (MCQs)" },
          { key: "Questions per Test", value: "50 questions (all compulsory)" },
          { key: "Marking Scheme", value: "+5 for correct and -1 for incorrect answers" },
          { key: "Maximum Marks", value: "250 marks per test" },
          { key: "Maximum Subject Choices", value: "5 subjects in total" },
          { key: "Syllabus Base", value: "Class 12 NCERT (mainly for Domain Subjects)" },
          { key: "Exam Schedule", value: "Multiple days and shifts (May 2026 - tentative)" },
        ],
      },
      {
        id: "news",
        label: "News",
        eyebrow: "Latest Updates",
        title: "CUET alerts and announcement watch",
        summary: "Application correction, city slip, answer key, result, and counselling news follow pannunga.",
        blocks: [
          { title: "Watchlist", items: ["Exam city slip release", "Admit card and schedule revision", "Answer key challenge notice", "Result announcement and university notices"] },
        ],
        resources: [
          { label: "Official notices", href: "https://cuet.nta.nic.in", note: "Primary update source." },
        ],
      },
    ]),
  },
  neet: {
    slug: "neet",
    title: "NEET UG 2026",
    short: "MBBS, BDS, AYUSH, and allied medical admission-kku exam dates, eligibility, cutoff pressure, and preparation tracking page.",
    logo: "/exams/neet.svg",
    mode: "Offline Exam",
    date: "May 05, 2026",
    level: "National",
    colleges: "612",
    authority: "National Testing Agency (NTA)",
    examMode: "Pen and Paper",
    coursesOffered: "MBBS / BDS / AYUSH / BSc Nursing",
    totalCandidates: "24 lakh+ expected",
    seatsAvailable: "1 lakh+ MBBS and allied seats",
    applicationStart: "February 09, 2026",
    applicationEnd: "March 15, 2026",
    applicationStartLabel: "Application Opens",
    applicationEndLabel: "Application Deadline",
    examDateISO: "2026-05-05T14:00:00+05:30",
    officialSite: "https://neet.nta.nic.in",
    heroGradient: "linear-gradient(135deg, #7a1d36 0%, #b33951 52%, #f4a261 100%)",
    overviewHighlights: [
      "NEET UG is the mandatory medical entrance exam for MBBS and BDS admissions.",
      "Biology-heavy score optimization is crucial because of intense competition.",
      "Counselling happens through AIQ and state quota processes after the result.",
    ],
    latestUpdates: [
      {
        date: "31 Dec, 2025",
        body: "NEET UG 2026 registration fee structure and application details have been revised.",
        ctaLabel: "Check Here",
        ctaHref: "https://neet.nta.nic.in",
      },
      {
        date: "29 Dec, 2025",
        body: "NEET UG 2026 exam date and correction schedule have been announced.",
        ctaLabel: "Check Dates Here",
        ctaHref: "https://neet.nta.nic.in",
      },
    ],
    keySummary: [
      "This article discusses registration, eligibility, syllabus, exam pattern, preparation strategy, answer key, and cutoff trends.",
      "NEET UG score is required for MBBS, BDS, AYUSH, and many allied medical admissions.",
      "Competition remains high because lakhs of candidates compete for a limited number of seats.",
      "Application dates, admit card, answer key, result, and counselling timeline should all be tracked properly.",
    ],
    aboutTitle: "What is NEET UG?",
    aboutParagraphs: [
      "The National Eligibility cum Entrance Test Undergraduate, called NEET UG, is the national-level medical entrance examination for admission to MBBS, BDS, AYUSH, and several allied health science programs in India.",
      "The exam is conducted in pen-and-paper mode and includes Physics, Chemistry, and Biology. The score is used across AIQ and state counselling processes, making it the most important undergraduate medical entrance exam in the country.",
    ],
    overviewCards: [
      { title: "Conducting Body", value: "NTA" },
      { title: "Mode of Examination", value: "Offline Mode" },
      { title: "Exam Date", value: "05 May 2026" },
      { title: "Subjects", value: "PCB" },
      { title: "Seat Intake", value: "1 lakh+" },
      { title: "Competition", value: "24 lakh+ expected" },
    ],
    highlightsTable: [
      { label: "Governing Body", value: "National Testing Agency" },
      { label: "Exam Level", value: "National Medical Entrance Test" },
      { label: "Exam Mode", value: "Pen and Paper" },
      { label: "Subjects", value: "Physics, Chemistry, Biology" },
      { label: "Courses Covered", value: "MBBS / BDS / AYUSH / BSc Nursing" },
      { label: "Exam Date", value: "05 May 2026" },
      { label: "Registration Dates", value: "February 09, 2026 to March 15, 2026" },
      { label: "Expected Candidates", value: "24 lakh+ expected" },
      { label: "Official Website", value: "neet.nta.nic.in" },
    ],
    importantDatesTable: [
      { date: "February 09, 2026", event: "Online application start date" },
      { date: "March 15, 2026", event: "Registration end date" },
      { date: "March 18 to 20, 2026", event: "Correction window" },
      { date: "April 26, 2026", event: "Admit card release" },
      { date: "May 05, 2026", event: "NEET UG exam date" },
      { date: "June 14, 2026", event: "Result window" },
    ],
    eligibilityTable: [
      { criteria: "Academic Qualification", eligibility: "Class 12 with Physics, Chemistry, Biology / Biotechnology and English" },
      { criteria: "Minimum Marks", eligibility: "As per latest category-wise NEET eligibility rules" },
      { criteria: "Age Limit", eligibility: "Candidates must satisfy the latest age criteria notified by NTA / NMC" },
      { criteria: "Nationality", eligibility: "Indian nationals, NRIs, OCIs, PIOs, and foreign nationals as per applicable rules" },
    ],
    relatedArticles: [
      "How to fill the NEET UG 2026 application form?",
      "NEET 2026 syllabus chapter-wise weightage",
      "Best biology revision strategy for NEET",
    ],
    relatedQuestions: [
      "Is NEET mandatory for all MBBS admissions in India?",
      "How does AIQ counselling differ from state quota counselling in NEET?",
    ],
    timeline: [
      { label: "Application Start", date: "2026-02-09T09:00:00+05:30", displayDate: "February 09, 2026", tone: "success" },
      { label: "Last Date", date: "2026-03-15T23:59:00+05:30", displayDate: "March 15, 2026", tone: "warning" },
      { label: "Correction Window", date: "2026-03-18T10:00:00+05:30", displayDate: "March 18 to 20, 2026" },
      { label: "Admit Card", date: "2026-04-26T10:00:00+05:30", displayDate: "April 26, 2026" },
      { label: "Exam Day", date: "2026-05-05T14:00:00+05:30", displayDate: "May 05, 2026", tone: "primary" },
      { label: "Result Window", date: "2026-06-14T10:00:00+05:30", displayDate: "June 14, 2026" },
    ],
    sections: ensureSections([
      {
        id: "overview",
        label: "Overview",
        eyebrow: "Medical Entrance",
        title: "NEET UG 2026 overview",
        summary: "NEET page-la exam date, registration, eligibility, medical seat competition, and counselling impact clear-a show aagum.",
        highlights: [
          "MBBS and BDS admissions-ku mandatory national exam.",
          "Biology-heavy score optimization very important because of intense competition.",
          "AIQ and state quota counselling both post-result process-la major role play pannum.",
        ],
        blocks: [
          { title: "Core facts", items: ["Physics, Chemistry, Biology sections pen-and-paper mode-la conduct aagum.", "Negative marking pattern follow aagum.", "High candidate volume nala cutoff pressure romba adhigam."] },
        ],
        resources: [
          { label: "Official NEET portal", href: "https://neet.nta.nic.in", note: "Primary exam source." },
          { label: "Google: NEET latest updates", href: googleSearch("NEET UG 2026 latest updates"), note: "Quick search reference." },
        ],
      },
      {
        id: "registration",
        label: "Registration",
        eyebrow: "Application Process",
        title: "NEET registration, fees, and document flow",
        summary: "Form fill, category fee, correction window, and required documents one place-la ready.",
        steps: ["Register", "Fill Application Form", "Upload Documents", "Pay Fees"],
        blocks: [
          { title: "Important dates", items: ["Start Date: February 09, 2026", "Last Date: March 15, 2026", "Correction Window: March 18 to 20, 2026"] },
          { title: "Application fees", items: ["General fee higher slab", "General-EWS / OBC / SC / ST / PwD concessions apply", "International centre fee separate if notified"] },
          { title: "Required documents", items: ["Photo, signature, thumb impression", "Class 10 and 12 details", "Category / domicile / PwD certificates if applicable", "Valid ID proof"] },
        ],
        resources: [
          { label: "Official apply portal", href: "https://neet.nta.nic.in", note: "Form fill and correction." },
        ],
      },
      {
        id: "admit-card",
        label: "Admit Card",
        eyebrow: "Hall Ticket",
        title: "NEET admit card and exam day readiness",
        summary: "Release date, download steps, and strict exam day instructions.",
        blocks: [
          { title: "Release and download", items: ["Release Date: April 26, 2026", "Application number + DOB / password use pannunga", "Printed copies multiple keep pannunga"] },
          { title: "Exam day instructions", items: ["Dress code and ID rules strict-a follow pannunga", "OMR discipline important", "Reporting time miss panna entry denied aagalam"] },
        ],
        resources: [
          { label: "Official admit card portal", href: "https://neet.nta.nic.in", note: "Primary source." },
        ],
      },
      {
        id: "answer-key",
        label: "Answer Key",
        eyebrow: "OMR Review",
        title: "NEET answer key and challenge process",
        summary: "Provisional key, OMR review, and objection filing flow.",
        blocks: [
          { title: "What happens after exam", items: ["OMR / scanned response display", "Provisional answer key release", "Objection process with fee per question", "Final answer key before result"] },
        ],
        resources: [
          { label: "Official answer key notices", href: "https://neet.nta.nic.in", note: "Reliable source." },
        ],
      },
      {
        id: "question-paper",
        label: "Question Paper",
        eyebrow: "PYQ Library",
        title: "Question paper and solution bank",
        summary: "Biology-heavy revision-ku previous papers and detailed solutions useful-a irukkum.",
        blocks: [
          { title: "Collect these", items: ["Year-wise NEET papers", "Code-wise papers and solutions", "Physics / Chemistry / Biology topic mapping"] },
        ],
        resources: [
          { label: "Google: NEET previous year papers", href: googleSearch("NEET UG previous year question paper with solutions pdf"), note: "Quick PYQ search." },
        ],
      },
      {
        id: "cutoff",
        label: "Cutoff",
        eyebrow: "Score Targets",
        title: "NEET cutoff, rank bands, and safe score analysis",
        summary: "Category cutoff, AIQ trends, opening-closing rank, and safe score bands compare pannunga.",
        blocks: [
          { title: "Track these", items: ["Category-wise qualifying cutoff", "AIQ and state quota safe score range", "MBBS / BDS opening-closing rank", "Government vs private college score bands"] },
        ],
        resources: [
          { label: "Google: NEET cutoff", href: googleSearch("NEET UG 2026 cutoff category wise"), note: "Quick cutoff search." },
        ],
      },
      {
        id: "preparation",
        label: "Preparation",
        eyebrow: "PCB Strategy",
        title: "NEET preparation strategy",
        summary: "NCERT Biology mastery, formula revision, and regular mock analysis-based plan.",
        blocks: [
          { title: "Subject-wise focus", items: ["Biology: NCERT line-by-line retention", "Chemistry: physical formula drills + inorganic revision", "Physics: concept plus numericals under time pressure"] },
          { title: "Study plan", items: ["Daily MCQ blocks", "Weekly full syllabus tests", "Wrong-answer notebook compulsory"] },
        ],
        resources: [
          { label: "Google: NEET preparation strategy", href: googleSearch("NEET UG 2026 preparation strategy subject wise"), note: "Quick prep search." },
        ],
      },
      {
        id: "mock-test",
        label: "Mock Test",
        eyebrow: "Practice Mode",
        title: "Mock tests and OMR practice",
        summary: "Full-length mocks plus OMR bubbling discipline score improve panna help aagum.",
        blocks: [
          { title: "Mock routine", items: ["Weekly full NEET mock", "Daily sectional sets", "OMR bubbling practice and time checkpoints"] },
        ],
        resources: [
          { label: "Google: NEET free mock test", href: googleSearch("NEET UG free mock test online"), note: "Quick mock search." },
        ],
      },
      {
        id: "exam-pattern",
        label: "Exam Pattern",
        eyebrow: "Paper Structure",
        title: "What is the NEET Exam Pattern?",
        introParagraphs: [
          "The NEET UG 2026 exam pattern continues to follow the standard national medical entrance format published through the official NTA NEET portal.",
          "NEET is conducted in pen-and-paper mode for medical aspirants and remains focused on Physics, Chemistry, and Biology with a common marking scheme.",
        ],
        ctaLabel: "Click here to know in detail about the NEET UG 2026 Exam Pattern",
        ctaHref: "https://neet.nta.nic.in",
        summary: "NEET UG 2026 pen-and-paper format, section structure, and negative marking rules candidates strong-a understand pannina score stability improve aagum.",
        blocks: [
          {
            title: "Key Summary",
            items: [
              "NEET UG is conducted in offline mode with Physics, Chemistry, and Biology sections.",
              "The exam pattern and negative marking scheme directly influence overall score and rank movement.",
              "Candidates should build both speed and accuracy because incorrect answers reduce marks.",
              "A clear understanding of the paper structure helps in better subject-wise time allocation and revision planning.",
            ],
          },
        ],
        tableTitle: "NEET UG 2026 Exam Pattern",
        tableColumns: ["Parameter", "Details"],
        tableRows: [
          { key: "Exam Mode", value: "Offline (Pen and Paper)" },
          { key: "Subjects", value: "Physics, Chemistry, Biology" },
          { key: "Question Type", value: "Objective questions / MCQs" },
          { key: "Marking Scheme", value: "+4 for correct answers and -1 for incorrect answers" },
          { key: "Exam Level", value: "National medical entrance test" },
          { key: "Use of Score", value: "MBBS, BDS, AYUSH, and allied medical admissions" },
        ],
        postTableParagraphs: [
          "NEET UG 2026 pen-and-paper format, section structure, and negative marking rules candidates strong-a understand pannina score stability improve aagum.",
          "NEET UG is conducted in offline mode with Physics, Chemistry, and Biology sections. The exam follows a common national medical entrance pattern.",
          "Question paper timing, total questions, and marking rules official notice base-la verify panna venum before final exam preparation.",
        ],
        postTableBullets: [
          "Question Type: objective questions across Physics, Chemistry, and Biology",
          "Marking Scheme: +4 for each correct answer and -1 for each incorrect answer",
          "Exam Mode: offline pen-and-paper test",
        ],
        postTableNote: "NEET UG 2026 continues with the standard national medical entrance pattern, and no major format change is expected in the core paper structure.",
        postTableFollowupTitle: "NEET Exam Pattern: Consistent Structure in Recent Years",
        postTableFollowupParagraphs: [
          "NEET has continued with a common offline format focused on Physics, Chemistry, and Biology, keeping the structure familiar for medical aspirants.",
          "Because negative marking remains important, candidates should balance speed with accuracy and avoid unnecessary guesswork during the paper.",
        ],
        postTableAlsoCheckLabel: "NEET 2026 Syllabus, Marking Scheme and Previous Year Papers",
      },
      {
        id: "news",
        label: "News",
        eyebrow: "Latest Updates",
        title: "NEET alerts and result announcements",
        summary: "Admit card, answer key, result, and counselling updates quick-a track panna use pannunga.",
        blocks: [
          { title: "Watchlist", items: ["Correction window alerts", "Admit card release notice", "Answer key and result announcement", "MCC counselling updates"] },
        ],
        resources: [
          { label: "Official notices", href: "https://neet.nta.nic.in", note: "Primary update source." },
        ],
      },
    ]),
  },
};
