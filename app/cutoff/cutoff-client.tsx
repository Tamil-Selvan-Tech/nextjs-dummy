"use client";

import { Navbar } from "@/components/navbar";
import { useMemo, useState, type CSSProperties } from "react";
import {
  ArrowUpRight,
  Award,
  BookOpen,
  Brain,
  Calculator,
  CalendarDays,
  FileText,
  GraduationCap,
  Lightbulb,
  MapPin,
  Scale,
  Search,
  SlidersHorizontal,
  Stethoscope,
  Target,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { parseCutoffValue } from "@/lib/cutoff-utils";
import { normalizeText, type College, type Course } from "@/lib/site-data";

type CutoffClientProps = {
  selectedLevel: string;
  selectedDegree: string;
  selectedCourse: string;
  selectedSpecialization: string;
  selectedCategory: string;
  selectedCollegeType: string;
  selectedAdmissionType: string;
  enteredCutoff: string;
  colleges: College[];
  courses: Course[];
};

type JuniorConfig = {
  heroTag: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  chips: Array<{ label: string; icon: LucideIcon }>;
  topSectionTitle: string;
  topSectionSubtitle: string;
  topBadges: string[];
  topColleges: Array<{ name: string; location: string; badge: string; image: string }>;
  otherSectionTitle: string;
  otherColleges: Array<{ name: string; location: string; image: string }>;
  engagementTitle: string;
  engagementSubtitle: string;
  engagementItems: string[];
  cutoffTitle: string;
  cutoffSubtitle: string;
  cutoffBands: Array<{ label: string; score: string; progress: string }>;
  careerTitle: string;
  careerSubtitle: string;
  careerOptions: string[];
  examTitle: string;
  examSubtitle: string;
  skillCards: Array<{ title: string; description: string; chips: string[] }>;
  roadmapTitle: string;
  roadmap: Array<{ title: string; detail: string }>;
  ctaEyebrow: string;
  ctaTitle: string;
  ctaSubtitle: string;
  ctaButton: string;
};

export function CutoffClient({
  selectedLevel,
  selectedDegree,
  selectedCourse,
  selectedSpecialization,
  selectedCategory,
  selectedCollegeType,
  selectedAdmissionType,
  enteredCutoff,
  colleges,
  courses,
}: CutoffClientProps) {
  const summaryLevel = selectedLevel || "11";
  const summaryDegree = selectedDegree || "Engineering";
  const summaryCourse = selectedCourse || "-";
  const summarySpecialization = selectedSpecialization || "-";
  const summaryCutoff = enteredCutoff || (summaryDegree === "Law" ? "0" : "184.5");
  const cutoffMax =
    summaryDegree === "Medical"
      ? 720
      : summaryDegree === "Paramedical"
        ? 100
        : summaryDegree === "Law"
          ? selectedAdmissionType === "CLAT"
            ? 120
            : 300
          : 200;
  const isJuniorLevel = ["6", "7", "8", "9", "10"].includes(summaryLevel);
  const examsByDegree: Record<string, string[]> = {
    Engineering: ["JEE Main", "JEE Advanced", "BITSAT", "VITEEE", "TNEA Counseling"],
    Medical: ["NEET UG", "AIIMS (via NEET)", "JIPMER (via NEET)", "State Medical Counseling"],
    "Arts & Science": ["CUET UG", "State University Entrance", "TANCET (PG)"],
    Law: ["CLAT", "AILET", "SLAT"],
    Agriculture: ["ICAR AIEEA (UG)", "State Agriculture Entrance", "University Counseling"],
    Nursing: ["NEET UG (B.Sc Nursing)", "State Nursing Entrance", "Nursing Counseling"],
    Paramedical: ["State Paramedical Entrance", "Health Science Counseling", "Institute Entrance Tests"],
    "B.Arch": ["NATA", "JEE Main (Paper 2)", "State Architecture Counseling"],
  };
  const degreeStreamMap: Record<string, string[]> = {
    Engineering: ["Engineering"],
    Medical: ["Medical", "Paramedical"],
    "Arts & Science": ["Science", "Arts", "Computer Science", "Management"],
    Law: ["Law"],
    Agriculture: ["Agriculture", "Agri"],
    Nursing: ["Nursing", "Medical"],
    Paramedical: ["Paramedical", "Medical"],
    "B.Arch": ["Architecture", "Design"],
  };
  const resolveCategoryKey = (value: string) => {
    const normalized = normalizeText(value);
    if (!normalized) return "";
    const categoryMap: Record<string, string> = {
      general: "OC",
      obc: "BC",
      sc: "SC",
      st: "ST",
      ews: "OC",
    };
    return (categoryMap[normalized] || normalized).toUpperCase();
  };
  const parseSelectedCourse = (value: string) => {
    const parts = String(value || "")
      .split(" - ")
      .map((item) => item.trim())
      .filter(Boolean);
    if (parts.length === 0) return { courseType: "", specialization: "" };
    const [courseType, ...rest] = parts;
    return { courseType, specialization: rest.join(" - ") };
  };
  const streamMatches = (streams: string[], targets: string[]) => {
    const lowerStreams = streams.map((item) => item.toLowerCase());
    return targets.some((target) =>
      lowerStreams.some((stream) => stream.includes(target.toLowerCase())),
    );
  };
  const degreeTargets = degreeStreamMap[summaryDegree] || [];
  const availableColleges = colleges || [];
  const matchingColleges = degreeTargets.length
    ? availableColleges.filter((college) => streamMatches(college.streams, degreeTargets))
    : availableColleges;
  const topColleges = matchingColleges.filter((college) => college.isBestCollege).slice(0, 6);
  const otherColleges = matchingColleges.filter((college) => !college.isBestCollege).slice(0, 10);
  const examsForDegree = examsByDegree[summaryDegree] || [];
  const examCards = (examsForDegree.length ? examsForDegree : ["Explore entrance exams for this degree"]).map(
    (exam) => ({
      title: exam,
      date: "Check official portal",
      tag: "Recommended",
    }),
  );
  const studyPlan = [
    { title: "Maths Practice", time: "30 mins", detail: "Solve 8-10 problems" },
    { title: "Science Concepts", time: "30 mins", detail: "Revise one chapter" },
    { title: "Revision Slot", time: "20 mins", detail: "Quick recap notes" },
    { title: "Mock Questions", time: "15 mins", detail: "Try 5 mixed questions" },
  ];
  const medicalHeroImage =
    "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=900&q=80";
  const medicalTopColleges = [
    {
      name: "AIIMS Delhi",
      location: "New Delhi",
      badge: "Top Pick",
      image: topColleges[0]?.image || "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "JIPMER Puducherry",
      location: "Puducherry",
      badge: "NEET Leader",
      image: topColleges[1]?.image || "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "CMC Vellore",
      location: "Vellore, TN",
      badge: "Clinical Focus",
      image: topColleges[2]?.image || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
    },
  ];
  const medicalOtherColleges = [
    {
      name: "Madras Medical College",
      location: "Chennai",
      image: otherColleges[0]?.image || "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=700&q=80",
    },
    {
      name: "Stanley Medical College",
      location: "Chennai",
      image: otherColleges[1]?.image || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=700&q=80",
    },
    {
      name: "KMC Manipal",
      location: "Karnataka",
      image: otherColleges[2]?.image || "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=700&q=80",
    },
    {
      name: "SRM Medical College",
      location: "Chengalpattu",
      image: otherColleges[3]?.image || "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=700&q=80",
    },
  ];
  const medicalEngagement = [
    "Doctor shadowing sessions",
    "Hospital / clinic visits",
    "Community health camps",
    "Career talks with alumni",
  ];
  const medicalCutoffBands = [
    { label: "OC Cutoff", score: "610+", progress: "84%" },
    { label: "BC Cutoff", score: "595+", progress: "78%" },
    { label: "MBC Cutoff", score: "580+", progress: "72%" },
    { label: "SC Cutoff", score: "520+", progress: "62%" },
  ];
  const medicalCareerOptions = [
    "MBBS (Doctor)",
    "BDS (Dentist)",
    "BPT (Physiotherapist)",
    "B.Sc Nursing",
    "Pharmacy",
    "Allied Health Sciences",
  ];
  const medicalSkillCards = [
    {
      title: "Skill Builder",
      description: "Focus on biology basics, human anatomy charts, and lab observations.",
      chips: ["Biology Basics", "Lab Skills", "Health Awareness"],
    },
    {
      title: "Subject Focus",
      description: "Keep Maths & English strong along with Biology, Chemistry, Physics.",
      chips: ["Biology", "Chemistry", "Physics", "English"],
    },
  ];
  const medicalRoadmap = [
    { title: "Build Basics", detail: "6th-10th: Strong Science foundation" },
    { title: "Choose Biology", detail: "11th-12th: PCB stream focus" },
    { title: "NEET Prep", detail: "Practice + mock tests" },
    { title: "Counselling", detail: "State & AIQ rounds" },
    { title: "MBBS Start", detail: "College admissions" },
  ];
  const juniorBaseConfig: JuniorConfig = {
    heroTag: "Career Guide",
    heroTitle: `6th-10th ${summaryDegree} Career Guide`,
    heroSubtitle: "Explore colleges, exams, and skills to build early clarity.",
    heroImage: medicalHeroImage,
    chips: [
      { label: "Top Colleges", icon: Target },
      { label: "Exam Readiness", icon: CalendarDays },
      { label: "Career Options", icon: GraduationCap },
    ],
    topSectionTitle: "Top Colleges",
    topSectionSubtitle: "Based on recent trends",
    topBadges: ["Top Pick", "Popular", "Rising"],
    topColleges: medicalTopColleges,
    otherSectionTitle: "Other Popular Institutions",
    otherColleges: medicalOtherColleges,
    engagementTitle: "Exploration Program",
    engagementSubtitle: "Activities that build curiosity and confidence early.",
    engagementItems: ["Workshops", "Project fairs", "Mentor talks"],
    cutoffTitle: "Admission Benchmarks",
    cutoffSubtitle: "Typical targets for leading programs.",
    cutoffBands: [
      { label: "Top Institutes", score: "85%+", progress: "80%" },
      { label: "Strong Programs", score: "80%+", progress: "70%" },
      { label: "Core Streams", score: "75%+", progress: "60%" },
    ],
    careerTitle: "Career Options",
    careerSubtitle: "Popular pathways to explore after 12th.",
    careerOptions: ["Core Programs", "Specializations", "Emerging Fields"],
    examTitle: "Important Exams",
    examSubtitle: "Entrance exams and admissions to track.",
    skillCards: [
      {
        title: "Skill Builder",
        description: "Strengthen core academics and learning habits.",
        chips: ["Basics", "Practice", "Focus"],
      },
      {
        title: "Growth Focus",
        description: "Explore projects to sharpen interest.",
        chips: ["Projects", "Clubs", "Mentorship"],
      },
    ],
    roadmapTitle: "Your Career Roadmap",
    roadmap: [
      { title: "Build Basics", detail: "6th-8th: Strong academic base" },
      { title: "Explore Interests", detail: "8th-10th: Clubs and projects" },
      { title: "Choose Stream", detail: "11th-12th: Focus on electives" },
      { title: "Admissions", detail: "Counseling and college selection" },
    ],
    ctaEyebrow: "Opportunities",
    ctaTitle: "Start early, stay ahead.",
    ctaSubtitle: "Get a personalized plan for exams, projects, and guidance.",
    ctaButton: "Book Free Counseling",
  };
  const juniorConfigOverrides: Record<string, Partial<JuniorConfig>> = {
    Medical: {
      heroTag: "Students Guide",
      heroTitle: "6th-10th Students Medical Career Guide",
      heroSubtitle:
        "A complete roadmap to explore medical colleges, entrance exams, and career paths after 10th.",
      heroImage: medicalHeroImage,
      chips: [
        { label: "Top Medical Colleges", icon: Stethoscope },
        { label: "NEET Cutoff Insights", icon: Target },
        { label: "Career Options", icon: GraduationCap },
      ],
      topSectionTitle: "Top Medical Colleges",
      topSectionSubtitle: "Based on NEET trends",
      topBadges: ["Top Pick", "NEET Leader", "Clinical Focus"],
      topColleges: medicalTopColleges,
      otherSectionTitle: "Other Popular Institutions",
      otherColleges: medicalOtherColleges,
      engagementTitle: "Doctor Engagement Program",
      engagementSubtitle: "Hands-on exposure that helps you understand real careers early.",
      engagementItems: medicalEngagement,
      cutoffTitle: "Cutoff Percentile (For Colleges)",
      cutoffSubtitle: "Typical NEET ranges for high-demand medical colleges.",
      cutoffBands: medicalCutoffBands,
      careerTitle: "Medical Career Options",
      careerSubtitle: "Explore common medical career paths after 12th.",
      careerOptions: medicalCareerOptions,
      examTitle: "Important Exams",
      examSubtitle: "Key exams and counseling rounds to track.",
      skillCards: medicalSkillCards,
      roadmapTitle: "Your Career Roadmap",
      roadmap: medicalRoadmap,
      ctaEyebrow: "Doctor Opportunities",
      ctaTitle: "Start early, stay ahead.",
      ctaSubtitle:
        "Get a personalized plan for NEET preparation, mentorship sessions, and guidance.",
      ctaButton: "Book Free Counseling",
    },
    Engineering: {
      heroTag: "STEM Track",
      heroTitle: "6th-10th Engineering Explorer",
      heroSubtitle:
        "Build strong math and science foundations while discovering engineering pathways.",
      heroImage:
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80",
      chips: [
        { label: "Tech Foundations", icon: Brain },
        { label: "JEE Readiness", icon: Target },
        { label: "Project Skills", icon: Lightbulb },
      ],
      topSectionTitle: "Top Engineering Colleges",
      topSectionSubtitle: "Based on JEE and state trends",
      topBadges: ["Top Pick", "Tech Focus", "Research Hub"],
      topColleges: [
        {
          name: "IIT Madras",
          location: "Chennai",
          badge: "Top Pick",
          image:
            "https://images.unsplash.com/photo-1519452575417-564c1401ecc0?auto=format&fit=crop&w=800&q=80",
        },
        {
          name: "NIT Trichy",
          location: "Tiruchirappalli",
          badge: "Tech Focus",
          image:
            "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=80",
        },
        {
          name: "Anna University",
          location: "Chennai",
          badge: "Research Hub",
          image:
            "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80",
        },
      ],
      otherColleges: [
        {
          name: "VIT Vellore",
          location: "Vellore, TN",
          image:
            "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=700&q=80",
        },
        {
          name: "SRM Institute of Science and Technology",
          location: "Chengalpattu, TN",
          image:
            "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=700&q=80",
        },
        {
          name: "PSG Tech",
          location: "Coimbatore, TN",
          image:
            "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=700&q=80",
        },
      ],
      engagementTitle: "Tech Exploration Program",
      engagementSubtitle: "Hands-on activities to build curiosity for engineering.",
      engagementItems: ["Robotics clubs", "STEM fairs", "Coding challenges"],
      cutoffBands: [
        { label: "Top Institutes Target", score: "95+ %ile", progress: "84%" },
        { label: "Strong State Target", score: "90+ %ile", progress: "74%" },
        { label: "Core Branches", score: "85+ %ile", progress: "64%" },
      ],
      careerTitle: "Engineering Career Options",
      careerOptions: ["Computer Science", "ECE", "Mechanical"],
      skillCards: [
        {
          title: "Skill Builder",
          description: "Strengthen Maths, Physics, and reasoning.",
          chips: ["Maths", "Physics", "Logic"],
        },
        {
          title: "Project Focus",
          description: "Build mini projects to develop design confidence.",
          chips: ["Coding", "Design", "Teamwork"],
        },
      ],
      roadmap: [
        { title: "Build Basics", detail: "6th-8th: Maths and Science" },
        { title: "Explore Tech", detail: "8th-10th: Robotics and coding" },
        { title: "Choose PCM", detail: "11th-12th: Core subjects" },
        { title: "JEE Prep", detail: "Practice + mock tests" },
      ],
      ctaEyebrow: "Engineering Opportunities",
    },
    "Arts & Science": {
      heroTag: "Core Stream",
      heroTitle: "6th-10th Arts & Science Pathway",
      heroSubtitle: "Discover academic pathways across science, commerce, and humanities.",
      heroImage:
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80",
      chips: [
        { label: "CUET Readiness", icon: BookOpen },
        { label: "Research Skills", icon: Brain },
        { label: "Creative Growth", icon: Lightbulb },
      ],
      topSectionTitle: "Top Arts & Science Colleges",
      topSectionSubtitle: "Based on university trends",
      topBadges: ["Top Pick", "Research Focus", "Student Favorite"],
      topColleges: [
        {
          name: "Loyola College",
          location: "Chennai",
          badge: "Top Pick",
          image:
            "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80",
        },
        {
          name: "Madras Christian College",
          location: "Chennai",
          badge: "Research Focus",
          image:
            "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=800&q=80",
        },
        {
          name: "PSG College of Arts & Science",
          location: "Coimbatore, TN",
          badge: "Student Favorite",
          image:
            "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
        },
      ],
      otherColleges: [
        {
          name: "Ethiraj College for Women",
          location: "Chennai",
          image:
            "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=700&q=80",
        },
        {
          name: "Presidency College",
          location: "Chennai",
          image:
            "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=700&q=80",
        },
        {
          name: "St. Joseph's College",
          location: "Trichy, TN",
          image:
            "https://images.unsplash.com/photo-1519452575417-564c1401ecc0?auto=format&fit=crop&w=700&q=80",
        },
      ],
      engagementTitle: "Academic Exploration Program",
      engagementItems: ["Science exhibitions", "Debate club", "Writing workshops"],
      cutoffBands: [
        { label: "Top Universities", score: "90%+", progress: "82%" },
        { label: "Strong Programs", score: "85%+", progress: "72%" },
        { label: "Popular Streams", score: "80%+", progress: "62%" },
      ],
      careerTitle: "Arts & Science Options",
      careerOptions: ["B.Sc", "B.A", "B.Com"],
      skillCards: [
        {
          title: "Skill Builder",
          description: "Develop reading, writing, and analysis.",
          chips: ["Reading", "Writing", "Research"],
        },
        {
          title: "Subject Focus",
          description: "Keep Maths, Science, and English strong.",
          chips: ["Maths", "Science", "English"],
        },
      ],
      roadmap: [
        { title: "Build Basics", detail: "6th-8th: Core subjects" },
        { title: "Find Interests", detail: "8th-10th: Clubs and labs" },
        { title: "Choose Stream", detail: "11th-12th: Electives" },
        { title: "Admissions", detail: "Applications and counseling" },
      ],
    },
    Law: {
      heroTag: "Legal Track",
      heroTitle: "6th-10th Law & Public Policy Path",
      heroSubtitle: "Build critical thinking and communication skills for law.",
      heroImage:
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&q=80",
      chips: [
        { label: "CLAT Readiness", icon: Scale },
        { label: "Debate Skills", icon: Lightbulb },
        { label: "Current Affairs", icon: FileText },
      ],
      topSectionTitle: "Top Law Colleges",
      topSectionSubtitle: "Based on CLAT trends",
      topBadges: ["Top Pick", "Advocacy Focus", "Policy Hub"],
      topColleges: [
        {
          name: "NLSIU Bengaluru",
          location: "Bengaluru",
          badge: "Top Pick",
          image:
            "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80",
        },
        {
          name: "NALSAR Hyderabad",
          location: "Hyderabad",
          badge: "Advocacy Focus",
          image:
            "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=80",
        },
        {
          name: "NLU Delhi",
          location: "New Delhi",
          badge: "Policy Hub",
          image:
            "https://images.unsplash.com/photo-1519452575417-564c1401ecc0?auto=format&fit=crop&w=800&q=80",
        },
      ],
      otherColleges: [
        {
          name: "SASTRA Law School",
          location: "Thanjavur, TN",
          image:
            "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=700&q=80",
        },
        {
          name: "School of Excellence in Law",
          location: "Chennai, TN",
          image:
            "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=700&q=80",
        },
        {
          name: "Saveetha School of Law",
          location: "Chennai, TN",
          image:
            "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=700&q=80",
        },
      ],
      engagementTitle: "Legal Exploration Program",
      engagementItems: ["Mock trials", "Debate club", "Model UN"],
      cutoffBands: [
        { label: "National Law Schools", score: "90+ score", progress: "82%" },
        { label: "Top Private Law", score: "80+ score", progress: "72%" },
        { label: "State Universities", score: "70+ score", progress: "62%" },
      ],
      careerTitle: "Law Career Options",
      careerOptions: ["BA LLB", "Corporate Law", "Judiciary"],
      skillCards: [
        {
          title: "Skill Builder",
          description: "Improve reading speed, reasoning, and writing clarity.",
          chips: ["Reasoning", "Reading", "Writing"],
        },
        {
          title: "Advocacy Focus",
          description: "Practice debates and public speaking.",
          chips: ["Debate", "Speaking", "Ethics"],
        },
      ],
      roadmap: [
        { title: "Build Basics", detail: "6th-8th: Reading and comprehension" },
        { title: "Explore Law", detail: "8th-10th: Debates and mock trials" },
        { title: "Humanities Stream", detail: "11th-12th: Legal aptitude" },
        { title: "Admissions", detail: "Counseling and selection" },
      ],
    },
    Agriculture: {
      heroTag: "Green Track",
      heroTitle: "6th-10th Agriculture & Life Sciences",
      heroSubtitle: "Learn about food science, sustainability, and agriculture.",
      heroImage:
        "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=900&q=80",
      chips: [
        { label: "ICAR Readiness", icon: Target },
        { label: "Life Sciences", icon: Brain },
        { label: "Field Learning", icon: Lightbulb },
      ],
      topSectionTitle: "Top Agriculture Colleges",
      topSectionSubtitle: "Based on ICAR trends",
      topBadges: ["Top Pick", "Research Farm", "Agri Tech"],
      topColleges: [
        {
          name: "TNAU Coimbatore",
          location: "Coimbatore, TN",
          badge: "Top Pick",
          image:
            "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=800&q=80",
        },
        {
          name: "ICAR-IARI",
          location: "New Delhi",
          badge: "Research Farm",
          image:
            "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=800&q=80",
        },
        {
          name: "PJTSAU",
          location: "Hyderabad",
          badge: "Agri Tech",
          image:
            "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=800&q=80",
        },
      ],
      otherColleges: [
        {
          name: "Annamalai University",
          location: "Chidambaram, TN",
          image:
            "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=700&q=80",
        },
        {
          name: "TNAU Madurai",
          location: "Madurai, TN",
          image:
            "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=700&q=80",
        },
        {
          name: "Kerala Agricultural University",
          location: "Thrissur, KL",
          image:
            "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=700&q=80",
        },
      ],
      engagementTitle: "Agri Exploration Program",
      engagementItems: ["Farm visits", "Plant lab sessions", "Soil testing"],
      cutoffBands: [
        { label: "Top Universities", score: "85%+", progress: "78%" },
        { label: "Strong Programs", score: "80%+", progress: "70%" },
        { label: "Core Streams", score: "75%+", progress: "62%" },
      ],
      careerTitle: "Agriculture Career Options",
      careerOptions: ["B.Sc Agriculture", "Horticulture", "Food Technology"],
      skillCards: [
        {
          title: "Skill Builder",
          description: "Develop biology basics and environmental awareness.",
          chips: ["Biology", "Environment", "Research"],
        },
        {
          title: "Field Focus",
          description: "Engage in field observations and sustainability projects.",
          chips: ["Fieldwork", "Sustainability", "Data"],
        },
      ],
      roadmap: [
        { title: "Build Basics", detail: "6th-8th: Biology and environment" },
        { title: "Explore Agri", detail: "8th-10th: Field visits and labs" },
        { title: "Choose PCB", detail: "11th-12th: Life science focus" },
        { title: "Admissions", detail: "Counseling and selection" },
      ],
    },
    Paramedical: {
      heroTag: "Health Track",
      heroTitle: "6th-10th Paramedical & Health Track",
      heroSubtitle: "Explore allied health careers that support patient care.",
      heroImage:
        "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=900&q=80",
      chips: [
        { label: "Health Sciences", icon: Stethoscope },
        { label: "Skill Training", icon: Target },
        { label: "Care Pathways", icon: GraduationCap },
      ],
      topSectionTitle: "Top Paramedical Colleges",
      topSectionSubtitle: "Based on health science trends",
      topBadges: ["Top Pick", "Clinical Focus", "Skills Hub"],
      topColleges: [
        {
          name: "CMC Vellore",
          location: "Vellore, TN",
          badge: "Top Pick",
          image:
            "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
        },
        {
          name: "Sri Ramachandra Institute",
          location: "Chennai, TN",
          badge: "Clinical Focus",
          image:
            "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80",
        },
        {
          name: "JSS Medical College",
          location: "Mysuru, KA",
          badge: "Skills Hub",
          image:
            "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=800&q=80",
        },
      ],
      otherColleges: [
        {
          name: "KMC Manipal",
          location: "Karnataka",
          image:
            "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=700&q=80",
        },
        {
          name: "SRM Medical College",
          location: "Chengalpattu, TN",
          image:
            "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=700&q=80",
        },
        {
          name: "Amrita Institute of Medical Sciences",
          location: "Kochi, KL",
          image:
            "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=700&q=80",
        },
      ],
      engagementTitle: "Health Exploration Program",
      engagementItems: ["First aid training", "Health camps", "Hospital visits"],
      cutoffBands: [
        { label: "Top Institutes", score: "85%+", progress: "78%" },
        { label: "Strong Programs", score: "80%+", progress: "70%" },
        { label: "Core Streams", score: "75%+", progress: "62%" },
      ],
      careerTitle: "Paramedical Career Options",
      careerOptions: ["Physiotherapy", "Radiology", "Lab Technology"],
      skillCards: [
        {
          title: "Skill Builder",
          description: "Strengthen biology basics and communication.",
          chips: ["Biology", "Health", "Communication"],
        },
        {
          title: "Care Focus",
          description: "Understand patient care and teamwork.",
          chips: ["Empathy", "Teamwork", "Safety"],
        },
      ],
      roadmap: [
        { title: "Build Basics", detail: "6th-8th: Science and health basics" },
        { title: "Explore Health", detail: "8th-10th: First aid and clinics" },
        { title: "Choose PCB", detail: "11th-12th: Life science focus" },
        { title: "Admissions", detail: "Counseling and selection" },
      ],
    },
    "B.Arch": {
      heroTag: "Design Track",
      heroTitle: "6th-10th Architecture & Design Track",
      heroSubtitle: "Develop creativity, spatial thinking, and design basics early.",
      heroImage:
        "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80",
      chips: [
        { label: "Design Basics", icon: Lightbulb },
        { label: "Drawing Skills", icon: BookOpen },
        { label: "NATA Readiness", icon: Target },
      ],
      topSectionTitle: "Top Architecture Colleges",
      topSectionSubtitle: "Based on NATA trends",
      topBadges: ["Top Pick", "Studio Focus", "Design Hub"],
      topColleges: [
        {
          name: "SPA Delhi",
          location: "New Delhi",
          badge: "Top Pick",
          image:
            "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80",
        },
        {
          name: "CEPT University",
          location: "Ahmedabad",
          badge: "Studio Focus",
          image:
            "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=800&q=80",
        },
        {
          name: "Anna University",
          location: "Chennai",
          badge: "Design Hub",
          image:
            "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80",
        },
      ],
      otherColleges: [
        {
          name: "School of Architecture & Planning",
          location: "Chennai, TN",
          image:
            "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=700&q=80",
        },
        {
          name: "SRM School of Architecture",
          location: "Chengalpattu, TN",
          image:
            "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=700&q=80",
        },
        {
          name: "BMS College of Architecture",
          location: "Bengaluru, KA",
          image:
            "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=700&q=80",
        },
      ],
      engagementTitle: "Design Exploration Program",
      engagementItems: ["Sketching practice", "Model making", "Portfolio building"],
      cutoffBands: [
        { label: "Top Schools", score: "120+ NATA", progress: "82%" },
        { label: "Strong Programs", score: "100+ NATA", progress: "72%" },
        { label: "Core Institutes", score: "90+ NATA", progress: "62%" },
      ],
      careerTitle: "Architecture Career Options",
      careerOptions: ["Architecture", "Interior Design", "Urban Planning"],
      skillCards: [
        {
          title: "Skill Builder",
          description: "Develop drawing, geometry, and visualization skills.",
          chips: ["Drawing", "Geometry", "Creativity"],
        },
        {
          title: "Design Focus",
          description: "Work on mini models and design thinking exercises.",
          chips: ["Model Making", "Design", "Portfolio"],
        },
      ],
      roadmap: [
        { title: "Build Basics", detail: "6th-8th: Drawing and geometry" },
        { title: "Explore Design", detail: "8th-10th: Sketching and models" },
        { title: "Choose PCM", detail: "11th-12th: Focus on NATA" },
        { title: "Admissions", detail: "Counseling and selection" },
      ],
    },
  };
  const resolvedJuniorConfig: JuniorConfig = {
    ...juniorBaseConfig,
    ...(juniorConfigOverrides[summaryDegree] || {}),
  };
  const resolveLocation = (college: College) =>
    [college.district, college.state].filter(Boolean).join(", ") || "Location not listed";
  const topBadges = resolvedJuniorConfig.topBadges.length
    ? resolvedJuniorConfig.topBadges
    : ["Top Pick", "Popular", "Rising"];
  const resolvedTopColleges = topColleges.length
    ? topColleges.slice(0, 3).map((college, index) => ({
        name: college.name,
        location: resolveLocation(college),
        badge: topBadges[index] ?? "Top Pick",
        image:
          college.image ||
          resolvedJuniorConfig.topColleges[index]?.image ||
          resolvedJuniorConfig.heroImage,
      }))
    : resolvedJuniorConfig.topColleges;
  const resolvedOtherColleges = otherColleges.length
    ? otherColleges.slice(0, 3).map((college, index) => ({
        name: college.name,
        location: resolveLocation(college),
        image:
          college.image ||
          resolvedJuniorConfig.otherColleges[index]?.image ||
          resolvedJuniorConfig.heroImage,
      }))
    : resolvedJuniorConfig.otherColleges;
  const subjectTips: Record<number, string> = {
    1: "Start with basics and short daily practice.",
    2: "Revise core topics with simple examples.",
    3: "Good progress - add more practice questions.",
    4: "Strong - start timed problem sets.",
    5: "Excellent - help peers or teach-back.",
  };
  const [subjectRatings, setSubjectRatings] = useState({
    Maths: 3,
    Science: 3,
    English: 3,
  });
  const quizOptionsByQuestion = [
    [
      { label: "I enjoy solving problems and building things", track: "Engineering" },
      { label: "I like helping people and learning about health", track: "Medical" },
      { label: "I enjoy creativity, reading, or social topics", track: "Arts" },
      { label: "I like justice, rules, and helping people with rights", track: "Law" },
    ],
    [
      { label: "I like fixing gadgets or understanding how machines work", track: "Engineering" },
      { label: "I am curious about biology and how the body works", track: "Medical" },
      { label: "I enjoy writing, debating, or storytelling", track: "Arts" },
      { label: "I like debating, public speaking, and fairness", track: "Law" },
    ],
    [
      { label: "I like building apps, models, or simple experiments", track: "Engineering" },
      { label: "I want a career where I can help patients", track: "Medical" },
      { label: "I enjoy design, art, or creative projects", track: "Arts" },
      { label: "I want to work on cases and solve disputes", track: "Law" },
    ],
  ];
  const [quizAnswers, setQuizAnswers] = useState([0, 0, 0]);
  const quizScores = quizAnswers.reduce(
    (acc, answerIndex) => {
      const optionsForQuestion = quizOptionsByQuestion[acc.__index] || [];
      const picked = optionsForQuestion[answerIndex]?.track;
      if (picked) acc[picked] = (acc[picked] || 0) + 1;
      acc.__index += 1;
      return acc;
    },
    { Engineering: 0, Medical: 0, Arts: 0, Law: 0, __index: 0 } as Record<string, number>,
  );
  const quizResult = Object.entries(quizScores)
    .filter(([key]) => key !== "__index")
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Engineering";
  const [scoreInput, setScoreInput] = useState("");
  const scoreValue = Number(scoreInput);
  const resolvedScore = Number.isFinite(scoreValue) ? scoreValue : NaN;
  const levelResult = useMemo(() => {
    if (!Number.isFinite(resolvedScore)) {
      return { level: "-", label: "Enter a score", tip: "Start with Maths + Science basics." };
    }
    if (resolvedScore >= 90) return { level: "10", label: "Top Performer", tip: "Keep a steady revision plan." };
    if (resolvedScore >= 80) return { level: "8", label: "Very Good", tip: "Practice weekly tests." };
    if (resolvedScore >= 60) return { level: "6", label: "Good", tip: "Focus on tricky topics daily." };
    if (resolvedScore >= 40) return { level: "4", label: "Needs Improvement", tip: "Spend extra time on basics." };
    return { level: "4", label: "Needs Improvement", tip: "Ask for help and revise fundamentals." };
  }, [resolvedScore]);

  const { matchingCards } = useMemo(() => {
    if (!courses.length || !colleges.length) {
      return { matchingCards: [], aimHigherCards: [] };
    }
    const categoryKey = resolveCategoryKey(selectedCategory);
    const normalizedCollegeType = normalizeText(selectedCollegeType);
    const normalizeCollegeType = (value: string) => {
      const normalized = normalizeText(value);
      if (!normalized) return "";
      if (
        normalized.includes("government") ||
        normalized.includes("govt") ||
        normalized.includes("public") ||
        normalized.includes("state")
      ) {
        return "government";
      }
      if (
        normalized.includes("private") ||
        normalized.includes("self") ||
        normalized.includes("deemed")
      ) {
        return "private";
      }
      return normalized;
    };
    const selectedCollegeTypeKey = normalizeCollegeType(normalizedCollegeType);
    const { courseType: selectedCourseType, specialization: selectedCourseSpecialization } =
      parseSelectedCourse(selectedCourse);
    const normalizeMatchText = (value: string | null | undefined) =>
      normalizeText(value).replace(/[^a-z0-9]/g, "");
    const normalizedCourseSearch = normalizeMatchText(selectedCourse);
    const normalizedCourseType = normalizeMatchText(selectedCourseType);
    const normalizedSpecialization = normalizeMatchText(
      selectedSpecialization || selectedCourseSpecialization,
    );
    const userCutoff = parseCutoffValue(enteredCutoff);
    const userScore = userCutoff ? Math.max(userCutoff.start, userCutoff.end) : null;
    const degreeTokens = (degreeTargets.length ? degreeTargets : [summaryDegree]).map((value) =>
      normalizeText(value),
    );
    const formatGap = (value: number) => {
      if (!Number.isFinite(value)) return "";
      const rounded = Math.round(value * 10) / 10;
      return Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1);
    };

    const resolveCutoffByCategory = (
      entries: Array<{ category: string; cutoff: string }> | undefined,
      category: string,
    ) => {
      if (!entries?.length || !category) return "";
      const resolved = entries.find(
        (entry) => normalizeText(entry.category) === normalizeText(category),
      );
      return resolved?.cutoff || "";
    };

    const matchesDegree = (course: Course) => {
      if (!degreeTokens[0]) return true;
      const haystack = [
        course.stream,
        course.courseCategory,
        course.degreeType,
        course.courseType,
      ]
        .map((value) => normalizeText(value))
        .join(" ");
      return degreeTokens.some((token) => token && haystack.includes(token));
    };

    const matchesCourseSelection = (course: Course) => {
      if (!normalizedCourseSearch && !normalizedCourseType && !normalizedSpecialization) {
        return true;
      }
      const courseName = normalizeMatchText(course.course || course.courseName || "");
      const courseType = normalizeMatchText(course.courseType || course.course || "");
      const specialization = normalizeMatchText(
        course.specialization || course.courseName || course.courseCategory || "",
      );
      const combinedCourse = `${courseType}${specialization}`;
      if (normalizedCourseSearch) {
        if (courseName && courseName.includes(normalizedCourseSearch)) return true;
        if (combinedCourse && combinedCourse.includes(normalizedCourseSearch)) return true;
        if (normalizedCourseSearch.includes(courseName) && courseName) return true;
      }
      if (normalizedCourseType && courseType.includes(normalizedCourseType)) {
        if (!normalizedSpecialization) return true;
        return specialization.includes(normalizedSpecialization);
      }
      if (normalizedSpecialization && specialization.includes(normalizedSpecialization)) return true;
      return false;
    };

    const matchesCollegeType = (college: College) => {
      if (!selectedCollegeTypeKey) return true;
      const ownership = normalizeCollegeType(college.ownershipType || "");
      if (ownership && ownership.includes(selectedCollegeTypeKey)) return true;
      if (college.quotas?.length) {
        return college.quotas.some((quota) =>
          normalizeCollegeType(quota).includes(selectedCollegeTypeKey),
        );
      }
      if (!ownership && (!college.quotas || college.quotas.length === 0)) {
        return true;
      }
      return false;
    };

    const matchingMap = new Map<
      string,
      {
        id: string;
        name: string;
        location: string;
        cutoff: string;
        match: string;
        image: string;
        tags: string[];
        href: string;
        score: number;
      }
    >();
    const aimHigherMap = new Map<
      string,
      {
        id: string;
        name: string;
        location: string;
        require: string;
        need: string;
        image: string;
        href: string;
        gap: number;
      }
    >();

    courses.forEach((course) => {
      const courseSelectionMatch = matchesCourseSelection(course);
      const degreeMatch = matchesDegree(course);
      if (!courseSelectionMatch && !degreeMatch) return;
      const courseDetails =
        course.collegeDetails && course.collegeDetails.length > 0
          ? course.collegeDetails
          : [
              {
                college: course.collegeId || course.college,
                cutoff: course.cutoff,
                cutoffByCategory: course.cutoffByCategory || [],
              },
            ];

      courseDetails.forEach((detail) => {
        const collegeKey = normalizeText(detail.college || "");
        if (!collegeKey) return;
        const college = colleges.find(
          (item) =>
            normalizeText(item.id) === collegeKey ||
            normalizeText(item.name) === collegeKey ||
            normalizeText(item.university) === collegeKey,
        );
        if (!college) return;
        if (!matchesCollegeType(college)) return;

        const categoryCutoff =
          resolveCutoffByCategory(detail.cutoffByCategory, categoryKey) ||
          resolveCutoffByCategory(course.cutoffByCategory, categoryKey);
        const rawCutoff =
          categoryCutoff ||
          detail.cutoffText ||
          course.cutoffText ||
          detail.cutoff ||
          course.cutoff;
        const parsedCutoff = parseCutoffValue(rawCutoff);
        const cutoffLabel = parsedCutoff
          ? parsedCutoff.start === parsedCutoff.end
            ? `${parsedCutoff.start}`
            : `${parsedCutoff.start} - ${parsedCutoff.end}`
          : rawCutoff
            ? String(rawCutoff)
            : "N/A";

        if (userScore !== null && parsedCutoff && userScore < parsedCutoff.start) {
          if (college.isBestCollege) {
            const gap = parsedCutoff.start - userScore;
            const requireText = categoryKey
              ? `Requires ${categoryKey} ${cutoffLabel} Cutoff`
              : `Requires ${cutoffLabel} Cutoff`;
            const needText = `+${formatGap(gap)} marks`;
            const existingTarget = aimHigherMap.get(college.id);
            if (!existingTarget || gap < existingTarget.gap) {
              aimHigherMap.set(college.id, {
                id: college.id,
                name: college.name,
                location: [college.district, college.state].filter(Boolean).join(", "),
                require: requireText,
                need: needText,
                image: college.image,
                href: `/college/${college.id}`,
                gap,
              });
            }
          }
          return;
        }

        const target = parsedCutoff ? parsedCutoff.end : null;
        const ratio = userScore !== null && target ? userScore / target : 0.75;
        const score = Math.max(55, Math.min(99, Math.round(ratio * 100)));

        const tags = [
          course.courseType || course.courseCategory || summaryDegree,
          course.specialization || course.courseName,
          categoryKey ? `${categoryKey} Cutoff` : "",
        ]
          .map((tag) => String(tag || "").trim())
          .filter(Boolean)
          .slice(0, 3);

        const existing = matchingMap.get(college.id);
        if (!existing || score > existing.score) {
          matchingMap.set(college.id, {
            id: college.id,
            name: college.name,
            location: [college.district, college.state].filter(Boolean).join(", "),
            cutoff: cutoffLabel,
            match: `${score}% Match`,
            image: college.image,
            tags,
            href: `/college/${college.id}`,
            score,
          });
        }
      });
    });

    return {
      matchingCards: Array.from(matchingMap.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, 6),
      aimHigherCards: Array.from(aimHigherMap.values())
        .sort((a, b) => a.gap - b.gap)
        .slice(0, 4),
    };
  }, [
    colleges,
    courses,
    enteredCutoff,
    selectedCategory,
    selectedCollegeType,
    selectedCourse,
    selectedSpecialization,
    summaryDegree,
  ]);
  const seniorParsedCutoff = parseCutoffValue(summaryCutoff);
  const seniorCutoffScore = seniorParsedCutoff
    ? Math.max(seniorParsedCutoff.start, seniorParsedCutoff.end)
    : 0;
  const seniorConfidence = cutoffMax
    ? Math.max(55, Math.min(98, Math.round((seniorCutoffScore / cutoffMax) * 100)))
    : 0;
  const seniorDisplayCards = matchingCards.length
    ? matchingCards
    : topColleges.slice(0, 5).map((college, index) => ({
        id: college.id,
        name: college.name,
        location: [college.district, college.state].filter(Boolean).join(", "),
        cutoff: ["195.5 - 199", "192 - 197.5", "188.5 - 194", "185 - 191.5", "182 - 190"][index] || "180 - 190",
        match: `${92 - index * 4}% Match`,
        image: college.image,
        tags: [college.ownershipType || "Engineering", college.accreditation, college.ranking]
          .filter(Boolean)
          .slice(0, 3),
        href: `/college/${college.id}`,
        score: 92 - index * 4,
      }));
  const seniorLocations = Array.from(
    new Set(
      seniorDisplayCards
        .map((college) => (college.location || "").split(",")[0]?.trim())
        .filter(Boolean),
    ),
  ).slice(0, 5);
  const seniorFeeEstimates = [
    "Rs25,000 / year",
    "Rs1.5L - 2.5L / year",
    "Rs2.0L - 3.0L / year",
    "Rs45,000 - 80,000 / year",
    "Rs3.5L+ / year",
    "Contact college",
  ];
  const seniorExamCards = examCards.slice(0, 3);
  const seniorHeroTitle =
    normalizeText(summaryDegree) === "engineering"
      ? `Top ${summaryCourse !== "-" ? summaryCourse : "B.E / B.Tech"} Matches for You`
      : `Top ${summaryDegree} Matches for You`;
  const seniorHeroSubtitle = [
    `Based on your aggregate of ${summaryCutoff || "0"}, we identified colleges where you have a strong chance of admission in Tamil Nadu.`,
    summarySpecialization !== "-" ? `Specialization focus: ${summarySpecialization}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (isJuniorLevel) {
    return (
      <section
        className="min-h-screen bg-[#f5f8ff] text-[color:var(--text-dark)]"
        style={
          {
            "--brand-primary": "#1d4ed8",
            "--brand-primary-soft": "#3b82f6",
            "--text-dark": "#0f172a",
            "--text-muted": "rgba(15,23,42,0.64)",
          } as CSSProperties
        }
      >
        <Navbar />
        <div className="page-container-full py-10 md:py-12">
          <section className="rounded-[1.8rem] border border-[rgba(29,78,216,0.12)] bg-white p-6 shadow-[0_18px_40px_rgba(29,78,216,0.12)] md:p-8">
            <div className="grid items-center gap-6 lg:grid-cols-[1.45fr_1fr]">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--brand-primary)]">
                  {resolvedJuniorConfig.heroTag}
                </div>
                <h1 className="mt-3 text-2xl font-bold text-[color:var(--text-dark)] md:text-3xl">
                  {resolvedJuniorConfig.heroTitle}
                </h1>
                <p className="mt-2 max-w-xl text-sm text-[color:var(--text-muted)] md:text-base">
                  {resolvedJuniorConfig.heroSubtitle}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {resolvedJuniorConfig.chips.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-2 rounded-full border border-[rgba(29,78,216,0.16)] bg-[rgba(29,78,216,0.08)] px-3 py-2 text-xs font-semibold text-[color:var(--text-dark)]"
                    >
                      <item.icon className="size-3.5 text-[color:var(--brand-primary)]" />
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative h-56 overflow-hidden rounded-3xl border border-[rgba(29,78,216,0.12)] bg-[rgba(29,78,216,0.06)] md:h-64 lg:h-72">
                <Image
                  src={resolvedJuniorConfig.heroImage}
                  alt={resolvedJuniorConfig.heroTitle}
                  fill
                  sizes="(min-width: 1024px) 420px, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-[1.6rem] border border-[rgba(29,78,216,0.12)] bg-white p-6 shadow-[0_16px_32px_rgba(29,78,216,0.08)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-base font-semibold text-[color:var(--text-dark)]">
                <Target className="size-4 text-[color:var(--brand-primary)]" />
                {resolvedJuniorConfig.topSectionTitle}
              </div>
              <span className="text-xs font-semibold text-[color:var(--text-muted)]">
                {resolvedJuniorConfig.topSectionSubtitle}
              </span>
            </div>
            <div className="mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 pr-2">
              {resolvedTopColleges.map((college) => (
                <article
                  key={college.name}
                  className="min-w-[260px] snap-start overflow-hidden rounded-2xl border border-[rgba(29,78,216,0.12)] bg-white shadow-[0_12px_24px_rgba(15,76,129,0.08)] sm:min-w-[300px] lg:min-w-[320px]"
                >
                  <div className="relative h-36 w-full bg-[rgba(15,76,129,0.08)]">
                    <Image
                      src={college.image}
                      alt={college.name}
                      fill
                      sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 100vw"
                      className="object-cover"
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-[rgba(29,78,216,0.16)] px-2.5 py-1 text-[10px] font-semibold text-[color:var(--brand-primary)]">
                      {college.badge}
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="text-sm font-semibold text-[color:var(--text-dark)]">{college.name}</div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-[color:var(--text-muted)]">
                      <MapPin className="size-3" />
                      {college.location}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-[1.6rem] border border-[rgba(29,78,216,0.12)] bg-white p-6 shadow-[0_16px_32px_rgba(29,78,216,0.08)]">
            <div className="text-sm font-semibold text-[color:var(--text-dark)]">
              {resolvedJuniorConfig.otherSectionTitle}
            </div>
            <div className="mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 pr-2">
              {resolvedOtherColleges.map((college) => (
                <article
                  key={college.name}
                  className="min-w-[240px] snap-start overflow-hidden rounded-2xl border border-[rgba(29,78,216,0.12)] bg-white shadow-[0_10px_20px_rgba(15,76,129,0.06)] sm:min-w-[280px] lg:min-w-[300px]"
                >
                  <div className="relative h-28 w-full bg-[rgba(15,76,129,0.08)]">
                    <Image
                      src={college.image}
                      alt={college.name}
                      fill
                      sizes="(min-width: 1024px) 260px, (min-width: 640px) 45vw, 100vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <div className="text-sm font-semibold text-[color:var(--text-dark)]">{college.name}</div>
                    <div className="mt-1 text-xs text-[color:var(--text-muted)]">{college.location}</div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[1.6rem] border border-[rgba(29,78,216,0.12)] bg-white p-6 shadow-[0_16px_32px_rgba(29,78,216,0.08)]">
              <div className="flex items-center gap-2 text-base font-semibold text-[color:var(--text-dark)]">
                <Award className="size-4 text-[color:var(--brand-primary)]" />
                {resolvedJuniorConfig.engagementTitle}
              </div>
              <p className="mt-2 text-sm text-[color:var(--text-muted)]">
                {resolvedJuniorConfig.engagementSubtitle}
              </p>
              <div className="mt-4 space-y-3 text-sm text-[color:var(--text-dark)]">
                {resolvedJuniorConfig.engagementItems.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-xl border border-[rgba(29,78,216,0.12)] bg-[rgba(29,78,216,0.06)] px-3 py-2"
                  >
                    <Target className="size-4 text-[color:var(--brand-primary)]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-[rgba(29,78,216,0.12)] bg-white p-6 shadow-[0_16px_32px_rgba(29,78,216,0.08)]">
              <div className="flex items-center gap-2 text-base font-semibold text-[color:var(--text-dark)]">
                <TrendingUp className="size-4 text-[color:var(--brand-primary)]" />
                {resolvedJuniorConfig.cutoffTitle}
              </div>
              <p className="mt-2 text-xs text-[color:var(--text-muted)]">
                {resolvedJuniorConfig.cutoffSubtitle}
              </p>
              <div className="mt-4 space-y-3">
                {resolvedJuniorConfig.cutoffBands.map((band) => (
                  <div
                    key={band.label}
                    className="rounded-xl border border-[rgba(29,78,216,0.12)] bg-[rgba(29,78,216,0.06)] p-3"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-[color:var(--text-dark)]">
                      <span>{band.label}</span>
                      <span>{band.score}</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-[rgba(29,78,216,0.12)]">
                      <div
                        className="h-2 rounded-full bg-[color:var(--brand-primary)]"
                        style={{ width: band.progress }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-[rgba(29,78,216,0.14)] bg-white p-3 text-xs text-[color:var(--text-muted)]">
                Enter your latest school % to see your level:
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-2 rounded-full border border-[rgba(29,78,216,0.14)] bg-[rgba(29,78,216,0.06)] px-3 py-2 text-xs text-[color:var(--text-dark)]">
                    <Calculator className="size-3.5 text-[color:var(--brand-primary)]" />
                    %
                    <input
                      type="number"
                      min={0}
                      max={100}
                      inputMode="numeric"
                      value={scoreInput}
                      onChange={(event) => setScoreInput(event.target.value)}
                      placeholder="78"
                      className="w-14 bg-transparent text-[color:var(--text-dark)] outline-none"
                    />
                  </label>
                  <span className="rounded-full bg-[rgba(29,78,216,0.12)] px-3 py-1 text-[11px] font-semibold text-[color:var(--text-dark)]">
                    Level {levelResult.level} - {levelResult.label}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[1.6rem] border border-[rgba(29,78,216,0.12)] bg-white p-6 shadow-[0_16px_32px_rgba(29,78,216,0.08)]">
              <div className="flex items-center gap-2 text-base font-semibold text-[color:var(--text-dark)]">
                <GraduationCap className="size-4 text-[color:var(--brand-primary)]" />
                {resolvedJuniorConfig.careerTitle}
              </div>
              <p className="mt-2 text-xs text-[color:var(--text-muted)]">
                {resolvedJuniorConfig.careerSubtitle}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {resolvedJuniorConfig.careerOptions.map((option) => (
                  <div
                    key={option}
                    className="flex items-center gap-2 rounded-xl border border-[rgba(29,78,216,0.12)] bg-[rgba(29,78,216,0.06)] px-3 py-2 text-xs font-semibold text-[color:var(--text-dark)]"
                  >
                    <Target className="size-3.5 text-[color:var(--brand-primary)]" />
                    {option}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-[rgba(29,78,216,0.12)] bg-white p-6 shadow-[0_16px_32px_rgba(29,78,216,0.08)]">
              <div className="flex items-center gap-2 text-base font-semibold text-[color:var(--text-dark)]">
                <CalendarDays className="size-4 text-[color:var(--brand-primary)]" />
                {resolvedJuniorConfig.examTitle}
              </div>
              <p className="mt-2 text-xs text-[color:var(--text-muted)]">
                {resolvedJuniorConfig.examSubtitle}
              </p>
              <div className="mt-4 space-y-3">
                {examCards.map((exam) => (
                  <div
                    key={exam.title}
                    className="rounded-xl border border-[rgba(29,78,216,0.12)] bg-[rgba(29,78,216,0.04)] p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-[color:var(--text-dark)]">{exam.title}</div>
                      <span className="rounded-full bg-[rgba(29,78,216,0.12)] px-2 py-0.5 text-[10px] font-semibold text-[color:var(--brand-primary)]">
                        {exam.tag}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-[color:var(--text-muted)]">{exam.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            {resolvedJuniorConfig.skillCards.map((card) => (
              <div
                key={card.title}
                className="rounded-[1.6rem] border border-[rgba(29,78,216,0.12)] bg-white p-6 shadow-[0_16px_32px_rgba(29,78,216,0.08)]"
              >
                <div className="flex items-center gap-2 text-base font-semibold text-[color:var(--text-dark)]">
                  <BookOpen className="size-4 text-[color:var(--brand-primary)]" />
                  {card.title}
                </div>
                <p className="mt-2 text-xs text-[color:var(--text-muted)]">{card.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {card.chips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-[rgba(29,78,216,0.14)] bg-[rgba(29,78,216,0.08)] px-3 py-1 text-[10px] font-semibold text-[color:var(--text-dark)]"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </section>

          {normalizeText(summaryDegree) === "engineering" ? (
            <>
              <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_1fr]">
                <section className="rounded-[1.6rem] border border-[rgba(79,141,187,0.14)] bg-white p-5 shadow-[0_18px_40px_rgba(79,141,187,0.08)]">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--text-dark)]">
                    <Target className="size-4 text-[color:var(--brand-primary)]" />
                    Weekly Study Plan
                  </div>
                  <p className="mt-2 text-xs text-[color:var(--text-muted)]">
                    Simple daily goals to keep you consistent this week.
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {studyPlan.map((item) => (
                      <div
                        key={item.title}
                        className="rounded-xl border border-[rgba(15,76,129,0.12)] bg-[rgba(228,237,255,0.6)] p-3 text-[color:var(--text-dark)]"
                      >
                        <div className="text-xs font-semibold text-[color:var(--text-dark)]">
                          {item.title}
                        </div>
                        <div className="mt-1 text-[11px] text-[color:var(--text-muted)]">
                          {item.detail}
                        </div>
                        <div className="mt-2 text-[11px] font-semibold text-[color:var(--text-dark)]">
                          {item.time}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-[1.6rem] border border-[rgba(79,141,187,0.14)] bg-white p-5 shadow-[0_18px_40px_rgba(79,141,187,0.08)]">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--text-dark)]">
                    <Brain className="size-4 text-[color:var(--brand-primary)]" />
                    Subject Strength Meter
                  </div>
                  <p className="mt-2 text-xs text-[color:var(--text-muted)]">
                    Rate yourself from 1 to 5 and get a quick tip.
                  </p>
                  <div className="mt-4 space-y-3">
                    {Object.entries(subjectRatings).map(([subject, rating]) => (
                      <div
                        key={subject}
                        className="rounded-xl border border-[rgba(15,76,129,0.12)] bg-[rgba(228,237,255,0.6)] p-3 text-[color:var(--text-dark)]"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs font-semibold text-[color:var(--text-dark)]">
                            {subject}
                          </span>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((value) => (
                              <button
                                key={value}
                                type="button"
                                onClick={() =>
                                  setSubjectRatings((prev) => ({ ...prev, [subject]: value }))
                                }
                                className={`h-7 w-7 rounded-full border text-[11px] font-semibold transition ${
                                  rating === value
                                    ? "border-transparent bg-[color:var(--brand-primary)] text-white"
                                    : "border-[rgba(255,255,255,0.2)] bg-[rgba(228,237,255,0.6)] text-[color:var(--text-dark)]"
                                }`}
                              >
                                {value}
                              </button>
                            ))}
                          </div>
                        </div>
                        <p className="mt-2 text-[11px] text-[color:var(--text-muted)]">
                          {subjectTips[rating]}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <section className="mt-6 rounded-[1.6rem] border border-[rgba(79,141,187,0.14)] bg-[rgba(248,252,255,0.9)] p-6 shadow-[0_18px_40px_rgba(79,141,187,0.08)]">
                <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--text-dark)]">
                  <BookOpen className="size-4 text-[color:var(--brand-primary)]" />
                  Mini Career Quiz
                </div>
                <p className="mt-2 text-xs text-[color:var(--text-muted)]">
                  Pick the option that feels most like you.
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  {["Q1", "Q2", "Q3"].map((label, index) => (
                    <div
                      key={label}
                      className="rounded-xl border border-[rgba(15,76,129,0.12)] bg-[rgba(228,237,255,0.6)] p-4 text-[color:var(--text-dark)]"
                    >
                      <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--text-muted)]">
                        {label}
                      </div>
                      <div className="mt-3 space-y-2 text-[11px] text-[color:var(--text-muted)]">
                        {(quizOptionsByQuestion[index] || []).map((option, optionIndex) => (
                          <button
                            key={option.label}
                            type="button"
                            onClick={() =>
                              setQuizAnswers((prev) => {
                                const next = [...prev];
                                next[index] = optionIndex;
                                return next;
                              })
                            }
                            className={`w-full rounded-xl border px-3 py-2 text-left font-semibold transition ${
                              quizAnswers[index] === optionIndex
                                ? "border-transparent bg-[color:var(--brand-primary)] text-white ring-2 ring-[rgba(11,42,85,0.35)]"
                                : "border-[rgba(255,255,255,0.24)] bg-[rgba(228,237,255,0.6)] text-[color:var(--text-dark)]"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-2xl border border-[rgba(15,76,129,0.12)] bg-[rgba(228,237,255,0.6)] p-4 text-xs text-[color:var(--text-muted)]">
                  Result:{" "}
                  <span className="font-semibold text-[color:var(--text-dark)]">
                    You may like {quizResult}.
                  </span>{" "}
                  Explore more options and talk to teachers for guidance.
                </div>
              </section>
            </>
          ) : null}

          <section className="mt-6 rounded-[1.6rem] border border-[rgba(29,78,216,0.12)] bg-white p-6 shadow-[0_16px_32px_rgba(29,78,216,0.08)]">
            <div className="text-sm font-semibold text-[color:var(--text-dark)]">
              {resolvedJuniorConfig.roadmapTitle}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {resolvedJuniorConfig.roadmap.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-xl border border-[rgba(29,78,216,0.12)] bg-[rgba(29,78,216,0.04)] p-3"
                >
                  <div className="text-xs font-semibold text-[color:var(--brand-primary)]">Step {index + 1}</div>
                  <div className="mt-1 text-sm font-semibold text-[color:var(--text-dark)]">{step.title}</div>
                  <div className="mt-1 text-xs text-[color:var(--text-muted)]">{step.detail}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6 overflow-hidden rounded-[1.6rem] border border-[rgba(29,78,216,0.2)] bg-[linear-gradient(120deg,#1d4ed8,#60a5fa)] p-6 text-white shadow-[0_18px_40px_rgba(29,78,216,0.25)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[rgba(255,255,255,0.7)]">
                  {resolvedJuniorConfig.ctaEyebrow}
                </div>
                <div className="mt-2 text-xl font-semibold">{resolvedJuniorConfig.ctaTitle}</div>
                <p className="mt-2 max-w-xl text-sm text-[rgba(255,255,255,0.8)]">
                  {resolvedJuniorConfig.ctaSubtitle}
                </p>
              </div>
              <button
                type="button"
                className="rounded-full bg-white px-5 py-2 text-xs font-semibold text-[color:#1d4ed8]"
              >
                {resolvedJuniorConfig.ctaButton}
              </button>
            </div>
          </section>
        </div>
      </section>
    );
  }

    return (
        <section
        className="min-h-screen bg-white text-[color:var(--text-dark)]"
        style={
          {
            "--brand-primary": "#0B2A55",
            "--brand-primary-soft": "#153B75",
          } as CSSProperties
        }
      >
        <Navbar />
        <div className="page-container-full py-10 md:py-12">
          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="space-y-6">
              <section className="rounded-[1.6rem] border border-[rgba(79,141,187,0.14)] bg-[linear-gradient(135deg,rgba(79,141,187,0.08),rgba(255,255,255,0.95))] p-6 shadow-[0_20px_44px_rgba(79,141,187,0.12)] md:p-7">
                <span className="inline-flex rounded-full border border-[rgba(79,141,187,0.2)] bg-[rgba(79,141,187,0.08)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--brand-primary)]">
                  Career Guidance
                </span>
                <h1 className="mt-4 text-2xl font-bold text-[color:var(--text-dark)] md:text-3xl">
                  Level {summaryLevel} - {summaryDegree}
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-[color:var(--text-muted)] md:text-base">
                  Based on your selected degree, here are suggested exams and colleges to explore.
                </p>
              </section>

              <section className="rounded-[1.6rem] border border-[rgba(79,141,187,0.12)] bg-white p-6 shadow-[0_18px_40px_rgba(79,141,187,0.08)]">
                <div className="flex items-center gap-2 text-base font-semibold text-[color:var(--text-dark)]">
                  <Target className="size-4 text-[color:var(--brand-primary)]" />
                  Top Colleges
                </div>
                <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
                  {topColleges.length ? (
                    topColleges.map((college) => (
                      <Link
                        key={college.id}
                        href={`/college/${college.id}`}
                        className="group min-w-[240px] rounded-2xl border border-[rgba(79,141,187,0.12)] bg-[rgba(248,252,255,0.9)] p-4 transition hover:-translate-y-0.5 hover:border-[rgba(79,141,187,0.28)] hover:shadow-[0_18px_36px_rgba(79,141,187,0.16)]"
                      >
                        <div className="overflow-hidden rounded-xl border border-[rgba(79,141,187,0.12)] bg-white">
                          <img
                            src={college.image}
                            alt={college.name}
                            className="h-32 w-full object-cover transition group-hover:scale-[1.02]"
                            loading="lazy"
                          />
                        </div>
                        <div className="mt-3 text-sm font-semibold text-[color:var(--text-dark)]">{college.name}</div>
                        <div className="mt-1 text-xs text-[color:var(--text-muted)]">
                          {college.district}, {college.state}
                        </div>
                        <div className="mt-2 text-xs font-semibold text-[color:var(--brand-primary)]">
                          {college.accreditation}
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-[color:var(--text-muted)]">No top colleges found for this degree.</p>
                  )}
                </div>
              </section>

              <section className="rounded-[1.6rem] border border-[rgba(79,141,187,0.12)] bg-white p-6 shadow-[0_18px_40px_rgba(79,141,187,0.08)]">
                <div className="text-sm font-semibold text-[color:var(--text-dark)]">Other Colleges</div>
                <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
                  {otherColleges.length ? (
                    otherColleges.map((college) => (
                      <Link
                        key={college.id}
                        href={`/college/${college.id}`}
                        className="group min-w-[240px] rounded-2xl border border-[rgba(79,141,187,0.12)] bg-[rgba(248,252,255,0.9)] p-4 transition hover:-translate-y-0.5 hover:border-[rgba(79,141,187,0.28)] hover:shadow-[0_18px_36px_rgba(79,141,187,0.16)]"
                      >
                        <div className="overflow-hidden rounded-xl border border-[rgba(79,141,187,0.12)] bg-white">
                          <img
                            src={college.image}
                            alt={college.name}
                            className="h-32 w-full object-cover transition group-hover:scale-[1.02]"
                            loading="lazy"
                          />
                        </div>
                        <div className="mt-3 text-sm font-semibold text-[color:var(--text-dark)]">{college.name}</div>
                        <div className="mt-1 text-xs text-[color:var(--text-muted)]">
                          {college.district}, {college.state}
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-xs text-[color:var(--text-muted)]">No other colleges found.</p>
                  )}
                </div>
              </section>

            </div>

          </div>
        </div>
      </section>
    );

  return (
    <section
      className="min-h-screen bg-[#f3f7ff] text-[color:var(--text-dark)]"
      style={
        {
          "--brand-primary": "#2563eb",
          "--brand-primary-soft": "#3b82f6",
          "--text-dark": "#0f172a",
          "--text-muted": "rgba(15,23,42,0.66)",
        } as CSSProperties
      }
    >
      <Navbar />
      <div className="page-container-full py-8 md:py-10">
        <section className="overflow-hidden rounded-[2rem] border border-[rgba(37,99,235,0.12)] bg-[linear-gradient(135deg,#eef5ff_0%,#ecfeff_100%)] shadow-[0_24px_60px_rgba(37,99,235,0.12)]">
          <div className="grid gap-6 p-6 md:p-8 lg:grid-cols-[1.35fr_320px] lg:items-center">
            <div>
              <span className="inline-flex rounded-full border border-[rgba(37,99,235,0.12)] bg-[rgba(37,99,235,0.08)] px-3 py-1 text-[11px] font-semibold text-[color:var(--brand-primary)]">
                Cutoff Results Level: {summaryLevel}th Grade
              </span>
              <h1 className="mt-5 max-w-3xl text-3xl font-bold tracking-[-0.03em] text-[color:var(--text-dark)] md:text-5xl">
                {seniorHeroTitle}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--text-muted)] md:text-lg">
                {seniorHeroSubtitle}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {[selectedCategory ? `Category: ${selectedCategory}` : "", selectedCollegeType ? `College Type: ${selectedCollegeType}` : "", summaryCourse !== "-" ? summaryCourse : ""]
                  .filter(Boolean)
                  .map((item) => (
                    <span key={item} className="rounded-full border border-[rgba(37,99,235,0.12)] bg-white px-3 py-1.5 text-xs font-semibold text-[color:var(--text-dark)]">
                      {item}
                    </span>
                  ))}
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-[rgba(37,99,235,0.14)] bg-white p-5 shadow-[0_18px_42px_rgba(37,99,235,0.14)]">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Your Final Cutoff</div>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-5xl font-bold tracking-[-0.04em] text-[color:var(--brand-primary)]">{summaryCutoff}</span>
                <span className="pb-2 text-base font-semibold text-[color:var(--text-muted)]">/ {cutoffMax}</span>
              </div>
              <div className="mt-5 flex items-center justify-between text-xs font-semibold text-[color:var(--text-muted)]">
                <span>Admission Confidence</span>
                <span>{seniorConfidence}%</span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-[rgba(37,99,235,0.12)]">
                <div className="h-full rounded-full bg-[linear-gradient(90deg,#2563eb,#38bdf8)]" style={{ width: `${seniorConfidence}%` }} />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[250px_1fr]">
          <aside className="space-y-4">
            <div className="rounded-[1.75rem] border border-[rgba(37,99,235,0.1)] bg-white p-5 shadow-[0_18px_40px_rgba(37,99,235,0.08)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--text-dark)]">
                  <SlidersHorizontal className="size-4 text-[color:var(--brand-primary)]" />
                  Filters
                </div>
                <button type="button" className="text-[11px] font-semibold text-[color:var(--text-muted)]">Clear All</button>
              </div>
              <div className="mt-6 space-y-6">
                <div>
                  <div className="text-xs font-semibold text-[color:var(--text-dark)]">College Type</div>
                  <div className="mt-3 space-y-2">
                    {["Government", "Autonomous", "Private"].map((type) => (
                      <label key={type} className="flex items-center gap-2 text-xs text-[color:var(--text-dark)]">
                        <input type="checkbox" checked={!selectedCollegeType || normalizeText(selectedCollegeType) === normalizeText(type)} readOnly className="h-3.5 w-3.5 rounded border-[rgba(37,99,235,0.24)] text-[color:var(--brand-primary)]" />
                        {type}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-[color:var(--text-dark)]">Fees Range</div>
                  <div className="mt-4 h-1.5 rounded-full bg-[rgba(37,99,235,0.12)]"><div className="relative h-full w-[42%] rounded-full bg-[linear-gradient(90deg,#2563eb,#60a5fa)]"><span className="absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-white bg-[color:var(--brand-primary)]" /></div></div>
                  <div className="mt-2 flex justify-between text-[11px] font-semibold text-[color:var(--text-muted)]"><span>Rs10k</span><span>Rs5L+</span></div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-[color:var(--text-dark)]">Preferred Location</div>
                  <div className="mt-3 space-y-2">
                    {(seniorLocations.length ? seniorLocations : ["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem"]).map((location) => (
                      <label key={location} className="flex items-center gap-2 text-xs text-[color:var(--text-dark)]">
                        <input type="checkbox" checked readOnly className="h-3.5 w-3.5 rounded border-[rgba(37,99,235,0.24)] text-[color:var(--brand-primary)]" />
                        {location}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-[rgba(37,99,235,0.1)] bg-[linear-gradient(180deg,#eff6ff_0%,#ffffff_100%)] p-4 shadow-[0_18px_40px_rgba(37,99,235,0.08)]">
              <div className="text-sm font-semibold text-[color:var(--brand-primary)]">Expert Guidance</div>
              <p className="mt-2 text-xs leading-6 text-[color:var(--text-muted)]">Talk to our counselors and shortlist colleges faster for your cutoff range.</p>
              <button type="button" className="mt-4 w-full rounded-xl border border-[rgba(37,99,235,0.14)] bg-white px-4 py-2 text-xs font-semibold text-[color:var(--brand-primary)]">Request Callback</button>
            </div>
          </aside>

          <div>
            <div className="flex flex-col gap-4 rounded-[1.75rem] border border-[rgba(37,99,235,0.1)] bg-white p-5 shadow-[0_18px_40px_rgba(37,99,235,0.08)] md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-bold tracking-[-0.03em] text-[color:var(--text-dark)]">Showing {seniorDisplayCards.length} Recommended Colleges</h2>
                  <span className="rounded-full bg-[rgba(37,99,235,0.08)] px-2.5 py-1 text-[10px] font-semibold text-[color:var(--brand-primary)]">Verified</span>
                </div>
                <p className="mt-1 text-sm text-[color:var(--text-muted)]">Matches based on your selected course, category, and academic profile.</p>
              </div>
              <label className="flex items-center gap-2 rounded-xl border border-[rgba(37,99,235,0.12)] bg-[rgba(243,247,255,0.8)] px-4 py-3 text-sm text-[color:var(--text-muted)] md:min-w-[280px]">
                <Search className="size-4 text-[color:var(--brand-primary)]" />
                <input type="text" readOnly value="" placeholder="Filter results by name..." className="w-full bg-transparent outline-none placeholder:text-[color:var(--text-muted)]" />
              </label>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {seniorDisplayCards.length ? seniorDisplayCards.map((college, index) => {
                const cardScore = Number.parseInt(college.match, 10) || college.score || 80;
                const feeLabel = seniorFeeEstimates[index] || seniorFeeEstimates[seniorFeeEstimates.length - 1];
                const ownershipBadge = index === 0 ? "Government" : college.tags.find((tag) => /government|autonomous|private/i.test(tag)) || "Autonomous";
                return (
                  <article key={college.id} className="overflow-hidden rounded-[1.5rem] border border-[rgba(37,99,235,0.1)] bg-white shadow-[0_18px_40px_rgba(37,99,235,0.08)]">
                    <div className="relative h-44 bg-[rgba(37,99,235,0.08)]">
                      <Image src={college.image} alt={`${college.name} campus`} fill sizes="(min-width: 1024px) 420px, 100vw" className="object-cover" />
                      <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-[color:var(--brand-primary)] px-3 py-1 text-[10px] font-semibold text-white">{ownershipBadge}</span>
                        {index < 2 ? <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold text-[color:var(--brand-primary)]">{index === 0 ? "Top 1%" : "Top Pick"}</span> : null}
                      </div>
                    </div>
                    <div className="p-4 md:p-5">
                      <h3 className="text-2xl font-bold tracking-[-0.02em] text-[color:var(--text-dark)]">{college.name}</h3>
                      <div className="mt-2 flex items-center gap-1 text-sm text-[color:var(--text-muted)]"><MapPin className="size-4" />{college.location || "Tamil Nadu"}</div>
                      <div className="mt-4 rounded-2xl border border-[rgba(37,99,235,0.1)] bg-[rgba(243,247,255,0.78)] p-4">
                        <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--text-muted)]"><span>Your Score vs Cutoff</span><span className="text-[color:var(--brand-primary)]">{cardScore >= 90 ? "Reach Target" : "Likely Admission"}</span></div>
                        <div className="mt-3 h-2 rounded-full bg-[rgba(37,99,235,0.12)]"><div className="h-full rounded-full bg-[linear-gradient(90deg,#2563eb,#38bdf8)]" style={{ width: `${Math.max(32, Math.min(cardScore, 100))}%` }} /></div>
                        <div className="mt-2 flex justify-between text-[10px] font-semibold text-[color:var(--text-muted)]"><span>Start: {summaryCutoff || "0"}</span><span>End: {college.cutoff}</span></div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">{college.tags.slice(0, 2).map((tag) => <span key={tag} className="rounded-lg border border-[rgba(37,99,235,0.1)] bg-[rgba(243,247,255,0.7)] px-2.5 py-1 text-[10px] font-semibold text-[color:var(--text-muted)]">{tag}</span>)}</div>
                      <div className="mt-4 border-t border-dashed border-[rgba(37,99,235,0.14)] pt-4"><div className="flex items-center justify-between gap-3 text-sm"><span className="text-[color:var(--text-muted)]">Estimated Fees:</span><span className="font-semibold text-[color:var(--text-dark)]">{feeLabel}</span></div></div>
                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <Link href={college.href} className="rounded-xl border border-[rgba(37,99,235,0.12)] bg-white px-4 py-3 text-center text-sm font-semibold text-[color:var(--text-dark)]">Brochure</Link>
                        <Link href={college.href} className="rounded-xl bg-[linear-gradient(90deg,#2563eb,#3b82f6)] px-4 py-3 text-center text-sm font-semibold text-white shadow-[0_14px_28px_rgba(37,99,235,0.24)]">Apply Now <ArrowUpRight className="ml-1 inline size-4" /></Link>
                      </div>
                    </div>
                  </article>
                );
              }) : <div className="rounded-[1.5rem] border border-[rgba(37,99,235,0.1)] bg-white p-6 text-sm text-[color:var(--text-muted)] shadow-[0_18px_40px_rgba(37,99,235,0.08)] md:col-span-2">No matching colleges found for the selected course and cutoff.</div>}
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-[rgba(37,99,235,0.1)] bg-white p-5 shadow-[0_18px_40px_rgba(37,99,235,0.08)]">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-[color:var(--text-muted)]">You have viewed the high-probability matches for your score.</p>
                <div className="flex flex-wrap gap-3">
                  <button type="button" className="rounded-xl border border-[rgba(37,99,235,0.12)] bg-white px-4 py-2.5 text-sm font-semibold text-[color:var(--text-dark)]">Modify Marks</button>
                  <button type="button" className="rounded-xl border border-[rgba(37,99,235,0.12)] bg-[rgba(243,247,255,0.8)] px-4 py-2.5 text-sm font-semibold text-[color:var(--text-dark)]">See Nearby States</button>
                </div>
              </div>
            </div>

            <section className="mt-8 rounded-[1.75rem] border border-[rgba(37,99,235,0.1)] bg-white p-5 shadow-[0_18px_40px_rgba(37,99,235,0.08)] md:p-6">
              <div className="text-2xl font-bold tracking-[-0.03em] text-[color:var(--text-dark)]">Recommended Competitive Exams</div>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {seniorExamCards.map((exam, index) => (
                  <div key={exam.title} className="rounded-[1.3rem] border border-[rgba(37,99,235,0.1)] bg-[rgba(243,247,255,0.8)] p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2563eb,#60a5fa)] text-white"><GraduationCap className="size-5" /></div>
                      <div>
                        <div className="text-base font-semibold text-[color:var(--text-dark)]">{exam.title}</div>
                        <div className="mt-1 text-xs text-[color:var(--text-muted)]">{index === 0 ? "May 2024" : index === 1 ? "April 2024" : "June 2024"}</div>
                        <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-primary)]">{index === 0 ? "Registration Open" : index === 1 ? "Coming Soon" : "Active"}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>
    </section>
  );
}
