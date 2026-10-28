# Floorplan live demo

**[Open the demo →](https://haydenschmitty.github.io/floorplan-demo/)**

See [Floorplan](https://github.com/haydenschmitty/floorplan) in action. Floorplan is a free, open-source Claude Code plugin that maps your codebase into an interactive, plain-English floorplan.

On the left, a scripted illustration of asking Claude Code for a floorplan of Brewline, a sample coffee-shop app. On the right, the real map it produces. Pick a follow-up question and the map shows the answer: a guided flow, the Health check, recent work or the tour. You can also click around the map directly.

The conversation is written ahead of time; in your own copy, you ask anything and Claude answers from your actual code. Best viewed on a computer.

## Get Floorplan for your app

See the [install instructions](https://github.com/haydenschmitty/floorplan#install).

## How this page is made

- `index.html` is the chat and the page around the map. It drives the map through the map's own `window.Floorplan` API.
- `map.html` is the Brewline map, built with `build.mjs --artifact` (which leaves out local file paths) and passed through `make-demo.mjs`, which adds the title, link preview, demo badge and messages. It also works on its own.

To rebuild the map after a Floorplan release:

```bash
node make-demo.mjs path/to/floorplan/artifact.html
```

Brewline is made up for the demo: there's no real code, customer or data behind it.
