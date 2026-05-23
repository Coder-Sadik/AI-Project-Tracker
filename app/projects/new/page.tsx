"use client";

import { useState, useCallback, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { createProject, createRequirement, addActivity } from "@/lib/firestore";
import Navbar from "@/components/navbar";
import { AIAnalysisResult, ExtractedRequirement } from "@/types";
import toast from "react-hot-toast";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowRight,
  X,
  RotateCcw,
  Loader2,
  DollarSign,
  Calendar,
} from "lucide-react";

type Step = "input" | "analyzing" | "review" | "creating";

function ConfidenceBadge({ value }: { value: number }) {
  if (value >= 0.8)
    return (
      <span
        className="badge confidence-high"
        style={{ background: "rgba(34,197,94,0.1)", gap: 4 }}
      >
        <CheckCircle2 size={10} /> {Math.round(value * 100)}%
      </span>
    );
  if (value >= 0.5)
    return (
      <span
        className="badge confidence-med"
        style={{ background: "rgba(245,158,11,0.1)", gap: 4 }}
      >
        <AlertTriangle size={10} /> {Math.round(value * 100)}%
      </span>
    );
  return (
    <span
      className="badge confidence-low"
      style={{ background: "rgba(239,68,68,0.1)", gap: 4 }}
    >
      <AlertTriangle size={10} /> {Math.round(value * 100)}%
    </span>
  );
}

