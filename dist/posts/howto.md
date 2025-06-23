---
title: How I Created a Free Static Website Using GitHub Pages.
date: Jan 16, 2025
edited: Jan 16,2025
summary: >
    Learn how I created a static portfolio & blog website without any frameworks using HTML, CSS, and JavaScript. And utilizing Markedjs to parse markdown files. We bundle our scripts using Rollup and deploy the site for free using GitHub Pages.
---

# Purpose

The internet is, in my opinion, by far the easiest means of sharing ideas and projects. For that reason, I have wanted a portfolio website and it took me until now to create one. The truth is, that I have never been particularly invested in web development, but had still found myself interacting with it because I wanted my friends and family to have easy access to things like machine learning models that I've trained or 3D demo projects. My experience in web dev prior to this website was mostly limited to small single-featured demos, a chat app made in collaboration with another person, unstyled model interfaces made in python with Flask, and iframes for creating WebGL rendering contexts. My choice not to use any frameworks might be stubbornness, but I didn't want to abstract away any of the details. 

&nbsp;

My personal goal for this website is to share my projects, provide an interactive resume to potential employers, and give myself a somewhat informal environment to talk about things that I like or have done. I don't expect to post often, but perhaps expect me to share new projects, interesting math topics, personal interests, or just some short introspective thoughts. I learned a lot in planning and creating this website so I wanted to share that process as my first post to perhaps help others and to solidify my own personal understanding.

&nbsp;

# CSS Grid

I want to bring up CSS Grid first because I essentially designed this site around it. You'll notice that every page on this website is split into three columns (and possibly rows) with the main content in the center. I like this format because I personally feel that it is easy to read and that it simplifies viewing for mobile phones. CSS Grid enables such organization without too much hassle. 

&nbsp;

In a parent element set the the display style to `grid` and create the template. 

```css
main {
    display: grid;
    grid-template-rows: minmax(15rem, auto) 1fr;
    grid-template-columns: minmax(2rem, 1fr) minmax(0, 40rem) minmax(2rem, 1fr);
}
```

We can use media queries to change grid sizes or hide elements on small screens.

```css
/* hide toc on narrow screens */
@media only screen and (max-width: 40rem) {
    main {
        grid-template-columns: minmax(1rem, 1fr) minmax(0, 40rem) minmax(1rem, 1fr);
    }
    nav {display: none;}
}
```

For child elements, specify the grid row/column in which they belong.

```css
#title { grid-row: 1; grid-column: 2; }
main > div { grid-row: 2; grid-column: 2; }
main > nav { grid-row: 2; grid-column: 3; }
```

The result for this page is this:

