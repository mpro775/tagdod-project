# Flutter Smells

## Smell to Action Map

- `build()` exceeds roughly 80 lines or has many nested branches:
  Extract private widgets or section widgets before adding helpers.
- Widget file performs repository, datasource, storage, or networking work:
  Move orchestration into Cubit, Notifier, Controller, or service that matches the current architecture.
- Same formatter, mapper, or null-handling logic appears in multiple widgets:
  Extract a pure helper or extension near the boundary where the logic belongs.
- Page owns form state, loading state, submit flow, snackbars, and navigation:
  Split visual composition from submission orchestration.
- State object accumulates many unrelated booleans:
  Replace flag soup with grouped status, sealed states, or smaller state objects.
- Presentation code depends on `Map<String, dynamic>` or raw JSON:
  Introduce typed DTO, entity, or view-data objects where repeated parsing happens.
- Widget creates controllers, focus nodes, repositories, or expensive objects on rebuild:
  Move lifecycle-owned objects to state, DI, or the owning state-management layer.
- Similar widgets differ only by labels, icons, or a small style branch:
  Extract a shared component only if call sites remain more readable than the duplicated version.

## Anti-Patterns

- Do not introduce a generic `utils.dart` just to move code out of a crowded file.
- Do not extract one-line wrappers that add names but no meaning.
- Do not migrate state-management frameworks unless the user explicitly asks.
- Do not force clean architecture naming if the repo already uses a different stable pattern.
- Do not hide side effects inside extensions, formatters, or model objects.

## Order of Attack

1. Split visual sections.
2. Move side effects and orchestration.
3. Simplify state shape.
4. Type repeated dynamic data.
5. Remove duplication after structure is clearer.
