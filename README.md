# Scottish FA UEFA Licence Tactical Platform

**Open the app:** [https://fracturedorbit1980.github.io/Coach-Soccer/](https://fracturedorbit1980.github.io/Coach-Soccer/)

The link is case-sensitive. Open that address in a browser and the board runs. No install.

A tactical board and session planner for coach education across UEFA C, UEFA B, and UEFA A. Draw the picture, animate the trigger, and check the plan against the four pillars: the coach, the environment, the player, and the game.

This is an independent coaching tool organised around Scottish FA and UEFA licence themes. It is not an official Scottish FA or UEFA product.

## What you can do

- Switch licence tier and the scaffolding changes with it: formations, phase types, guided questions, and the opponent read.
- Work on a marked pitch in full, half, box, thirds, or channel view.
- Place players, goalkeepers, a ball, cones, mannequins, goals, and poles.
- Draw passes, runs, dribbles, pressing zones, and notes.
- Record keyframes, scrub the timeline, and play the sequence.
- Ask the board to suggest a press. UEFA C steps two players in, UEFA B curves a unit of three, UEFA A jumps a line.
- Write the session around what, where, who, when, and why, then print a session sheet or export JSON.
- Copy a share link for the session you are looking at.

The live board is stored in this browser. Use **File → Save current** in the library if you want a named copy beside it.

## Run it locally

```bash
npm install
npm run dev
```

The dev server listens on [http://localhost:43123](http://localhost:43123).

```bash
npm run build
npm run preview
```

## Share a URL

The public app is [https://fracturedorbit1980.github.io/Coach-Soccer/](https://fracturedorbit1980.github.io/Coach-Soccer/). Pushes to `main` publish it again through GitHub Actions.

To share one session, open the board and choose **Share**. The copied link reopens that picture, timeline, and plan.

You can also export a `.json` file from the File menu and import it on another machine.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local development server |
| `npm run build` | Typecheck and production build |
| `npm run preview` | Serve the production build |
| `npm run lint` | Lint with oxlint |
