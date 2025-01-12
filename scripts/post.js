import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from 'highlight.js';

if (!Marked) console.error("Marked undefined");
if (!markedHighlight) console.error("markedHighlight undefined");
if (!hljs) console.error("hljs undefined");

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

document.getElementById('content').innerHTML =
    marked.parse('# Marked in browser\n\nRendered by **marked**.');