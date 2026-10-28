# Floorplan live demo

**[Open the demo →](https://haydenschmitty.github.io/floorplan-demo/)**

A live, clickable map of Brewline, a sample coffee-shop app made to show off [Floorplan](https://github.com/haydenschmitty/floorplan). Floorplan is a free, open-source Claude Code plugin that maps your codebase into an interactive, plain-English floorplan.

Explore every part, file and web request, play the "Start here" tour, and open Health, Screens and Flows. Asking questions works in your own copy, since it runs on your own Claude account. Best viewed on a computer.

## Get Floorplan for your app

See the [install instructions](https://github.com/haydenschmitty/floorplan#install).

## How this page is made

`index.html` is the Brewline map, built with `build.mjs --artifact` (which leaves out local file paths) and passed through `make-demo.mjs`, which adds the title, link preview, demo badge and messages:

```bash
node make-demo.mjs path/to/floorplan/artifact.html
```

Brewline is made up for the demo: there's no real code, customer or data behind it.
