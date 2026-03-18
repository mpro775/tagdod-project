# Refactor Checklist

## Before Editing

- Find the Flutter app root and confirm where `pubspec.yaml` lives.
- Read `analysis_options.yaml` if it exists.
- Detect state management, routing, DI, and codegen packages from `pubspec.yaml`.
- Read one adjacent feature that already looks clean to infer local conventions.
- Decide whether the job is behavior-preserving refactor or behavior change.

## Smell Triage

- Can a private widget or small helper solve this without new architecture?
- Is the duplication semantic, or only superficial text duplication?
- Is the abstraction local to one feature, or genuinely reusable?
- Is the current pain in UI composition, state ownership, side effects, typing, or performance?
- Will the proposed split make ownership clearer after one week, not only today?

## Safe Edit Rules

- Keep the change set narrow and reversible.
- Preserve public APIs unless the improvement clearly justifies the sweep.
- Do not mix unrelated cleanup into the same edit.
- Keep side effects explicit and close to the state layer that owns them.
- Prefer typed models and pure helpers over generic utility dumping grounds.
- Continue existing feature splits if the repo already uses helper, partial, or section files.

## Validation

- Format touched files.
- Run `flutter analyze` or `dart analyze`.
- Run the narrowest relevant tests.
- Add focused tests for extracted pure logic when coverage is missing.
- Re-read the changed files once after formatting to catch awkward abstractions.

## Final Review Questions

- Is `build()` smaller or easier to scan?
- Is the side-effect owner clearer than before?
- Did rebuild scope get narrower or stay the same?
- Is duplicated logic now isolated without hiding intent?
- Are naming and types clearer?
- Did the refactor avoid changing behavior unless requested?
