#!/usr/bin/env bash

# move changes into deployment branch
git branch -D gh-pages > /dev/null 2>&1
git switch --orphan gh-pages && git checkout main dist

if [[ "$(git branch --show-current)" == "gh-pages" ]]; then
    echo "node_modules" >> .gitignore
    touch .nojekyll

    # move distribution files into root
    mv dist/* .

    # stage and push files
    git add --all \
    && git commit -m "$(date)" \
    && git push -u origin gh-pages --force

    # go back to main branch
    git checkout main
    echo "SUCCESS"
else
    echo "FAILURE"
    exit 1
fi