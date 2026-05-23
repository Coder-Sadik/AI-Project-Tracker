"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getUserProjects, getUserProfile } from "@/lib/firestore";
import { Project, UserProfile } from "@/types";
import Navbar from "@/components/navbar";
import ProjectCard from "@/components/projects/project-card";
import { Plus, Sparkles, FolderOpen, Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [memberProfiles, setMemberProfiles] = useState<
    Record<string, UserProfile>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    async function load() {
      setLoading(true);
      try {
        const ps = await getUserProjects(user!.uid);
        setProjects(ps);

        // Load all unique member profiles
        const uids = [...new Set(ps.flatMap((p) => p.teamMembers))];
        const profiles: Record<string, UserProfile> = {};
        await Promise.all(
          uids.map(async (uid) => {
            const p = await getUserProfile(uid);
            if (p) profiles[uid] = p;
          }),
        );
        setMemberProfiles(profiles);
      } catch (err) {
        console.error("Failed to load projects:", err);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  // Show loading only if auth is still loading AND user is not set
  if (authLoading && !user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg-primary)" }}
      >
        <Loader2
          size={32}
          className="animate-spin"
          style={{ color: "var(--brand-500)" }}
        />
      </div>
    );
  }

  // If user is not set, redirect to login
  if (!user) {
    return null;
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Navbar />

      <main
        style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between mb-8"
          style={{ flexWrap: "wrap", gap: "1rem" }}
        >
          <div>
            <h1
              className="text-3xl font-bold mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              Your Projects
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              {loading
                ? "Loading…"
                : `${projects.length} project${projects.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/projects/new" className="btn btn-secondary">
              <Plus size={16} />
              New Project
            </Link>
            <Link href="/projects/new?ai=true" className="btn btn-primary">
              <Sparkles size={16} />
              AI Extract
            </Link>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card" style={{ height: 180 }}>
                <div style={{ padding: "1.5rem" }}>
                  <div
                    className="skeleton"
                    style={{
                      height: 20,
                      width: "60%",
                      marginBottom: "0.75rem",
                    }}
                  />
                  <div
                    className="skeleton"
                    style={{ height: 12, width: "40%", marginBottom: "1.5rem" }}
                  />
                  <div
                    className="skeleton"
                    style={{ height: 8, marginBottom: "0.5rem" }}
                  />
                  <div
                    className="skeleton"
                    style={{ height: 8, width: "80%" }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div
            className="card flex flex-col items-center justify-center text-center"
            style={{ padding: "4rem 2rem", minHeight: 300 }}
          >
            <div
              className="flex items-center justify-center rounded-2xl mb-4"
              style={{
                width: 64,
                height: 64,
                background: "var(--bg-secondary)",
              }}
            >
              <FolderOpen size={32} style={{ color: "var(--text-muted)" }} />
            </div>
            <h2
              className="text-xl font-bold mb-2"
              style={{ color: "var(--text-primary)" }}
            >
              No projects yet
            </h2>
            <p
              className="mb-6"
              style={{ color: "var(--text-secondary)", maxWidth: 360 }}
            >
              Create your first project manually or let AI extract requirements
              from a document.
            </p>
            <div
              className="flex gap-3"
              style={{ flexWrap: "wrap", justifyContent: "center" }}
            >
              <Link href="/projects/new" className="btn btn-secondary">
                <Plus size={16} />
                New Project
              </Link>
              <Link href="/projects/new?ai=true" className="btn btn-primary">
                <Sparkles size={16} />
                AI Extract from Document
              </Link>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                memberProfiles={memberProfiles}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
