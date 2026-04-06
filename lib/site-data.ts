export type College = {
  id: string;
  name: string;
  university: string;
  description: string;
  establishedYear?: string;
  ownershipType?: string;
  country?: string;
  district: string;
  state: string;
  city?: string;
  address?: string;
  pincode?: string;
  image: string;
  images?: string[];
  logo?: string;
  isBestCollege: boolean;
  accreditation: string;
  ranking: string;
  placementRate: number;
  hasHostel: boolean;
  facilities: string[];
  quotas: string[];
  streams: string[];
  reviews?: string;
  admissionProcess?: string;
  applicationMode?: string;
  website?: string;
  locationLink?: string;
  mapUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  alternatePhone?: string;
  awardsRecognitions?: string;
  brochurePdfUrl?: string;
  brochureUrl?: string;
  campusVideoUrl?: string;
  scholarships?: string;
  feesStructure?: Record<string, unknown>;
  placements?: Record<string, unknown>;
  hostelDetails?: Record<string, unknown>;
};

export type Course = {
  id: string;
  course: string;
  duration: string;
  semesterFees?: number;
  totalFees: number;
  cutoff: number;
  isTopCourse: boolean;
  university: string;
  college: string;
  collegeId?: string;
  specialization: string;
  courseType: string;
  courseCategory: string;
  courseName?: string;
  degreeType?: string;
  stream?: string;
  mode?: string;
  lateralEntryAvailable?: boolean;
  lateralEntryDetails?: string;
  minimumQualification?: string;
  admissionProcess?: string;
  applicationFee?: number;
  intake?: number;
  hostelFees?: number;
  description?: string;
  entranceExams?: Array<{
    examName?: string;
    cutoffScoreOrRank?: string;
    weightage?: string;
    paperOrSyllabus?: string;
    preparationNotes?: string;
  }>;
  collegeDetails: Array<{
    college: string;
    semesterFees?: number;
    totalFees?: number;
    hostelFees?: number;
    cutoff: number;
    intake?: number;
    applicationFee?: number;
  }>;
};

export const allCoursesList = [
  "B.Tech",
  "MBA",
  "M.Tech",
  "MBBS",
  "B.Com",
  "B.Sc",
  "BCA",
  "BBA",
  "LLB",
  "MCA",
  "B.Pharm",
  "B.Arch",
];

const PSG_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80";

