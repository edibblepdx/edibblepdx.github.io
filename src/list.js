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
