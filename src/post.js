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

let params = new URLSearchParams(document.location.search);
let title = params.get("title");
if (title) {
    fetch('posts/test.md')
        .then((response) => {
            return response.text();
        })
        .then((text) => {
            document.getElementById('content').innerHTML = marked.parse(text);
        })
        .catch(() => {
            document.getElementById('content').innerHTML = marked.parse('# File Not Found');
            console.error("ERROR::FILE::NOT_FOUND");
        })
} else {
    document.getElementById('content').innerHTML = marked.parse('# File NULL');
    console.error("ERROR::FILE::NULL");
}