export const colleges: College[] = [
  {
    id: "kumaraguru-tech",
    name: "Kumaraguru College of Technology",
    university: "Anna University",
    description:
      "Industry-linked engineering campus with strong placement culture, modern labs, and innovation programs.",
    district: "Coimbatore",
    state: "Tamil Nadu",
    image:
      "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80",
    images: [],
    logo: "",
    isBestCollege: true,
    accreditation: "NAAC A++",
    ranking: "Top 25",
    placementRate: 92,
    hasHostel: true,
    facilities: ["Labs", "Library", "Incubation Center"],
    quotas: ["Management", "Government"],
    streams: ["Engineering", "Computer Science", "Management"],
  },
  {
    id: "psg-tech",
    name: "PSG College of Technology",
    university: "Anna University",
    description:
      "Established engineering institution known for academic rigor, research depth, and recruiter trust.",
    district: "Coimbatore",
    state: "Tamil Nadu",
    image: PSG_FALLBACK_IMAGE,
    images: [],
    logo: "",
    isBestCollege: true,
    accreditation: "NAAC A++",
    ranking: "Top 15",
    placementRate: 94,
    hasHostel: true,
    facilities: ["Labs", "Sports", "Library"],
    quotas: ["Government", "Management"],
    streams: ["Engineering", "Management"],
  },
  {
    id: "amrita",
    name: "Amrita Vishwa Vidyapeetham",
    university: "Amrita University",
    description:
      "High-performing private university with multidisciplinary programs, research focus, and strong student support.",
    district: "Coimbatore",
    state: "Tamil Nadu",
    image:
      "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80",
    images: [],
    logo: "",
    isBestCollege: true,
    accreditation: "NAAC A++",
    ranking: "Top 10",
    placementRate: 95,
    hasHostel: true,
    facilities: ["Hostel", "Medical Center", "Labs"],
    quotas: ["Management"],
    streams: ["Engineering", "Medical", "Science"],
  },
  {
    id: "sastra",
    name: "SASTRA University",
    university: "SASTRA Deemed University",
    description:
      "Popular choice for engineering and science students seeking research exposure and broad academic options.",
    district: "Thanjavur",
    state: "Tamil Nadu",
    image:
      "https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&w=1200&q=80",
    images: [],
    logo: "",
    isBestCollege: false,
    accreditation: "NAAC A+",
    ranking: "Top 35",
    placementRate: 89,
    hasHostel: true,
    facilities: ["Library", "Hostel", "Labs"],
    quotas: ["Management"],
    streams: ["Engineering", "Law", "Science"],
  },
  {
    id: "vit-chennai",
    name: "VIT Chennai",
    university: "VIT",
    description:
      "Modern campus with strong technology programs, industry engagement, and outcome-oriented learning.",
    district: "Chennai",
    state: "Tamil Nadu",
    image:
      "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?auto=format&fit=crop&w=1200&q=80",
    images: [],
    logo: "",
    isBestCollege: true,
    accreditation: "NAAC A++",
    ranking: "Top 20",
    placementRate: 91,
    hasHostel: true,
    facilities: ["Labs", "Hostel", "Innovation Hub"],
    quotas: ["Management"],
    streams: ["Engineering", "Computer Science", "Business"],
  },
  {
    id: "saveetha-medical",
    name: "Saveetha Medical College",
    university: "SIMATS",
    description:
      "Medical campus with modern clinical learning support, hospital exposure, and structured student mentoring.",
    district: "Chennai",
    state: "Tamil Nadu",
    image:
      "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?auto=format&fit=crop&w=1200&q=80",
    images: [],
    logo: "",
    isBestCollege: false,
    accreditation: "NAAC A",
    ranking: "Top 40",
    placementRate: 84,
    hasHostel: true,
    facilities: ["Hospital", "Hostel", "Library"],
    quotas: ["Management", "Government"],
    streams: ["Medical", "Paramedical"],
  },
];

export const courses: Course[] = [
  {
    id: "btech-cse-kct",
    course: "B.Tech",
    duration: "4 Years",
    totalFees: 220000,
    cutoff: 185,
    isTopCourse: true,
    university: "Anna University",
    college: "Kumaraguru College of Technology",
    specialization: "Computer Science Engineering",
    courseType: "UG",
    courseCategory: "Engineering",
    collegeDetails: [
      { college: "kumaraguru-tech", cutoff: 185 },
      { college: "psg-tech", cutoff: 192 },
      { college: "vit-chennai", cutoff: 178 },
    ],
  },
  {
    id: "btech-ai-amrita",
    course: "B.Tech",
    duration: "4 Years",
    totalFees: 310000,
    cutoff: 190,
    isTopCourse: true,
    university: "Amrita University",
    college: "Amrita Vishwa Vidyapeetham",
    specialization: "AI and Data Science",
    courseType: "UG",
    courseCategory: "Engineering",
    collegeDetails: [
      { college: "amrita", cutoff: 190 },
      { college: "sastra", cutoff: 176 },
    ],
  },
  {
    id: "mba-psg",
    course: "MBA",
    duration: "2 Years",
    totalFees: 180000,
    cutoff: 78,
    isTopCourse: true,
    university: "Anna University",
    college: "PSG College of Technology",
    specialization: "Business Analytics",
    courseType: "PG",
    courseCategory: "Management",
    collegeDetails: [
      { college: "psg-tech", cutoff: 78 },
      { college: "kumaraguru-tech", cutoff: 72 },
      { college: "vit-chennai", cutoff: 75 },
    ],
  },
  {
    id: "mca-kct",
    course: "MCA",
    duration: "2 Years",
    totalFees: 145000,
    cutoff: 68,
    isTopCourse: false,
    university: "Anna University",
    college: "Kumaraguru College of Technology",
    specialization: "Software Engineering",
    courseType: "PG",
    courseCategory: "Computer Applications",
    collegeDetails: [
      { college: "kumaraguru-tech", cutoff: 68 },
      { college: "sastra", cutoff: 65 },
    ],
  },
  {
    id: "mbbs-saveetha",
    course: "MBBS",
    duration: "5.5 Years",
    totalFees: 850000,
    cutoff: 540,
    isTopCourse: true,
    university: "SIMATS",
    college: "Saveetha Medical College",
    specialization: "General Medicine",
    courseType: "UG",
    courseCategory: "Medical",
    collegeDetails: [
      { college: "saveetha-medical", cutoff: 540 },
      { college: "amrita", cutoff: 575 },
    ],
  },
  {
    id: "bsc-cs-sastra",
    course: "B.Sc",
    duration: "3 Years",
    totalFees: 90000,
    cutoff: 70,
    isTopCourse: false,
    university: "SASTRA Deemed University",
    college: "SASTRA University",
    specialization: "Computer Science",
    courseType: "UG",
    courseCategory: "Science",
    collegeDetails: [
      { college: "sastra", cutoff: 70 },
      { college: "amrita", cutoff: 74 },
    ],
  },
  {
    id: "bba-vit",
    course: "BBA",
    duration: "3 Years",
    totalFees: 120000,
    cutoff: 65,
    isTopCourse: false,
    university: "VIT",
    college: "VIT Chennai",
    specialization: "Marketing",
    courseType: "UG",
    courseCategory: "Management",
    collegeDetails: [
      { college: "vit-chennai", cutoff: 65 },
      { college: "kumaraguru-tech", cutoff: 60 },
    ],
  },
];