function NewProjectContent() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const aiMode = searchParams.get("ai") === "true";

  const [step, setStep] = useState<Step>("input");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedBudget, setEditedBudget] = useState("");
  const [editedTimeline, setEditedTimeline] = useState("");
  const [editedReqs, setEditedReqs] = useState<ExtractedRequirement[]>([]);
  const [manualName, setManualName] = useState("");
  const [manualBudget, setManualBudget] = useState("");
  const [manualTimeline, setManualTimeline] = useState("");
  const [useAI, setUseAI] = useState(aiMode);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10 MB
  });

  async function handleAnalyze() {
    if (!text.trim() && !file) {
      toast.error("Please paste text or upload a file");
      return;
    }
    setStep("analyzing");
    try {
      const formData = new FormData();
      if (text.trim()) formData.append("text", text);
      if (file) formData.append("file", file);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Analysis failed");

      setResult(data);
      setEditedName(data.projectName || "");
      setEditedBudget(data.budget || "");
      setEditedTimeline(data.timeline || "");
      setEditedReqs(data.requirements || []);
      setStep("review");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Analysis failed";
      toast.error(msg);
      setStep("input");
    }
  }

  async function handleCreate() {
    if (!user) {
      toast.error("Not authenticated. Please sign in.");
      router.push("/login");
      return;
    }
    if (!userProfile) {
      toast.error("User profile not loaded. Try refreshing.");
      return;
    }
    const name = useAI ? editedName.trim() : manualName.trim();
    if (!name) {
      toast.error("Please enter a project name");
      return;
    }

    setStep("creating");
    try {
      const projectId = await createProject(
        name, 
        user.uid,
        useAI ? editedBudget.trim() : manualBudget.trim(),
        useAI ? editedTimeline.trim() : manualTimeline.trim()
      );

      // Create requirements
      const reqs = useAI ? editedReqs : [];
      for (const req of reqs) {
        if (req.description.trim()) {
          await createRequirement(
            projectId,
            req.description,
            user.uid,
            userProfile.displayName,
            userProfile.color,
            req.confidence,
          );
        }
      }

      await addActivity(
        projectId,
        "created_project",
        user.uid,
        userProfile.displayName,
        userProfile.color,
        `Created project "${name}" with ${reqs.length} AI-extracted requirements`,
      );

      toast.success("Project created! 🚀");
      router.push(`/projects/${projectId}`);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to create project";
      console.error("Create project error:", err);
      toast.error(msg);
      setStep(useAI ? "review" : "input");
    }
  }

  function addReq() {
    setEditedReqs((prev) => [...prev, { description: "", confidence: 1 }]);
  }

  function removeReq(i: number) {
    setEditedReqs((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateReq(i: number, desc: string) {
    setEditedReqs((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, description: desc } : r)),
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Navbar />

      {authLoading && (
        <main
          style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1.5rem" }}
        >
          <div
            className="flex items-center justify-center"
            style={{ minHeight: 400 }}
          >
            <Loader2
              size={32}
              className="animate-spin"
              style={{ color: "var(--brand-500)" }}
            />
          </div>
        </main>
      )}

      {!authLoading && (
        <main
          style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1.5rem" }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1
              className="text-3xl font-bold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              {useAI ? "AI Requirement Extraction" : "New Project"}
            </h1>
            <p style={{ color: "var(--text-secondary)" }}>
              {useAI
                ? "Paste text or upload a document to automatically extract project requirements"
                : "Create a project manually and add requirements one by one"}
            </p>
            <div className="flex gap-2 mt-4">
              <button
                className={`btn btn-sm ${useAI ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setUseAI(true)}
              >
                <Sparkles size={14} /> AI Extract
              </button>
              <button
                className={`btn btn-sm ${!useAI ? "btn-primary" : "btn-secondary"}`}
                onClick={() => setUseAI(false)}
              >
                <Plus size={14} /> Manual
              </button>
            </div>
          </div>

          {/* ── MANUAL mode ─────────────────────────────────── */}
          {!useAI && step !== "creating" && (
            <div className="card fade-in" style={{ padding: "2rem" }}>
              <label
                htmlFor="manual-name"
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                Project Name
              </label>
              <input
                id="manual-name"
                className="input mb-6"
                placeholder="e.g. E-commerce Redesign"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
              />
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label
                    htmlFor="manual-budget"
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Budget
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      id="manual-budget"
                      className="input w-full"
                      style={{ paddingLeft: '2.5rem' }}
                      placeholder="e.g. $5,000"
                      value={manualBudget}
                      onChange={(e) => setManualBudget(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="manual-timeline"
                    className="block text-sm font-medium mb-2"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Timeline
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      id="manual-timeline"
                      type="date"
                      className="input w-full"
                      style={{ paddingLeft: '2.5rem' }}
                      placeholder="e.g. 4 Weeks"
                      value={manualTimeline}
                      onChange={(e) => setManualTimeline(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <button
                className="btn btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={handleCreate}
                disabled={!manualName.trim()}
              >
                <Plus size={16} /> Create Project
              </button>
            </div>
          )}

          {/* ── INPUT step ──────────────────────────────────── */}
          {useAI && step === "input" && (
            <div className="fade-in flex flex-col gap-6">
              {/* Text area */}
              <div className="card" style={{ padding: "1.5rem" }}>
                <label
                  htmlFor="paste-text"
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Paste your document text
                </label>
                <textarea
                  id="paste-text"
                  className="input"
                  style={{ minHeight: 200, fontFamily: "inherit" }}
                  placeholder="Paste a project brief, spec document, email, or any text with requirements…"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 divider" style={{ margin: 0 }} />
                <span
                  style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}
                >
                  or upload a file
                </span>
                <div className="flex-1 divider" style={{ margin: 0 }} />
              </div>

              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`dropzone ${isDragActive ? "active" : ""}`}
              >
                <input {...getInputProps()} id="file-upload" />
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText size={24} style={{ color: "var(--brand-500)" }} />
                    <div>
                      <p
                        className="font-medium"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {file.name}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {(file.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                    <button
                      className="btn btn-ghost btn-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload
                      size={32}
                      style={{
                        color: "var(--text-muted)",
                        margin: "0 auto 0.75rem",
                      }}
                    />
                    <p
                      className="font-medium mb-1"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {isDragActive
                        ? "Drop your file here"
                        : "Drag & drop or click to upload"}
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      PDF, DOCX, or TXT — up to 10 MB
                    </p>
                  </div>
                )}
              </div>

              <button
                id="analyze-btn"
                className="btn btn-primary btn-lg"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={handleAnalyze}
                disabled={!text.trim() && !file}
              >
                <Sparkles size={18} />
                Analyze with AI
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* ── ANALYZING step ──────────────────────────────── */}
          {useAI && step === "analyzing" && (
            <div
              className="card flex flex-col items-center justify-center text-center fade-in"
              style={{ padding: "4rem 2rem" }}
            >
              <div
                className="ai-pulse flex items-center justify-center rounded-2xl mb-6"
                style={{
                  width: 80,
                  height: 80,
                  background: "linear-gradient(135deg, #3b82f620, #8b5cf620)",
                  border: "1px solid rgba(139,92,246,0.3)",
                }}
              >
                <Sparkles size={36} style={{ color: "#8b5cf6" }} />
              </div>
              <h2
                className="text-xl font-bold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Analyzing your document…
              </h2>
              <p style={{ color: "var(--text-secondary)", maxWidth: 360 }}>
                AI is extracting only the explicitly stated requirements.
                Nothing will be added or assumed.
              </p>
              <div className="flex gap-1 mt-6">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="rounded-full"
                    style={{
                      width: 8,
                      height: 8,
                      background: "var(--brand-500)",
                      animation: `ai-pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── REVIEW step ─────────────────────────────────── */}
          {useAI && step === "review" && result && (
            <div className="fade-in flex flex-col gap-6">
              {/* Result summary */}
              <div
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{
                  background: "rgba(34,197,94,0.1)",
                  border: "1px solid rgba(34,197,94,0.3)",
                }}
              >
                <CheckCircle2
                  size={20}
                  style={{ color: "#22c55e", flexShrink: 0 }}
                />
                <p style={{ color: "var(--text-primary)", fontSize: "0.9rem" }}>
                  Found <strong>{result.requirements.length}</strong>{" "}
                  requirement
                  {result.requirements.length !== 1 ? "s" : ""} — review and
                  edit before creating
                </p>
                <button
                  className="btn btn-ghost btn-sm ml-auto"
                  onClick={() => setStep("input")}
                >
                  <RotateCcw size={14} /> Re-analyze
                </button>
              </div>

              {/* Project name */}
              <div className="card" style={{ padding: "1.5rem" }}>
                <label
                  htmlFor="project-name-input"
                  className="block text-sm font-medium mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Project Name
                </label>
                <input
                  id="project-name-input"
                  className="input text-lg font-semibold"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                />
                
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label
                      htmlFor="project-budget-input"
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Budget
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        id="project-budget-input"
                        className="input w-full"
                        style={{ paddingLeft: '2.5rem' }}
                        value={editedBudget}
                        onChange={(e) => setEditedBudget(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="project-timeline-input"
                      className="block text-sm font-medium mb-2"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Timeline
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        id="project-timeline-input"
                        type="date"
                        className="input w-full"
                        style={{ paddingLeft: '2.5rem' }}
                        value={editedTimeline}
                        onChange={(e) => setEditedTimeline(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Requirements list */}
              <div className="card" style={{ padding: "1.5rem" }}>
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className="font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Requirements ({editedReqs.length})
                  </h2>
                  <button className="btn btn-secondary btn-sm" onClick={addReq}>
                    <Plus size={14} /> Add
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  {editedReqs.map((req, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-lg p-3"
                      style={{ background: "var(--bg-secondary)" }}
                    >
                      <span
                        className="flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold mt-1"
                        style={{
                          width: 22,
                          height: 22,
                          background: "var(--bg-card)",
                          border: "1px solid var(--border-default)",
                          color: "var(--text-muted)",
                        }}
                      >
                        {i + 1}
                      </span>
                      <textarea
                        className="input flex-1 text-sm"
                        style={{
                          minHeight: 60,
                          resize: "vertical",
                          padding: "0.375rem 0.625rem",
                        }}
                        value={req.description}
                        onChange={(e) => updateReq(i, e.target.value)}
                        id={`req-input-${i}`}
                      />
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        {req.confidence !== null &&
                          req.confidence !== undefined && (
                            <ConfidenceBadge value={req.confidence} />
                          )}
                        <button
                          className="btn btn-ghost btn-icon"
                          style={{ padding: "0.25rem" }}
                          onClick={() => removeReq(i)}
                        >
                          <X size={14} style={{ color: "var(--text-muted)" }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Create button */}
              <button
                id="create-project-btn"
                className="btn btn-primary btn-lg"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={handleCreate}
                disabled={!editedName.trim()}
              >
                <CheckCircle2 size={18} />
                Create Project with{" "}
                {editedReqs.filter((r) => r.description.trim()).length}{" "}
                Requirements
              </button>
            </div>
          )}

          {/* ── CREATING step ─────────────────────────────── */}
          {step === "creating" && (
            <div
              className="card flex flex-col items-center justify-center text-center fade-in"
              style={{ padding: "4rem 2rem" }}
            >
              <Loader2
                size={40}
                className="animate-spin mb-4"
                style={{ color: "var(--brand-500)" }}
              />
              <h2
                className="text-xl font-bold mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Creating your project…
              </h2>
              <p style={{ color: "var(--text-secondary)" }}>
                Setting up requirements and activity log
              </p>
            </div>
          )}
        </main>
      )}
    </div>
  );
}

export default function NewProjectPage() {
  return (
    <Suspense fallback={<div />}>
      <NewProjectContent />
    </Suspense>
  );
}
