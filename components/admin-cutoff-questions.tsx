"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FlaskConical,
  GraduationCap,
  Info,
  Landmark,
  LibraryBig,
  Microscope,
  Pencil,
  Plus,
  Ruler,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { readAuthToken } from "@/lib/auth-storage";
import { request, withAuth } from "@/lib/api";
import { showToast } from "@/lib/toast";

type DegreeKey =
  | "Engineering"
  | "Medical"
  | "Arts & Science"
  | "Law"
  | "Paramedical"
  | "Agriculture"
  | "B.Arch";

type QuestionDraft = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
};

type SavedQuestion = QuestionDraft & {
  subject: string;
};

type SavedQuestionSet = {
  id: string;
  degree: DegreeKey;
  level: string;
  subjects: string[];
  questionsBySubject: Record<string, SavedQuestion[]>;
  savedAt: string;
};

type SavedQuestionSetResponse = {
  sets?: SavedQuestionSet[];
  set?: SavedQuestionSet;
};

type BuilderView = "management" | "basic" | "questions";

const maxQuestionsPerSubject = 10;

const degreeSubjectMap: Record<DegreeKey, string[]> = {
  Engineering: ["Mathematics", "Physics", "Chemistry"],
  Medical: ["Chemistry", "Physics", "Biology"],
  "Arts & Science": ["English", "Mathematics", "General Knowledge"],
  Law: ["English", "General Knowledge", "Logical Reasoning"],
  Paramedical: ["Chemistry", "Physics", "Biology"],
  Agriculture: ["Chemistry", "Physics", "Biology"],
  "B.Arch": ["Mathematics", "Physics", "Drawing"],
};

const degreeOptions = Object.keys(degreeSubjectMap) as DegreeKey[];
const levelOptions = ["6th - 8th", "9th - 10th"];
const pageTextClass = "max-w-full space-y-4 overflow-hidden text-sm font-medium text-slate-700";
const sectionTitleClass = "text-sm font-bold text-slate-900";
const fieldLabelClass = "text-sm font-semibold text-slate-800";
const controlTextClass = "text-sm font-semibold text-slate-950";
const inputTextClass = "text-sm font-semibold";
const actionTextClass = "text-sm font-semibold";
const managementCardTones = [
  {
    card: "border-[#e7dcff] bg-[linear-gradient(135deg,#fbf8ff_0%,#ffffff_100%)]",
    icon: "bg-[#efe8ff]",
    text: "text-[#6d35d4]",
    button: "text-[#6d35d4] hover:bg-[#f6f0ff]",
  },
  {
    card: "border-[#d7e9ff] bg-[linear-gradient(135deg,#f7fbff_0%,#ffffff_100%)]",
    icon: "bg-[#e8f2ff]",
    text: "text-[#1d75d8]",
    button: "text-[#1d75d8] hover:bg-[#eef7ff]",
  },
  {
    card: "border-[#d6f4df] bg-[linear-gradient(135deg,#f5fff8_0%,#ffffff_100%)]",
    icon: "bg-[#dcfce7]",
    text: "text-[#0f9f5f]",
    button: "text-[#0f9f5f] hover:bg-[#eefdf3]",
  },
];

const subjectStyles: Record<string, { icon: typeof BookOpen; accent: string; tile: string; total: string }> = {
  Mathematics: { icon: BookOpen, accent: "text-[#6d35d4]", tile: "bg-[#efe8ff]", total: "text-[#6d35d4]" },
  Physics: { icon: Microscope, accent: "text-[#6d35d4]", tile: "bg-[#efe8ff]", total: "text-[#6d35d4]" },
  Chemistry: { icon: FlaskConical, accent: "text-[#0f9f5f]", tile: "bg-[#e8fff2]", total: "text-[#059669]" },
  Biology: { icon: Microscope, accent: "text-[#0f9f5f]", tile: "bg-[#e8fff2]", total: "text-[#059669]" },
  English: { icon: LibraryBig, accent: "text-[#f97316]", tile: "bg-[#fff7e6]", total: "text-[#f97316]" },
  "General Knowledge": { icon: Landmark, accent: "text-[#0f766e]", tile: "bg-[#e6fffb]", total: "text-[#0f766e]" },
  "Logical Reasoning": { icon: CheckCircle2, accent: "text-[#7c3aed]", tile: "bg-[#f0e9ff]", total: "text-[#7c3aed]" },
  Drawing: { icon: Ruler, accent: "text-[#dc2626]", tile: "bg-[#fff0f0]", total: "text-[#dc2626]" },
};

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

const createEmptyDraft = (): QuestionDraft => ({
  id: createId(),
  question: "",
  options: ["", "", "", ""],
  correctAnswer: "B",
});

const createEmptySubjectsByDegree = (): Record<DegreeKey, string[]> => ({
  ...degreeSubjectMap,
});

const getSubjectStyle = (subject: string) => subjectStyles[subject] || subjectStyles.Mathematics;

const isQuestionComplete = (question: QuestionDraft) =>
  question.question.trim() && question.options.every((option) => option.trim()) && question.correctAnswer;

const getAnswerValue = (question: SavedQuestion) => {
  const answerIndex = question.correctAnswer.charCodeAt(0) - 65;
  return question.options[answerIndex] || question.correctAnswer;
};

