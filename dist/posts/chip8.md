---
title: 'Oxid-8: A Gentle Introduction to Rust and Emulation'
date: Oct 7, 2025
edited: Oct 7,2025
summary: >
    My experience learning Rust and Emulation by creating a Chip-8 interpreter.
---

# Purpose

If you want to get into emulation, most people will tell you to start with Chip-8—an interpreted programming language developed by Joseph Weisbecker and originally implemented for the COSMAC-VIP and Telmac 1800 in 1977. Chip-8 programs fit in 4KB of memory and have a very simple instruction set that can showcase concepts like instruction decoding and execution through a game loop as a soft introduction for more involved emulators.

&nbsp;

That said, you don't *have* to start here. This project was actually inspired by a presentation given by Luke Petherbridge, the creator of [**Tetanes**](https://lukeworks.tech/tetanes-web), at the PDX Rust group led by Bart Massey and Jim Blandy. As this was also my project for learning Rust, I picked a similarly "rusty" name: [**Oxid-8**](https://github.com/edibblepdx/Oxid-8/tree/main). And I also found this project to be a good introduction to Wgpu and Ratatui—I actually got it to draw natively, in browser, and in the terminal!

&nbsp;

There are already many excellent guides for Chip-8 emulation so the purpose of this writing will be to explore some of the experiences and challenges of making my interpreter and the mediums I chose to use. But expect me to wander off-topic. If you would like to preview the instruction set, [Cowgod's](http://devernay.free.fr/hacks/chip8/C8TECH10.HTM#0.1) technical reference is fairly authoritative on the topic. And as for guides, many people point [**here**](https://tobiasvl.github.io/blog/write-a-chip-8-emulator/).

&nbsp;

All of my code is available on my [GitHub](https://github.com/edibblepdx/Oxid-8/tree/main) and the core [crate](https://crates.io/crates/oxid8-core) is fully documented to be used in implementing your own frontend. You can also use my interpreter in the browser [**here**](https://edibblepdx.github.io/Oxid-8/) or click on the controller icon up in the navbar as of writing. You will need your own games, but those are easy to find. The controls can also be found in the readme of the Git repository.

<a href="https://edibblepdx.github.io/Oxid-8/" target="_blank">
<img src="https://github.com/user-attachments/assets/ab1f3bdc-4ab0-48f8-8563-1ee89c436e90" alt="Tetris drawing to Kitty terminal via Ratatui."/>
<a/>
<p style="text-align: center;"><em>Tetris drawing to Kitty terminal via Ratatui.</em></p>

&nbsp;

# Learning Rust

My Rust journey started just as I registered for a class called "Rust full-stack web". Rust had long been an admired language, but the only preparation I made prior to the class was reading the first six chapters of ["The Rust Programming Language"](https://doc.rust-lang.org/stable/book/). I have since finished the book, but not before I attended my first PDX Rust meeting and inspiration had me creating a Chip-8 emulator. Rust full-stack web was a fairly guided class so much of my early experimentation happened with the Chip-8 interpreter.

&nbsp;

Rust is a beautiful language, and I must say that I enjoy it much more than C++. In my opinion, classes can introduce needless complexity and inheritance is not a good model for most real-world relationships. Traits and Interfaces, on the other hand, tend to model such relationships more naturally. I also appreciate the safer error handling provided by option types (I know that C++17 added `std::optional`, but I don't have much experience with it).

&nbsp;

Rust is also expression-oriented and relies heavily on pattern matching. Lazy iterators are another highlight. Most importantly, the community standard for good documentation is high and Rust makes it easy to write good documentation.

&nbsp;

Large projects in Rust however can get very complex in ways different than C++ and certain patterns have a lot of boilerplate code. Lifetimes and generics can sometimes be confusing and closures also have an odd syntax. Some would-be-useful features of cargo workspaces like separate `config.toml` files are also still not released yet. Trait objects and async also require more work from the developer. And Rust also doesn't have reflection.

&nbsp;

# Ratatui

This project came not long after I lost motivation with learning ncurses—a programming library for creating textual user interfaces (TUIs) that is installed by default on most operating systems. To differentiate itself from Tetanes, I wanted my emulator to draw to the terminal and be fully interactive (there was some difficulty with the latter that I'll cover in the next section).

&nbsp;

[Ratatui](https://ratatui.rs/) is a young—but still very functional—TUI library, and generally considered the best Rust has to offer. The maintainers are also very helpful and answered some of my questions about drawing and architecture along the way.

&nbsp;

It is also currently in the process of being embedded and there's also [Ratzilla](https://github.com/orhun/ratzilla) for building terminal-themed web applications over Ratatui. There are many talented people working on the project and it's not very hard to get into, so I recommend checking it out.

&nbsp;

The hardest part with the TUI was possibly implementing suspension. I had to strip away a lot of the higher level api and create my own terminal for drawing with crossterm and manually setting feature flags. It also involved setting up some signal handlers via message passing concurrency (which is often what you should consider before involving shared ownership).

&nbsp;

There was an issue with the screen being blank when resumed, which I conjectured was Ratatui optimizing pixel updates, and was confirmed by a maintainer. The fix was to manually force a redraw on a resume event.

&nbsp;

# Kitty Protocol

Here lies some annoyance: most terminals do not differentiate key press, release, and repeat ([read more](https://sw.kovidgoyal.net/kitty/keyboard-protocol/)). Ptyxis, Gnome's current default terminal emulator, certainly does not. How long did it take me to figure this out? Not *that* long, but long enough to be more than a little annoying.

&nbsp;

The solution to this problem is the [Kitty Protocol](https://sw.kovidgoyal.net/kitty/keyboard-protocol/). It's was made for Kitty terminal, but a handful of other terminals also implement the protocol. And most importantly, the it is supported by crossterm, which is a Rust library used by Ratatui!

&nbsp;

So now we have working input right? Well yes, but can I expect every user to be using a terminal that supports the Kitty protocol? You should be, but if you aren't, the best band-aid fix I could come up with is clearing the virtual keyboard every cpu cycle for those unsupported terminals. Now you might find that the adhesive of this band-aid is wearing down. In that case, just use a Kitty terminal.

&nbsp;

# Testing

Writing tests in Rust is so easy. I did not test every opcode, Timendus' [Chip-8 test suite](https://github.com/Timendus/chip8-test-suite) is fantastic for that. The hardest thing to get right is input since Chip-8 registers a key press on *release*. So you might want to store the pressed key in your emulator.

&nbsp;

Some things that I wrote tests for are opcode reading and decoding, pushing and popping to the program stack, loading font, panic conditions, and drawing sprites to a virtual screen. There are more things to test, but most are covered by existing test suites, making Chip-8 very beginner friendly alongside its simple architecture.

&nbsp;

# Wgpu

I wasn't quite yet done, since I wanted to run my emulator in the browser (with the added benefit of Wgpu also running natively). It was also an opportunity to get familiar with Rust's graphics library and the WGSL shading language, already having some experience with OpenGL, WebGL, and GLSL.

&nbsp;

I spent a lot of time reading the Tetanes source code, and I have to say that Winit can be confusing coming from glfw (there is a [glfw crate](https://crates.io/crates/glfw) if you want to use that instead). I think the hardest part was implementing the user event and installing the handler for uploading roms. I'm so grateful that Tetanes existed to provide a working example that I could modify.

&nbsp;

I ended up writing a very simple shader that tinted the screen blue and curved the image like the bowled glass of older computers that existed around the time of the COSMAC-VIP. It had been a while since I wrote my last shader so I had to relearn a couple things and translate it to WGSL.

&nbsp;

Wgpu is based on the WebGPU standard, but it can run both natively and in the browser. My primary target was the browser environment since that would be the simplest medium for which to share my project. But as long as you stay mindful of the desktop environment and use some conditional compilation, you can get a windowed version almost for free.

&nbsp;

# What next?

Simplest to most advanced would possibly be: a colorway parameter, bit display, TUI menu, and debugger. For now this project will remain dormant while I focus on other things, but this is what I would focus on were I to come back and make some revisions or enhancements.

&nbsp;

I was actually working on a bit display feature at one point with my own bitvec implementation, however there is a vetted bitvec library that I should probably implement a trait extension for to decode the color pixels for drawing. The benefit to this is minor since the Chip-8 display is already so small, but there is memory saving to be had.

&nbsp;

The TUI menu is also partially implemented, fit with key binds and a pretty look, just not joined with the actual emulator. It even has a cute little logo. A difficulty would be implementing a file browser for loading up Chip-8 games; however, I can imagine something like oil.nvim.

```
▄▄▄▄              ▄▄▄▄
█  █ ▜▄▛ █ █▀▄ ▄▄ █▄▄█
█▄▄█ █ █ █ █▄▀    █▄▄█
```
