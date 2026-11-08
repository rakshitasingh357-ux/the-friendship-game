import { useEffect, useRef, useState } from "react";
import "./level-four.css";
import birthdayLetter from "./birthday-letter";
import InteractionGuide, { findNearestInteraction, type ProximityInteraction } from "./InteractionGuide";
import InstructionGuide, { type InstructionPage } from "./InstructionGuide";

const SAVE_KEY = "friendship-game-level-four-v1";
const VIEW_WIDTH = 960;
const VIEW_HEIGHT = 540;
const WORLD_END = 6250;
const PORTAL_X = 6010;
type Phase = "intro" | "instructions" | "playing" | "paused" | "gameover" | "victory" | "letter";
type Collectible = { id: string; x: number; y: number; kind: "star" | "heart" | "shield" };
type Platform = { id: string; x: number; y: number; width: number; height: number; moving?: boolean; amplitude?: number; speed?: number };
type Enemy = { id: string; x: number; y: number; min: number; max: number; speed: number; direction: number; stunned: number };

type RunSnapshot = {
  active: boolean;
  special: boolean;
  x: number;
  checkpoint: number;
  score: number;
  stars: number;
  hearts: number;
  lives: number;
  collected: string[];
  falls: number;
};

type Campaign = {
  failedAttempts: number;
  completed: boolean;
  activeRun: RunSnapshot | null;
  result: { score: number; stars: number; hearts: number } | null;
};

type Run = {
  player: { x: number; y: number; vx: number; vy: number; width: number; height: number; grounded: boolean; coyote: number; jumps: number; invulnerable: number; facing: number; platformId: string | null };
  platforms: Platform[];
  enemies: Enemy[];
  collectibles: Collectible[];
  collected: Set<string>;
  checkpoint: number;
  score: number;
  stars: number;
  hearts: number;
  lives: number;
  special: boolean;
  falls: number;
  helpLevel: number;
  shield: number;
  elapsed: number;
  portalEntered: boolean;
  hintsShown: Set<number>;
  message: string;
  messageTime: number;
  savedAt: number;
};

type Props = {
  onMap: () => void;
  onLetterComplete: () => void;
  onComplete: () => void;
  setMusicDucked: (ducked: boolean) => void;
  game: { award: (label: string, amount?: number) => void; collect: (id: number, title: string) => void; secret: (id: string, label: string) => void; wrongAnswer: () => void };
};

const adventureGuidePages: InstructionPage[] = [
  {
    title: "WELCOME TO THE ADVENTURE",
    content: <>
      <p>Guide a tiny cat across a whimsical world of meadows, floating ruins, gardens and sunset cliffs. The journey is made for Player 2, and it leads to one very important destination: my heart.</p>
      <div className="instruction-guide-callout"><strong>YOUR OBJECTIVE</strong><p>Travel through the five regions and reach the glowing portal at the end to complete the adventure and unlock the birthday letter.</p></div>
    </>,
  },
  {
    title: "MOVEMENT AND CONTROLS",
    content: <>
      <section className="instruction-guide-card"><h3>KEYBOARD</h3><ul>
        <li><kbd>A</kbd> / <kbd>←</kbd> — Move left.</li>
        <li><kbd>D</kbd> / <kbd>→</kbd> — Move right.</li>
        <li><kbd>SPACE</kbd> / <kbd>W</kbd> / <kbd>↑</kbd> — Jump; tap again in the air to double-jump.</li>
        <li><kbd>ESC</kbd> — Pause or resume.</li>
        <li><kbd>E</kbd> — Ask for a little help during a Special Edition run; the on-screen <strong>A LITTLE HELP, PLEASE!</strong> button does the same.</li>
      </ul></section>
      <section className="instruction-guide-card"><h3>TOUCH</h3><p>Hold <strong>◀ / ▶</strong> to move and tap <strong>JUMP</strong> to leap. Tap JUMP again while airborne for a double jump. The on-screen pause button opens the pause menu.</p></section>
      <p>There is no separate run control in this adventure.</p>
    </>,
  },
  {
    title: "PLATFORMS AND OBSTACLES",
    content: <>
      <p>Jump between platforms, land on their top surfaces and keep moving toward the portal. Some platforms move, so watch their position before you leap.</p>
      <ul>
        <li>Jump over or bounce off creatures; colliding with them can cost a life.</li>
        <li>Collect optional friendship stars, heart coins and shields for score and rewards.</li>
        <li>Check the on-screen prompts for upcoming platforms, creatures, checkpoint flowers and the final portal.</li>
      </ul>
    </>,
  },
  {
    title: "CHECKPOINTS AND SPECIAL ASSISTANCE",
    content: <>
      <section className="instruction-guide-card"><h3>CHECKPOINTS AND RETRIES</h3><p>Cross a glowing checkpoint flower to save your position and collected progress. If you lose a life, you return to your latest checkpoint with brief protection. A normal run has three lives. If all lives are lost, choose <strong>TRY AGAIN</strong> to restart; if you leave before failing, your active run is saved in this browser and can be resumed from the level introduction.</p></section>
      <section className="instruction-guide-card"><h3>SPECIAL EDITION</h3><p>After repeated failed attempts, a Special Edition run offers extra help. It starts with 99 lives and progressively eases the challenge. Use <strong>A LITTLE HELP, PLEASE!</strong> or press <strong>E</strong> to increase assistance; later help levels add protection and a safer path.</p></section>
    </>,
  },
  {
    title: "COMPLETING THE ADVENTURE",
    content: <>
      <p>Reach the glowing portal at the end of the course. The victory screen records your score, stars and heart coins and awards the Heart Conqueror reward.</p>
      <div className="instruction-guide-callout"><strong>YOUR FINAL REWARD</strong><p>Open the birthday letter after victory. When you finish reading, choose <strong>CONTINUE TO THE STARS</strong> to carry on.</p></div>
    </>,
  },
];

