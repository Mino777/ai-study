"use client";

import { useState } from "react";
import type { ProjectCategory } from "./projects-tabs";
import { ProjectTabs } from "./projects-tabs";

export interface Project {
  name: string;
  category: ProjectCategory;
  url: string;
  color: string;
  period: string;
  version: string;
  tagline: string;
  stack: string[];
  metrics: Record<string, any>;
  environment: Array<{ title: string; detail: string }>;
  cycles: Array<{ title: string; detail: string }>;
  retrospective: string;
}

interface ProjectsPageClientProps {
  projects: Project[];
}

function StatBadge({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[var(--radius-sm)] bg-bg px-3 py-1.5 text-center">
      <div className="font-data text-lg font-semibold text-text">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}

export function ProjectsPageClient({
  projects,
}: ProjectsPageClientProps) {
  const [currentCategory, setCurrentCategory] = useState<ProjectCategory>("all");

  const categories: ProjectCategory[] = ["all", "methodology", "infrastructure", "learning"];

  const filteredProjects =
    currentCategory === "all"
      ? projects
      : projects.filter((p) => p.category === currentCategory);

  return (
    <>
      {/* Projects Tabs */}
      <div className="mb-8">
        <ProjectTabs
          categories={categories}
          onCategoryChange={setCurrentCategory}
          currentCategory={currentCategory}
        />
      </div>

      {/* Projects Grid */}
      <div className="space-y-16">
        {filteredProjects.map((project) => (
          <article key={project.name}>
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
              <span
                className="h-4 w-4 rounded-full"
                style={{ background: project.color }}
              />
              <h2 className="font-display text-3xl font-black tracking-tight">
                {project.name}
              </h2>
              <span className="text-sm text-muted font-code ml-auto">
                {project.period} · {project.version}
              </span>
            </div>

            <p className="text-base text-text leading-relaxed mb-5">{project.tagline}</p>

            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-surface border border-border px-4 py-2 text-sm font-medium text-accent hover:border-accent transition-colors mb-6"
            >
              {project.url.replace("https://", "")} →
            </a>

            {/* AI 운영 지표 */}
            <div className="flex flex-wrap gap-3 mb-6">
              {Object.entries(project.metrics).map(([key, val]) => {
                const labels: Record<string, string> = {
                  tests: "테스트",
                  agents: "에이전트",
                  providers: "프로바이더",
                  rounds: "라운드",
                  compoundCycles: "Compound 사이클",
                  stabilityAxes: "안정성 축",
                  entries: "위키 엔트리",
                  journals: "Harness Journal",
                  categories: "카테고리",
                  slashCommands: "슬래시 커맨드",
                  qualityJudge: "품질 Judge",
                };
                return <StatBadge key={key} label={labels[key] || key} value={val} />;
              })}
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {project.stack.map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-surface px-3 py-1 text-xs text-muted font-code border border-border"
                >
                  {s}
                </span>
              ))}
            </div>

            {/* 환경 조성 */}
            <section className="mb-8">
              <h3 className="font-display text-xl font-bold mb-2">
                AI가 안전하게 달리는 환경
              </h3>
              <p className="text-xs text-muted leading-relaxed mb-4">
                Foundation 위에 이 프로젝트만의 특화 환경을 추가로 깔았다.
              </p>
              <div className="space-y-3">
                {project.environment.map((e, i) => (
                  <div
                    key={i}
                    className="rounded-[var(--radius-md)] border border-border bg-surface p-4"
                    style={{ borderLeftColor: project.color, borderLeftWidth: 3 }}
                  >
                    <h4 className="font-display text-sm font-bold text-text mb-2">
                      {e.title}
                    </h4>
                    <p className="text-xs text-muted leading-relaxed">{e.detail}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* 사이클 흐름 */}
            <section className="mb-8">
              <h3 className="font-display text-xl font-bold mb-2">사이클 흐름</h3>
              <p className="text-xs text-muted leading-relaxed mb-4">
                매 사이클의 마지막 단계는 항상 compound — 회고와 솔루션이 다음 사이클의 입력이 된다.
              </p>
              <div className="space-y-3">
                {project.cycles.map((c, i) => (
                  <div
                    key={i}
                    className="rounded-[var(--radius-md)] border border-border bg-surface p-4"
                  >
                    <div className="flex items-baseline gap-2 mb-2">
                      <span
                        className="font-code text-xs font-bold"
                        style={{ color: project.color }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h4 className="font-display text-sm font-bold text-text">{c.title}</h4>
                    </div>
                    <p className="text-xs text-muted leading-relaxed pl-6">{c.detail}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* AI 운영 회고 */}
            <section className="rounded-[var(--radius-lg)] border border-border bg-surface p-6">
              <h3 className="font-display text-xl font-bold mb-3">AI 운영 회고</h3>
              <p className="text-sm text-muted leading-relaxed whitespace-pre-line">
                {project.retrospective}
              </p>
            </section>
          </article>
        ))}
      </div>
    </>
  );
}
