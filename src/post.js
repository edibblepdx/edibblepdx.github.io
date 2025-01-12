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