const PLATFORM_LAYOUT: Platform[] = [
  { id: "ground-a", x: 0, y: 460, width: 820, height: 100 },
  { id: "meadow-step-a", x: 270, y: 372, width: 150, height: 20 },
  { id: "meadow-step-b", x: 530, y: 316, width: 150, height: 20 },
  { id: "meadow-bridge", x: 785, y: 404, width: 115, height: 20 },
  { id: "ground-b", x: 940, y: 460, width: 650, height: 100 },
  { id: "ruin-a", x: 1120, y: 378, width: 150, height: 20 },
  { id: "moving-a", x: 1370, y: 350, width: 128, height: 20, moving: true, amplitude: 48, speed: 1.5 },
  { id: "ruin-b", x: 1535, y: 318, width: 150, height: 20 },
  { id: "ground-c", x: 1725, y: 460, width: 700, height: 100 },
  { id: "garden-a", x: 1880, y: 375, width: 130, height: 20 },
  { id: "moving-b", x: 2150, y: 340, width: 124, height: 20, moving: true, amplitude: 56, speed: 1.8 },
  { id: "garden-b", x: 2360, y: 298, width: 135, height: 20 },
  { id: "ground-d", x: 2580, y: 460, width: 690, height: 100 },
  { id: "cliff-a", x: 2730, y: 376, width: 140, height: 20 },
  { id: "cliff-b", x: 2970, y: 318, width: 145, height: 20 },
  { id: "moving-c", x: 3200, y: 354, width: 130, height: 20, moving: true, amplitude: 58, speed: 2 },
  { id: "ground-e", x: 3430, y: 460, width: 670, height: 100 },
  { id: "sunset-a", x: 3570, y: 375, width: 125, height: 20 },
  { id: "sunset-b", x: 3795, y: 310, width: 125, height: 20 },
  { id: "sunset-c", x: 4010, y: 365, width: 135, height: 20 },
  { id: "ground-f", x: 4260, y: 460, width: 720, height: 100 },
  { id: "gate-a", x: 4410, y: 375, width: 140, height: 20 },
  { id: "gate-b", x: 4640, y: 315, width: 135, height: 20 },
  { id: "moving-d", x: 4860, y: 355, width: 132, height: 20, moving: true, amplitude: 42, speed: 2.2 },
  { id: "ground-g", x: 5120, y: 460, width: 1130, height: 100 },
  { id: "heart-step-a", x: 5350, y: 382, width: 150, height: 20 },
  { id: "heart-step-b", x: 5600, y: 330, width: 150, height: 20 },
];

const COLLECTIBLE_LAYOUT: Collectible[] = [
  { id: "star-01", x: 330, y: 327, kind: "star" }, { id: "star-02", x: 600, y: 268, kind: "star" },
  { id: "heart-01", x: 870, y: 354, kind: "heart" }, { id: "star-03", x: 1190, y: 333, kind: "star" },
  { id: "shield-01", x: 1450, y: 300, kind: "shield" }, { id: "star-04", x: 1615, y: 273, kind: "star" },
  { id: "heart-02", x: 1970, y: 327, kind: "heart" }, { id: "star-05", x: 2205, y: 286, kind: "star" },
  { id: "star-06", x: 2420, y: 254, kind: "star" }, { id: "heart-secret", x: 2480, y: 404, kind: "heart" },
  { id: "star-07", x: 2810, y: 333, kind: "star" }, { id: "star-08", x: 3035, y: 274, kind: "star" },
  { id: "shield-02", x: 3270, y: 308, kind: "shield" }, { id: "heart-03", x: 3650, y: 332, kind: "heart" },
  { id: "star-09", x: 3850, y: 265, kind: "star" }, { id: "star-10", x: 4070, y: 322, kind: "star" },
  { id: "heart-04", x: 4490, y: 330, kind: "heart" }, { id: "star-11", x: 4700, y: 271, kind: "star" },
  { id: "star-12", x: 4915, y: 311, kind: "star" }, { id: "heart-05", x: 5430, y: 338, kind: "heart" },
  { id: "star-13", x: 5665, y: 284, kind: "star" },
];

const ENEMY_LAYOUT: Enemy[] = [
  { id: "slime-01", x: 690, y: 432, min: 630, max: 785, speed: 50, direction: 1, stunned: 0 },
  { id: "mushroom-01", x: 1180, y: 350, min: 1125, max: 1240, speed: 45, direction: -1, stunned: 0 },
  { id: "slime-02", x: 2010, y: 432, min: 1900, max: 2220, speed: 66, direction: 1, stunned: 0 },
  { id: "fly-01", x: 2880, y: 310, min: 2770, max: 3050, speed: 52, direction: -1, stunned: 0 },
  { id: "mushroom-02", x: 3890, y: 432, min: 3650, max: 4110, speed: 70, direction: 1, stunned: 0 },
  { id: "guardian", x: 5320, y: 432, min: 5200, max: 5680, speed: 62, direction: -1, stunned: 0 },
];
const WORLD_NAMES = ["THE HAPPY MEADOW", "THE FLOATING RUINS", "THE MONSTER GARDEN", "THE SUNSET CLIFFS", "THE HEART GATE"];
const SKY_PALETTES = [
  ["#8c91c4", "#f0a5bc", "#ffdda7"],
  ["#837cae", "#e99ab8", "#ffd5a4"],
  ["#777ea8", "#df94b3", "#ffc99f"],
  ["#766998", "#d989aa", "#ffc28f"],
  ["#766694", "#df8ab0", "#ffcb9e"],
];
const GRASS_PALETTES = ["#91c98b", "#9dcc9b", "#90bf87", "#a8c58b", "#a7cf9a"];

function emptyCampaign(): Campaign {
  return { failedAttempts: 0, completed: false, activeRun: null, result: null };
}

function isSpecialAttempt(failedAttempts: number) {
  return failedAttempts > 0 && failedAttempts % 11 === 10;
}

function loadCampaign(): Campaign {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return emptyCampaign();
    const value = JSON.parse(raw) as Partial<Campaign>;
    const active = value.activeRun && typeof value.activeRun === "object" ? value.activeRun as RunSnapshot : null;
    const result = value.result && typeof value.result === "object" ? value.result as Campaign["result"] : null;
    return {
      failedAttempts: Number.isInteger(value.failedAttempts) && (value.failedAttempts ?? -1) >= 0 ? value.failedAttempts as number : 0,
      completed: value.completed === true,
      activeRun: active?.active === true && typeof active.x === "number" ? active : null,
      result: result && Number.isFinite(result.score) && Number.isFinite(result.stars) && Number.isFinite(result.hearts) ? result : null,
    };
  } catch {
    return emptyCampaign();
  }
}

function makeRun(special: boolean, saved?: RunSnapshot | null): Run {
  const startX = saved?.active ? Math.max(0, Math.min(saved.checkpoint, WORLD_END - 200)) : 42;
  const collected = new Set(saved?.active ? saved.collected : []);
  return {
    player: { x: startX, y: 420, vx: 0, vy: 0, width: 30, height: 34, grounded: false, coyote: 0, jumps: 0, invulnerable: 0, facing: 1, platformId: null },
    platforms: PLATFORM_LAYOUT.map((platform) => ({ ...platform })),
    enemies: ENEMY_LAYOUT.map((enemy) => ({ ...enemy })),
    collectibles: COLLECTIBLE_LAYOUT.map((item) => ({ ...item })),
    collected,
    checkpoint: startX,
    score: saved?.active ? saved.score : 0,
    stars: saved?.active ? saved.stars : 0,
    hearts: saved?.active ? saved.hearts : 0,
    lives: saved?.active ? Math.max(1, saved.lives) : special ? 99 : 3,
    special,
    falls: saved?.active ? saved.falls : 0,
    helpLevel: special ? Math.min(4, 1 + Math.floor((saved?.falls ?? 0) / 2)) : 0,
    shield: 0,
    elapsed: 0,
    portalEntered: false,
    hintsShown: new Set(),
    message: special ? "THE STARS ARE ON YOUR SIDE!" : "A tiny cat. A very big adventure.",
    messageTime: 3.5,
    savedAt: 0,
  };
}