![css-grid](https://i.ibb.co/gTJHgVB/css-grid.png)

&nbsp;

# Structure

This is the basic structure of the website. There are still more things to consider on the development branch with node modules and bundling, but this is how the website will be served to its users. 

```
📁 dist/
├── 📁 posts/
│   ├── 📰 posts.json
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

We require `rollup` for bundling our scripts, `markedjs` for parsing markdown files, `highlight.js` for code syntax highlighting, and `front-matter` to store YAML-style metadata in our markdown files. If you don't want to use npm packages you can instead use a CDN to include the scripts in HTML, or forgo all of these if you want to write all your posts as separate pages in HTML and don't care about syntax highlighting for code. If you get lost, [check out the source code for this website](https://github.com/edibblepdx/edibblepdx.github.io).

```bash
npm install marked highlight.js front-matter

npm install rollup @rollup/plugin-commonjs @rollup/plugin-node-resolve --save-dev
```

I'll also include some markedjs extensions: `marked-highlight`, `marked-katex-extension`, and `marked-gfm-heading-id`. Marked-highlight is necessary to use highlight.js with markedjs and marked-gfm-heading-id is also necessary for the table of contents. Marked-katex-extension lets markdownjs parse KaTeX which is a math typesetting library for the web based on TeX. I use LaTeX a lot for school and other work so of course I included it.

```
npm install marked-highlight marked-katex-extension marked-gfm-heading-id
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
/* rollup.config.js */

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

All `.html` pages will mimic this basic layout. Using CSS Grid, `<main>` will be split into (usually) three columns and may also be split into rows. Each `<div>` element we can place in the center column. This layout is mobile phone friendly and easy to read.

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

A lot of the content of this site is filled dynamically, but this site doesn't have a database, nor does it have access to Node's filesystem. In order to fill content dynamically from external files we need to use `fetch()`. `fetch()` is a JavaScript interface for making HTTP requests. It returns a promise that is fulfilled with a response object. A promise, guarantees that the value will be provided sometime in the future. This also means that pages are void of content when the DOM is loaded, so we need to delay operations on that content. For that I used custom JavaScript events.

&nbsp;

## post.js

The first script is `post.js`. The purpose of this script will be to parse markdown files and fill the content of each post. I mentioned previously that `post.html` is boilerplate for a post; its content is empty. Within the `<main>` element of `post.html`, there are two empty `<div>` tags. This script fills those elements dynamically.

```html
<!-- post.html -->

<body>
    ...
    <main>
        <div id="title"></div>
        <div id="content"></div>
    </main>
    ...
</body>
```

```javascript
/* post.js */
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import markedKatex from "marked-katex-extension";
import { gfmHeadingId, getHeadingList } from "marked-gfm-heading-id";
import hljs from 'highlight.js';
import fm from 'front-matter';

const marked = new Marked();
/* syntax highlighting */
marked.use(markedHighlight({
        emptyLangClass: 'hljs',
        langPrefix: 'hljs language-',
        highlight(code, lang, info) {
            const language = hljs.getLanguage(lang) ? lang : 'plaintext';
            return hljs.highlight(code, { language }).value;
        }
    })
);
/* LaTeX parsing */
marked.use(markedKatex({
        throwOnError: false
    })
);
/* header id's and toc postprocessing hook */
const options = {
    hooks: {
        postprocess(html) {
            const headings = getHeadingList();
            headings.map(({id, raw, level}) => {
                const template = document.getElementById('tocItem');
                const clone = template.content.cloneNode(true);

                const anchor = clone.querySelector('a');
                anchor.href = '#' + id;
                anchor.textContent = raw;

                const li = clone.querySelector('li');
                li.className = 'h' + level;

                document.getElementById("tocList").appendChild(clone);
            });
            return html;
        }
    }
}

const event = new Event('custom-content-loaded');
let params = new URLSearchParams(document.location.search);
let title = params.get("title");
if (title) {
    fetch('posts/' + title  + '.md')
        .then((response) => {
            return response.text();
        })
        .then((text) => {
            let content = fm(text);

            /* title and date */
            document.getElementById('title').innerHTML = 
                marked.parse(
                    '# ' + content.attributes.title + '\n\n' + 
                    '### ' + content.attributes.date
                );
            
            /* (body only) id headings and apply postprocessing */
            marked.use(gfmHeadingId({prefix: "section-"}), options);

            /* body */
            document.getElementById('content').innerHTML = 
                marked.parse(content.body);

            /* let other scripts know that the parser has finished */
            dispatchEvent(event);
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

The first thing we do is create a new parser using Marked and enable the `marked-highlight` and `marked-katex-extension` extensions with the `use()` method. I don't want to id the title and date so I enable the `marked-gfm-heading-id` extension later. For now I just create the postprocessing hook that it will eventually use. The purpose of this hook is to append the headings in the body of the post to the table of contents.

&nbsp;

Next, we get the title of the post which was passed as a search parameter similar to `username.github.io/post.html?title=value`, where `title` is the parameter and `value` is the value. I use `fetch()` to find the markdown file, then extract metadata and body using front-matter. I get the `title` and `content` elements by id and use the parser to fill their contents. Once the job is finished, we need to let the toc know that the parser's job is finished by emitting a `custom-content-loaded` message. This is necessary because there is no content on the page when it is loaded; thus we need to delay applying observers.

&nbsp;

Remember that `fetch()` returns a promise. The `then()` method of promise instances takes a callback function and immediately returns a new promise different from the original. We can chain promises with `then()` clauses, where each returned promise represents the completion of one asynchronous step in the chain. Importantly, however, with multiple calls to `fetch()` order is not guaranteed.

&nbsp;

## toc.js

The second script is `toc.js`. The table of contents is modified from this [source](https://www.bram.us/2020/01/10/smooth-scrolling-sticky-scrollspy-navigation/) so let me just talk about the parts I changed. Since the post content is filled dynamically, we need to wait for that content to exist on the page before we add the observers. Since JavaScript allows us to create and broadcast custom events, we can just wait for the previous `custom-content-loaded` message to signal that the parser's job has finished.

```javascript
/* toc.js */

window.addEventListener('custom-content-loaded', () => {
    let activeElement = null;
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const id = entry.target.getAttribute('id');
            const navElement = document.querySelector(`nav li a[href="#${id}"]`)
            if (entry.isIntersecting) {
                if (activeElement && activeElement !== navElement) {
                    activeElement.parentElement.classList.remove('active');
                }
                navElement.parentElement.classList.add('active');
                activeElement = navElement;
            }
        });
    });

    // Track all headers that have an `id` applied
    document.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]').forEach((header) => {
        observer.observe(header);
    });
});
```

The other part that I changed was tracking headers instead of sections. Since the active header won't always be intersecting the screen we need to keep track of both the previous and current active headers.

&nbsp;

## list.js

The third script is `list.js`. The purpose of this script will be to read the metadata of each markdown file and append them to an ordered list within anchor elements `<a>` that have an `href` attribute with the value `username.github.io/post.html?title=value`, where `value` is the title of the post. We will use an HTML5 `<template>` for each child of the list. All post titles are stored in a separate `posts.json` so that we don't have to rebundle the script each time a new post is added and we again use front-matter for extracting metadata. 

```html
<!-- index.html -->

