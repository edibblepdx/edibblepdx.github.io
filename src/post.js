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
      headings.map(({ id, raw, level }) => {
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
const params = new URLSearchParams(document.location.search);
const title = params.get("title");
if (title) {
  fetch('posts/' + title + '.md')
    .then((response) => {
      return response.text();
    })
    .then((text) => {
      const content = fm(text);

      /* title and date */
      document.getElementById('title').innerHTML =
        marked.parse(
          '# ' + content.attributes.title + '\n\n' +
          '### ' + content.attributes.date + '\n\n' +
          '#### ' + `${content.attributes.length} min`
        );

      /* (body only) id headings and apply postprocessing */
      marked.use(gfmHeadingId({ prefix: "section-" }), options);

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
