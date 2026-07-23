# Interview Story — "I don't just use AI, I build the AI system my team uses"

> Target roles: Forward Deployed Engineer (FDE), AI Engineer, AI Tooling / Developer Productivity.
> Framing: I'm a 5-year iOS engineer who built a self-improving AI development harness on top of an LLM coding agent — deployed on a real, large-scale production car-sharing app. Prompt/context engineering, agent orchestration, evals, and token economics — all shipped, all measured.

---

## The one-line thesis

**Most engineers use an AI coding assistant. I built the operating system that safely puts an LLM agent onto a large production codebase — and made it get better every time it fails.**

The target app is a nationwide car-sharing / mobility iOS app: ~320K lines of Swift, 50 SPM modules across a Domain/Repository/UseCase/Presentation clean architecture, RIBs + ReactorKit + RxSwift, 100+ screens, digital car-key over BLE, deep-link routing that funnels 5 entry channels into 120+ destinations. And critically: **it merges straight to the integration branch with no PR review gate.** That's the hard environment I put an autonomous agent into.

---

# 2-MINUTE VERSION

Here's how I'd tell it in two minutes.

I'm an iOS engineer, but over the last few months the work I'm proudest of isn't a feature — it's the **AI development harness** I built for my team. It's a Claude Code plugin plus an MCP server that turns a general LLM coding agent into a disciplined engineer for one specific, gnarly production codebase.

The problem I was solving: LLM agents are impressive in a toy repo and dangerous in a real one. On our app they'd do three things that hurt — hallucinate that a feature "doesn't exist" because a naive grep returned zero hits, silently introduce data bugs the compiler can't catch, and forget hard-won lessons between sessions. Our app has no PR review gate, so those mistakes go straight toward production.

So I engineered the failures out. Three layers:

1. **A knowledge layer** — every mistake, fix, and decision gets "cast" into a shared memory store. An `add_memory` call auto-opens a pull request, squash-merges it, and surfaces it in every teammate's next session. It's team institutional memory, versioned in git. We're at 579 memories, 152 solution docs, 58 retros.

2. **An execution layer** — 59 skills and 17 sub-agents (routed by cost: read-only tasks run on a cheap model, reasoning on a mid model, architecture on the top model), backed by 176 scripts and a code-graph index so the agent locates code in sub-second, deterministic, hallucination-free lookups instead of grep-and-pray.

3. **An enforcement layer** — 46 lifecycle hooks that block the specific failure classes we've actually hit: a hook that blocks a naive `.build`-including grep, a hook that rejects AI-written code with no "why" comment, a hook that catches a sub-agent lying that the build passed.

And the whole thing is **measured and self-improving**. Repeated failures climb an escalation ladder — first a memory note, then an inline rule, then a hard rule, then a code-level hook, then an architecture decision record. Harness changes are validated against a golden-set regression suite with Wilson-score confidence intervals — if the confidence interval overlaps, we don't ship the change.

That's the story I want to bring to an FDE role: not "I'm fast with AI," but "I know how to put an AI agent into a customer's messy production system and make it safe, measured, and compounding."

---

# 5-MINUTE VERSION

## 1. The framing: builder of the system, not user of the tool

There's a category difference between *using* an AI assistant and *engineering the system* an agent runs inside. I did the second. The deliverable is a versioned product — a Claude Code plugin (currently v1.13.x, ~800 commits, 1,500 tracked files) with its own MCP server written in TypeScript, unit-tested, distributed to teammates through a plugin marketplace with auto-update. I treat the harness itself as a software product: ADRs, retros, a research corpus, a regression eval suite.

That's the FDE mindset in miniature: you land in someone's real, hairy environment and you build the tooling and guardrails that make an AI system actually work there — not in a demo, in production.

## 2. Prompt & context engineering — in practice, not in theory

**Context rot is the enemy.** LLM agents degrade as their context fills with noise. I engineered against it structurally:

- **Isolation of exploration.** Broad codebase searches don't run in the main session — they're fanned out to read-only sub-agents that return only a summary (path:line + 1–3 lines, zero file dumps). Measured effect: ~9K tokens isolated vs ~15K accumulated for the same work — roughly 40% context saved on exploration-heavy tasks.
- **Just-in-time retrieval instead of full-file reads.** A `Read` hook blocks whole-file reads of 300+ line sources and redirects to a code-graph symbol lookup or partial read. Knowledge isn't preloaded — it's pulled at the moment of need via a BM25-ranked memory search and a graph-aware `wiki_query` that expands 1–2 hops through `[[wikilink]]` edges.
- **Sub-agents don't inherit the main context**, so the critical rules (e.g., the "never hallucinate twice" doctrine) are *re-cast inline* into each agent's prompt. That's deliberate prompt engineering: the same contract, re-expressed at each isolation boundary.

## 3. Agent harness & orchestration — and knowing when to *retreat*

The most honest part of this story is that I **killed my own multi-agent design.** I originally built a 4-pane tmux worker pool with send-keys IPC. It failed — I catalogued 25+ failure incidents (transmission failures, pane-grep state misreads, launch hangs, context dominoes) and cross-referenced them against external multi-agent research (MAST, Cognition). The evidence converged, so I wrote an ADR, deleted 52 files, and retreated to a **SOLO orchestrator + on-demand isolated fan-out** model (conservative 2–3 parallel worktree agents).

That's a signal I'd want an interviewer to hear: I make architecture decisions from measured failure taxonomies, and I'm willing to tear down my own work when the data says so. "Cognitive bandwidth doesn't parallelize" — I learned that the expensive way and wrote it down.

