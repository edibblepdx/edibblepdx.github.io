#!/usr/bin/env bash

# move changes into deployment branch
git checkout gh-pages && git merge main

if [[ "$(git branch --show-current)" == "gh-pages" ]]; then
    # move all files into .gitignore
    : > .gitignore
    for filename in *; do
        echo "$filename" >> .gitignore
    done

    # move distribution files into root
    mv dist/* .

    # stage and push files
    git add --all \
    && git commit -m "$(date)" \
    && git push -u origin gh-pages

    # go back to main branch
    git checkout main
    echo "SUCCESS"
else
    echo "FAILURE"
    exit 1
fi