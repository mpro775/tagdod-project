---
name: flutter-refactor
description: Improve, clean up, and safely refactor Flutter and Dart codebases. Use when Codex is asked to review, simplify, restructure, or modernize Flutter code; split oversized widgets or pages; clean up Cubit, Bloc, Riverpod, Provider, GetX, or local state logic; move business logic out of UI; reduce duplication; improve naming, testability, and maintainability across lib, test, pubspec.yaml, analysis_options.yaml, and related Dart files.
---

# Flutter Refactor

Use this skill to make behavior-preserving improvements in Flutter apps. Learn the local architecture first, then apply the smallest refactor that removes the highest-friction smell.

## Quick Start

1. Inspect `pubspec.yaml`, `analysis_options.yaml`, `lib/`, and a nearby feature that already looks well-structured.
2. Detect the state-management, routing, DI, and codegen stack before proposing abstractions.
3. If the target area is broad or unclear, run `python scripts/flutter_refactor_hotspots.py <flutter-project-root>`.
4. Choose one primary refactor shape and keep the change set narrow.
5. Validate with formatting, analysis, and the narrowest relevant tests.

## Required Workflow

### 1. Build local context

- Use `rg --files` and `rg` to find feature boundaries, call sites, and repeated patterns.
- Infer conventions from the repo instead of imposing a new architecture.
- Read `references/state-management.md` only after identifying the active library.
- Read `references/flutter-smells.md` when the code feels messy but the best cut is unclear.

### 2. Classify the job

Choose the primary category before editing:

- widget decomposition
- state-management cleanup
- async and side-effect isolation
- feature and module boundary cleanup
- model, mapper, and type cleanup
- performance and rebuild reduction
- testability improvement

### 3. Pick the smallest safe refactor

Prefer:

- Extract private widgets or section widgets when `build()` is long or deeply nested.
- Move mapping, formatting, parsing, and IO orchestration out of widgets.
- Split mixed responsibilities in Cubits, Notifiers, and Controllers before adding helpers.
- Replace boolean parameter clusters with enums or small immutable config objects.
- Extract pure helpers or extensions for duplicated formatting or mapping logic.
- Preserve public APIs unless the payoff and validation are strong.

Avoid:

- Re-architecting the whole app when a local refactor solves the problem.
- Introducing a new state-management library or DI approach.
- Hiding navigation, snackbars, or network calls inside low-level utility classes.
- Large renames or folder moves without strong validation.

### 4. Validate deliberately

- Format only touched files.
- Run `flutter analyze` or `dart analyze` from the Flutter app root.
- Run the smallest relevant tests first.
- Add focused tests if risky logic was extracted and coverage was missing.
- Use `references/refactor-checklist.md` before finishing.

## Hotspot Script

Use `scripts/flutter_refactor_hotspots.py` when the user asks for a broad cleanup, a refactor plan, or "find the worst files first".

```bash
python scripts/flutter_refactor_hotspots.py <flutter-project-root>
python scripts/flutter_refactor_hotspots.py <flutter-project-root> --top 20 --json
```

Treat the output as a prioritization hint, not proof. Confirm candidate files by reading them.

## Default Heuristics

- Long page or widget file: split visual sections first, then extract behavior.
- Widget with repositories, services, storage, or network calls: move orchestration to the local state layer or a nearby collaborator that matches the repo's architecture.
- State file with many unrelated booleans: group by mode or status, or extract smaller state objects.
- Repeated UI branches with mostly shared structure: extract a shared widget only if call sites stay readable.
- Heavy logic inside `build()`: precompute outside build, move to a view model or helper, or cache safely in state.
- Partial helper files already exist for the feature: extend that pattern instead of inventing a new one.

## Resources

- Read `references/flutter-smells.md` for smell-to-refactor mappings and anti-patterns.
- Read `references/state-management.md` after detecting `flutter_bloc`, `riverpod`, `provider`, `get`, or plain `setState`.
- Read `references/refactor-checklist.md` before signoff.

## Output

When finishing a task with this skill:

- State what was refactored and why.
- Mention validation commands that were run.
- Call out remaining risks or intentionally unchanged areas.
- If the user asked for review only, prioritize concrete findings and safe next refactors over a broad rewrite plan.
