---
title: 'Chip-8: A gentle introduction to Emulation'
date: Oct 6, 2025
edited: Oct 6,2025
summary: >
    My experience creating a Chip-8 interpreter in rust.
---

# Purpose

If you want to get into emulation, most people will tell you to start with Chip-8—an interpreted programming language developed by Joseph Weisbecker and originally implemented and the COSMAC-VIP and Telmac 1800 in 1977. Chip-8 programs fit in 4KB of memory and have a very simple instruction set that can showcase concepts like instruction decoding and execution through a game loop as a soft introduction for more involved emulators.

&nbsp;

That said, you don't *have* to start here. This project was actually inspired by a presentation given by Luke Petherbridge, the creator of [**Tetanes**](https://github.com/lukexor/tetanes), at the PDX Rust group led by Bart Massey and Jim Blandy. As this was also my project for learning Rust, I picked a similarly "rusty" name: [**Oxid-8**](https://github.com/edibblepdx/Oxid-8/tree/main). And I also found this project to be a good introduction to Wgpu and Ratatui—I actually got it to draw natively, in browser, and in the terminal!

&nbsp;

There are already many excellent guides for Chip-8 emulation so the purpose of this writing will be to explore some of the experiences and challenges of making my interpreter and the mediums I chose to use. But expect me to wander off-topic. If you would like to preview the instruction set, [Cowgod's](http://devernay.free.fr/hacks/chip8/C8TECH10.HTM#0.1) technical reference is fairly authoritative on the topic. As for guides, many people point [**here**](https://tobiasvl.github.io/blog/write-a-chip-8-emulator/).

&nbsp;

All of my code is available on my [GitHub](https://github.com/edibblepdx/Oxid-8/tree/main) and the core [crate](https://crates.io/crates/oxid8-core) is fully documented to be used in implementing your own frontend. You can also use my interpreter in the browser [**here**](https://edibblepdx.github.io/Oxid-8/) or click on the controller icon up in the navbar as of writing. You will need your own games, but those are easy to find. The controls can also be found in the readme of the Git repository.

![oxid-tetris](https://github.com/user-attachments/assets/ab1f3bdc-4ab0-48f8-8563-1ee89c436e90)
<p style="text-align: center;"><em>Drawing to Kitty terminal via Ratatui.</em></p>

&nbsp;

# Learning Rust

# Community

# Ratatui

# Kitty Protocol

# Wgpu

# What next?

bitvec, menu, debugger,
