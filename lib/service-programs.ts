export const serviceProgramSlugs = [
  "career-guidance",
  "skill-programs",
  "placements",
  "internships",
  "study-abroad",
] as const;

export type ServiceProgramSlug = (typeof serviceProgramSlugs)[number];

export type ServiceProgram = {
  slug: ServiceProgramSlug;
  menuLabel: string;
  title: string;
  description: string;
  objective: string;
  intro: string;
  idealFor: string[];
  highlights: string[];
  process: string[];
  servicesOffered: string[];
  deliverables: string[];
  revenueModel: string[];
};

export const servicePrograms: ServiceProgram[] = [
  {
    slug: "career-guidance",
    menuLabel: "Career Guidance",
    title: "Career Guidance & Counseling Services",
    description:
      "Enable students to make data-driven career decisions aligned with aptitude, interest, and market demand.",
    objective:
      "Enable students to make data-driven career decisions aligned with aptitude, interest, and market demand.",
    intro:
      "This service is designed for students and parents who want clarity before choosing streams, courses, or long-term career tracks. The focus is not only on interest, but also on aptitude, employability, and realistic progression paths.",
    idealFor: [
      "Students confused about stream or course selection",
      "Parents seeking expert-backed planning support",
      "Students preparing for college and future role alignment",
      "Learners who want a structured career roadmap before investing time and money",
    ],
    highlights: [
      "Personalized one-to-one expert counseling support",
      "Assessment-driven recommendations instead of generic advice",
      "Roadmaps tailored for IT, core, government, and business pathways",
      "Clear next-step planning for both India and abroad options",
    ],
    process: [
      "Student profile and aspiration discovery session",
      "Psychometric, aptitude, and interest assessment",
      "Career mapping with pathway comparison",
      "Final roadmap with course, college, and skill recommendations",
    ],
    servicesOffered: [
      "1:1 Personalized Career Counseling Sessions",
      "Psychometric & Aptitude Assessments",
      "Career Pathway Mapping (IT / Core / Govt / Business)",
      "Stream Selection (10th -> 12th)",
      "Higher Education Guidance (India & Abroad)",
      "Parent Counseling Sessions",
    ],
    deliverables: [
      "Career Assessment Report",
      "Personalized Career Roadmap",
      "Course & College Recommendations",
      "Skill Gap Analysis",
    ],
    revenueModel: [
      "Per-session fee",
      "School/college bulk packages",
      "Subscription-based counseling plans",
    ],
  },
  {
    slug: "skill-programs",
    menuLabel: "Skill Programs",
    title: "Skill Development Programs",
    description:
      "Build job-ready technical and domain skills aligned with industry needs.",
    objective:
      "Build job-ready technical and domain skills aligned with industry needs.",
    intro:
      "The skill programs are built to close the gap between classroom learning and industry expectations. Students get structured learning, practical execution, and portfolio-ready output so they can show capability, not just attendance.",
    idealFor: [
      "Students who want stronger technical and domain skills",
      "Freshers preparing for internship and placement rounds",
      "Colleges looking for structured training partnerships",
      "Learners who want certifications plus real project experience",
    ],
    highlights: [
      "Industry-aligned curriculum mapped to current hiring demand",
      "Hands-on projects instead of theory-only sessions",
      "Tracks across software, analytics, AI, marketing, and core tools",
      "Portfolio and certification support for placement readiness",
    ],
    process: [
      "Skill gap identification and program selection",
      "Structured learning modules with mentor guidance",
      "Project execution and practical review",
      "Certification, portfolio polishing, and readiness support",
    ],
    servicesOffered: [
      "Full Stack Development (MERN, Java, Python)",
      "Data Analytics & Data Science",
      "AI Tools & Automation",
      "Digital Marketing",
      "Business Analytics",
      "Embedded Systems, IoT, Core Engineering Tools",
    ],
    deliverables: [
      "Industry-aligned curriculum",
      "Hands-on projects",
      "Certification",
      "Portfolio development",
    ],
    revenueModel: [
      "Course fees",
      "Institutional tie-ups",
      "Corporate-sponsored training",
    ],
  },
  {
    slug: "placements",
    menuLabel: "Placements",
    title: "Campus Recruitment & Placement Services",
    description:
      "Ensure job outcomes, not just training.",
    objective:
      "Ensure job outcomes, not just training.",
    intro:
      "Placement support is positioned as an outcome engine. Instead of stopping at training completion, this service connects students, colleges, and recruiters through drives, company partnerships, and placement visibility.",
    idealFor: [
      "Final-year students preparing for hiring cycles",
      "Institutions seeking structured placement support",
      "Students looking for direct recruiter access",
      "Campuses that need pooled drive and analytics support",
    ],
    highlights: [
      "Placement-focused model built around measurable outcomes",
      "Access to pooled drives and recruiter tie-ups",
      "Better internship-to-job conversion pipelines",
      "Reports and analytics that help institutions track success",
    ],
    process: [
      "Institution and candidate readiness mapping",
      "Employer outreach and hiring requirement alignment",
      "Drive execution, candidate coordination, and tracking",
      "Reporting, follow-up, and placement outcome analysis",
    ],
    servicesOffered: [
      "Campus & pooled placement drives",
      "Company tie-ups",
      "Internship-to-placement pipelines",
      "Job portal integration",
      "Placement analytics",
    ],
    deliverables: [
      "Job opportunities",
      "Placement reports",
      "Employer partnerships",
    ],
    revenueModel: [
      "Placement commission",
      "Hiring fees",
      "College contracts",
    ],
  },
  {
    slug: "internships",
    menuLabel: "Internships",
    title: "Internship & Live Project Programs",
    description:
      "Provide real-world exposure.",
    objective:
      "Provide real-world exposure.",
    intro:
      "This service helps students move from theory to execution through internships, live projects, and startup collaborations. It is aimed at building proof of work that improves confidence and employability.",
    idealFor: [
      "Students who need real project exposure before placements",
      "Learners who want internships with guided mentoring",
      "Colleges seeking industry-linked live project models",
      "Freshers building practical experience portfolios",
    ],
    highlights: [
      "Live project work linked to real industry contexts",
      "Mentored execution instead of unsupported self-learning",
      "Exposure to startup and innovation environments",
      "Strong project proof for resumes and interviews",
    ],
    process: [
      "Student profiling and project matching",
      "Internship or live-project allocation",
      "Mentored delivery with milestone checkpoints",
      "Completion review, certificate issue, and portfolio packaging",
    ],
    servicesOffered: [
      "Live industry projects",
      "Internships",
      "Startup collaboration",
      "Capstone mentoring",
    ],
    deliverables: [
      "Project portfolio",
      "Experience certificate",
      "Skill validation",
    ],
    revenueModel: [
      "Program fee",
      "Corporate sponsorship",
      "College packages",
    ],
  },
  {
    slug: "study-abroad",
    menuLabel: "Study Abroad",
    title: "Study Abroad & Global Career Services",
    description:
      "Enable global education and careers.",
    objective:
      "Enable global education & careers.",
    intro:
      "Study abroad support combines counseling, test preparation, documentation, and international opportunity mapping into one guided flow. The service is built for students who want confidence throughout the global application journey.",
    idealFor: [
      "Students planning overseas higher education",
      "Applicants preparing for IELTS, TOEFL, and visa steps",
      "Families needing structured admission guidance",
      "Learners exploring international internship and career routes",
    ],
    highlights: [
      "End-to-end support from planning to application execution",
      "Country, course, and university matching support",
      "Coaching and documentation guidance under one flow",
      "Focus on admissions, visa readiness, and global outcomes",
    ],
    process: [
      "Profile evaluation and country/course shortlisting",
      "Test prep, documentation, and application support",
      "University follow-up and visa guidance",
      "Pre-departure and global opportunity assistance",
    ],
    servicesOffered: [
      "Study abroad consulting",
      "IELTS / TOEFL coaching",
      "Visa support",
      "International internships",
      "University partnerships",
    ],
    deliverables: [
      "Admissions",
      "Visa approvals",
      "Global placements",
    ],
    revenueModel: [
      "Service fees",
      "University commissions",
      "Premium packages",
    ],
  },
];

export function getServiceProgramBySlug(serviceSlug: string) {
  return servicePrograms.find((program) => program.slug === serviceSlug);
}
