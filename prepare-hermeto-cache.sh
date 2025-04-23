#!/usr/bin/env bash

set -euo pipefail

echo "📦 Preparing .yarn-cache for Hermeto offline build..."

CACHE_DIR=$(yarn cache dir)
DEST_DIR=".yarn-cache"

echo "📂 Yarn cache directory: $CACHE_DIR"
echo "📁 Outputting tarballs to: $DEST_DIR"

mkdir -p "$DEST_DIR"

# Copy all relevant .tgz files from the v6-style cache
find "$CACHE_DIR" -type f -name "*.tgz" -exec cp {} "$DEST_DIR" \;

echo "✅ Copied $(ls -1 "$DEST_DIR" | wc -l) packages to .yarn-cache"