export function AdminCutoffQuestions() {
  const [view, setView] = useState<BuilderView>("basic");
  const [managementBackView, setManagementBackView] = useState<BuilderView>("basic");
  const [managementDegreeFilter, setManagementDegreeFilter] = useState<DegreeKey | null>(null);
  const [managementLevelFilter, setManagementLevelFilter] = useState<string | null>(null);
  const [managementSubjectFilter, setManagementSubjectFilter] = useState<string | null>(null);
  const [managementPage, setManagementPage] = useState(1);
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [deleteSet, setDeleteSet] = useState<SavedQuestionSet | null>(null);
  const [deleteSubjectName, setDeleteSubjectName] = useState<string | null>(null);
  const [deleteQuestionDialog, setDeleteQuestionDialog] = useState<{
    set: SavedQuestionSet;
    subject: string;
    question: SavedQuestion;
  } | null>(null);
  const [degree, setDegree] = useState<DegreeKey>("Engineering");
  const [level, setLevel] = useState(levelOptions[1]);
  const [subjectsByDegree, setSubjectsByDegree] = useState<Record<DegreeKey, string[]>>(createEmptySubjectsByDegree());
  const [activeSubject, setActiveSubject] = useState(degreeSubjectMap.Engineering[0]);
  const [questionsBySubject, setQuestionsBySubject] = useState<Record<string, SavedQuestion[]>>({});
  const [savedSets, setSavedSets] = useState<SavedQuestionSet[]>([]);
  const [draft, setDraft] = useState<QuestionDraft>(() => createEmptyDraft());
  const [newSubjectName, setNewSubjectName] = useState("");
  const [showAllSavedQuestions, setShowAllSavedQuestions] = useState(false);
  const [loadingSavedSets, setLoadingSavedSets] = useState(true);

  const subjects = useMemo(() => subjectsByDegree[degree] || degreeSubjectMap[degree], [degree, subjectsByDegree]);
  const resolvedActiveSubject = subjects.includes(activeSubject) ? activeSubject : subjects[0];
  const totalTarget = subjects.length * maxQuestionsPerSubject;
  const totalAdded = subjects.reduce((total, subject) => total + (questionsBySubject[subject]?.length || 0), 0);
  const activeQuestions = questionsBySubject[resolvedActiveSubject] || [];
  const savedQuestionPreviewLimit = 4;
  const displayedActiveQuestions = showAllSavedQuestions
    ? activeQuestions
    : activeQuestions.slice(0, savedQuestionPreviewLimit);
  const isEditingDraftQuestion = activeQuestions.some((question) => question.id === draft.id);

  const displayedSavedSets = useMemo(
    () =>
      savedSets.filter(
        (set) =>
          (!managementDegreeFilter || set.degree === managementDegreeFilter) &&
          (!managementLevelFilter || set.level === managementLevelFilter),
      ),
    [managementDegreeFilter, managementLevelFilter, savedSets],
  );

  const selectedManagementSet = useMemo(
    () =>
      [...displayedSavedSets].sort((left, right) => {
        const leftTime = new Date(left.savedAt || 0).getTime();
        const rightTime = new Date(right.savedAt || 0).getTime();
        return rightTime - leftTime;
      })[0] || null,
    [displayedSavedSets],
  );

  const managementActiveSubject = useMemo(() => {
    if (!selectedManagementSet) return "";
    if (managementSubjectFilter && selectedManagementSet.subjects.includes(managementSubjectFilter)) {
      return managementSubjectFilter;
    }
    return selectedManagementSet.subjects[0] || "";
  }, [managementSubjectFilter, selectedManagementSet]);

  const managementQuestionRows = useMemo(() => {
    if (!selectedManagementSet || !managementActiveSubject) return [];
    const questions = selectedManagementSet.questionsBySubject[managementActiveSubject] || [];

    return questions.map((question, index) => ({ question, originalIndex: index }));
  }, [managementActiveSubject, selectedManagementSet]);
  const managementPageSize = 5;
  const managementTotalPages = Math.max(1, Math.ceil(managementQuestionRows.length / managementPageSize));
  const normalizedManagementPage = Math.min(managementPage, managementTotalPages);
  const paginatedManagementRows = managementQuestionRows.slice(
    (normalizedManagementPage - 1) * managementPageSize,
    normalizedManagementPage * managementPageSize,
  );

  const savedSetsForCurrentDegree = useMemo(
    () => savedSets.filter((set) => set.degree === degree),
    [degree, savedSets],
  );
  const savedSetForCurrentSelection = useMemo(
    () =>
      savedSets
        .filter((set) => set.degree === degree && set.level === level)
        .sort((left, right) => new Date(right.savedAt || 0).getTime() - new Date(left.savedAt || 0).getTime())[0] || null,
    [degree, level, savedSets],
  );

  useEffect(() => {
    let isMounted = true;

    const loadSavedQuestionSets = async () => {
      const token = readAuthToken();
      if (!token) {
        if (isMounted) {
          setLoadingSavedSets(false);
        }
        return;
      }

      try {
        const data = await request<SavedQuestionSetResponse>(
          "/api/admin/cutoff-question-sets",
          withAuth(token),
        );
        if (!isMounted) return;

        const nextSavedSets = Array.isArray(data?.sets) ? data.sets : [];
        setSavedSets(nextSavedSets);
      } catch (error) {
        if (isMounted) {
          const message = error instanceof Error ? error.message : "Unable to load cutoff questions.";
          showToast(message, "error");
        }
      } finally {
        if (isMounted) {
          setLoadingSavedSets(false);
        }
      }
    };

    void loadSavedQuestionSets();

    return () => {
      isMounted = false;
    };
  }, []);

  const upsertSavedSetLocally = (nextSet: SavedQuestionSet) => {
    setSavedSets((previous) => {
      const withoutCurrent = previous.filter(
        (set) => set.id !== nextSet.id && !(set.degree === nextSet.degree && set.level === nextSet.level),
      );
      return [nextSet, ...withoutCurrent];
    });
  };

  const saveQuestionSet = async (
    setPayload: SavedQuestionSet,
    isEdit = false,
    targetSetId: string | null = null,
  ) => {
    const token = readAuthToken();
    if (!token) {
      showToast("Admin session expired. Please log in again.", "error");
      return null;
    }

    const nextTargetSetId = targetSetId || (isEdit ? editingSetId : null);
    const endpoint = isEdit && nextTargetSetId
      ? `/api/admin/cutoff-question-sets/${nextTargetSetId}`
      : "/api/admin/cutoff-question-sets";
    const method = isEdit && nextTargetSetId ? "PUT" : "POST";

    const data = await request<SavedQuestionSetResponse>(
      endpoint,
      withAuth(token, {
        method,
        body: JSON.stringify({
          degree: setPayload.degree,
          level: setPayload.level,
          subjects: setPayload.subjects,
          questionsBySubject: setPayload.questionsBySubject,
        }),
      }),
    );

    const nextSet = data?.set;
    if (!nextSet) {
      throw new Error("Cutoff question set save failed");
    }
    upsertSavedSetLocally(nextSet);
    return nextSet;
  };

  const deleteQuestionSet = async (setId: string) => {
    const token = readAuthToken();
    if (!token) {
      showToast("Admin session expired. Please log in again.", "error");
      return false;
    }

    await request(
      `/api/admin/cutoff-question-sets/${setId}`,
      withAuth(token, { method: "DELETE" }),
    );
    setSavedSets((previous) => previous.filter((set) => set.id !== setId));
    return true;
  };

  const startNewQuestions = () => {
    const nextSubjects = subjectsByDegree[degree] || degreeSubjectMap[degree];
    setManagementDegreeFilter(null);
    setEditingSetId(null);
    setManagementLevelFilter(null);
    setManagementSubjectFilter(null);
    setManagementPage(1);
    setQuestionsBySubject({});
    setActiveSubject(nextSubjects[0]);
    setDraft(createEmptyDraft());
    setView("basic");
  };

  const openDegreeManagement = (targetDegree: DegreeKey) => {
    setDegree(targetDegree);
    setManagementDegreeFilter(targetDegree);
    setManagementLevelFilter(null);
    setManagementSubjectFilter(null);
    setManagementPage(1);
    setManagementBackView("basic");
    setView("management");
  };

  const openQuestionBuilderFromSet = (set: SavedQuestionSet, preferredSubject = managementActiveSubject) => {
    const nextSubject = set.subjects.includes(preferredSubject)
      ? preferredSubject
      : set.subjects[0] || degreeSubjectMap[set.degree][0];
    setDegree(set.degree);
    setLevel(set.level);
    setSubjectsByDegree((previous) => ({ ...previous, [set.degree]: set.subjects }));
    setQuestionsBySubject(set.questionsBySubject);
    setActiveSubject(nextSubject);
    setEditingSetId(set.id);
    setDraft(createEmptyDraft());
    setView("questions");
  };

  const openQuestionBuilderFromBasic = () => {
    if (savedSetForCurrentSelection) {
      openQuestionBuilderFromSet(savedSetForCurrentSelection, savedSetForCurrentSelection.subjects[0]);
      return;
    }
    setEditingSetId(null);
    setQuestionsBySubject({});
    setDraft(createEmptyDraft());
    setView("questions");
  };

  const handleManagementBack = () => {
    if (managementBackView === "questions" && selectedManagementSet) {
      openQuestionBuilderFromSet(selectedManagementSet);
      return;
    }
    setView(managementBackView === "management" ? "basic" : managementBackView);
  };

  const handleManagementAddQuestion = () => {
    if (selectedManagementSet) {
      openQuestionBuilderFromSet(selectedManagementSet);
      return;
    }
    startNewQuestions();
  };

  const handleDegreeChange = (nextDegree: DegreeKey) => {
    setDegree(nextDegree);
    const nextSubjects = subjectsByDegree[nextDegree] || degreeSubjectMap[nextDegree];
    setActiveSubject(nextSubjects[0]);
    setQuestionsBySubject({});
    setEditingSetId(null);
    setDraft(createEmptyDraft());
  };

  const addSubject = () => {
    const normalizedSubject = newSubjectName.trim();
    if (!normalizedSubject) {
      showToast("Enter a subject name.", "error");
      return;
    }
    if (subjects.some((subject) => subject.toLowerCase() === normalizedSubject.toLowerCase())) {
      showToast("Subject already exists.", "info");
      return;
    }

    const nextSubjectsByDegree = { ...subjectsByDegree, [degree]: [...subjects, normalizedSubject] };
    setSubjectsByDegree(nextSubjectsByDegree);
    setActiveSubject(normalizedSubject);
    setNewSubjectName("");
    showToast("Subject added.", "success");
  };

  const deleteSubject = (subjectToDelete: string) => {
    if (subjects.length <= 1) {
      showToast("At least one subject is required.", "error");
      return;
    }
    const nextSubjects = subjects.filter((subject) => subject !== subjectToDelete);
    const nextSubjectsByDegree = { ...subjectsByDegree, [degree]: nextSubjects };
    const nextQuestions = { ...questionsBySubject };
    delete nextQuestions[subjectToDelete];
    setSubjectsByDegree(nextSubjectsByDegree);
    setQuestionsBySubject(nextQuestions);
    setActiveSubject(nextSubjects[0]);
    showToast("Subject deleted.", "success");
  };

  const confirmDeleteSubject = () => {
    if (!deleteSubjectName) return;
    deleteSubject(deleteSubjectName);
    setDeleteSubjectName(null);
  };

  const updateOption = (index: number, value: string) => {
    setDraft((previous) => ({
      ...previous,
      options: previous.options.map((option, optionIndex) => (optionIndex === index ? value : option)),
    }));
  };

  const commitDraftQuestion = (silent = false) => {
    if (!isQuestionComplete(draft)) {
      showToast("Please fill question, all options, and correct answer.", "error");
      return null;
    }
    const existingQuestionIndex = activeQuestions.findIndex((question) => question.id === draft.id);
    const isUpdatingQuestion = existingQuestionIndex >= 0;

    if (!isUpdatingQuestion && activeQuestions.length >= maxQuestionsPerSubject) {
      showToast(`${resolvedActiveSubject} already has ${maxQuestionsPerSubject} questions.`, "info");
      return null;
    }

    const nextQuestion: SavedQuestion = { ...draft, subject: resolvedActiveSubject };
    const nextSubjectQuestions = isUpdatingQuestion
      ? activeQuestions.reduce<SavedQuestion[]>((questions, question, index) => {
          if (question.id !== draft.id) {
            questions.push(question);
            return questions;
          }
          if (index === existingQuestionIndex) {
            questions.push(nextQuestion);
          }
          return questions;
        }, [])
      : [...activeQuestions, nextQuestion];
    const nextQuestions = { ...questionsBySubject, [resolvedActiveSubject]: nextSubjectQuestions };
    setQuestionsBySubject(nextQuestions);
    setDraft(createEmptyDraft());
    if (!silent) {
      showToast(`Question ${isUpdatingQuestion ? "updated" : "added"} for ${resolvedActiveSubject}.`, "success");
    }
    return nextQuestions;
  };

  const addQuestion = () => {
    return Boolean(commitDraftQuestion());
  };

  const goToNextSubject = () => {
    const hasDraftContent = [draft.question, ...draft.options].some((value) => value.trim());
    if (hasDraftContent && !commitDraftQuestion(true)) return;
    const currentIndex = subjects.indexOf(resolvedActiveSubject);
    setActiveSubject(subjects[currentIndex + 1] || subjects[0]);
    setShowAllSavedQuestions(false);
    setDraft(createEmptyDraft());
  };

  const deleteQuestion = (subject: string, id: string) => {
    const nextQuestions = {
      ...questionsBySubject,
      [subject]: (questionsBySubject[subject] || []).filter((question) => question.id !== id),
    };
    setQuestionsBySubject(nextQuestions);
    showToast("Question deleted.", "success");
  };

  const saveAll = () => {
    const nextSavedAt = new Date().toISOString();
    const hasDraftContent = [draft.question, ...draft.options].some((value) => value.trim());
    const questionsToSave = hasDraftContent ? commitDraftQuestion(true) : questionsBySubject;
    if (!questionsToSave) return;
    const nextSet: SavedQuestionSet = {
      id: editingSetId || createId(),
      degree,
      level,
      subjects,
      questionsBySubject: questionsToSave,
      savedAt: nextSavedAt,
    };

    void (async () => {
      try {
        const savedSet = await saveQuestionSet(nextSet, Boolean(editingSetId), editingSetId);
        if (!savedSet) return;
        setEditingSetId(savedSet.id);
        setDegree(savedSet.degree);
        setLevel(savedSet.level);
        setSubjectsByDegree((previous) => ({ ...previous, [savedSet.degree]: savedSet.subjects }));
        setQuestionsBySubject(savedSet.questionsBySubject);
        setManagementDegreeFilter(savedSet.degree);
        setManagementLevelFilter(savedSet.level);
        setManagementSubjectFilter(resolvedActiveSubject);
        setManagementPage(1);
        setManagementBackView("questions");
        setView("management");
        showToast("Questions saved.", "success");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to save questions.";
        showToast(message, "error");
      }
    })();
  };

  const confirmDeleteSet = () => {
    if (!deleteSet) return;
    void (async () => {
      try {
        await deleteQuestionSet(deleteSet.id);
        if (editingSetId === deleteSet.id) {
          setEditingSetId(null);
          setQuestionsBySubject({});
          setDraft(createEmptyDraft());
        }
        setDeleteSet(null);
        showToast("Questions deleted.", "success");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to delete questions.";
        showToast(message, "error");
      }
    })();
  };

  const editQuestionFromSet = (set: SavedQuestionSet, question: SavedQuestion) => {
    setDegree(set.degree);
    setLevel(set.level);
    setSubjectsByDegree((previous) => ({ ...previous, [set.degree]: set.subjects }));
    setQuestionsBySubject(set.questionsBySubject);
    setActiveSubject(question.subject);
    setEditingSetId(set.id);
    setDraft(question);
    setView("questions");
  };

  const deleteQuestionFromSet = (set: SavedQuestionSet, subject: string, questionId: string) => {
    const nextQuestions = {
      ...set.questionsBySubject,
      [subject]: (set.questionsBySubject[subject] || []).filter((q) => q.id !== questionId),
    };
    const nextSet = { ...set, questionsBySubject: nextQuestions };
    void (async () => {
      try {
        const savedSet = await saveQuestionSet(nextSet, true, set.id);
        if (!savedSet) return;
        if (editingSetId === set.id) {
          setQuestionsBySubject(savedSet.questionsBySubject);
        }
        showToast("Question deleted.", "success");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to delete question.";
        showToast(message, "error");
      }
    })();
  };

  const formatQuestionDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const confirmDeleteQuestionFromSet = () => {
    if (!deleteQuestionDialog) return;
    deleteQuestionFromSet(
      deleteQuestionDialog.set,
      deleteQuestionDialog.subject,
      deleteQuestionDialog.question.id,
    );
    setDeleteQuestionDialog(null);
  };

  if (view === "management") {
    return (
      <div className="text-sm font-medium text-slate-700">
        <section className="overflow-hidden rounded-[0.9rem] border border-[#e8edf7] bg-white shadow-[0_18px_42px_rgba(15,23,42,0.07)]">
          <div className="p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-sm font-bold tracking-tight text-slate-900">Questions Management</h1>
              <p className="mt-1 text-xs font-medium leading-5 text-slate-500">Manage questions and answers for all degrees, levels and subjects</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleManagementBack}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#e4e9f4] bg-white px-5 text-xs font-bold text-[#53617e] shadow-sm transition hover:border-[#d7dff0] hover:bg-slate-50"
              >
                <ArrowLeft className="size-4" />
                Back
              </button>
              <button
                type="button"
                onClick={handleManagementAddQuestion}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#6d35d4] px-5 text-xs font-bold text-white shadow-[0_12px_24px_rgba(109,53,212,0.26)] transition hover:bg-[#5b2ec4]"
              >
                <Plus className="size-4" />
                Add Question
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-[#e8edf7] bg-white p-3">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-[#53617e]">Degree</span>
                <span className="flex h-9 items-center gap-2 rounded-md border border-[#e2e8f3] bg-white px-3 shadow-sm">
                  <GraduationCap className="size-4 text-[#7c3aed]" />
                  <select
                    className="w-full bg-transparent text-xs font-bold text-[#17213f] outline-none"
                    value={managementDegreeFilter || selectedManagementSet?.degree || degree}
                    onChange={(event) => {
                      setManagementDegreeFilter(event.target.value as DegreeKey);
                      setManagementLevelFilter(null);
                      setManagementSubjectFilter(null);
                      setManagementPage(1);
                    }}
                  >
                    {degreeOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </span>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-[#53617e]">Level</span>
                <span className="flex h-9 items-center gap-2 rounded-md border border-[#e2e8f3] bg-white px-3 shadow-sm">
                  <LibraryBig className="size-4 text-[#7c3aed]" />
                  <select
                    className="w-full bg-transparent text-xs font-bold text-[#17213f] outline-none"
                    value={managementLevelFilter || selectedManagementSet?.level || levelOptions[0]}
                    onChange={(event) => {
                      setManagementLevelFilter(event.target.value);
                      setManagementSubjectFilter(null);
                      setManagementPage(1);
                    }}
                  >
                    {levelOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </span>
              </label>
            </div>
          </div>

          <div className="mt-4">
            {loadingSavedSets ? (
              <div className="rounded-lg border border-dashed border-[#dfe7f4] px-4 py-12 text-center text-sm font-semibold text-slate-500">
                Loading saved cutoff questions...
              </div>
            ) : selectedManagementSet ? (
              <>
                <div className="grid gap-3 md:grid-cols-3">
                  {selectedManagementSet.subjects.map((subject, index) => {
                    const style = getSubjectStyle(subject);
                    const tone = managementCardTones[index % managementCardTones.length];
                    const Icon = style.icon;
                    const count = selectedManagementSet.questionsBySubject[subject]?.length || 0;
                    const isActive = subject === managementActiveSubject;

                    return (
                      <button
                        key={subject}
                        type="button"
                        onClick={() => {
                          setManagementSubjectFilter(subject);
                          setManagementPage(1);
                        }}
                        className={`min-h-24 rounded-lg border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(15,23,42,0.08)] ${tone.card} ${isActive ? "ring-2 ring-[#8b5cf6]/20" : ""}`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${tone.icon}`}>
                            <Icon className={`size-5 ${tone.text}`} />
                          </span>
                          <span className="min-w-0">
                            <span className={`block text-xs font-bold ${tone.text}`}>{subject}</span>
                            <span className="mt-0.5 block text-xl font-bold leading-none text-[#18203a]">{count}</span>
                            <span className="mt-1 block text-xs font-medium text-[#53617e]">{count === 1 ? "Question" : "Questions"}</span>
                          </span>
                        </div>
                        <span className={`mt-2 inline-flex h-7 items-center justify-center gap-1.5 rounded-md px-2.5 text-xs font-bold transition ${tone.button}`}>
                          View Questions
                          <ArrowRight className="size-3.5" />
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 overflow-hidden rounded-lg border border-[#e7ecf6] bg-white">
                  <div className="flex flex-col gap-3 border-b border-[#eef2f8] px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex min-w-0 gap-5 overflow-x-auto">
                      {selectedManagementSet.subjects.map((subject) => {
                        const active = subject === managementActiveSubject;
                        const count = selectedManagementSet.questionsBySubject[subject]?.length || 0;

                        return (
                          <button
                            key={subject}
                            type="button"
                            onClick={() => {
                              setManagementSubjectFilter(subject);
                              setManagementPage(1);
                            }}
                            className={`relative shrink-0 pb-3 text-xs font-bold transition ${active ? "text-[#6d35d4]" : "text-[#68758e] hover:text-[#17213f]"}`}
                          >
                            {subject} ({count})
                            {active ? <span className="absolute inset-x-0 -bottom-3 h-0.5 rounded-full bg-[#7c3aed]" /> : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="px-4 py-3">
                    <p className="text-sm font-bold text-[#17213f]">Total Questions: {managementQuestionRows.length}</p>
                  </div>

                  <div className="space-y-2 px-4 pb-4">
                    {paginatedManagementRows.length ? paginatedManagementRows.map(({ question, originalIndex }) => (
                      <div key={`${question.id}-${originalIndex}`} className="grid gap-3 rounded-lg border border-[#e7ecf6] bg-white px-4 py-3 shadow-[0_4px_14px_rgba(15,23,42,0.03)] md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
                        <span className="inline-flex size-9 items-center justify-center rounded-lg bg-[#f2eaff] text-xs font-bold text-[#7c3aed]">
                          Q{originalIndex + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-[#17213f]">{question.question || "-"}</p>
                          <p className="mt-1 text-xs font-semibold text-[#059669]">
                            Ans: <span className="font-medium text-[#53617e]">{getAnswerValue(question)}</span>
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 md:justify-end">
                          <span className="text-[10px] font-semibold text-[#8290a8]">
                            Created: {formatQuestionDate(selectedManagementSet.savedAt)}
                          </span>
                          <button
                            type="button"
                            onClick={() => editQuestionFromSet(selectedManagementSet, question)}
                            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-[#d8c7ff] bg-white px-3 text-xs font-bold text-[#6d35d4] transition hover:bg-[#fbfaff]"
                          >
                            <Pencil className="size-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteQuestionDialog({
                              set: selectedManagementSet,
                              subject: managementActiveSubject,
                              question,
                            })}
                            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-[#ffd4d4] bg-white px-3 text-xs font-bold text-[#ef4444] transition hover:bg-red-50"
                          >
                            <Trash2 className="size-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                    )) : (
                      <div className="rounded-lg border border-dashed border-[#dfe7f4] px-4 py-10 text-center text-sm font-semibold text-slate-500">
                        No questions found for {managementActiveSubject || "this subject"}.
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-3 border-t border-[#eef2f8] px-4 py-4">
                    <button
                      type="button"
                      disabled={normalizedManagementPage <= 1}
                      onClick={() => setManagementPage((page) => Math.max(1, page - 1))}
                      className="h-9 rounded-md border border-[#e7ecf6] bg-white px-5 text-xs font-bold text-[#53617e] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-[#c2cad8]"
                    >
                      Previous
                    </button>
                    <span className="flex size-9 items-center justify-center rounded-md bg-[#6d35d4] text-xs font-bold text-white shadow-[0_10px_18px_rgba(109,53,212,0.22)]">
                      {normalizedManagementPage}
                    </span>
                    <button
                      type="button"
                      disabled={normalizedManagementPage >= managementTotalPages}
                      onClick={() => setManagementPage((page) => Math.min(managementTotalPages, page + 1))}
                      className="h-9 rounded-md border border-[#e7ecf6] bg-white px-5 text-xs font-bold text-[#53617e] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-[#c2cad8]"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-dashed border-[#dfe7f4] px-4 py-12 text-center text-sm font-semibold text-slate-500">
                No saved questions yet. Click Add Question to create the first set.
              </div>
            )}
          </div>
          </div>
        </section>

        {deleteSet ? (
          <div className="fixed inset-0 z-[2300] flex items-center justify-center bg-slate-950/45 p-4">
            <div className="w-full max-w-sm rounded-[1rem] bg-white p-5 shadow-[0_28px_70px_rgba(15,23,42,0.26)]">
              <h2 className={sectionTitleClass}>Are you delete?</h2>
              <p className="mt-2 text-sm text-slate-600">
                {deleteSet.degree} {deleteSet.level} questions will be removed.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setDeleteSet(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600">
                  Cancel
                </button>
                <button type="button" onClick={confirmDeleteSet} className="rounded-lg bg-red-500 px-4 py-2 text-sm font-bold text-white">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ) : null}
        {deleteQuestionDialog ? (
          <div className="fixed inset-0 z-[2300] flex items-center justify-center bg-slate-950/45 p-4">
            <div className="w-full max-w-sm rounded-[1rem] bg-white p-5 shadow-[0_28px_70px_rgba(15,23,42,0.26)]">
              <h2 className={sectionTitleClass}>Are you delete this question?</h2>
              <p className="mt-2 text-sm text-slate-600">
                This question will be removed from {deleteQuestionDialog.subject}.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setDeleteQuestionDialog(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600">
                  Cancel
                </button>
                <button type="button" onClick={confirmDeleteQuestionFromSet} className="rounded-lg bg-red-500 px-4 py-2 text-sm font-bold text-white">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={pageTextClass}>
      {view === "basic" ? (
        <section className="overflow-hidden rounded-[1rem] border border-slate-200 bg-white shadow-[0_18px_42px_rgba(15,23,42,0.08)]">
          <div className="p-3 sm:p-5">
            <div className="flex items-center gap-2">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#e8ecff] text-[#174eea] sm:size-11">
                <UserRound className="size-4 sm:size-5" />
              </span>
              <div className="min-w-0">
                <h1 className="whitespace-nowrap text-[11px] font-bold tracking-tight text-slate-900 sm:text-xs">Basic Information</h1>
                <p className="mt-0.5 truncate text-[10px] font-medium leading-4 text-slate-500 sm:text-[11px]">Select your degree, level and subjects to continue</p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              <label className="block">
                <span className={fieldLabelClass}>Degree <span className="text-red-500">*</span></span>
                <span className="mt-1.5 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-[0_4px_12px_rgba(15,23,42,0.03)] sm:gap-3 sm:py-2.5">
                  <GraduationCap className="size-4 text-slate-600 sm:size-5" />
                  <select className={`w-full bg-transparent outline-none ${controlTextClass}`} value={degree} onChange={(event) => handleDegreeChange(event.target.value as DegreeKey)}>
                    {degreeOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </span>
                <span className="mt-1.5 block text-xs text-[#405174]">Choose the degree you are interested in.</span>
              </label>

              <label className="block">
                <span className={fieldLabelClass}>Level <span className="text-red-500">*</span></span>
                <span className="mt-2 flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-[0_4px_12px_rgba(15,23,42,0.03)]">
                  <LibraryBig className="size-5 text-slate-600" />
                  <select className={`w-full bg-transparent outline-none ${controlTextClass}`} value={level} onChange={(event) => setLevel(event.target.value)}>
                    {levelOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </span>
                <span className="mt-1.5 block text-xs text-[#405174]">Choose your current class / grade level.</span>
              </label>
            </div>

            <div className="mt-5">
              <h2 className={sectionTitleClass}>Subjects</h2>
              <p className="mt-1.5 text-xs text-[#405174]">Subjects show automatically based on the selected degree.</p>

              <div className="mt-3 space-y-2">
                {subjects.map((subject) => {
                  const style = getSubjectStyle(subject);
                  const Icon = style.icon;
                  return (
                    <div key={subject} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
                      <div className="flex items-center gap-3">
                        <span className={`flex size-9 items-center justify-center rounded-md ${style.tile} ${style.accent}`}>
                          <Icon className="size-5" />
                        </span>
                        <span className={sectionTitleClass}>{subject}</span>
                      </div>
                      <button type="button" onClick={() => setDeleteSubjectName(subject)} className="flex size-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50" aria-label={`Delete ${subject}`}>
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <input className={`min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-[#174eea] focus:ring-4 focus:ring-blue-100 ${inputTextClass}`} value={newSubjectName} onChange={(event) => setNewSubjectName(event.target.value)} placeholder="Enter subject name" />
                <button type="button" onClick={addSubject} className={`inline-flex items-center justify-center gap-2 rounded-lg border border-dashed border-[#174eea] bg-white px-4 py-2.5 text-[#174eea] ${actionTextClass}`}>
                  <Plus className="size-4" />
                  Add Subject
                </button>
              </div>

              {savedSetsForCurrentDegree.length > 0 ? (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => openDegreeManagement(degree)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#c9b8ff] bg-[#fbfaff] px-4 py-2.5 text-sm font-bold text-[#5b2ec4] transition hover:bg-[#f0e9ff]"
                  >
                    {degree} Questions
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-row items-center justify-between gap-2 border-t border-slate-100 bg-white px-3 py-3 sm:px-5 sm:py-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#405174]">
              <ShieldCheck className="size-4" />
              <span className="truncate">Your information is safe with us.</span>
            </div>
            <button type="button" onClick={openQuestionBuilderFromBasic} className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#174eea] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(23,78,234,0.22)] sm:min-w-32 sm:gap-2 sm:px-5 sm:py-2.5">
              Next
              <ArrowRight className="size-4" />
            </button>
          </div>
        </section>
      ) : (
        <section className="max-w-full overflow-hidden rounded-[1rem] border border-slate-200 bg-white p-3 shadow-[0_18px_42px_rgba(15,23,42,0.08)] sm:p-5 lg:p-7">
          <div className="mb-4 flex flex-nowrap items-start justify-between gap-2">
            <div className="min-w-0 text-transparent [&>span]:hidden">
              <h1 className="text-sm font-bold tracking-tight text-slate-900">Add Questions</h1>
              <p className="mt-1 truncate text-xs font-semibold text-slate-600">
                <span className="text-slate-950">{degree}</span> <span className="text-slate-400">/</span> <span className="text-slate-950">{level}</span>
              </p>
            </div>
            <button type="button" onClick={() => setView("basic")} className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
              <ArrowLeft className="size-4" />
              Back
            </button>
          </div>

          <div className="grid max-w-full gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="min-w-0 space-y-4">
              <div className="grid overflow-hidden rounded-lg border border-slate-200 md:grid-cols-3">
                {subjects.map((subject) => {
                  const style = getSubjectStyle(subject);
                  const Icon = style.icon;
                  const active = subject === resolvedActiveSubject;
                  return (
                    <button key={subject} type="button" onClick={() => { setActiveSubject(subject); setShowAllSavedQuestions(false); }} className={`flex items-center gap-3 border-b border-slate-200 px-4 py-3 text-left md:border-b-0 md:border-r ${active ? "border-[#7c3aed] bg-white shadow-[inset_0_-3px_0_#7c3aed]" : "bg-white"}`}>
                      <Icon className={`size-5 ${active ? "text-[#6d35d4]" : "text-slate-500"}`} />
                      <span>
                        <span className={`block text-sm font-bold ${active ? "text-[#6d35d4]" : "text-slate-950"}`}>{subject}</span>
                        <span className="mt-0.5 block text-xs font-semibold text-slate-700">{questionsBySubject[subject]?.length || 0} / {maxQuestionsPerSubject}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-nowrap items-center justify-between gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-[#1456c8] sm:px-4">
                <div className="flex min-w-0 items-center gap-2 text-xs font-semibold">
                  <Info className="size-4" />
                  <span className="min-w-0 truncate whitespace-nowrap">Add questions for <span className="font-bold">{resolvedActiveSubject}</span> (Maximum {maxQuestionsPerSubject} questions)</span>
                </div>
                <span className={`${sectionTitleClass} shrink-0 whitespace-nowrap`}>{activeQuestions.length} / {maxQuestionsPerSubject}</span>
              </div>

              <div className="max-w-full overflow-hidden rounded-lg border border-slate-200 bg-white p-3 sm:p-4">
                <h2 className={sectionTitleClass}>Question {activeQuestions.length + 1}</h2>
                <label className="mt-3 block">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-700">Question</span>
                  <input className={`w-full min-w-0 rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-[#7c3aed] focus:ring-4 focus:ring-purple-100 ${inputTextClass}`} value={draft.question} onChange={(event) => setDraft((previous) => ({ ...previous, question: event.target.value }))} placeholder="What is 2 + 2 ?" />
                </label>

                <div className="mt-3 space-y-2">
                  <span className="block text-xs font-semibold text-slate-700">Options</span>
                  {draft.options.map((option, index) => {
                    const optionLabel = String.fromCharCode(65 + index);
                    return (
                      <div key={optionLabel} className="flex items-center gap-2">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#5b2ec4] text-sm font-bold text-white">{optionLabel}</span>
                        <input className={`min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-[#7c3aed] focus:ring-4 focus:ring-purple-100 ${inputTextClass}`} value={option} onChange={(event) => updateOption(index, event.target.value)} />
                        <button type="button" onClick={() => updateOption(index, "")} className="flex size-8 items-center justify-center text-slate-500">
                          <X className="size-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <label className="mt-3 block max-w-64">
                  <span className="mb-1.5 block text-xs font-semibold text-slate-700">Correct Answer</span>
                  <select className={`w-full min-w-0 rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-[#7c3aed] focus:ring-4 focus:ring-purple-100 ${inputTextClass}`} value={draft.correctAnswer} onChange={(event) => setDraft((previous) => ({ ...previous, correctAnswer: event.target.value }))}>
                    {["A", "B", "C", "D"].map((option) => <option key={option} value={option}>Option {option}</option>)}
                  </select>
                </label>

                <div className="mt-4 grid grid-cols-3 gap-2 sm:flex sm:justify-end sm:gap-3">
                  <button type="button" onClick={addQuestion} className={`inline-flex min-w-0 items-center justify-center gap-1 rounded-lg border border-[#7c3aed] px-2 py-2 text-xs font-semibold text-[#6d35d4] sm:w-auto sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm`}>
                    <Plus className="size-3.5 shrink-0 sm:size-4" />
                    {isEditingDraftQuestion ? "Update Question" : "Add Question"}
                  </button>
                  <button type="button" onClick={goToNextSubject} className="inline-flex min-w-0 items-center justify-center gap-1 rounded-lg bg-[#6d35d4] px-2 py-2 text-xs font-semibold text-white sm:w-auto sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm">
                    Next Subject
                    <ArrowRight className="size-3.5 shrink-0 sm:size-4" />
                  </button>
                  <button type="button" onClick={saveAll} className="inline-flex min-w-0 items-center justify-center gap-1 rounded-lg bg-emerald-600 px-2 py-2 text-xs font-semibold text-white shadow-[0_10px_20px_rgba(16,185,129,0.18)] transition hover:bg-emerald-700 sm:w-auto sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm">
                    <Save className="size-3.5 shrink-0 sm:size-4" />
                    Save All
                  </button>
                </div>
              </div>

            </div>

            <aside className="space-y-5">
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <h2 className={`border-b border-slate-200 px-4 py-3 ${sectionTitleClass}`}>Questions Summary</h2>
                {subjects.map((subject) => {
                  const style = getSubjectStyle(subject);
                  const Icon = style.icon;
                  const count = questionsBySubject[subject]?.length || 0;
                  return (
                    <div key={subject} className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <Icon className={`size-4 ${style.accent}`} />
                        <span className="text-sm font-bold text-slate-950">{subject}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-950">{count} / {maxQuestionsPerSubject}</span>
                    </div>
                  );
                })}
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-950">
                    <span>Total Progress</span>
                    <span>{totalAdded} / {totalTarget}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-[#6d35d4]" style={{ width: `${Math.min((totalAdded / Math.max(totalTarget, 1)) * 100, 100)}%` }} />
                  </div>
                </div>
              </div>

              {activeQuestions.length > 0 ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <h3 className="text-sm font-bold text-slate-900">Saved {resolvedActiveSubject} Questions</h3>
                  <div className="mt-3 space-y-2">
                    {displayedActiveQuestions.map((question, index) => (
                      <div key={`${question.id}-${index}`} className="grid grid-cols-[minmax(0,1fr)_2rem] items-center gap-3 rounded-lg bg-white px-3 py-2 text-sm">
                        <span className="min-w-0 truncate font-semibold text-slate-700">{index + 1}. {question.question}</span>
                        <button type="button" onClick={() => deleteQuestion(resolvedActiveSubject, question.id)} className="flex size-8 shrink-0 items-center justify-center rounded-md text-red-500 transition hover:bg-red-50" aria-label={`Delete question ${index + 1}`}>
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    ))}
                    {activeQuestions.length > savedQuestionPreviewLimit ? (
                      <button
                        type="button"
                        onClick={() => setShowAllSavedQuestions((previous) => !previous)}
                        className="mt-2 w-full rounded-lg border border-[#c9b8ff] bg-white px-3 py-2 text-xs font-bold text-[#6d35d4] transition hover:bg-[#fbfaff]"
                      >
                        {showAllSavedQuestions ? "Show Less" : `View More (${activeQuestions.length - savedQuestionPreviewLimit} more)`}
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </aside>
          </div>

        </section>
      )}
      {deleteSubjectName ? (
        <div className="fixed inset-0 z-[2300] flex items-center justify-center bg-slate-950/45 p-4">
          <div className="w-full max-w-sm rounded-[1rem] bg-white p-5 shadow-[0_28px_70px_rgba(15,23,42,0.26)]">
            <h2 className={sectionTitleClass}>Are you delete this subject?</h2>
            <p className="mt-2 text-sm text-slate-600">
              {deleteSubjectName} and its questions will be removed.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setDeleteSubjectName(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600">
                Cancel
              </button>
              <button type="button" onClick={confirmDeleteSubject} className="rounded-lg bg-red-500 px-4 py-2 text-sm font-bold text-white">
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
