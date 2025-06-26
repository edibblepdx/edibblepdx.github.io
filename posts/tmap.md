---
title: Four Ways to Texture a Sphere
date: Jan 24, 2025
edited: Jan 24, 2025
summary: >
    Texture mapping a sphere can be difficult. I'll cover four methods: octahedral mapping, seams, cubemaps, and fragment shaders. The ideas are general, but the implementation is in WebGL2.
---
# Introduction

I think spheres can be a little difficult.

So what is a vertex? A vertex is the sum of its position, texture, and normal. Two vertices that have the same position and normal, but different texture coordinates are different vertices.

&nbsp;

# Octahedral Mapping

An octahedron is a platonic solid; all angles and edges are congruent, and the same number of faces meet at each vertex equidistant from the center. Five such shapes exist in three dimensions. An Octahedron has eight identical faces and exactly four faces join at each vertex.

&nbsp;

For spherical representations, usually an octahedron or icosahedron is used by recursively subdividing its faces. Each edge is split halfway and ballooned out to the surface of a sphere by normalizing the new vertex position then scaling it by the radius. Subdivided octahedrons can result in smoother looking spherical surfaces and may work well for repeated textures.

&nbsp;

Imagine for a second that you're peeling an orange. You push both thumbs into the bottom and the peel splits into four corners. After pulling off the peel, you squish it onto the table and flatten it. You can do the same with an octahedron: pick any vertex, pull it into four corners, and squish it. The result is a square. And this square is our texture. There is one caveat in that the same vertex would need to be mapped to all four corners of the texture. Well that's just not possible, so we need four vertices with different texture coordinates even if they share a position and a normal. After subdivision this results in a cross of duplicated vertices on one half of the octahedron. The number of repeated vertices $v$ with $n$ subdivisions is $v = 4 + a_n$, where $a_n = 4 + 2(a_{n-1})$, $a_0 = 0$, $a_1 = 4$.

&nbsp;

TOAST map

&nbsp;

**When to use:**
- using a repeating texture
- want to segment the sphere
- will make your own textures

&nbsp;

**When not to use:**
- want to avoid the memory cost of repeated vertices
- converting textures to a TOAST projection is difficult

&nbsp;

# Seams

&nbsp;

&nbsp;

**When to use:**

&nbsp;

**When not to use:**
- want to avoid the memory cost of repeated vertices

# Cubemap

&nbsp;

&nbsp;

**When to use:**
- want to avoid the memory cost of repeated vertices

&nbsp;

**When not to use:**
- converting textures to a cubemap is difficult

&nbsp;

# Fragment Shader

There may be times where your vertex data does not contain texture information. This isn't an issue with some trigonometry. You also must recalculate the texture coordinates per frame, but the GPU can handle that without any issue. This also must be done per fragment rather than per vertex otherwise you will have a very ugly seam. The main drawback of this method is that non-spherical objects in your scene will need to use a different shader program and shader swapping has a cost. This is probably the easiest method however if you just want to render a planet or something similar.

&nbsp;

&nbsp;

**When to use:**
- want to avoid the memory cost of repeated vertices
- your sphere mesh doesn't store texture information

&nbsp;

**When not to use:**
- when non-spherical objects in your scene share the shader
- want to avoid the cost of computing texture coordinates on the GPU

&nbsp;

# Aside: Storing Shaders in WebGL

&nbsp;

It's common to use ES6 template literals above your main code or store shader source in `<script>` tags. I don't like either of these methods because it gets cluttered, I get lost, and there's no syntax highlighting.

&nbsp;

The method I do like to use is storing the shader source in their own JavaScript files `shader.vert.js` and `shader.frag.js` then export the source as an ES6 template literal. You can import and use Webpack or Rollup to bundle your scripts. You get syntax highlighting in vim by putting this comment on the first line: `/* vim: set filetype=glsl : */`.

```glsl
/* vim: set filetype=glsl : */

export const fragmentShaderSource = `#version 300 es
precision mediump float;

void main() 
{
    /* Have you seen a fish do a backflip? */
}`;
```

&nbsp;

I don't recommend using `fetch()` because it returns a promise which could result in shader compilation errors. A workaround is to make your main function `async` and `await` the response from `fetch()`, but personally, I'm not doing that.
