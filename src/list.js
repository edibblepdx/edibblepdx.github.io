import fm from 'front-matter';

const posts = [
    "howto",
    "test",
    "hello_world"
];

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