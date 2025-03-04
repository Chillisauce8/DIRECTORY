#!/bin/bash

# Navigate to the git repository
cd "$(git rev-parse --show-toplevel)" || exit

echo "Fixing broken Git references..."

# More complete search for broken refs
echo "Searching for files with spaces in their names in .git directory..."
find .git/refs -name "* *" -type f | while read -r file; do
    echo "Found broken ref: $file"
    rm -f "$file"
    echo "Removed broken ref: $file"
done

# Specifically check for the known problematic files
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

# Check packed-refs file
if [ -f ".git/packed-refs" ]; then
    echo "Checking packed-refs file..."
    if grep -q " refs/heads/.*[[:space:]]" .git/packed-refs; then
        echo "Found broken refs in packed-refs, cleaning up..."
        grep -v " refs/heads/.*[[:space:]]" .git/packed-refs > .git/packed-refs.tmp
        mv .git/packed-refs.tmp .git/packed-refs
    fi
    
    # Also specifically check for the known problematic refs
    if grep -q "main 2" .git/packed-refs; then
        echo "Cleaning main 2 from packed-refs..."
        grep -v "main 2" .git/packed-refs > .git/packed-refs.tmp
        mv .git/packed-refs.tmp .git/packed-refs
    fi

    if grep -q "nuxt-layers-migration 2" .git/packed-refs; then
        echo "Cleaning nuxt-layers-migration 2 from packed-refs..."
        grep -v "nuxt-layers-migration 2" .git/packed-refs > .git/packed-refs.tmp
        mv .git/packed-refs.tmp .git/packed-refs
    fi
fi

# Look in refs directory more thoroughly
echo "Checking for any additional problematic files in refs directory..."
find .git -type f -name "* *" -exec rm -f {} \;

# Fix any other potential issues
echo "Running git maintenance..."
git gc --prune=now
git reflog expire --expire=now --all
git repack -ad
git prune

echo "Done! Try committing again. If issues persist, you might need to:"
echo "1. Check for any remaining files with spaces in .git directory"
echo "2. Consider recreating the repository by cloning it fresh"