export const topCollegeCourseLinks = [
  { label: "M.B.A", query: "MBA" },
  { label: "B.Tech/B.E", query: "B.Tech" },
  { label: "MCA", query: "MCA" },
  { label: "B.Sc", query: "B.Sc" },
  { label: "MBBS", query: "MBBS" },
];

export const degreeOptions = ["Engineering", "Arts & Science", "Medical", "Law"];

export const degreeCourseOptions: Record<string, string[]> = {
  "Arts & Science": ["BSc", "BA", "BCom", "BBA", "BCA", "MSc", "MCA", "MBA"],
  Engineering: ["BE", "BTech", "MCA", "MTech", "MBA"],
  Law: ["LLB", "BA_LLB", "BBA_LLB", "LLM"],
  Medical: ["MBBS", "BDS", "BAMS", "BHMS", "BPT", "BPharm", "MPharm"],
};

export const courseSpecializationOptions: Record<string, string[]> = {
  BSc: ["Computer Science", "Mathematics", "Physics", "Chemistry"],
  BA: ["English Literature", "History", "Economics"],
  BCom: ["General", "Accounting & Finance", "Taxation"],
  BBA: ["Finance", "Marketing", "Business Analytics"],
  BCA: ["Software Development", "Cloud Computing", "Cyber Security"],
  BE: ["Computer Science Engineering", "Mechanical Engineering"],
  BTech: ["Computer Science Engineering", "AI & Data Science", "Cyber Security"],
  LLB: ["Criminal Law", "Corporate Law"],
  BA_LLB: ["Integrated Law (Arts + Law)"],
  BBA_LLB: ["Integrated Law (Management + Law)"],
  MBBS: ["General Medicine"],
  BDS: ["Dental Surgery"],
  BAMS: ["Ayurvedic Medicine"],
  BHMS: ["Homeopathy"],
  BPT: ["Physiotherapy"],
  BPharm: ["Pharmacy"],
  MSc: ["Computer Science", "Physics", "Data Science"],
  MBA: ["Finance", "Marketing", "Human Resources"],
  MCA: ["Software Engineering", "AI & ML", "Data Science"],
  MTech: ["Computer Science", "Robotics"],
  LLM: ["Corporate Law", "International Law"],
  MPharm: ["Pharmacology"],
};

export const toNumber = (value: string | number | null | undefined) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : Number.NaN;
};

export const normalizeText = (value: string | null | undefined) =>
  String(value || "")
    .trim()
    .toLowerCase();

export const getCollegeById = (id: string) =>
  colleges.find((college) => college.id === id);

export const getCoursesForCollege = (collegeName: string) =>
  courses.filter((course) => course.college === collegeName);

export const getRelatedCourses = (courseName: string) =>
  courses.filter((course) => normalizeText(course.course) === normalizeText(courseName));
