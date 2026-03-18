#!/usr/bin/env python3
"""
Heuristic scanner for Flutter and Dart refactor hotspots.

Use this to prioritize which files deserve attention first. The output is
advisory only and should be confirmed by reading the reported files.
"""

from __future__ import annotations

import argparse
import json
import os
import re
from dataclasses import asdict, dataclass
from pathlib import Path

EXCLUDED_DIRS = {
    ".dart_tool",
    ".git",
    ".idea",
    ".vscode",
    ".fvm",
    "android",
    "build",
    "ios",
    "linux",
    "macos",
    "windows",
}

GENERATED_SUFFIXES = (
    ".g.dart",
    ".freezed.dart",
    ".gen.dart",
    ".gr.dart",
    ".mocks.dart",
    ".config.dart",
    ".chopper.dart",
    ".pb.dart",
    ".pbenum.dart",
    ".pbjson.dart",
    ".gql.dart",
)

WIDGET_CLASS_PATTERN = re.compile(
    r"extends\s+(?:\w+\.)?"
    r"(?:StatelessWidget|StatefulWidget|ConsumerWidget|ConsumerStatefulWidget|"
    r"HookWidget|HookConsumerWidget|HookConsumerStatefulWidget)"
)
CLASS_PATTERN = re.compile(r"^\s*class\s+([A-Za-z_]\w*)", re.MULTILINE)
BUILD_PATTERN = re.compile(r"\bbuild\s*\(\s*BuildContext\b")
IF_PATTERN = re.compile(r"\bif\s*\(")
SWITCH_PATTERN = re.compile(r"\bswitch\s*\(")
TODO_PATTERN = re.compile(r"\b(?:TODO|FIXME|HACK)\b")
BOOL_FIELD_PATTERN = re.compile(r"\bbool\s+\w+")

BUSINESS_LOGIC_PATTERNS = {
    "repository": re.compile(r"\b\w*(?:Repository|_repository)\b"),
    "datasource": re.compile(r"\b\w*(?:DataSource|Datasource|_datasource)\b"),
    "service": re.compile(r"\b\w*(?:Service|_service)\b"),
    "http": re.compile(r"\bhttp\."),
    "dio": re.compile(r"\bdio\."),
    "firebase": re.compile(r"\bFirebase\b"),
    "storage": re.compile(r"\b(?:SharedPreferences|sqflite|Isar|Hive)\b"),
    "json": re.compile(r"\bjson(?:Decode|Encode)\("),
    "client": re.compile(r"\b\w*Client\b|\bclient\."),
}

PAGE_FILE_TOKENS = ("page", "screen", "view")
STATE_FILE_SUFFIXES = ("_state.dart", "state.dart")


@dataclass
class Hotspot:
    path: str
    score: int
    total_lines: int
    longest_build_lines: int
    class_count: int
    public_class_count: int
    set_state_count: int
    conditional_count: int
    todo_count: int
    bool_field_count: int
    reasons: list[str]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Scan a Flutter/Dart tree for likely refactor hotspots."
    )
    parser.add_argument("path", help="Flutter app or Dart project root")
    parser.add_argument("--top", type=int, default=10, help="Number of hotspots to print")
    parser.add_argument("--json", action="store_true", help="Emit JSON output")
    parser.add_argument(
        "--include-tests",
        action="store_true",
        help="Include files under test/ and integration_test/",
    )
    return parser.parse_args()


def should_skip_dir(dirname: str) -> bool:
    return dirname in EXCLUDED_DIRS or dirname.startswith(".symlinks")


def is_generated_file(path: Path) -> bool:
    return any(path.name.endswith(suffix) for suffix in GENERATED_SUFFIXES)


def is_test_file(root: Path, path: Path) -> bool:
    relative_parts = [part.lower() for part in path.relative_to(root).parts]
    return "test" in relative_parts or "integration_test" in relative_parts


def iter_dart_files(root: Path, include_tests: bool) -> list[Path]:
    results: list[Path] = []
    for current_root, dirs, files in os.walk(root):
        dirs[:] = [dirname for dirname in dirs if not should_skip_dir(dirname)]
        current_path = Path(current_root)
        for filename in files:
            if not filename.endswith(".dart"):
                continue
            path = current_path / filename
            if is_generated_file(path):
                continue
            if not include_tests and is_test_file(root, path):
                continue
            results.append(path)
    return results


def longest_build_span(lines: list[str]) -> int:
    longest = 0
    for index, line in enumerate(lines):
        if not BUILD_PATTERN.search(line):
            continue

        brace_balance = 0
        seen_open = False
        span_end = index

        for inner_index in range(index, len(lines)):
            current = lines[inner_index]
            opens = current.count("{")
            closes = current.count("}")
            if opens:
                seen_open = True
            brace_balance += opens - closes
            span_end = inner_index
            if seen_open and brace_balance <= 0:
                break

        span = span_end - index + 1 if seen_open else 1
        if span > longest:
            longest = span
    return longest


