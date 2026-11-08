# The Friendship Game

A responsive React and Vite birthday adventure with persistent XP, achievements, collectible discoveries, a multi-round quiz, hidden objects, and an unlockable final level.

## Requirements

- Node.js 22.12 or newer (the repository uses Node.js 22 in `.mise.toml`)
- pnpm 10

If you use [mise](https://mise.jdx.dev/), run:

```bash
mise install
```

Otherwise install a current Node.js release and enable pnpm:

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

## Run locally

```bash
pnpm install
pnpm dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

Production verification:

```bash
pnpm check
pnpm preview
```

`pnpm build` creates the deployable static site in `dist/`.

## Personalize the game

The editable game content is grouped at the top of `src/App.tsx`:

- `memories`: dates, photo paths, captions, and stories
- `loreFiles`: classified friendship stories and screenshots
- `questions`: quiz categories, questions, four answers, correct-answer index, hints, and wrong-answer dialogue
- `collectibles`: titles, rarity, image paths, and stories
- `privateLetter`: hidden Save File letter
- `birthdayLetter`: final birthday message

### Add photos and screenshots

1. Create a folder such as `public/photos/`.
2. Copy image files into it.
3. Set an item's `image` value to its public URL:

```ts
image: "/photos/first-day.jpg"
```

Leave `image: ""` to keep the designed placeholder. Files in `public/` are copied into the production build without modification.

Artwork and level backgrounds use CSS and files in `public/`; the friendship and Haunted Woods music tracks are also served from `public/`. Reward and penalty cues are synthesized in the browser so they do not depend on external sound-effect files.

## Saved progress

XP, completed levels, achievements, secret discoveries, and collected inventory items are saved in browser `localStorage` under:

```text
friendship-game-progress-v1
```

The Replay Adventure button clears the active game state and writes a fresh save. To manually clear progress, remove that key in the browser's developer tools under **Application → Local Storage**.

## Source files required for GitHub

Commit these files and directories so Vercel has the build metadata, site configuration, and every public asset:

```text
src/
public/
index.html
package.json
pnpm-lock.yaml
tsconfig.json
vite.config.ts
vercel.json
.figma/make/site.json
.mise.toml
.gitignore
README.md
```

Do not commit `node_modules/` or `dist/`; both are excluded by `.gitignore`.

## Push to GitHub

From the project root:

```bash
git status
git add src public index.html package.json pnpm-lock.yaml tsconfig.json vite.config.ts vercel.json .figma/make/site.json .mise.toml .gitignore README.md
git commit -m "Build deployable Friendship Game"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

If this repository already has a GitHub remote, check it with `git remote -v` and do not run `git remote add origin` again.

## Deploy to Vercel

`vercel.json` configures the Vite framework, frozen pnpm install, `pnpm build`, `dist` output, and a single-page-app rewrite so refreshes and unknown paths return to the opening screen.

This workspace is not currently a Git repository, so it cannot be imported from GitHub yet. You can deploy this folder directly with the Vercel CLI:

1. Install the project dependencies with `pnpm install --frozen-lockfile`.
2. Authenticate with Vercel by running `vercel login`.
3. From the project root, run `vercel link --project the-friendship-game` and choose your Vercel account/team. Create the project if prompted.
4. Run `vercel deploy --prod`.

Vercel will print the public production URL after deployment. Alternatively, create or connect a GitHub repository and import it at [vercel.com/new](https://vercel.com/new); keep the build command as `pnpm build` and output directory as `dist`.

## Progress and shared links

XP, achievements, discoveries, and level progress remain in browser `localStorage`. Each player has their own progress per device and browser; it is not synchronized between players or devices.