function platformPosition(platform: Platform, elapsed: number) {
  return platform.y + (platform.moving ? Math.sin(elapsed * (platform.speed ?? 1)) * (platform.amplitude ?? 0) : 0);
}

function drawCat(ctx: CanvasRenderingContext2D, x: number, y: number, run: Run, time: number) {
  const player = run.player;
  const anim = player.grounded ? Math.sin(time * (Math.abs(player.vx) > 10 ? 18 : 3)) : -1;
  const bob = player.grounded && Math.abs(player.vx) < 10 ? Math.sin(time * 3) * 1.5 : 0;
  ctx.save();
  ctx.translate(Math.round(x + player.width / 2), Math.round(y + player.height / 2 + bob));
  ctx.scale(player.facing, 1);
  if (player.invulnerable > 0 && Math.floor(time * 18) % 2 === 0) ctx.globalAlpha = 0.45;
  if (run.shield > 0) {
    ctx.strokeStyle = "rgba(255,245,174,.85)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 25 + Math.sin(time * 5) * 2, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = "#522d66";
  ctx.fillRect(-13, -3, 26, 20);
  ctx.fillStyle = "#f8b3c8";
  ctx.fillRect(-13, 7, 26, 10);
  ctx.fillStyle = "#ffdfcd";
  ctx.fillRect(-13, -15, 25, 17);
  ctx.fillRect(-13, -23, 7, 11);
  ctx.fillRect(5, -23, 7, 11);
  ctx.fillStyle = "#ed91ac";
  ctx.fillRect(-11, -21, 3, 6);
  ctx.fillRect(7, -21, 3, 6);
  ctx.fillStyle = "#34204c";
  ctx.fillRect(-7, -9, 3, 4);
  ctx.fillRect(4, -9, 3, 4);
  ctx.fillStyle = "#df789c";
  ctx.fillRect(-2, -4, 3, 2);
  ctx.fillStyle = "#f7c38f";
  ctx.fillRect(-10, 16, 8, 4 + Math.max(0, Math.round(anim * 2)));
  ctx.fillRect(4, 16, 8, 4 - Math.min(0, Math.round(anim * 2)));
  ctx.fillStyle = "#7a4e93";
  ctx.fillRect(8, 0, 12, 4);
  ctx.fillRect(17, -4, 5, 5);
  ctx.restore();
}

function drawWorld(ctx: CanvasRenderingContext2D, run: Run, camera: number, time: number, width: number, height: number) {
  const scale = Math.min(width / VIEW_WIDTH, height / VIEW_HEIGHT);
  const offsetX = (width - VIEW_WIDTH * scale) / 2;
  const offsetY = (height - VIEW_HEIGHT * scale) / 2;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = "#665d94";
  ctx.fillRect(0, 0, width, height);
  ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
  ctx.imageSmoothingEnabled = false;
  const zoneIndex = Math.min(WORLD_NAMES.length - 1, Math.floor(run.player.x / (WORLD_END / WORLD_NAMES.length)));
  const gradient = ctx.createLinearGradient(0, 0, 0, VIEW_HEIGHT);
  gradient.addColorStop(0, SKY_PALETTES[zoneIndex][0]);
  gradient.addColorStop(0.48, SKY_PALETTES[zoneIndex][1]);
  gradient.addColorStop(1, SKY_PALETTES[zoneIndex][2]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  ctx.fillStyle = "rgba(255,242,193,.8)";
  ctx.beginPath();
  ctx.arc(760, 110, 52, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,245,217,.34)";
  for (let i = 0; i < 12; i++) {
    const x = (i * 191 - camera * 0.12) % (VIEW_WIDTH + 50);
    const y = 45 + ((i * 37) % 150);
    ctx.fillRect((x + VIEW_WIDTH + 50) % (VIEW_WIDTH + 50), y + Math.sin(time * 0.5 + i) * 3, 3, 3);
  }
  ctx.fillStyle = "rgba(62,42,79,.62)";
  ctx.fillRect(14, 14, 194, 25);
  ctx.fillStyle = "#fff2d7";
  ctx.font = "7px monospace";
  ctx.fillText(WORLD_NAMES[zoneIndex], 23, 30);
  drawMountains(ctx, camera);
  drawClouds(ctx, camera, time);

  ctx.save();
  ctx.translate(-camera, 0);
  for (const platform of run.platforms) {
    const py = platformPosition(platform, run.elapsed);
    if (platform.x + platform.width < camera - 20 || platform.x > camera + VIEW_WIDTH + 20) continue;
    const platformZone = Math.min(GRASS_PALETTES.length - 1, Math.floor(platform.x / (WORLD_END / GRASS_PALETTES.length)));
    ctx.fillStyle = platform.moving ? "#9565a5" : ["#765b77", "#715c78", "#6e5875", "#705477", "#765879"][platformZone];
    ctx.fillRect(platform.x, py, platform.width, platform.height);
    ctx.fillStyle = platform.moving ? "#a8d58a" : GRASS_PALETTES[platformZone];
    ctx.fillRect(platform.x, py, platform.width, 7);
    ctx.fillStyle = "#d7a4af";
    ctx.fillRect(platform.x + 12, py + 10, 11, 4);
    ctx.fillRect(platform.x + platform.width - 29, py + 11, 13, 4);
    if (!platform.moving) {
      for (let flowerX = platform.x + 27; flowerX < platform.x + platform.width - 14; flowerX += 82) {
        ctx.fillStyle = "#517b67";
        ctx.fillRect(flowerX, py - 5, 2, 5);
        ctx.fillStyle = "#ffeaa7";
        ctx.fillRect(flowerX - 2, py - 8, 6, 4);
      }
    }
  }

  drawCheckpoint(ctx, 1490, run.checkpoint >= 1490, time);
  drawCheckpoint(ctx, 3230, run.checkpoint >= 3230, time);
  drawCheckpoint(ctx, 4780, run.checkpoint >= 4780, time);

  for (const item of run.collectibles) {
    if (run.collected.has(item.id) || item.x < camera - 40 || item.x > camera + VIEW_WIDTH + 40) continue;
    const float = Math.sin(time * 4 + item.x) * 4;
    const iy = item.y + float;
    if (item.kind === "star") {
      ctx.fillStyle = "#ffe27e";
      ctx.beginPath();
      ctx.moveTo(item.x, iy - 12); ctx.lineTo(item.x + 4, iy - 4); ctx.lineTo(item.x + 12, iy);
      ctx.lineTo(item.x + 4, iy + 4); ctx.lineTo(item.x, iy + 12); ctx.lineTo(item.x - 4, iy + 4);
      ctx.lineTo(item.x - 12, iy); ctx.lineTo(item.x - 4, iy - 4); ctx.closePath(); ctx.fill();
      ctx.fillStyle = "#fff5cb"; ctx.fillRect(item.x - 2, iy - 4, 4, 8);
    } else if (item.kind === "heart") {
      ctx.fillStyle = "#fa759f";
      ctx.fillRect(item.x - 9, iy - 6, 8, 7); ctx.fillRect(item.x + 1, iy - 6, 8, 7);
      ctx.fillRect(item.x - 12, iy - 2, 24, 6); ctx.fillRect(item.x - 9, iy + 4, 18, 5); ctx.fillRect(item.x - 5, iy + 9, 10, 4);
      ctx.fillStyle = "#ffd8e3"; ctx.fillRect(item.x - 6, iy - 4, 3, 3);
    } else {
      ctx.fillStyle = "#7ae0cd"; ctx.fillRect(item.x - 8, iy - 9, 16, 18);
      ctx.fillStyle = "#e9fff0"; ctx.fillRect(item.x - 3, iy - 5, 6, 10); ctx.fillRect(item.x - 5, iy - 3, 10, 6);
    }
    ctx.fillStyle = "rgba(255,255,255,.5)";
    ctx.fillRect(item.x + 13, iy - 10, 3, 3);
  }

  for (const enemy of run.enemies) {
    if (enemy.x < camera - 40 || enemy.x > camera + VIEW_WIDTH + 40 || enemy.stunned > 0) continue;
    const bounce = Math.abs(Math.sin(time * 4 + enemy.x)) * (enemy.id.startsWith("fly") ? 9 : 4);
    ctx.fillStyle = enemy.id === "guardian" ? "#8a547f" : enemy.id.startsWith("mushroom") ? "#e88498" : "#81bda7";
    ctx.fillRect(enemy.x - 16, enemy.y - 20 - bounce, 32, 23);
    ctx.fillStyle = enemy.id === "guardian" ? "#f5c45e" : "#fff0db";
    ctx.fillRect(enemy.x - 9, enemy.y - 14 - bounce, 4, 5);
    ctx.fillRect(enemy.x + 4, enemy.y - 14 - bounce, 4, 5);
    ctx.fillStyle = "#55304f";
    ctx.fillRect(enemy.x - 7, enemy.y - 2 - bounce, 3, 3);
    ctx.fillRect(enemy.x + 5, enemy.y - 2 - bounce, 3, 3);
  }

  drawPortal(ctx, PORTAL_X, time);
  drawCat(ctx, run.player.x, run.player.y, run, time);
  ctx.restore();

  const progress = Math.max(0, Math.min(1, run.player.x / PORTAL_X));
  ctx.fillStyle = "rgba(83,49,99,.5)";
  ctx.fillRect(0, VIEW_HEIGHT - 9, VIEW_WIDTH, 9);
  ctx.fillStyle = "#fff1ad";
  ctx.fillRect(0, VIEW_HEIGHT - 9, VIEW_WIDTH * progress, 9);
}

function drawMountains(ctx: CanvasRenderingContext2D, camera: number) {
  const offset1 = (camera * 0.18) % 900;
  const offset2 = (camera * 0.32) % 900;
  ctx.fillStyle = "#a48dbb";
  for (let i = -1; i < 3; i++) {
    const x = i * 460 - offset1;
    ctx.beginPath(); ctx.moveTo(x, 365); ctx.lineTo(x + 190, 132); ctx.lineTo(x + 390, 365); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#c79cb5"; ctx.fillRect(x + 178, 168, 20, 28);
    ctx.fillStyle = "#a48dbb";
  }
  ctx.fillStyle = "#847aaa";
  for (let i = -1; i < 4; i++) {
    const x = i * 340 - offset2;
    ctx.beginPath(); ctx.moveTo(x, 404); ctx.lineTo(x + 140, 222); ctx.lineTo(x + 310, 404); ctx.closePath(); ctx.fill();
  }
}

function drawClouds(ctx: CanvasRenderingContext2D, camera: number, time: number) {
  for (let i = 0; i < 5; i++) {
    const x = (i * 260 - camera * 0.09 + time * 5) % (VIEW_WIDTH + 150);
    const cx = (x + VIEW_WIDTH + 150) % (VIEW_WIDTH + 150) - 75;
    const y = 105 + (i % 3) * 49;
    ctx.fillStyle = "rgba(255,225,226,.5)";
    ctx.fillRect(cx, y, 75, 16); ctx.fillRect(cx + 14, y - 12, 26, 17); ctx.fillRect(cx + 43, y - 6, 21, 12);
  }
}

function drawCheckpoint(ctx: CanvasRenderingContext2D, x: number, active: boolean, time: number) {
  ctx.fillStyle = active ? "#ffec9e" : "#b7abd1";
  ctx.fillRect(x - 3, 392, 6, 66);
  ctx.fillStyle = active ? "#fff2a7" : "#d7cadb";
  ctx.fillRect(x, 394, 29, 16); ctx.fillRect(x + 6, 410, 19, 7); ctx.fillRect(x + 12, 417, 12, 7);
  if (active) {
    ctx.fillStyle = `rgba(255,235,156,${0.16 + Math.sin(time * 5) * 0.08})`;
    ctx.beginPath(); ctx.arc(x, 424, 32, 0, Math.PI * 2); ctx.fill();
  }
}

function drawPortal(ctx: CanvasRenderingContext2D, x: number, time: number) {
  ctx.fillStyle = "rgba(255,234,186,.18)";
  ctx.beginPath(); ctx.arc(x, 402, 86 + Math.sin(time * 2) * 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#8c669d"; ctx.fillRect(x - 48, 347, 16, 113); ctx.fillRect(x + 32, 347, 16, 113);
  ctx.fillRect(x - 58, 338, 116, 14); ctx.fillRect(x - 39, 327, 78, 12);
  ctx.fillStyle = "#f6a8c8"; ctx.fillRect(x - 26, 357, 52, 93);
  ctx.fillStyle = "#d3b9f5"; ctx.fillRect(x - 20, 363, 40, 81);
  ctx.fillStyle = "#fff5ce"; ctx.fillRect(x - 10, 369, 20, 67);
  for (let i = 0; i < 5; i++) {
    const a = time * 1.5 + i * (Math.PI * 2 / 5);
    ctx.fillStyle = "#fff3b0";
    ctx.fillRect(x + Math.cos(a) * 54 - 2, 395 + Math.sin(a) * 47 - 2, 5, 5);
  }
}

function snapshotRun(run: Run): RunSnapshot {
  return { active: true, special: run.special, x: run.player.x, checkpoint: run.checkpoint, score: run.score, stars: run.stars, hearts: run.hearts, lives: run.lives, collected: [...run.collected], falls: run.falls };
}

export default function LevelFour({ onMap, onLetterComplete, onComplete, setMusicDucked, game }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runRef = useRef<Run | null>(null);
  const propsRef = useRef({ game, onComplete });
  propsRef.current = { game, onComplete };
  const phaseRef = useRef<Phase>("intro");
  const inputRef = useRef({ left: false, right: false, jumpPressed: false });
  const campaignRef = useRef<Campaign>(emptyCampaign());
  const [campaign, setCampaign] = useState<Campaign>(() => loadCampaign());
  const [phase, setPhase] = useState<Phase>(() => loadCampaign().completed ? "victory" : "intro");
  const [instructionPage, setInstructionPage] = useState(0);
  const [hud, setHud] = useState<{ x: number; lives: number; stars: number; hearts: number; score: number; special: boolean; message: string; interaction: ProximityInteraction | null; interactionInRange: boolean }>({ x: 0, lives: 3, stars: 0, hearts: 0, score: 0, special: false, message: "", interaction: null, interactionInRange: false });

  campaignRef.current = campaign;
  phaseRef.current = phase;

  useEffect(() => {
    setMusicDucked(phase === "letter");
    return () => setMusicDucked(false);
  }, [phase, setMusicDucked]);

  const changePhase = (next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  };

  const returnToMap = () => {
    onMap();
  };

  const saveCampaign = (next: Campaign) => {
    campaignRef.current = next;
    setCampaign(next);
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(next));
  };

  const currentSpecial = () => isSpecialAttempt(campaignRef.current.failedAttempts);

  const saveSnapshot = (run: Run) => {
    const next = { ...campaignRef.current, activeRun: snapshotRun(run) };
    saveCampaign(next);
  };

  const beginRun = (resume = false) => {
    const saved = resume ? campaignRef.current.activeRun : null;
    const special = saved?.active ? saved.special : currentSpecial();
    const run = makeRun(special, saved);
    runRef.current = run;
    inputRef.current = { left: false, right: false, jumpPressed: false };
    saveCampaign({ ...campaignRef.current, activeRun: snapshotRun(run) });
    changePhase("playing");
  };

  const countFailure = () => {
    const current = campaignRef.current;
    if (!current.activeRun?.active) return;
    saveCampaign({ ...current, failedAttempts: current.failedAttempts + 1, activeRun: null });
  };

  const returnToIntro = () => {
    inputRef.current = { left: false, right: false, jumpPressed: false };
    changePhase("intro");
  };

  const restartRun = () => {
    countFailure();
    beginRun(false);
  };

  const finishRun = () => {
    const current = campaignRef.current;
    const run = runRef.current;
    if (current.completed || !run || run.portalEntered) return;
    run.portalEntered = true;
    saveCampaign({ ...current, completed: true, activeRun: null, result: { score: run.score, stars: run.stars, hearts: run.hearts } });
    propsRef.current.game.award("HEART CONQUEROR", 500);
    propsRef.current.onComplete();
    changePhase("victory");
  };

  const loseLife = () => {
    const run = runRef.current;
    if (!run) return;
    const failedX = run.player.x;
    run.falls += 1;
    if (run.special) {
      run.helpLevel = Math.min(4, 1 + Math.floor(run.falls / 2));
      run.lives = 99;
      run.message = ["A softer landing next time!", "The stars are lending a paw.", "A safe little shortcut is ready.", "The path is yours. Keep going!"][run.helpLevel - 1];
      run.messageTime = 4;
      if (run.helpLevel >= 4) run.checkpoint = Math.max(run.checkpoint, Math.min(failedX + 220, PORTAL_X - 300));
      run.player.x = run.checkpoint;
      run.player.y = 420;
      run.player.vx = 0;
      run.player.vy = 0;
      run.player.invulnerable = 2;
      run.player.grounded = false;
      saveSnapshot(run);
      propsRef.current.game.wrongAnswer();
      return;
    }
    run.lives -= 1;
    propsRef.current.game.wrongAnswer();
    if (run.lives <= 0) {
      countFailure();
      changePhase("gameover");
      return;
    }
    run.message = "A little setback. Your checkpoint is waiting!";
    run.messageTime = 3;
    run.player.x = run.checkpoint;
    run.player.y = 420;
    run.player.vx = 0;
    run.player.vy = 0;
    run.player.invulnerable = 1.8;
    run.player.grounded = false;
    saveSnapshot(run);
  };

  const activateHelp = () => {
    const run = runRef.current;
    if (!run?.special) return;
    run.helpLevel = Math.min(4, run.helpLevel + 1);
    run.lives = 99;
    if (run.helpLevel >= 3) run.shield = 30;
    run.message = ["You've got this, Player 2!", "The platforms are taking it easy.", "A little safe path is appearing.", "The stars will always help you forward."][run.helpLevel - 1];
    run.messageTime = 4;
    setHud((old) => ({ ...old, lives: run.lives, message: run.message }));
  };

  const activeCanvas = phase === "playing" || phase === "paused";
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let frame = 0;
    let lastTime = 0;
    let hudTime = 0;
    let saveTime = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const keyDown = (event: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", " ", "Escape", "w", "a", "d", "e"].includes(event.key) || ["ArrowLeft", "ArrowRight", "ArrowUp", " "].includes(event.code)) event.preventDefault();
      const key = event.key.toLowerCase();
      if (key === "escape" && phaseRef.current === "playing") { changePhase("paused"); return; }
      if (key === "escape" && phaseRef.current === "paused") { changePhase("playing"); return; }
      if (phaseRef.current !== "playing") return;
      if (key === "a" || key === "arrowleft") inputRef.current.left = true;
      if (key === "d" || key === "arrowright") inputRef.current.right = true;
      if ((key === " " || key === "w" || key === "arrowup") && !event.repeat) inputRef.current.jumpPressed = true;
      if (key === "e") activateHelp();
    };
    const keyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === "a" || key === "arrowleft") inputRef.current.left = false;
      if (key === "d" || key === "arrowright") inputRef.current.right = false;
    };
    const clearInput = () => { inputRef.current = { left: false, right: false, jumpPressed: false }; };
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    window.addEventListener("blur", clearInput);

    const step = (dt: number, now: number) => {
      const run = runRef.current;
      if (!run || phaseRef.current !== "playing") return;
      run.elapsed += dt;
      const player = run.player;
      const input = inputRef.current;
      const acceleration = run.special ? 1450 + run.helpLevel * 100 : 1200;
      const maxSpeed = run.special ? 270 + run.helpLevel * 18 : 235;
      if (input.left !== input.right) {
        const direction = input.left ? -1 : 1;
        player.vx += direction * acceleration * dt;
        player.facing = direction;
      } else {
        player.vx *= Math.pow(0.0008, dt);
      }
      player.vx = Math.max(-maxSpeed, Math.min(maxSpeed, player.vx));

      const previousPlatform = player.platformId ? run.platforms.find((platform) => platform.id === player.platformId) : undefined;
      if (player.grounded && previousPlatform?.moving) {
        const currentY = platformPosition(previousPlatform, run.elapsed);
        const previousY = platformPosition(previousPlatform, run.elapsed - dt);
        player.y += currentY - previousY;
      }
      if (input.jumpPressed) {
        const canJump = player.grounded || player.coyote > 0 || player.jumps < 2;
        if (canJump) {
          player.vy = -(run.special ? 515 + run.helpLevel * 58 : 470);
          player.grounded = false;
          player.coyote = 0;
          player.jumps = Math.min(2, player.jumps + 1);
          player.platformId = null;
        }
        input.jumpPressed = false;
      }

      if (!player.grounded) player.vy += (run.special ? 980 - run.helpLevel * 70 : 1100) * dt;
      player.x = Math.max(0, Math.min(WORLD_END - player.width, player.x + player.vx * dt));
      const oldBottom = player.y + player.height;
      player.y += player.vy * dt;
      player.grounded = false;
      player.platformId = null;
      for (const platform of run.platforms) {
        const py = platformPosition(platform, run.elapsed);
        const crossedTop = oldBottom <= py + 8 && player.y + player.height >= py && player.vy >= 0;
        const overlaps = player.x + player.width > platform.x && player.x < platform.x + platform.width;
        if (crossedTop && overlaps) {
          player.y = py - player.height;
          player.vy = 0;
          player.grounded = true;
          player.jumps = 0;
          player.coyote = 0.13;
          player.platformId = platform.id;
        }
      }
      if (player.grounded) player.coyote = 0.13;
      else player.coyote = Math.max(0, player.coyote - dt);
      player.invulnerable = Math.max(0, player.invulnerable - dt);
      run.shield = Math.max(0, run.shield - dt);
      if (run.messageTime > 0) run.messageTime = Math.max(0, run.messageTime - dt);

      for (const enemy of run.enemies) {
        if (enemy.stunned > 0) { enemy.stunned -= dt; continue; }
        const speedScale = run.special ? Math.max(0.32, 1 - run.helpLevel * 0.16) : 1;
        enemy.x += enemy.direction * enemy.speed * speedScale * dt;
        if (enemy.x < enemy.min || enemy.x > enemy.max) enemy.direction *= -1;
        const enemyTop = enemy.y - 21;
        const collides = player.x + player.width > enemy.x - 15 && player.x < enemy.x + 15 &&
          player.y + player.height > enemyTop && player.y < enemy.y;
        if (!collides || run.special && run.helpLevel >= 4 || player.invulnerable > 0 || run.shield > 0) continue;
        if (player.vy > 100 && oldBottom < enemyTop + 10) {
          enemy.stunned = 4;
          player.vy = -300;
          run.score += 50;
        } else {
          player.vx = player.x < enemy.x ? -220 : 220;
          player.vy = -290;
          player.invulnerable = run.special ? 3.5 + run.helpLevel : 1.6;
          run.message = "BONK! Take a breath and try again.";
          run.messageTime = 2.6;
          if (!run.special) {
            run.lives -= 1;
            propsRef.current.game.wrongAnswer();
            if (run.lives <= 0) {
              countFailure();
              changePhase("gameover");
            }
          }
        }
      }

      for (const item of run.collectibles) {
        if (run.collected.has(item.id)) continue;
        const close = Math.abs(player.x + player.width / 2 - item.x) < 25 && Math.abs(player.y + player.height / 2 - item.y) < 28;
        if (!close) continue;
        run.collected.add(item.id);
        if (item.kind === "star") { run.stars += 1; run.score += 100; }
        if (item.kind === "heart") { run.hearts += 1; run.score += 150; }
        if (item.kind === "shield") { run.shield = 8; run.score += 75; }
        run.message = item.kind === "heart" ? "YOU FOUND A LITTLE PIECE OF MY HEART." : item.kind === "star" ? "FRIENDSHIP STAR +100" : "A LITTLE EXTRA PROTECTION!";
        run.messageTime = 2.4;
        propsRef.current.game.collect(item.kind === "star" ? 1001 : item.kind === "heart" ? 1002 : 1003, item.kind === "star" ? "Friendship Star" : item.kind === "heart" ? "Heart Coin" : "Lucky Shield");
        if (item.id === "heart-secret") {
          propsRef.current.game.secret("level-four-hidden-heart", "A LITTLE PIECE OF MY HEART");
        }
      }

      for (const x of [1490, 3230, 4780]) {
        if (player.x + player.width > x - 24 && player.x < x + 28 && run.checkpoint < x) {
          run.checkpoint = x;
          run.message = "CHECKPOINT SAVED!";
          run.messageTime = 3;
          propsRef.current.game.award(`LEVEL 04 CHECKPOINT ${x}`, 25);
          saveSnapshot(run);
        }
      }

      if (player.y > VIEW_HEIGHT + 80) loseLife();
      if (player.x + player.width >= PORTAL_X - 30 && !run.portalEntered) finishRun();
      if (player.x > 2350 && !run.hintsShown.has(1)) {
        run.hintsShown.add(1);
        run.message = "Psst... there's a safer route above you!";
        run.messageTime = 4;
      }
      if (player.x > 5400 && !run.hintsShown.has(2)) {
        run.hintsShown.add(2);
        run.message = "YOU'RE SO CLOSE, PLAYER 2. ONE LAST LITTLE LEAP.";
        run.messageTime = 4;
      }
      if (now - hudTime > 110) {
        hudTime = now;
        const interactions: ProximityInteraction[] = [
          ...run.collectibles
            .filter((item) => !run.collected.has(item.id))
            .map((item) => ({
              id: item.id,
              title: item.kind === "star" ? "FRIENDSHIP STAR" : item.kind === "heart" ? "HEART COIN" : "LUCKY SHIELD",
              discovery: "Something is glowing along the path.",
              instruction: item.kind === "shield"
                ? "Move into the shield to collect a brief layer of protection."
                : item.kind === "heart"
                  ? "Move into the heart to collect this piece of the memory."
                  : "Move into the star to collect friendship points.",
              control: "MOVE INTO IT",
              x: item.x,
              y: item.y,
              detectionRadius: 150,
              interactionRadius: 35,
            })),
          ...run.platforms
            .filter((platform) => !platform.id.startsWith("ground-") && platform.x >= player.x + player.width && platform.x - player.x < 260)
            .slice(0, 1)
            .map((platform) => ({
              id: platform.id,
              title: "JUMPABLE PLATFORM",
              discovery: "A platform is coming up. Watch its height and timing.",
              instruction: "Land on the top surface to continue. Jump with SPACE / W / ↑, or tap JUMP.",
              control: "SPACE / W / ↑ · JUMP",
              x: platform.x,
              y: platform.y,
              detectionRadius: 250,
              interactionRadius: 185,
            })),
          ...run.enemies
            .filter((enemy) => enemy.stunned <= 0)
            .map((enemy) => ({
              id: enemy.id,
              title: "A CREATURE AHEAD",
              discovery: "A creature is patrolling this part of the path.",
              instruction: "Jump onto its head to bounce past it; avoid its sides.",
              control: "SPACE / W / ↑ · JUMP",
              x: enemy.x,
              y: enemy.y,
              detectionRadius: 140,
              interactionRadius: 95,
            })),
          ...[1490, 3230, 4780]
            .filter((checkpoint) => checkpoint > run.checkpoint)
            .slice(0, 1)
            .map((checkpoint) => ({
              id: `checkpoint-${checkpoint}`,
              title: "CHECKPOINT FLOWER",
              discovery: "A glowing flower ahead marks a safe checkpoint.",
              instruction: "Cross the flower to save your progress automatically.",
              control: "WALK THROUGH",
              x: checkpoint,
              y: VIEW_HEIGHT - 40,
              detectionRadius: 135,
              interactionRadius: 60,
            })),
          {
            id: "heart-portal",
            title: "THE FINAL DESTINATION",
            discovery: "A glowing portal waits at the end of the adventure.",
            instruction: "Keep moving right into the portal to reach the birthday letter.",
            control: "MOVE RIGHT",
            x: PORTAL_X,
            y: VIEW_HEIGHT - 90,
            detectionRadius: 230,
            interactionRadius: 200,
          },
        ];
        const nearest = findNearestInteraction(interactions, {
          x: player.x + player.width / 2,
          y: player.y + player.height / 2,
        });
        setHud({ x: Math.min(1, player.x / PORTAL_X), lives: run.lives, stars: run.stars, hearts: run.hearts, score: run.score, special: run.special, message: run.messageTime > 0 ? run.message : "", interaction: nearest?.interaction ?? null, interactionInRange: nearest?.inRange ?? false });
      }
      if (now - saveTime > 2200) { saveTime = now; saveSnapshot(run); }
    };

    const loop = (now: number) => {
      const delta = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 0;
      lastTime = now;
      const run = runRef.current;
      if (run && phaseRef.current === "playing") {
        let remaining = delta;
        while (remaining > 0) {
          const stepDelta = Math.min(1 / 60, remaining);
          step(stepDelta, now);
          remaining -= stepDelta;
        }
      }
      if (run) {
        const camera = Math.max(0, Math.min(WORLD_END - VIEW_WIDTH, run.player.x - 230));
        drawWorld(ctx, run, camera, run.elapsed, canvas.width, canvas.height);
      }
      frame = window.requestAnimationFrame(loop);
    };
    frame = window.requestAnimationFrame(loop);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
      window.removeEventListener("blur", clearInput);
    };
  }, [activeCanvas]);

  const moveControl = (direction: "left" | "right") => ({
    onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      inputRef.current[direction] = true;
    },
    onPointerUp: () => { inputRef.current[direction] = false; },
    onPointerCancel: () => { inputRef.current[direction] = false; },
    onLostPointerCapture: () => { inputRef.current[direction] = false; },
  });
  const jumpControl = {
    onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      inputRef.current.jumpPressed = true;
    },
  };

  const estimatedAttempt = campaign.failedAttempts + 1;
  const specialNext = currentSpecial();

  if (phase === "letter") return <main className="level-four-screen l4-letter">
    <div className="l4-letter-stars" aria-hidden="true">✦　♡　✧　♡　✦</div>
    <article className="l4-letter-card">
      <span className="l4-kicker">ANOTHER YEAR OF BEING MY BESTIE.</span>
      <h1>A LITTLE LETTER FOR MY PLAYER 2 <span>💗</span></h1>
      <p>Hey, you.</p>
      <p>You made it all the way here. You jumped across platforms, survived the chaos, collected little pieces of this world, and found your way to the end.</p>
      <p>But the truth is, this level was never really about reaching a portal.</p>
      <p>It was about celebrating you.</p>
      <div className="l4-personal-letter">{birthdayLetter}</div>
      <button className="l4-button l4-primary" onClick={onLetterComplete}>CONTINUE TO THE STARS</button>
    </article>
  </main>;

  return <main className="level-four-screen">
    <header className="l4-header">
      <button className="l4-back" onClick={phase === "playing" || phase === "paused" ? returnToIntro : returnToMap}>{phase === "playing" || phase === "paused" ? "← LEVEL INTRO" : "← WORLD MAP"}</button>
      <div className="l4-brand"><span>LEVEL 04</span><strong>THE ADVENTURE TO MY HEART</strong></div>
    </header>

    {phase === "intro" && <section className="l4-intro">
      <div className="l4-sky-pixels" aria-hidden="true"><i /><i /><i /><i /><i /></div>
      <div className="l4-intro-copy">
        <div className="l4-kicker">A PLAYER 2 PLATFORM ADVENTURE</div>
        <h1>THE ADVENTURE<br /><em>TO MY HEART</em></h1>
        <p className="l4-subtitle">One tiny cat. One impossible adventure. One very important destination: my heart.</p>
        <p>Hey, Player 2. Your mission is simple... probably. Guide your tiny cat through a world of jumps, chaos, suspiciously cute monsters, and shiny things.</p>
        <p>Collect friendship stars, survive the obstacles, and find the portal waiting at the end. Somewhere beyond this world is something I made just for you.</p>
        {specialNext && <div className="l4-special-card">
          <div className="l4-sparkle-cat" aria-hidden="true">🐈‍⬛</div>
          <div><strong>✨ SPECIAL EDITION UNLOCKED! ✨</strong><p>The universe has decided this little cat deserves some extra luck.</p><p>Your adventure isn't over, Player 2. This time, the stars are on your side.</p></div>
        </div>}
        {campaign.activeRun?.active && <div className="l4-resume-note">YOUR ADVENTURE IS SAVED AT THE LAST CHECKPOINT.</div>}
        <div className="l4-intro-actions">
          <button className="l4-button l4-primary" onClick={() => { setInstructionPage(0); changePhase("instructions"); }}>HOW TO PLAY</button>
        </div>
        {!campaign.completed && <small className="l4-attempt-note">ADVENTURE {estimatedAttempt} / {campaign.failedAttempts} FAILED RUN{campaign.failedAttempts === 1 ? "" : "S"}</small>}
      </div>
      <div className="l4-preview">
        <div className="l4-preview-sun" />
        <div className="l4-preview-mountain one" /><div className="l4-preview-mountain two" />
        <div className="l4-preview-platform p1" /><div className="l4-preview-platform p2" /><div className="l4-preview-platform p3" />
        <div className="l4-preview-cat"><i /><b /><span /></div>
        <span className="l4-preview-star s1">✦</span><span className="l4-preview-star s2">✦</span><span className="l4-preview-heart">♡</span>
        <div className="l4-preview-caption">MEADOW → RUINS → SUNSET CLIFFS → MY HEART</div>
        <span className="l4-difficulty">MODERATE → HARD</span>
      </div>
      <div className="l4-intro-footer"><span>✦ FRIENDSHIP STARS</span><span>♡ HEART COINS</span><span>✧ SECRET TOKENS</span><span>◈ CHECKPOINTS</span></div>
    </section>}

    {phase === "instructions" && <InstructionGuide
      pages={adventureGuidePages}
      pageIndex={instructionPage}
      onPageChange={setInstructionPage}
      onStart={() => beginRun(campaign.activeRun?.active === true)}
      onMap={returnToMap}
      startLabel="START ADVENTURE"
      eyebrow="FIELD GUIDE / READ BEFORE YOU LEAP"
      theme="adventure"
      className="l4-instruction-guide"
    />}

    {(phase === "playing" || phase === "paused") && <section className="l4-game-section">
      <div className="l4-hud">
        <div className="l4-hud-level"><small>LEVEL 04 / WORLD 01–05</small><strong>{hud.special ? "SPECIAL EDITION" : "THE ADVENTURE TO MY HEART"}</strong></div>
        <div className="l4-progress"><span>DESTINATION: MY HEART</span><i><b style={{ width: `${Math.round(hud.x * 100)}%` }} /></i></div>
        <div className="l4-stat">♥ <b>{hud.lives === 99 ? "∞" : hud.lives}</b></div>
        <div className="l4-stat">✦ <b>{hud.stars}</b></div>
        <div className="l4-stat">♡ <b>{hud.hearts}</b></div>
        <div className="l4-stat l4-score">SCORE <b>{hud.score}</b></div>
        <button className="l4-pause-button" onClick={() => changePhase(phase === "playing" ? "paused" : "playing")} aria-label={phase === "playing" ? "Pause game" : "Resume game"}>{phase === "playing" ? "Ⅱ" : "▶"}</button>
      </div>
      <div className="l4-canvas-wrap">
        <canvas ref={canvasRef} aria-label="Side-scrolling pixel-art platform adventure. Use the controls to guide the cat to the portal." />
        {hud.message && phase === "playing" && <div className="l4-game-message" role="status">{hud.message}</div>}
        {hud.interaction && phase === "playing" && (
          <InteractionGuide
            title={hud.interaction.title}
            discovery={hud.interaction.discovery}
            instruction={hud.interaction.instruction}
            control={hud.interaction.control}
            inRange={hud.interactionInRange}
            tone="meadow"
          />
        )}
        {phase === "paused" && <div className="l4-overlay"><div className="l4-dialog"><span className="l4-kicker">PAUSED / NO RUSH</span><h2>TAKE A TINY BREATHER.</h2><button className="l4-button l4-primary" onClick={() => changePhase("playing")}>RESUME</button><button className="l4-button l4-secondary" onClick={restartRun}>RESTART THIS RUN</button><button className="l4-text-button" onClick={returnToIntro}>RETURN TO LEVEL INTRO</button></div></div>}
      </div>
      <div className="l4-touch-controls" aria-label="Touch game controls">
        <div><button {...moveControl("left")} aria-label="Move left">◀</button><button {...moveControl("right")} aria-label="Move right">▶</button></div>
        <button className="l4-jump" {...jumpControl}>JUMP<br /><small>DOUBLE TAP</small></button>
      </div>
      {hud.special && <div className="l4-special-badge">✦ SPECIAL EDITION ✦ <button onClick={activateHelp}>A LITTLE HELP, PLEASE!</button></div>}
    </section>}

    {phase === "gameover" && <section className="l4-end-panel"><div className="l4-kicker">THE ADVENTURE CONTINUES...</div><div className="l4-victory-cat">🐈</div><h1>YOUR NEXT ADVENTURE<br /><em>IS ALREADY WAITING.</em></h1><p>Every run brings you closer. Your score and discoveries are safe.</p><div className="l4-result-stats"><span>SCORE <b>{runRef.current?.score ?? 0}</b></span><span>STARS <b>{runRef.current?.stars ?? 0}</b></span><span>HEART COINS <b>{runRef.current?.hearts ?? 0}</b></span></div><button className="l4-button l4-primary" onClick={() => beginRun(false)}>TRY AGAIN</button><button className="l4-button l4-secondary" onClick={returnToIntro}>RETURN TO LEVEL INTRO</button></section>}

    {phase === "victory" && <section className="l4-end-panel l4-victory-panel">
      <div className="l4-confetti" aria-hidden="true">✦　♡　✧　✦　♡　✧　✦</div>
      <div className="l4-kicker">QUEST COMPLETE!</div><div className="l4-victory-cat">🐈</div>
      <h1>PLAYER 2 HAS CONQUERED THE WORLD.<br /><em>AND WON MY HEART.</em></h1>
      <p>You made it all the way to the portal. The real treasure was always you.</p>
      <div className="l4-result-stats"><span>BADGE <b>HEART CONQUEROR</b></span><span>SCORE <b>{runRef.current?.score ?? campaign.result?.score ?? 0}</b></span><span>STARS <b>{runRef.current?.stars ?? campaign.result?.stars ?? 0}</b></span><span>HEART COINS <b>{runRef.current?.hearts ?? campaign.result?.hearts ?? 0}</b></span></div>
      <button className="l4-button l4-primary" onClick={() => changePhase("letter")}>OPEN YOUR FINAL REWARD</button>
      <button className="l4-text-button" onClick={returnToMap}>BACK TO WORLD MAP</button>
    </section>}
  </main>;
}