What I kept is a **Generator–Critic separation with falsification-first verification**: a reviewer agent splits deterministic checks (grep-based, a FAIL is a blocker) from judgment checks (LLM, a FAIL is a warning), and before any judgment verdict it must *first hunt for evidence of failure* and only pass if it can't find any — which counters LLM-as-judge agreement bias (a documented +25pp failure-detection, +14pp accuracy improvement). When a merge agent claims "zero loss," a separate independent auditor re-verifies it. Two layers of safety, never self-attested.

## 4. Solving LLM limitations with engineering — two concrete cases

**Case A — hallucinated absence.** The agent twice claimed a BLE feature "doesn't exist" because a single naive grep of one Korean keyword returned nothing. Root cause: search-zero was being read as feature-absent. Fix, engineered in layers: a hard rule ("zero search results ≠ feature absent"), a domain-synonym query expander (single Korean term → PascalCase + server-abbreviation OR-expansion), and a *hook that blocks* the footgun grep entirely (exit code 2). The failure became a permanent guard.

**Case B — silent-nil DTO decay.** Measured reality: 64% of the app's response DTOs (123 of 191) had no explicit `CodingKeys`, and nearly every field was Optional. So if the server renamed a key by one character, decoding didn't throw — it silently produced `nil`, sailed through the compiler, mock QA, and diff review, and only broke against the live server. I built a `contract-audit` skill and a dedicated auditor agent that cross-checks three oracles (the API spec, the cross-platform Android implementation, and a real response) and runs a decode round-trip test — structurally closing a bug class that no compiler could catch. On a codebase that ships without PR review, a `ship-radar` gate scans only the *added* diff lines for signatures derived from past production incidents (hardcoded env keys, mock leaking to production, simulator bypass, `Thread.sleep`, encrypted-field silent-nil). It's effectively the only production-regression gate the team has.

## 5. Token economics — cost as a first-class design input

Cost isn't an afterthought; it's routed like a resource:

- **Model tiering by task.** Read-only, rule-based work (exploration, review, UI verification) runs on the cheapest model — roughly a 15× cost reduction versus running everything on the top tier. Multi-step reasoning gets the mid tier; only genuine architecture judgment gets the top model.
- **Deterministic tools over LLM calls.** Code location is a cached, semantic, *non-LLM* script (0.1–0.5s, ~0.06s on repeat) — zero tokens, zero hallucination — instead of an agent burning context on grep loops.
- **Context budget as a hard constraint.** The memory index is capped at 200 lines because the agent truncates auto-loaded context past that point — so completed/historical memories move to an archive file (still searchable via JIT) while the live index stays lean. I engineered directly against the context-window limit.

## 6. Measurement & impact

I'll be honest about what's measured versus estimated:

**Measured (from the repo):** 579 team memories, 152 solutions, 58 retros, 19 ADRs; ~40% context reduction via isolation; sub-second deterministic code location; 64% CodingKeys-absent as the quantified silent-nil surface; harness changes gated by Wilson-score 95% confidence intervals on a 22-task golden set — if intervals overlap, the change is rejected as noise.

**Reasonably estimated:** each silent-nil caught pre-ship removes a live-server hotfix worth hours-to-days of response cost; a new engineer clones and inherits ~3.5 months of accumulated pitfalls instantly, because 579 memories are searchable from day one instead of living in senior engineers' heads.

## 7. Why this is the story for an AI-forward role

- It's the **complete "put an agent into production" artifact** — not a toy, a real large-scale app with no safety net, which is exactly the FDE problem: *how do we safely adopt this at a customer?* This repo is the answer.
- It's **failure-taxonomy-driven defensive design** — every guard is reverse-engineered from an incident we actually hit, via a closed loop: incident → memory → hook → ADR. That's measurement-driven harness engineering, not abstract best practice.
- It's **knowledge as a git-native team asset** — casting memory into auto-merged PRs promotes one engineer's private context into a compounding team knowledge graph. The system gets stronger as the team and session count grow.
- And it demonstrates the full stack an AI engineer is hired for: **prompt engineering, context engineering, agent orchestration, evals, and token economics** — each shipped and each measured.

**Closing line:** I'm not the person who's fast because they use AI. I'm the person who builds the AI system a team can safely rely on — and who measures it, gates it, and makes it compound.

---

## Appendix — fast-recall numbers (for follow-up questions)

| Signal | Value |
|---|---|
| Harness skills / agents / commands | 59 / 17 / 16 |
| Lifecycle hooks (guards + gates) | 46 Claude hooks (+6 git hooks) |
| Team memories (feedback / reference / project) | 579 (374 / 159 / 44) |
| Solutions / retros / ADRs / research docs | 152 / 58 / 19 / 66 |
| Scripts / tracked files / commits | 176 / 1,515 / ~800 |
| MCP server tools (unit-tested TS) | 6 (`search_memory`, `add_memory`, `wiki_query`, `harness_status`, `harness_pull`, `harness_health`) |
| Model-tier cost delta | ~15× cheaper on read-only tier |
| Context saved via isolation | ~40% (9K vs 15K tokens) |
| Silent-nil surface (measured) | 64% of DTOs (123/191) no CodingKeys |
| Eval gate | Wilson-score 95% CI on 22-task golden set |

## Appendix — escalation ladder (the self-improvement mechanism)

A repeated failure climbs a ladder, each rung a stronger gate:

1st occurrence → cast a memory · 2nd → inline the rule into the agent/skill · 3rd → promote to a hard rule in the operating doc · 4th → fix it in hook code (behavioral enforcement) · recurrence after fix → structural ADR · 5th+ → architecture redesign.

The point: **a mistake can only happen a bounded number of times before it becomes impossible.** The harness folds its own failures into guard code — which is why the codebase reads like a log of everything it learned not to do.
