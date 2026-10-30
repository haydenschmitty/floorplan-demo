# Floorplan live demo

**[Open the demo →](https://haydenschmitty.github.io/floorplan-demo/)**

See [Floorplan](https://github.com/haydenschmitty/floorplan) in action. Floorplan is a free, open-source plugin for Claude Code and Codex that maps your codebase into an interactive, plain-English floorplan.

On the left, a scripted illustration of asking for a floorplan of Brewline, a sample coffee-shop app. Switch between **Claude Code** and **Codex** at the top (or open [the Codex version](https://haydenschmitty.github.io/floorplan-demo/?in=codex) directly). On the right, the real map it produces. Pick a follow-up question and the map shows the answer: a guided flow, the Health check, recent work or the tour. You can also click around the map directly.

The conversation is written ahead of time; in your own copy, you ask anything and Claude answers from your actual code. Best viewed on a computer.

## Get Floorplan for your app

- **Claude Code:** see the [install instructions](https://github.com/haydenschmitty/floorplan#claude-code).
- **Codex:** in the Codex app, open **Plugins → Add a marketplace** and enter `haydenschmitty/floorplan`. More in [Floorplan in Codex](https://github.com/haydenschmitty/floorplan/blob/main/docs/codex.md).

## How this page is made

- `index.html` is the chat and the page around the map, with the Claude Code / Codex switch. It drives the map through the map's own `window.Floorplan` API.
- `map.html` is the Brewline map, built with `build.mjs --artifact` (which leaves out local file paths) and passed through `make-demo.mjs`, which adds the title, link preview, demo badge and messages. It also works on its own, and `map.html?agent=codex` shows it as made in Codex.

To rebuild the map after a Floorplan release:

```bash
node make-demo.mjs path/to/floorplan/artifact.html
```

Brewline is made up for the demo: there's no real code, customer or data behind it.

## Maps gallery

[`/maps/`](https://haydenschmitty.github.io/floorplan-demo/maps/) shows Floorplan maps of popular open source codebases. Each map is an exported copy (`node floorplan/serve.mjs --export`), so it has no Ask bar, local paths or git remotes, and the gallery refuses maps that include Health or recent work: it never publishes another project's weak spots.

To add one, map the project with Floorplan, export it, then:

```bash
node add-map.mjs path/to/<project>-map.html owner/repo
```

That writes `maps/<owner>/<repo>/index.html`, adds it to `maps/maps.json`, and prints a badge maintainers can put in their README:

[![Floorplan: explore the map](https://haydenschmitty.github.io/floorplan-demo/badge.svg)](https://haydenschmitty.github.io/floorplan-demo/maps/)

`badge.svg` is that badge, made to sit beside shields.io badges.