<ul id="list"></ul>
<template id="listItem">
    <li><a href="post.html?title=">
        <h2 id="post-title"></h2><br/>
        <p id="post-summary"></p><br/>
        <p id="post-date"></p>
    </a></li>
</template>
```

```javascript
/* list.js */

import fm from 'front-matter';

async function getPosts() {
    const response = await fetch('posts/posts.json')
    const posts = await response.json();
    return posts;
}

async function appendPosts() {
    const posts = await getPosts();
    for (const title of posts) {
        await append(title);
    }
}

async function append(t) {
    try {
        const response = await fetch('posts/' + t + '.md')
        const text = await response.text();

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
    } catch (err) {
        console.error(err);
    }
}

appendPosts();
```

As mentioned before with `fetch()` and `then()` clauses, the ordering of our data is not guaranteed. I want each post to be ordered by date with newest at the top, which is how I ordered them in json. To mimic synchronous code we can instead use `async`/`await`. This may also be a more intuitive representation. `await` suspends execution until the promise is either fulfilled or rejected. In practice, this is slower than using a `then()` clause, but it garuntees order. To summarize: we fetch the list of posts, then for each post, clone the template, modify its elements, then append the clone as a new child of the list.

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

To move the `dist/` files into that branch I created a bash script:

```bash
#!/usr/bin/env bash

# create new deployment branch, deleting the old one
git branch -D gh-pages > /dev/null 2>&1
git switch --orphan gh-pages && git checkout main dist

# fail if any uncommitted changes
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

If you use this method, do not keep important files in the remote branch `gh-pages`; they will be *replaced* by the files in the `dist/` folder of the development branch. This script will fail if there are any uncommitted changes, however untracked files will be visible in the new branch so we append them to a `.gitignore`. 

&nbsp;

GitHub Pages also uses Jekyll by default. This can cause problems if you aren't using Jekyll. The simple fix is to create a new file: `.nojekyll`. You might have noticed that Jekyll will cause your markdown files to be served at `root/posts/title` instead of `root/posts/title.md`. I personally did not want this behavior.

&nbsp;

# Creating a New Post

Creating a new post is almost as simple as creating a new markdown file. It isn't exactly that easy, because we still need to direct towards it. I'm not sure of a method to search a filesystem through the web so I settled for maintaining an ordered list of all posts in `post.json` and using `fetch()` since we don't have access to Node's filesystem. Thus, creating a new post is as simple as creating a new markdown file and adding the filename to the front of the ordered list.

&nbsp;

Once you've dealt with that minor inconvenience, you're good to go. You can also run this site with a local server and see the result as you write the post in markdown. The homepage will fetch all the posts and read their metadata as it fills in the list. When you click on a post it will fetch it again and parse the markdown content. A markdown file might look like this:

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
