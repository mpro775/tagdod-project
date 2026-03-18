# State Management Guidance

Do not migrate frameworks unless the user explicitly asks. Refactor within the library the project already uses.

## Plain `setState`

- Keep local UI state local when it is truly local.
- Move async workflows, repository calls, and submit orchestration out of the widget when they start to dominate the page.
- Extract private widgets before introducing a heavier state layer.

## `flutter_bloc` and `bloc`

- Keep state immutable and focused on renderable state.
- Move parsing, mapping, and orchestration out of the widget tree and into Cubit collaborators or pure helpers.
- Prefer fewer, clearer state transitions over many boolean flags.
- Avoid placing navigation or snackbar behavior in repositories.

## Riverpod

- Keep providers narrow and purposeful.
- Move imperative workflows into `Notifier`, `AsyncNotifier`, or a dedicated collaborator instead of large widget callbacks.
- Avoid reading providers deep in leaf widgets when passing data down is simpler and clearer.
- Preserve existing provider families and naming patterns unless there is a clear bug.

## Provider and `ChangeNotifier`

- Reduce mutable surface area.
- Extract derived values and formatting into pure helpers where possible.
- Keep IO out of leaf widgets.
- Split oversized notifiers by feature boundary before creating generic base classes.

## GetX

- Reduce controller sprawl.
- Keep UI-only reactive values local to the owning controller or widget.
- Split controllers when one class owns navigation, forms, network calls, and filtering logic together.
- Avoid mixing storage, transport, and presentation formatting in one controller.

## Cross-Cutting Rule

Match the surrounding code. Consistency with the existing feature slice is usually more valuable than a theoretically cleaner but foreign pattern.