def analyze_file(root: Path, path: Path) -> Hotspot | None:
    text = path.read_text(encoding="utf-8", errors="ignore")
    lines = text.splitlines()
    total_lines = len(lines)
    class_names = CLASS_PATTERN.findall(text)
    public_class_count = sum(1 for name in class_names if not name.startswith("_"))
    class_count = len(class_names)
    widget_class_count = len(WIDGET_CLASS_PATTERN.findall(text))
    build_span = longest_build_span(lines)
    set_state_count = text.count("setState(")
    conditional_count = len(IF_PATTERN.findall(text)) + len(SWITCH_PATTERN.findall(text))
    todo_count = len(TODO_PATTERN.findall(text))
    bool_field_count = len(BOOL_FIELD_PATTERN.findall(text))

    score = 0
    reasons: list[str] = []

    if total_lines >= 250:
        score += 2
        reasons.append(f"{total_lines} lines")
    if total_lines >= 400:
        score += 2

    if build_span >= 60:
        score += 2
        reasons.append(f"longest build() spans about {build_span} lines")
    if build_span >= 100:
        score += 2

    if class_count > 2:
        score += 1
        reasons.append(f"{class_count} classes in one file")

    if public_class_count > 1:
        score += 1

    if set_state_count >= 1:
        score += 1
        reasons.append(f"{set_state_count} setState() calls")
    if set_state_count >= 4:
        score += 1

    if conditional_count >= 12:
        score += 1
        reasons.append(f"{conditional_count} conditionals")

    if todo_count >= 1:
        score += 1
        reasons.append(f"{todo_count} TODO/FIXME/HACK markers")

    business_logic_hits = sorted(
        {
            label
            for label, pattern in BUSINESS_LOGIC_PATTERNS.items()
            if pattern.search(text)
        }
    )
    if widget_class_count and business_logic_hits:
        score += 2
        reasons.append("widget file references service, repository, or network/storage tokens")

    await_count = len(re.findall(r"\bawait\b", text))
    if widget_class_count and await_count >= 4:
        score += 1
        reasons.append(f"{await_count} await expressions in widget file")

    lower_name = path.name.lower()
    if any(token in lower_name for token in PAGE_FILE_TOKENS) and total_lines >= 200:
        score += 1
        reasons.append("large page or screen file")

    if lower_name.endswith(STATE_FILE_SUFFIXES) and bool_field_count >= 4:
        score += 1
        reasons.append(f"{bool_field_count} bool fields in a state file")

    if score == 0:
        return None

    relative_path = path.relative_to(root).as_posix()
    return Hotspot(
        path=relative_path,
        score=score,
        total_lines=total_lines,
        longest_build_lines=build_span,
        class_count=class_count,
        public_class_count=public_class_count,
        set_state_count=set_state_count,
        conditional_count=conditional_count,
        todo_count=todo_count,
        bool_field_count=bool_field_count,
        reasons=reasons,
    )


def sort_hotspots(hotspots: list[Hotspot]) -> list[Hotspot]:
    return sorted(
        hotspots,
        key=lambda item: (
            -item.score,
            -item.total_lines,
            -item.longest_build_lines,
            item.path,
        ),
    )


def emit_text(root: Path, scanned_files: int, hotspots: list[Hotspot], top: int) -> None:
    print(f"Scanned {scanned_files} Dart files under {root}")
    print("Excluded generated files by default.")
    print()
    if not hotspots:
        print("No hotspots matched the current heuristics.")
        return

    print(f"Top {min(top, len(hotspots))} hotspots:")
    for index, hotspot in enumerate(hotspots[:top], start=1):
        print(f"{index}. {hotspot.path} (score {hotspot.score})")
        for reason in hotspot.reasons:
            print(f"   - {reason}")


def main() -> int:
    args = parse_args()
    root = Path(args.path).resolve()
    if not root.exists():
        raise SystemExit(f"Path does not exist: {root}")

    dart_files = iter_dart_files(root, include_tests=args.include_tests)
    hotspots = sort_hotspots(
        [hotspot for path in dart_files if (hotspot := analyze_file(root, path))]
    )

    if args.json:
        payload = {
            "root": str(root),
            "scanned_files": len(dart_files),
            "reported_files": len(hotspots),
            "hotspots": [asdict(item) for item in hotspots[: args.top]],
        }
        print(json.dumps(payload, indent=2))
    else:
        emit_text(root, len(dart_files), hotspots, args.top)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
