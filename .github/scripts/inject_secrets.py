#!/usr/bin/env python3
"""Replace {{PLACEHOLDER}} in non-react-index.html with values from environment variables.
Secrets are read from os.environ so no shell/sed interpretation; newlines preserved.
"""
import os

PLACEHOLDERS = [
    "SORYN_USER",
    "SORYN_PASS",
    "GUEST_USER",
    "GUEST_PASS",
    "JSONBIN_API_KEY",
    "JSONBIN_BIN_ID",
    "IMGBB_API_KEY",
]

HTML_PATH = "non-react-index.html"


def main() -> None:
    with open(HTML_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    for name in PLACEHOLDERS:
        placeholder = "{{" + name + "}}"
        value = os.environ.get(name, "")
        content = content.replace(placeholder, value)

    with open(HTML_PATH, "w", encoding="utf-8", newline="") as f:
        f.write(content)


if __name__ == "__main__":
    main()
