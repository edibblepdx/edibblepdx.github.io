---
title: How to create a free static website using GitHub Pages.
date: Jan 12, 2025
summary: Learn how to create a static website without any frameworks using HTML, CSS, and a few npm packages. We bundle our scripts using Rollup and deploy the site for free using GitHub Pages.
---
# Structure

This is the basic structure of the website. There are still more things to consider on the development branch with node modules and bundling, but this is how the website will be served to it's users. 
```
📁 dist/
├── 📁 posts/
│   └── 📰 post.md
├── 📁 resources/
│   ├── 📰 image.svg
│   └── 📰 resume.pdf
├── 📁 scripts/
│   └── 📰 script.js
├── 📁 styles/
│   ├── 📰 style.css
│   ├── 📰 palette.css
│   ├── 📰 navbar.css
│   └── 📰 reset.css
├── 📰 index.html
├── 📰 post.html
└── 📰 resume.html
```
It only has 3 pages: `index.html`, `post.html`, and `resume.html`. Each of those pages will include the `palette.css`, `reset.css`, `navbar.css`, and `unique.css` stylesheets. The `posts.html` page is simply boilerplate; it will take a title as a search parameter and serve the corresponding markdown file.

&nbsp;

# Let's Begin

Create a new GitHub repository called `username.github.io` and clone that repository into an empty folder, then initialize a new npm project.
```
git clone git@github.com:username/username.github.io.git website
cd website
npm init
```
We require **rollup** for bundling our scripts, **markedjs** for parsing markdown files, **highlight.js** for code syntax highlighting, **marked-highlight** to use highlight.js with markedjs, and **front-matter** to store YAML-style metadata in our markdown files. If you don't want to use npm packages you can instead use a CDN to include the scripts in HTML, or forgo all of these if you want to write all your posts as separate pages in HTML and don't care about syntax highlighting for code. If you get lost, [check out the source code for this website](https://github.com/edibblepdx/edibblepdx.github.io).

&nbsp;

# Stylesheets
I won't won't spend much time on stylesheets, but I will explain the purpose of each one in the order that I include them in each page. If you want a reference, [MDN Web Docs](https://developer.mozilla.org/en-US/) is a good resource.

&nbsp;

`palette.css` includes global variables that define my hex color codes.

```css
:root {
    --soft-white: #d0d0d0;
    --soft-black: #222222;
    --soft-gray: #2a2a2a;
    --shadow: #1f1f1f;
}  
```

&nbsp;

`reset.css` uses [Josh W Comeau's "A Modern CSS Reset"](https://www.joshwcomeau.com/css/custom-css-reset/). Since this stylesheet will be included everywhere, I appended this to the bottom:
```css
html, body {
    height: 100%;
    margin: 0;
    background-color: var(--soft-black);
    font-size: 20px;
    scroll-behavior: smooth;
    color: var(--soft-white);
    font-family: 'Roboto', sans-serif;
}
```

&nbsp;

`navbar.css` styles the navbar on each html page.

&nbsp;

`unique.css` is unique to each html page and shares the same name.

&nbsp;

# Scalable Graphics

For adding solid-color scalable graphics I recommend using svgs. They don't lose quality when scaled and can be resized or colored directly in the file or with CSS without filters.

&nbsp;

An svg file might look like this:
```svg
<svg xmlns="http://www.w3.org/2000/svg"
viewBox="0 0 98 96"
width="98" 
height="96">
<path d="[data]" 
fill="#d0d0d0"/></svg>

<!-- using an HTML img tag -->
<img src="path_to_my_svg"></img>
```
We care about the parameters: **viewBox**, **width**, **height**, and **fill**. If your svg has no viewBox parameter you should add it and set the value to `"0 0 width, height"`. The viewBox parameter defines the visible region of our svg; if you were to modify the width or height without it, the svg would be clipped. Width and height do what you might expect, and fill takes a color as a hex color code.

&nbsp;

# Deployment

GitHub Pages serves your website through the `index.html` in the `root/` directory of your repository. But you may also pick to deploy from a branch other than main: I created a branch called `gh-pages` (because that seemed most common) and deployed my website from there.

&nbsp;

To move `dist/` files into that branch I created a bash script:
```bash
#!/usr/bin/env bash

# create new deployment branch, deleting the old one
git branch -D gh-pages > /dev/null 2>&1
git switch --orphan gh-pages && git checkout main dist

# fail if any uncommited changes
if [[ "$(git branch --show-current)" == "gh-pages" ]]; then
    # append untracked files to .gitignore
    for filename in *; do
        echo "$filename" >> .gitignore
    done

    # move distribution files into root
    mv dist/* .
    touch .nojekyll

    # stage, commit, and push files
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
```
To summarize: this script will create a new empty branch called `gh-pages`, deleting the old branch, checkout the files the `dist/` directory of the development branch, move them to `root/`, then push to and *replace* the remote branch of the same name.

&nbsp;

If you use this method, do not keep important files in the remote branch `gh-pages`; they will be *replaced* by the files in the `dist/` folder of the development branch. This script will fail if there are any uncommited changes, however untracked files will be visible in the new branch so we append them to a `.gitignore`. 

&nbsp;

GitHub Pages also uses Jekyll by default. This can cause problems if you aren't using Jekyll. The simple fix is to create a new file: `.nojekyll`. You might have noticed that Jekyll will cause your markdown files to be served at `root/posts/title` instead of `root/posts/title.md`. I personally did not want this behavior.
