---
title: How to create a free static website using GitHub Pages.
date: Jan 12, 2025
summary: Learn how to create a static website without any frameworks using HTML, CSS, and a few npm packages. We bundle our scripts using Rollup and deploy the site for free using GitHub Pages.
---

# Purpose
# CSS Grid

&nbsp;

# Structure

This is the basic structure of the website. There are still more things to consider on the development branch with node modules and bundling, but this is how the website will be served to its users. 

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

```bash
npm install marked marked-highlight highlight.js front-matter

npm install rollup @rollup/plugin-commonjs @rollup/plugin-node-resolve --save-dev
```

Add this build command to your `package.json` under `scripts`:

```javascript
"scripts": {
    "build": "rollup --config"
}
```

Append this rule to your `package.json` to suppress errors with rollup:

```javascript
"type": "module"
```

Create a `rollup.config.js` that looks like this. When you run `rollup --config`, it looks for a predefined config file and executes that. Rollup takes each `input` and bundles it with its imports to create the `output`. You can export an array of bundles.

```javascript
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
    {
        input: 'src/file.js',
        output: {
            file: 'dist/scripts/file.js',
            format: 'iife'
        },
        plugins: [
            nodeResolve(),
            commonjs()
        ]
    },
];
```

`iife` stands for "immediately-invoked Function Expression"; a self-executing function, suitable for inclusion as a `<script>` tag, which is our use case.

&nbsp;

# Basic HTML Layout

All `.html` pages will mimic this basic layout. Using CSS Grid, `<main>` will be split into (usually) three columns and may also be split into rowns. Each `<div>` elevement we can place in the center column. This layout is mobile phone friendly and easy to read.

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title><!-- title --></title>
<!-- Link Stylesheets -->
        <link rel="stylesheet" href="styles/palette.css">
        <link rel="stylesheet" href="styles/reset.css">
        <link rel="stylesheet" href="styles/navbar.css">
        <link rel="stylesheet" href="styles/unique.css">
    </head>
    <body>
<!-- Navbar -->
        <div id="navbar"></div> 
<!-- Main Content -->
        <main>
            <div>
                ...
            </div>
        </main>
    </body>
<!-- Scripts -->
    <script src=""></script>
</html>
```

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

# Scripts

```javascript
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from 'highlight.js';
import fm from 'front-matter';

const marked = new Marked(
    markedHighlight({
        emptyLangClass: 'hljs',
        langPrefix: 'hljs language-',
        highlight(code, lang, info) {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, { language }).value;
        }
    })
);

let params = new URLSearchParams(document.location.search);
let title = params.get("title");
if (title) {
    fetch('posts/' + title  + '.md')
        .then((response) => {
            return response.text();
        })
        .then((text) => {
            let content = fm(text);
            document.getElementById('title').innerHTML = 
                marked.parse(
                    '# ' + content.attributes.title + '\n\n' + 
                    '### ' + content.attributes.date
                );
            document.getElementById('content').innerHTML = 
                marked.parse(content.body);
        })
        .catch((err) => {
            document.getElementById('content').innerHTML = 
                marked.parse('# File Not Found');
            console.error(err);
        })
} else {
    document.getElementById('content').innerHTML = 
        marked.parse('# File NULL');
    console.error("ERROR::FILE::NULL");
}
```

```javascript
import fm from 'front-matter';

const posts = [/* Post Filenames */];

posts.forEach(append);

function append(title) {
    const t = title;
    fetch('posts/' + title  + '.md')
        .then((response) => {
            return response.text();
        })
        .then((text) => {
            const content = fm(text);
            const template = document.getElementById('listItem');
            const clone = template.content.cloneNode(true);

            const anchor = clone.querySelector('a');
            anchor.href = 'post.html?title=' + t;

            const title = clone.querySelector('#post-title');
            title.textContent = content.attributes.title;

            const date = clone.querySelector('#post-date')
            date.textContent = content.attributes.date;

            const summary = clone.querySelector('#post-summary');
            summary.textContent = content.attributes.summary;

            document.getElementById('list').appendChild(clone);
        })
        .catch((err) => {
            console.error(err);
        })
}
```

```html
<div id="list">
    <ul></ul>
    <template id="listItem">
        <li><a href="post.html?title=">
            <h2 id="post-title"></h2><br/>
            <p id="post-summary"></p><br/>
            <p id="post-date"></p>
        </a></li>
    </template>
</div>
```

&nbsp;

# Scalable Vector Graphics

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

&nbsp;

# Creating a New Post

Creating a new post is almost as simple as creating a new markdown file. It isn't exactly that easy, because we still need to direct towards it. I'm not sure of a method to search a filesystem through the web so I settled for maintaining an ordered list of all posts in `post.js` and using `fetch()` since we don't have access to Node's filesystem. Thus, creating a new post is as simple as creating a new markdown file and adding the filename to the front of the ordered list.

&nbsp;

Once you've dealt with that minor inconvenience, you're good to go. You can also run this site with a local server and see the result as you write the post in markdown. The homepage will fetch all the posts and read their metadata as it fills in the list. When you click on a post it will fetch it again and parse the markdown content. A markdown file might light like this:

```yaml
---
title: title
data: date
summary: summary
---
content
```

# Conclusion

At this point you probably don't have a completed website, but you should have some idea of how to get there. You've also learned how you can serve files through the web without the use of Node.js. And this should have also showed you how can make a blog & portfolio website with dynamic content generation from scratch (minus borrowing a markdown parser) and host it without any cost. I appreciate you if you've read this far.