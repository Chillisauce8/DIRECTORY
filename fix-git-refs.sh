#!/bin/bash

# Navigate to the git repository
cd "$(git rev-parse --show-toplevel)" || exit

echo "Fixing broken Git references..."

# Check for broken refs with spaces in their names
if [ -f ".git/refs/heads/main 2" ]; then
    echo "Found broken ref: main 2"
    rm -f ".git/refs/heads/main 2"
    echo "Removed broken ref: main 2"
fi

if [ -f ".git/refs/heads/nuxt-layers-migration 2" ]; then
    echo "Found broken ref: nuxt-layers-migration 2"
    rm -f ".git/refs/heads/nuxt-layers-migration 2"
    echo "Removed broken ref: nuxt-layers-migration 2"
fi

# Clean up packed-refs if needed
if grep -q "main 2" .git/packed-refs 2>/dev/null; then
    echo "Cleaning packed-refs file..."
    grep -v "main 2" .git/packed-refs > .git/packed-refs.tmp
    mv .git/packed-refs.tmp .git/packed-refs
fi

if grep -q "nuxt-layers-migration 2" .git/packed-refs 2>/dev/null; then
    echo "Cleaning packed-refs file..."
    grep -v "nuxt-layers-migration 2" .git/packed-refs > .git/packed-refs.tmp
    mv .git/packed-refs.tmp .git/packed-refs
fi

# Fix any other potential issues
echo "Running git maintenance..."
git gc --prune=now

echo "Done! Try committing again."
