# Sportfica

**Open the app:** [https://fracturedorbit1980.github.io/Coach-Soccer/](https://fracturedorbit1980.github.io/Coach-Soccer/)

The link is case-sensitive. Open that address in a browser and the board runs. No install.

Sportfica is a tactics board for coaches. Draw 5-a-side, 7-a-side, 9-a-side, and 11-a-side, from the first grassroots age group through to GDL and pro.

## What you can do

- Switch the format and the shapes, areas, and press suggestion change with it.
- Set the age group: grassroots U6 through U11, youth ages, GDL, and pro.
- Work on a shaded pitch in full, half, box, thirds, or channel view.
- Place lifelike player mannequins, goalkeepers, a ball, cones, training mannequins, mini goals, and poles.
- Select a mini goal and drag the gold handle, or use the angle control, to turn it.
- Keep a season team sheet. Home players in a drill use those shirt numbers and names.
- Draw passes, runs, dribbles, pressing zones, and notes.
- Record keyframes, scrub the timeline, and play the sequence.
- Ask the board to suggest a press. 5-a-side and 7-a-side step two players in, 9-a-side curves a unit of three, 11-a-side jumps a line.
- Write the session around what, where, who, when, and why, then print a session sheet or export JSON.
- Copy a share link for the session you are looking at.

The live board is stored in this browser.

- **Coach Portal:** Open the tactics board to assemble training sessions, load pre-populated animated drills across 5s, 7s, 9s, and 11s, or manage season squads.
- **Player Portal:** Open **Player Profiles** to review direct coach feedback on role and position (positive strengths and constructive areas to improve), practice 1-person ball mastery skills, and review suggested drills. Use **Save** on the board, or **Save a copy** to preserve earlier versions.

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
| `npm run lint` | Lint with oxlint |
| `npm run preview` | Serve the production build |
