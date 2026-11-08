import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import "./fight-club.css";
import LevelFour from "./LevelFour";
import InstructionGuide, { type InstructionPage } from "./InstructionGuide";
import birthdayLetter from "./birthday-letter";
import CelestialRealm from "./celestial-realm/components/CelestialRealm";
import InteractionGuide, { findNearestInteraction } from "./InteractionGuide";

type Screen = "start" | "map" | "guide" | "timeline" | "lore" | "quiz" | "inventory" | "adventure" | "haunted" | "hauntedReveal" | "ending" | "finalStory";
type GuideKind = "game" | "timeline" | "lore" | "quiz";
type IconName = "arrow" | "audio" | "back" | "camera" | "chat" | "chest" | "close" | "heart" | "home" | "lock" | "map" | "music" | "play" | "sparkle" | "sword" | "trophy";

// PERSONALIZE HERE: replace the placeholders below with real dates, photos, stories, lore, and answers.
type Memory = {
  id: number;
  date: string;
  dateStart: string;
  dateEnd: string;
  title: string;
  caption: string;
  story: string;
  photo: string;
  image: string;
};

const memories: Memory[] = [
  { id: 1, date: "[2020-2021]", dateStart: "2020-01-01", dateEnd: "2021-12-31", title: "Teenagers", caption: "The first meetup of covid era", story: "We went to school after so long that day and I remember once I wanted to stay longer, but that goddamn guy came early. And then idk why I was being so dramatic about it on call that evening.", photo: "covid-meetup.jpg", image: "/photos/covid-meetup.jpg" },
  { id: 2, date: "[10-05-2022]", dateStart: "2022-05-10", dateEnd: "2022-05-10", title: "Kendall & Kylie hairstyles", caption: "ps~This line was said by mee", story: "It was also during COVID, when we were in that phase of dreaming big shitss like damnn.. the shit we used to talk about, though it still hasn't changed, but it was the starting phase.", photo: "kendall-kylie.jpg", image: "/photos/kendall-kylie.jpg" },
  { id: 3, date: "[2015-2016]", dateStart: "2015-01-01", dateEnd: "2016-12-31", title: "Rabbit Teeth", caption: "Our First pic ig", story: "We were soooo small wowww, I mean, this was literally our first pic together and just look at us, all smiley smiley.", photo: "rabbit-teeth.jpg", image: "/photos/rabbit-teeth.jpg" },
  { id: 4, date: "[2026]", dateStart: "2026-01-01", dateEnd: "2026-12-31", title: "a relaxing day", caption: "THE long awaited day", story: "Honestly, I really wanted to spend a whole day just talking face to face, doing nothing, just a normal hangout like everyone else, and taking things peacefully. I'd wanted that for a long, long time.", photo: "relaxing-hyangout.jpg", image: "/photos/relaxing-hangout.jpg" },
];

const celebrationProfile = {
  appTitle: "THE BIRTHDAY QUEST",
  playerName: "PLAYER 2",
  mainCharacter: "BIRTHDAY GIRL",
  highlightWord: "ENTERED",
  celebrationWord: "THE PARTY",
};

type FightOptionId = "A" | "B" | "C" | "D";

type FightOption = {
  id: FightOptionId;
  text: string;
};

type FightQuestion = {
  id: string;
  question: string;
  difficulty: "EASY" | "MEDIUM" | "HARD" | "VERY HARD" | "FINAL BOSS";
  note?: string;
  options: [FightOption, FightOption, FightOption, FightOption];
  correctAnswer: FightOptionId;
};

const fightQuestions: FightQuestion[] = [
  { id: "common-favourite-pet", question: "What's our common favourite pet?", difficulty: "EASY", options: [{ id: "A", text: "Dog" }, { id: "B", text: "Rabbit" }, { id: "C", text: "Cat" }, { id: "D", text: "Hamster" }], correctAnswer: "C" },
  { id: "dream-life", question: "What would our dream life look like?", difficulty: "EASY", options: [{ id: "A", text: "Living a peaceful life in the countryside" }, { id: "B", text: "Living in a luxurious mansion, doing whatever we want" }, { id: "C", text: "Becoming powerful, rich, and completely unstoppable" }, { id: "D", text: "Travelling the world with no responsibilities" }], correctAnswer: "B" },
  { id: "male-lead-trope", question: "Which male-lead trope would I choose?", difficulty: "EASY", options: [{ id: "A", text: "Cold duke" }, { id: "B", text: "Obsessive villain" }, { id: "C", text: "Childhood best friend" }, { id: "D", text: "Crown prince" }], correctAnswer: "B" },
  { id: "shared-promise", question: "What's something we always say to each other?", difficulty: "MEDIUM", options: [{ id: "A", text: "We'll figure it out somehow." }, { id: "B", text: "We'll make it and live our dream life one day, for sure." }, { id: "C", text: "Everything happens for a reason." }, { id: "D", text: "We'll become rich and disappear together." }], correctAnswer: "B" },
  { id: "fantasy-identity", question: "Which role would you be assigned in a fantasy manhwa?", difficulty: "MEDIUM", options: [{ id: "A", text: "Villainess" }, { id: "B", text: "Princess" }, { id: "C", text: "Female knight" }, { id: "D", text: "Mage" }], correctAnswer: "C" },
  { id: "chosen-power", question: "Which power would BOTH of us choose without a second thought?", difficulty: "MEDIUM", options: [{ id: "A", text: "Time manipulation" }, { id: "B", text: "Teleportation" }, { id: "C", text: "Mind reading" }, { id: "D", text: "Healing magic" }], correctAnswer: "A" },
  { id: "ultimate-ending", question: "Which ending would I prefer?", difficulty: "HARD", options: [{ id: "A", text: "Become the most powerful person in the empire" }, { id: "B", text: "Escape and live peacefully" }, { id: "C", text: "Travel the world with my favourite person" }, { id: "D", text: "Take over the throne" }], correctAnswer: "D" },
  { id: "zombie-apocalypse", question: "Who's more likely to survive a zombie apocalypse?", difficulty: "HARD", note: "P.S. I feel like it!", options: [{ id: "A", text: "Me (Player 1)" }, { id: "B", text: "You (Player 2)" }, { id: "C", text: "Neither of us" }, { id: "D", text: "We'd accidentally become the zombies." }], correctAnswer: "B" },
  { id: "arrest-situation", question: "If one of us got arrested, what would the other do?", difficulty: "VERY HARD", note: "Think logically about what our future selves would actually do!", options: [{ id: "A", text: "Immediately come to rescue them" }, { id: "B", text: "Ask what happened before helping" }, { id: "C", text: "Laugh first, then arrange a lawyer" }, { id: "D", text: "Somehow get arrested too" }], correctAnswer: "C" },
  { id: "ultimate-betrayal", question: "If someone offered us ₹10 crore to betray each other, what would happen?", difficulty: "FINAL BOSS", options: [{ id: "A", text: "We'd refuse immediately because friendship comes first" }, { id: "B", text: "We'd negotiate for ₹100 crore" }, { id: "C", text: "We'd pretend to betray each other and split the money" }, { id: "D", text: "We'd take the money and disappear together" }], correctAnswer: "D" },
];

const FIGHT_RULES = { startingHealth: 100, damagePerHit: 10 } as const;

const questions = [
  { category: "SHARED MEMORIES", question: "The place we often used to go to talk.. our non-surveillance spot?", options: ["The Bathroom", "The Sofa", "The Basement", "The Terrace"], answer: 3, hint: "Gurlll in bgp where it was try to recall.. yk even I used to go there in my house during covid so that no one could listen to our yapping ", wrong: "The Keeper has filed that answer under: suspicious #FUCK YOU" },
  { category: "ULTIMATE PLACE", question: "The obvious place we will go one day for fun and to enjoy the luxuries and live our rich-girl fantasies?" , options: ["Italy", "Monaco", "Switzerland", "Luxembourg"], answer: 1, hint: "BROOO.. You know yachts and all shit seriously you know it rememberrr", wrong: "I didn't expect you to get this wrong TT" },
  { category: "INSIDE JOKES", question: "The creature you hated the most AKA..?", options: ["Musty", "Melon Felon", "Musk Melon", "Elongated Muskrat"], answer: 2, hint: "That ass you remember.. He even named his own kid X", wrong: "SYSTEM: shared brain cell temporarily disconnected." },
  { category: "FINAL ROUND — OBSCURE FACT", question: "What was my first impression of you when we met?", options: ["I assumed we'd remain nothing more than classmates who happened to sit together.", "I figured we'd eventually become friends, but I never imagined we'd be this close.", "I thought we'd get along, but we'd never be genuinely close because our personalities were too different.", "I genuinely thought we had so little in common that, beyond being sitting partners, there was no reason for us to become friends."], answer: 3, hint: "Dudeee you really needed the hint whatever I hav already mentioned it like 5 million times so recall thatttt ", wrong: "Critical lore failure. The archives are pretending they didn't see that." },
];

const collectibles = [
  { id: 1, type: "MEMORY", title: "The Legendary Photo", rarity: "Epic", icon: "camera" as IconName, story: "Well honestly it really is A LEGENDARY photo for me like seriouslyy I even brought a camera which is ded now.. but this trip was like literally the first one without parents without anyone else but just us classmates it was really fun and also wasn't it our beginning stage of friendship, ig we barely knew each other around this time that is.", image: "/photos/legendary-photo.jpg" },
  { id: 2, type: "SOUNDTRACK", title: "The Song That Reminds Me of You", rarity: "Rare", icon: "music" as IconName, story: "[Add the song link and explain the exact memory it unlocks.]", image: "" },
  { id: 3, type: "EVIDENCE", title: "The Screenshot of Doom", rarity: "Common", icon: "chat" as IconName, story: "[Paste the screenshot or message that deserves permanent museum status.]", image: "" },
  { id: 4, type: "LOCATION", title: "Our Favorite Place", rarity: "Rare", icon: "map" as IconName, story: "[Add the place that belongs to both of you—a city, café, car, or one specific couch.]", image: "" },
  { id: 5, type: "MESSAGE", title: "A Message I Never Want You to Forget", rarity: "Epic", icon: "heart" as IconName, story: "[Write the message you want her to keep for difficult days.]", image: "" },
  { id: 6, type: "SAVE DATA", title: "The Friendship Save File", rarity: "Legendary", icon: "sparkle" as IconName, story: "[Write what this friendship has changed, protected, or made possible in your life.]", image: "" },
];

const letterBody = birthdayLetter.replace(/\n\nSee you in our dream life\.\n\n— Your partner in crime$/, "");
const letterParagraphs = letterBody.trim().split(/\n\s*\n/);

const FRIENDSHIP_MUSIC = "/music/nalyver-playful-cute-fun-remastered-614983.mp3";
const CELESTIAL_MUSIC = "/celestial/kulakovka-dark-cinematic-620558.mp3";
const MUSIC_PREFERENCE_KEY = "friendship-game-music-v1";
const DEFAULT_MUSIC_VOLUME = 0.16;
const MAX_MUSIC_VOLUME = 1;

type MusicPreference = { enabled: boolean; volume: number };
type MusicStatus = "ready" | "playing" | "unavailable";
type MusicPanelContextValue = { isOpen: boolean; toggle: () => void };

const MusicPanelContext = createContext<MusicPanelContextValue | null>(null);

function loadMusicPreference(): MusicPreference {
  try {
    const saved = window.localStorage.getItem(MUSIC_PREFERENCE_KEY);
    if (!saved) return { enabled: true, volume: DEFAULT_MUSIC_VOLUME };
    const parsed = JSON.parse(saved) as Partial<MusicPreference>;
    return {
      enabled: typeof parsed.enabled === "boolean" ? parsed.enabled : true,
      volume: typeof parsed.volume === "number" && Number.isFinite(parsed.volume)
        ? Math.max(0, Math.min(1, parsed.volume <= 0.3 ? parsed.volume / 0.3 : parsed.volume))
        : DEFAULT_MUSIC_VOLUME / 0.3,
    };
  } catch {
    return { enabled: true, volume: DEFAULT_MUSIC_VOLUME };
  }
}

class GameAudio {
  private readonly music = new Audio(FRIENDSHIP_MUSIC);
  private effectContext: AudioContext | null = null;
  private effectOscillators: OscillatorNode[] = [];
  private readonly onMusicStatusChange: (status: MusicStatus) => void;
  private enabled = true;
  private suspended = false;
  private musicUnavailable = false;
  private startingMusic = false;
  private retryWhenMusicReady = false;
  private musicRequest = 0;
  private destroyed = false;
  private activeEffect: "reward" | "penalty" | null = null;
  private effectTimer: number | null = null;
  private fadeTimer: number | null = null;
  private musicVolume = DEFAULT_MUSIC_VOLUME;
  private musicDucked = false;
  private musicTrack: "friendship" | "celestial" = "friendship";

  private readonly reportMusicPlayback = () => this.onMusicStatusChange(this.music.paused ? "ready" : "playing");
  private readonly reportMusicPaused = () => this.onMusicStatusChange("ready");
  private readonly reportMusicUnavailable = () => {
    this.musicUnavailable = true;
    this.onMusicStatusChange("unavailable");
  };

  constructor(onMusicStatusChange: (status: MusicStatus) => void) {
    this.onMusicStatusChange = onMusicStatusChange;
    this.music.loop = true;
    this.music.preload = "auto";
    this.music.volume = this.musicVolume;
    this.music.addEventListener("play", this.reportMusicPlayback);
    this.music.addEventListener("pause", this.reportMusicPaused);
    this.music.addEventListener("error", this.reportMusicUnavailable);
  }

  async startMusic(): Promise<boolean> {
    if (this.destroyed || !this.enabled || this.suspended || this.musicUnavailable) return false;
    if (!this.music.paused) return true;
    if (this.startingMusic) {
      this.retryWhenMusicReady = true;
      return false;
    }
    this.startingMusic = true;
    const request = ++this.musicRequest;
    try {
      await this.music.play();
      if (request !== this.musicRequest || this.destroyed || !this.enabled || this.suspended) {
        this.music.pause();
        return false;
      }
      return !this.music.paused;
    } catch (error) {
      if (request !== this.musicRequest || this.destroyed) return false;
      if (error instanceof DOMException && ["NotAllowedError", "AbortError"].includes(error.name)) {
        this.onMusicStatusChange("ready");
      } else {
        this.reportMusicUnavailable();
      }
      return false;
    } finally {
      this.startingMusic = false;
      const shouldRetry = this.retryWhenMusicReady;
      this.retryWhenMusicReady = false;
      if (shouldRetry && !this.destroyed && this.enabled && !this.suspended && this.music.paused) {
        void this.startMusic();
      }
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
      this.musicRequest += 1;
      this.music.pause();
      this.stopEffect();
      this.setMusicVolumeTarget(this.effectiveMusicVolume(), 0);
      return;
    }
    void this.startMusic();
  }

  suspendMusic() {
    this.suspended = true;
    this.musicRequest += 1;
    this.music.pause();
    this.music.currentTime = 0;
    this.stopEffect();
    this.setMusicVolumeTarget(this.effectiveMusicVolume(), 0);
  }

  resumeMusic() {
    this.suspended = false;
    if (this.enabled) void this.startMusic();
  }

  setMusicTrack(track: "friendship" | "celestial") {
    if (this.destroyed || this.musicTrack === track) return;
    this.musicTrack = track;
    this.musicRequest += 1;
    this.music.pause();
    this.music.currentTime = 0;
    this.music.src = track === "celestial" ? CELESTIAL_MUSIC : FRIENDSHIP_MUSIC;
    this.music.load();
    this.musicUnavailable = false;
    if (this.enabled && !this.suspended) void this.startMusic();
  }

  setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(MAX_MUSIC_VOLUME, volume));
    const target = this.effectiveMusicVolume() * (this.activeEffect ? 0.22 : 1);
    this.setMusicVolumeTarget(target, 0);
  }

  setMusicDucked(ducked: boolean) {
    if (this.musicDucked === ducked) return;
    this.musicDucked = ducked;
    const target = this.effectiveMusicVolume() * (this.activeEffect ? 0.22 : 1);
    this.setMusicVolumeTarget(target, 900);
  }

  playReward() {
    this.playEffect("reward");
  }

  playPenalty() {
    this.playEffect("penalty");
  }

  destroy() {
    this.destroyed = true;
    this.setEnabled(false);
    this.music.removeEventListener("play", this.reportMusicPlayback);
    this.music.removeEventListener("pause", this.reportMusicPaused);
    this.music.removeEventListener("error", this.reportMusicUnavailable);
    this.music.src = "";
    this.effectContext?.close();
    this.effectContext = null;
  }

  private playEffect(kind: "reward" | "penalty") {
    if (!this.enabled) return;
    if (this.activeEffect === "penalty" || (this.activeEffect === "reward" && kind === "reward")) return;
    if (this.activeEffect === "reward" && kind === "penalty") this.stopEffect();

    this.activeEffect = kind;
    this.setMusicVolumeTarget(this.effectiveMusicVolume() * 0.22, 220);
    void this.playSynthEffect(kind);
  }

  private async playSynthEffect(kind: "reward" | "penalty") {
    try {
      const context = this.effectContext ?? new AudioContext();
      this.effectContext = context;
      if (context.state === "suspended") await context.resume();
      if (this.activeEffect !== kind || this.destroyed) return;

      const notes = kind === "reward" ? [523.25, 659.25, 783.99] : [293.66, 220];
      const start = context.currentTime;
      notes.forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const noteStart = start + index * 0.11;
        const noteEnd = noteStart + 0.16;
        oscillator.type = kind === "reward" ? "triangle" : "sawtooth";
        oscillator.frequency.setValueAtTime(frequency, noteStart);
        gain.gain.setValueAtTime(0.0001, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.12, noteStart + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.onended = () => {
          oscillator.disconnect();
          gain.disconnect();
          this.effectOscillators = this.effectOscillators.filter((active) => active !== oscillator);
        };
        oscillator.start(noteStart);
        oscillator.stop(noteEnd);
        this.effectOscillators.push(oscillator);
      });
      this.effectTimer = window.setTimeout(() => this.finishEffect(kind), 500);
    } catch (error) {
      console.warn("Unable to play the game sound effect.", error);
      this.finishEffect(kind);
    }
  }

  private finishEffect(kind: "reward" | "penalty") {
    if (this.activeEffect !== kind) return;
    if (this.effectTimer !== null) window.clearTimeout(this.effectTimer);
    this.effectTimer = null;
    this.effectOscillators = [];
    this.activeEffect = null;
    if (this.enabled) this.setMusicVolumeTarget(this.effectiveMusicVolume(), 320);
  }

  private stopEffect() {
    if (this.effectTimer !== null) window.clearTimeout(this.effectTimer);
    this.effectTimer = null;
    this.effectOscillators.forEach((oscillator) => oscillator.stop());
    this.effectOscillators = [];
    this.activeEffect = null;
  }

  private effectiveMusicVolume() {
    return this.musicVolume * (this.musicDucked ? 0.62 : 1);
  }

  private setMusicVolumeTarget(target: number, duration: number) {
    if (this.fadeTimer !== null) window.clearInterval(this.fadeTimer);
    this.fadeTimer = null;
    if (duration === 0) {
      this.music.volume = target;
      return;
    }
    const start = this.music.volume;
    const startedAt = performance.now();
    this.fadeTimer = window.setInterval(() => {
      const progress = Math.min(1, (performance.now() - startedAt) / duration);
      this.music.volume = start + (target - start) * progress;
      if (progress === 1 && this.fadeTimer !== null) {
        window.clearInterval(this.fadeTimer);
        this.fadeTimer = null;
      }
    }, 20);
  }
}

interface GameState {
  xp: number;
  achievements: Set<string>;
  secrets: Set<string>;
  foundItems: Set<number>;
  award: (label: string, amount?: number) => void;
  spend: (amount: number) => boolean;
  playAttack: () => void;
  wrongAnswer: () => void;
  secret: (id: string, label: string) => void;
  collect: (id: number, title: string) => void;
}

interface StoredProgress {
  version: 1;
  xp: number;
  achievements: string[];
  secrets: string[];
  foundItems: number[];
  completed: Screen[];
  finalCompleted: boolean;
  ghostLevelUnlocked: boolean;
}

const PROGRESS_KEY = "friendship-game-progress-v1";
const GHOST_LEVEL_KEY = "friendship-game-ghost-level-v1";

function loadGhostLevelUnlock() {
  try {
    const saved = window.localStorage.getItem(GHOST_LEVEL_KEY);
    if (saved === null) return false;
    const parsed = JSON.parse(saved) as Partial<{ unlocked: boolean }>;
    return parsed.unlocked === true;
  } catch {
    return false;
  }
}

function loadProgress(): StoredProgress {
  const empty: StoredProgress = { version: 1, xp: 0, achievements: [], secrets: [], foundItems: [], completed: [], finalCompleted: false, ghostLevelUnlocked: loadGhostLevelUnlock() };
  try {
    const saved = window.localStorage.getItem(PROGRESS_KEY);
    if (!saved) return empty;
    const parsed = JSON.parse(saved) as Partial<StoredProgress>;
    if (parsed.version !== 1) return empty;
    return {
      version: 1,
      xp: typeof parsed.xp === "number" ? parsed.xp : 0,
      achievements: Array.isArray(parsed.achievements) ? parsed.achievements.filter((item): item is string => typeof item === "string") : [],
      secrets: Array.isArray(parsed.secrets) ? parsed.secrets.filter((item): item is string => typeof item === "string") : [],
      foundItems: Array.isArray(parsed.foundItems) ? parsed.foundItems.filter((item): item is number => typeof item === "number") : [],
      completed: Array.isArray(parsed.completed) ? parsed.completed.filter((item): item is Screen => ["timeline", "lore", "quiz", "inventory", "adventure"].includes(item)) : [],
      finalCompleted: parsed.finalCompleted === true,
      ghostLevelUnlocked: parsed.ghostLevelUnlocked === true || loadGhostLevelUnlock(),
    };
  } catch {
    return empty;
  }
}

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    arrow: <><path d="M5 12h14M14 7l5 5-5 5" /></>, audio: <><path d="M11 5 6 9H3v6h3l5 4V5Z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /></>,
    back: <path d="m15 18-6-6 6-6" />, camera: <><path d="M4 7h3l1.5-2h7L17 7h3v12H4Z" /><circle cx="12" cy="13" r="3.5" /></>,
    chat: <><path d="M4 5h16v11H9l-5 4V5Z" /><path d="M8 10h8M8 13h5" /></>, chest: <><path d="M4 9h16v10H4Z" /><path d="M5 9V6h14v3M9 9v4h6V9M12 13v3" /></>,
    close: <path d="m6 6 12 12M18 6 6 18" />, heart: <path d="M12 20S4 16 4 9a4 4 0 0 1 7-2.5L12 8l1-1.5A4 4 0 0 1 20 9c0 7-8 11-8 11Z" />,
    home: <path d="m4 11 8-7 8 7v9h-6v-6h-4v6H4Z" />, lock: <><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z" /><path d="M9 3v15M15 6v15" /></>, music: <><path d="M9 18V6l10-2v12" /><circle cx="6" cy="18" r="3" /><circle cx="16" cy="16" r="3" /></>,
    play: <path d="m9 6 10 6-10 6Z" />, sparkle: <><path d="m12 2 1.7 5.3L19 9l-5.3 1.7L12 16l-1.7-5.3L5 9l5.3-1.7Z" /><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7Z" /></>,
    sword: <><path d="m14 5 5-2-2 5L9 16l-3-3Z" /><path d="m5 12-2 2 7 7 2-2M7 17l-3 3" /></>, trophy: <><path d="M8 4h8v5a4 4 0 0 1-8 0Z" /><path d="M8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4M12 13v4M8 21h8M9 17h6v4H9Z" /></>,
  };
  return <svg aria-hidden="true" className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function PixelHeart({ filled = true }: { filled?: boolean }) {
  return <span className={`pixel-heart ${filled ? "filled" : ""}`} aria-label={filled ? "Life remaining" : "Life lost"} />;
}

function Button({ children, onClick, variant = "primary", icon, disabled = false }: { children: React.ReactNode; onClick?: () => void; variant?: "primary" | "secondary" | "ghost"; icon?: IconName; disabled?: boolean }) {
  return <button className={`game-button ${variant}`} onClick={onClick} disabled={disabled}>{icon && <Icon name={icon} size={17} />}<span>{children}</span></button>;
}

function TopBar({ onMap, game }: { onMap?: () => void; game: GameState }) {
  const [paused, setPaused] = useState(false);
  return <><header className="topbar">
    <button className="brand" onClick={onMap} aria-label="Go to game map"><span className="brand-mark">FG</span><span>{celebrationProfile.appTitle}</span></button>
    <div className="persistent-hud"><span><b>{game.xp.toLocaleString()}</b> XP</span><span><b>{game.achievements.size}</b> BADGES</span><span><b>{game.secrets.size}</b>/3 SECRETS</span></div>
    <div className="top-actions"><MusicPanelButton /><button className="pause-button" onClick={() => setPaused(true)}>II</button></div>
  </header>
  {paused && <div className="modal-backdrop"><section className="pause-menu"><small>GAME PAUSED</small><h2>Take a tiny side-quest break.</h2><div className="pause-stats"><span>FRIENDSHIP XP <b>{game.xp}</b></span><span>ACHIEVEMENTS <b>{game.achievements.size}</b></span><span>SECRET OBJECTS <b>{game.secrets.size}/3</b></span></div><Button onClick={() => setPaused(false)}>RESUME GAME</Button>{onMap && <Button variant="secondary" onClick={() => { setPaused(false); onMap(); }} icon="map">WORLD MAP</Button>}</section></div>}
  </>;
}

function MusicPanelButton() {
  const musicPanel = useContext(MusicPanelContext);
  if (!musicPanel) return null;
  return <button
    type="button"
    className="music-panel-toggle"
    onClick={musicPanel.toggle}
    aria-expanded={musicPanel.isOpen}
    aria-label={musicPanel.isOpen ? "Close music controls" : "Open music controls"}
    title={musicPanel.isOpen ? "Close music controls" : "Open music controls"}
  >🎵 MUSIC</button>;
}

function AchievementToast({ toast }: { toast: string | null }) {
  return toast ? <div className="achievement-toast"><span><Icon name="trophy" /></span><div><small>ACHIEVEMENT UNLOCKED</small><b>{toast}</b></div></div> : null;
}

function MusicControl({ enabled, status, volume, onToggle, onVolumeChange }: {
  enabled: boolean;
  status: MusicStatus;
  volume: number;
  onToggle: () => void;
  onVolumeChange: (volume: number) => void;
}) {
  return <aside className="music-control" aria-label="Background music controls">
    <div className="music-control-heading">
      <button type="button" className={`music-toggle ${enabled ? "enabled" : ""}`} onClick={onToggle} aria-pressed={enabled} aria-label={enabled ? "Mute background music" : "Turn on background music"}>
        <Icon name="music" size={17} />
      </button>
      <div className="music-control-label">
        <strong>ADVENTURE MUSIC</strong>
        <span className={enabled && status === "playing" ? "playing" : ""}>{!enabled ? "MUTED" : status === "playing" ? "PLAYING" : status === "unavailable" ? "TRACK MISSING" : "READY"}</span>
      </div>
    </div>
    <label className="music-volume">
      <span>VOLUME</span>
      <input type="range" min="0" max="100" step="1" value={Math.round(volume / MAX_MUSIC_VOLUME * 100)} onInput={(event) => onVolumeChange(Number(event.currentTarget.value) / 100)} onChange={(event) => onVolumeChange(Number(event.currentTarget.value) / 100)} aria-label="Background music volume" />
    </label>
  </aside>;
}

const bootMessages = ["Loading questionable decisions...", "Recovering deleted brain cells...", "Scanning friendship lore...", "Locating Player 2..."];

function StartScreen({ onStart, game }: { onStart: () => void; audio: boolean; toggleAudio: () => void; game: GameState }) {
  const [stage, setStage] = useState(0);
  const [load, setLoad] = useState(0);
  const [logoClicks, setLogoClicks] = useState(0);
  const [egg, setEgg] = useState(false);
  useEffect(() => {
    if (stage !== 0) return;
    if (load < bootMessages.length - 1) {
      const timer = window.setTimeout(() => setLoad((n) => n + 1), 650);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => setStage(1), 850);
    return () => window.clearTimeout(timer);
  }, [load, stage]);
  useEffect(() => {
    if (stage === 1) { const t = window.setTimeout(() => setStage(2), 1400); return () => window.clearTimeout(t); }
    if (stage === 2) { const t = window.setTimeout(() => setStage(3), 1800); return () => window.clearTimeout(t); }
  }, [stage]);
  const logoTap = () => {
    const next = logoClicks + 1;
    setLogoClicks(next);
    if (next === 5) { setEgg(true); game.award("THE LOGO KNOWS TOO MUCH", 125); }
  };
  if (stage < 3) return <main className="boot-screen screen">
    <div className="boot-music-control"><MusicPanelButton /></div>
    {stage === 0 && <section className="boot-console"><div className="boot-logo">FG_OS v2.0</div><h1>INITIALIZING FRIENDSHIP.EXE...</h1><div className="loading-track"><i style={{ width: `${(load + 1) * 25}%` }} /></div><p>{bootMessages[load]}</p><span>{(load + 1) * 25}%</span></section>}
    {stage === 1 && <section className="detected-alert"><span>SYSTEM ALERT</span><h1>PLAYER 2 HAS BEEN DETECTED.</h1><div className="scan-line" /></section>}
    {stage === 2 && <section className="duo-detected"><div className="mini-player left-player"><i /><b /></div><div className="mini-portal"><Icon name="heart" size={32} /></div><div className="mini-player right-player"><i /><b /></div><h1>A LEGENDARY DUO HAS ENTERED THE SERVER.</h1></section>}
  </main>;
  return <main className="start-screen screen cinematic-reveal">
    <div className="stars" aria-hidden="true">{Array.from({ length: 28 }, (_, i) => <i key={i} style={{ "--i": i } as React.CSSProperties} />)}</div>
    <div className="start-nav"><button className="game-logo logo-button" onClick={logoTap}><span>THE</span> FRIENDSHIP GAME</button><MusicPanelButton /></div>
    {egg && <div className="logo-secret"><b>SECRET MESSAGE FOUND</b><span>"You always look closer. That's one of my favorite things about you."</span></div>}
    <div className="start-layout">
      <section className="hero-copy"><div className="eyebrow"><span className="status-dot" /> {celebrationProfile.playerName} ONLINE</div><h1>{celebrationProfile.playerName} HAS<br /><em>{celebrationProfile.highlightWord}</em> THE<br />{celebrationProfile.celebrationWord}</h1><p>An adventure built from our questionable decisions, unforgettable memories, and a friendship that deserves its own game.</p><div className="hero-actions"><Button onClick={onStart} icon="play">START GAME</Button><span className="press-start">5 LOGO TAPS = SECRET <i /></span></div></section>
      <section className="portal-scene"><div className="moon" /><div className="cloud cloud-one" /><div className="cloud cloud-two" /><div className="portal"><div className="portal-core"><Icon name="heart" size={38} /></div></div><div className="pixel-person person-one"><span className="person-hair" /><span className="person-face" /><span className="person-body" /></div><div className="pixel-person person-two"><span className="person-hair" /><span className="person-face" /><span className="person-body" /></div><div className="floating-card fc-one"><Icon name="camera" /><span>CORE MEMORY</span></div><div className="floating-card fc-two"><Icon name="sparkle" /><span>+125 XP</span></div></section>
    </div>
    <div className="start-footer"><div className="system-bar"><span>FRIENDSHIP STATUS</span><div><i /><i /><i /><i /><i /></div><b>LEGENDARY</b></div><small>Gentle adventure music, whenever you want it. Made with an unreasonable amount of love.</small></div>
  </main>;
}

const levels = [
  { n: "01", screen: "timeline" as Screen, title: "MEMORY MEADOW", subtitle: "How It Started", icon: "camera" as IconName, color: "pink", x: "level-one", reward: "POLAROID FRAGMENT" },
  { n: "02", screen: "lore" as Screen, title: "FRIENDSHIP FIGHT CLUB", subtitle: "10-Round Arcade Battle", icon: "sword" as IconName, color: "pink", x: "level-two", reward: "BESTIE COMBAT BADGE" },
  { n: "03", screen: "quiz" as Screen, title: "THE FINAL ARENA", subtitle: "Boss Battle", icon: "sword" as IconName, color: "orange", x: "level-three", reward: "BOSS KEY" },
  { n: "04", screen: "adventure" as Screen, title: "THE ADVENTURE TO MY HEART", subtitle: "Platform Adventure", icon: "heart" as IconName, color: "lavender", x: "level-four", reward: "HEART CONQUEROR" },
];

const instructionGuides: Record<GuideKind, { title: string; theme: string; startLabel: string; pages: InstructionPage[] }> = {
  timeline: {
    title: "MEMORY MEADOW",
    theme: "meadow",
    startLabel: "START MEMORY MEADOW",
    pages: [
      { title: "WELCOME TO MEMORY MEADOW", content: <><p>A warm little archive holds the moments that made this friendship. The cards have slipped out of order, and Player 2 is the one who can put them right.</p><div className="instruction-guide-callout"><strong>YOUR OBJECTIVE</strong><p>Restore the friendship memory timeline by arranging every memory from the oldest to the newest.</p></div></> },
      { title: "HOW TO ARRANGE MEMORIES", content: <><p>Put the memory cards in chronological order using whichever controls feel comfortable.</p><ul><li><strong>Drag and drop:</strong> Select a card and drop it where it belongs in the list.</li><li><strong>Move controls:</strong> Use the up and down arrow buttons on each card to move it one position at a time.</li><li><strong>Timeline order:</strong> Oldest memory goes first; newest memory goes last. No dates or hints are shown during the challenge.</li></ul></> },
      { title: "CHECKING YOUR ANSWERS", content: <><p>When you are happy with the order, choose <strong>LOCK IN MY ANSWER</strong>. The game checks every card and reveals the real timeline with the memories and stories.</p><ul><li>Each card earns a point when it sits in a position that is valid for a chronological order. Overlapping date ranges can make more than one position fair.</li><li>The revealed timeline shows the score and the correct chronology.</li><li>Choose <strong>PLAY AGAIN</strong> on the reveal screen to shuffle the cards for another attempt.</li></ul></> },
      { title: "SECRETS AND REWARDS", content: <><p>Some keepsakes are optional. Explore the challenge and reveal screen for interactive details, including a suspicious star and a flower that holds a personal memory.</p><ul><li>Restoring the timeline awards Friendship XP; optional discoveries can award additional XP and achievements.</li><li>Choose <strong>COMPLETE LEVEL</strong> after reviewing the reveal to return to the World Map with your progress.</li></ul></> },
    ],
  },
  lore: {
    title: "FRIENDSHIP FIGHT CLUB",
    theme: "arcade",
    startLabel: "START FIGHT CLUB",
    pages: [
      { title: "ENTER THE ARENA", content: <><p>Player 2 enters an arcade showdown against a mischievous monster. The battle is fought with friendship knowledge, not reflexes.</p><div className="fight-intro-stage"><div className="fighter human-fighter" role="img" aria-label="Original pixel-art human fighter"><span className="fighter-hair" /><span className="fighter-face"><i /><i /></span><span className="fighter-shirt" /><span className="fighter-arm" /><span className="fighter-leg" /></div><b className="versus-mark">VS</b><div className="fighter monster-fighter" role="img" aria-label="Original pixel-art mischievous monster"><span className="monster-horn" /><span className="monster-head"><i /><i /><b /></span><span className="monster-body" /><span className="monster-arm" /><span className="monster-foot" /></div></div><div className="instruction-guide-callout"><strong>YOUR OBJECTIVE</strong><p>Answer ten friendship questions and finish with more health than the monster to win the Bestie Combat Badge.</p></div></> },
      { title: "HOW THE BATTLE WORKS", content: <><p>There are ten questions. Read each one, then choose one of the four answer buttons; your choice submits immediately.</p><ul><li>A correct answer makes Player 2 attack and removes 10% of the monster's health.</li><li>An incorrect answer makes the monster attack and removes 10% of Player 2's health.</li><li>Attack animations and a brief result appear before the next question. The opponent does not interrupt while you are choosing.</li></ul></> },
      { title: "HEALTH, DAMAGE AND SCORING", content: <><p>Both fighters begin at <strong>100% health</strong>. Each correct or incorrect response triggers the matching fighter animation and deals 10% damage to the opponent. Your final score is 100 points per correct answer.</p><ul><li>The battle tracks correct answers, incorrect answers, completed rounds, Player 2 health and monster health.</li><li>A victory unlocks the combat-champion achievement and Friendship XP. Completing the level awards its completion XP.</li><li>Keep an eye on both health bars as the ten-question battle progresses.</li></ul></> },
      { title: "VICTORY, DEFEAT AND REPLAY", content: <><p>The battle ends if Player 2 reaches zero health. If all ten questions are answered, the fighter with more health wins; equal health is a draw.</p><ul><li>Victory awards the Bestie Combat Champion achievement and XP.</li><li>Defeat or a draw can be replayed with <strong>RETRY BATTLE</strong>; victory can be replayed with <strong>PLAY AGAIN</strong>.</li><li>Use <strong>RETURN TO MAP</strong> on the result screen to leave at any time.</li></ul></> },
    ],
  },
  quiz: {
    title: "THE FINAL ARENA",
    theme: "boss",
    startLabel: "START THE FINAL BATTLE",
    pages: [
      { title: "MEET THE KEEPER", content: <><p>The Keeper of Obscure Memories guards the Boss Key with four rounds of personal lore. This is a question-and-answer boss battle.</p><BossFigure /><div className="instruction-guide-callout"><strong>YOUR OBJECTIVE</strong><p>Answer the four rounds, survive the Keeper's attacks and claim the Boss Key after the transformation reveal.</p></div></> },
      { title: "ANSWERING QUESTIONS", content: <><p>Choose one answer from the four options in each round. Your answer is submitted when selected.</p><ul><li>Correct answers damage the Keeper and add to your score.</li><li>Incorrect answers cost one life and let the Keeper strike back.</li><li>After the feedback, use <strong>NEXT ROUND</strong> to continue; the final round uses <strong>FINAL STRIKE</strong>.</li></ul></> },
      { title: "BOSS HEALTH AND DAMAGE", content: <><p>The Keeper begins at full health. A correct answer deals <strong>25% boss damage</strong>; a correct final-round answer also earns a higher score bonus.</p><ul><li>You begin with three lives. Each wrong answer removes one life; the battle ends if all lives are lost.</li><li>Correct answers add 250 score, except the final round which adds 400.</li><li><strong>USE HINT (-50 XP)</strong> removes two wrong options for the current question. Each question can use one hint.</li></ul></> },
      { title: "RESULTS AND REWARDS", content: <><p>Answer all four questions with at least one life remaining to defeat the Keeper. The reveal screen shows the transformation; choose <strong>CLAIM THE BOSS KEY</strong> to reach your score results.</p><ul><li>If you lose, choose <strong>RETRY BATTLE</strong> to start over with three lives.</li><li>Your score determines the result title. The Boss Key and level-completion XP are awarded on victory.</li><li>Choose <strong>COMPLETE LEVEL</strong> on the results screen to return to the World Map.</li></ul></> },
    ],
  },
  game: {
    title: "THE FRIENDSHIP GAME",
    theme: "game-help",
    startLabel: "BACK TO THE WORLD MAP",
    pages: [
      { title: "GETTING AROUND", content: <><p>The World Map is your hub. Choose a level node or its matching card to open that level's introduction and guide before gameplay.</p><ul><li>Use the top-left brand or a level's <strong>WORLD MAP</strong> / <strong>RETURN TO MAP</strong> button to come back.</li><li>The secret Haunted Woods chapter becomes available after its permanent unlock.</li></ul></> },
      { title: "XP AND ACHIEVEMENTS", content: <><p>Friendship XP is earned by completing challenges, discovering optional details and finishing levels. Achievements celebrate milestones across the game.</p><ul><li>Some optional hints use XP; the game tells you the cost before you use one.</li><li>Your XP total and achievement count are shown in the persistent HUD and World Map profile.</li></ul></> },
      { title: "COLLECTIBLES AND SECRETS", content: <><p>Levels have their own collectibles and optional secrets. Look closely, interact with unusual objects and revisit levels when you want to explore.</p><ul><li>Optional discoveries can award XP and achievements. Completing the birthday story unlocks the Haunted Woods.</li><li>Level manuals explain the objective and controls for that level without revealing its secret solutions.</li></ul></> },
      { title: "SAVES, MUSIC AND PROGRESS", content: <><p>Progress is stored locally in this browser. The app saves XP, achievements, collected objects, secrets and completed-level progress; the platform adventure also saves its active checkpoint run.</p><ul><li>The Haunted Woods is an active challenge rather than a saved checkpoint run; retrying starts a fresh attempt.</li><li>Open <strong>MUSIC</strong> in the top bar to toggle the soundtrack and adjust volume.</li><li>Use a level's World Map control whenever you want to leave. Its persistent rewards and progress remain saved.</li></ul></> },
    ],
  },
};

function MapScreen({ selectLevel, onHelp, completed, finalCompleted, audio, toggleAudio, game, ghostLevelUnlocked }: { selectLevel: (s: Screen) => void; onHelp: () => void; completed: Set<Screen>; finalCompleted: boolean; audio: boolean; toggleAudio: () => void; game: GameState; ghostLevelUnlocked: boolean }) {
  const completedLevelCount = levels.filter((level) => completed.has(level.screen)).length;
  return <main className="map-screen screen"><TopBar game={game} />
    <div className="map-heading"><div><div className="eyebrow">WORLD 01 / OUR STORY</div><h1>CHOOSE YOUR LEVEL</h1><p>Explore freely. Look closely. The world rewards curious players.</p><button className="map-guide-button" type="button" onClick={onHelp}>HELP / GAME GUIDE</button></div><div className="profile-card"><div className="avatar"><span>2P</span></div><div><small>MAIN CHARACTER</small><b>{celebrationProfile.mainCharacter}</b><div className="xp-line"><i><span style={{ width: `${Math.min(100, game.xp / 20)}%` }} /></i><em>{game.xp} XP</em></div></div></div></div>
    <div className={`world-map living-map progress-${completedLevelCount}`}>
      <div className="map-cloud mc-one" /><div className="map-cloud mc-two" /><div className="map-particles">{Array.from({ length: 12 }, (_, i) => <i key={i} />)}</div>
      <svg className="map-path" viewBox="0 0 1000 500" preserveAspectRatio="none"><path d="M125 340 C180 210 260 210 330 290 S450 380 525 245 S680 115 730 230 S820 360 900 170" /><path className="path-dashes" d="M125 340 C180 210 260 210 330 290 S450 380 525 245 S680 115 730 230 S820 360 900 170" /></svg>
      {levels.map((level, index) => <button key={level.n} className={`level-node ${level.x} ${level.color}`} onClick={() => selectLevel(level.screen)}>
        <span className="island"><i className="island-top" /><i className="island-bottom" />{index === 0 && <b className="tiny-house" />}{index === 1 && <b className="tiny-folder" />}{index === 2 && <b className="tiny-arena" />}{index === 3 && <b className="tiny-cave" />}</span>
        <span className="node-number">LEVEL {level.n}</span><span className="node-icon"><Icon name={level.icon} size={28} />{completed.has(level.screen) && <i className="complete-check">✓</i>}</span><span className="node-copy"><b>{level.title}</b><small>{level.subtitle}</small><em>{completed.has(level.screen) ? `REWARD: ${level.reward}` : "SECRET: UNDISCOVERED"}</em></span>
      </button>)}
      {ghostLevelUnlocked && <button className="ghost-location level-node haunted-forest" onClick={() => selectLevel("haunted")}>
        <span className="island"><i className="island-top" /><i className="island-bottom" /><b className="tiny-cave haunted-glow" /></span>
        <span className="node-number">LEVEL 05</span><span className="node-icon"><Icon name="lock" size={28} />{<i className="complete-check">✓</i>}</span><span className="node-copy"><b>THE HAUNTED WOODS</b><small>Some things are better left unfound.</small><em>UNLOCKED</em></span>
      </button>}
    </div>
    {ghostLevelUnlocked ? <div className="hidden-discovered haunted-discovery"><Icon name="sparkle" /><span><b>SECRET LOCATION UNLOCKED: THE HAUNTED WOODS</b>Something has awakened beyond this world.</span><Button onClick={() => selectLevel("haunted")}>ENTER HAUNTED WOODS</Button></div> : <div className="secret-progress"><Icon name="lock" /><span>HIDDEN SIGNAL DETECTED</span><div>{[0, 1, 2].map((n) => <i key={n} className={n < game.secrets.size ? "found" : ""} />)}</div><small>Find three secret objects inside the levels.</small></div>}
    <div className="map-cards">{levels.map((level) => <button key={level.n} className="map-card" onClick={() => selectLevel(level.screen)}><span className={`card-icon ${level.color}`}><Icon name={level.icon} /></span><span><small>LEVEL {level.n}</small><b>{level.title}</b><em>{completed.has(level.screen) ? "COMPLETE" : level.subtitle}</em></span><Icon name="arrow" /></button>)}{ghostLevelUnlocked && <button key="haunted-woods" className="map-card haunted-map-card" onClick={() => selectLevel("haunted")}><span className="card-icon haunted-card"><Icon name="lock" /></span><span><small>LEVEL 05</small><b>THE HAUNTED WOODS</b><em>Something has awakened.</em></span><Icon name="arrow" /></button>}</div>
    <div className="map-footer"><span><i className="key">W</i><i className="key">A</i><i className="key">S</i><i className="key">D</i> EXPLORE</span><span>{completedLevelCount}/4 QUESTS COMPLETE{finalCompleted ? " · FINAL STORY COMPLETE" : ""}{ghostLevelUnlocked ? " · HAUNTED WOODS UNLOCKED" : ""}</span></div>
  </main>;
}

function InstructionScreen({ kind, pageIndex, onPageChange, onStart, onMap }: {
  kind: GuideKind;
  pageIndex: number;
  onPageChange: (page: number) => void;
  onStart: () => void;
  onMap: () => void;
}) {
  const guide = instructionGuides[kind];
  return <main className={`screen instruction-screen instruction-screen-${guide.theme}`}>
    <InstructionGuide
      pages={guide.pages}
      pageIndex={pageIndex}
      onPageChange={onPageChange}
      onStart={onStart}
      onMap={onMap}
      startLabel={guide.startLabel}
      eyebrow={guide.title}
      theme={guide.theme}
    />
  </main>;
}

type HauntedItem = {
  id: string;
  x: number;
  y: number;
  label: string;
  color: string;
  clue: string;
  area: string;
};

type GhostPatrol = {
  id: string;
  x: number;
  y: number;
  route: [number, number][];
  speed: number;
  vision: number;
  fieldOfView: number;
  targetIndex: number;
  facing: number;
  appearance?: "wisp" | "shade" | "elder" | "lost";
  pauseTicks?: number;
  pauseDuration?: number;
  vanishes?: boolean;
  distractionTarget?: HauntedWaypoint;
  distractedTicks?: number;
};

const HAUNTED_WORLD_WIDTH = 14400;
type HauntedWaypoint = { x: number; y: number };

const hauntedAreas = [
  { name: "Forgotten Entrance", start: 0, end: 900 },
  { name: "The Weeping Woods", start: 900, end: 3000 },
  { name: "Deadwood Crossing", start: 3000, end: 5000 },
  { name: "Abandoned Settlement", start: 5000, end: 7000 },
  { name: "The Sunken Bridge", start: 7000, end: 9000 },
  { name: "The Hollow", start: 9000, end: 10800 },
  { name: "The Forgotten Shrine", start: 10800, end: 12600 },
  { name: "The Final Escape Route", start: 12600, end: HAUNTED_WORLD_WIDTH },
] as const;

const hauntedItems: HauntedItem[] = [
  { id: "silver-key", x: 1160, y: 238, label: "THE SILVER KEY", color: "#dfe6ff", area: "The Weeping Woods", clue: "Silver Key: a clear metallic ring echoes from somewhere among the blue pines." },
  { id: "music-box-piece", x: 3780, y: 418, label: "THE BROKEN MUSIC BOX PIECE", color: "#ffb3d9", area: "Deadwood Crossing", clue: "Music Box Piece: a few music-box notes drift beneath the fallen timber." },
  { id: "photograph", x: 6240, y: 292, label: "THE MYSTERIOUS PHOTOGRAPH", color: "#fde7a8", area: "Abandoned Settlement", clue: "Photograph: a faint golden flicker glows in the settlement's ruined watch room." },
  { id: "pendant", x: 8580, y: 355, label: "THE ANCIENT PENDANT", color: "#b7f7d4", area: "The Sunken Bridge", clue: "Pendant: pale particles drift toward the half-submerged stonework." },
  { id: "memory-fragment", x: 11340, y: 420, label: "THE LOST MEMORY FRAGMENT", color: "#ff7e8c", area: "The Forgotten Shrine", clue: "Memory Fragment: warm whispers gather beneath the old shrine's broken arch." },
];

const hauntedCoverZones = [
  { x: 380, y: 274, w: 190, h: 132 }, { x: 1960, y: 250, w: 200, h: 150 },
  { x: 3610, y: 278, w: 190, h: 142 }, { x: 5480, y: 260, w: 220, h: 150 },
  { x: 7330, y: 280, w: 205, h: 145 }, { x: 9210, y: 260, w: 210, h: 160 },
  { x: 11040, y: 270, w: 220, h: 150 }, { x: 12810, y: 265, w: 230, h: 150 },
];
const hauntedTrees = [
  { x: 40, y: 112, scale: 1.02 }, { x: 890, y: 133, scale: 0.86 },
  { x: 1800, y: 120, scale: 1.06 }, { x: 2520, y: 136, scale: 0.87 },
  { x: 3400, y: 128, scale: 1.04 }, { x: 4240, y: 130, scale: 0.92 },
  { x: 5120, y: 120, scale: 1.08 }, { x: 5920, y: 132, scale: 0.9 },
  { x: 6820, y: 125, scale: 1.04 }, { x: 7620, y: 135, scale: 0.9 },
  { x: 8520, y: 120, scale: 1.06 }, { x: 9320, y: 130, scale: 0.92 },
  { x: 10220, y: 122, scale: 1.04 }, { x: 11100, y: 130, scale: 0.9 },
  { x: 12020, y: 122, scale: 1.03 }, { x: 12900, y: 130, scale: 0.92 },
  { x: 13800, y: 122, scale: 1.05 },
];
const hauntedObstacles = [
  { x: 700, y: 120, w: 72, h: 195 }, { x: 1520, y: 135, w: 86, h: 190 },
  { x: 2310, y: 330, w: 160, h: 48 }, { x: 3180, y: 150, w: 88, h: 190 },
  { x: 4010, y: 142, w: 80, h: 190 }, { x: 4780, y: 350, w: 190, h: 48 },
  { x: 5660, y: 140, w: 80, h: 190 }, { x: 6510, y: 348, w: 180, h: 48 },
  { x: 7350, y: 148, w: 88, h: 196 }, { x: 8120, y: 345, w: 180, h: 52 },
  { x: 8950, y: 130, w: 90, h: 195 }, { x: 9780, y: 340, w: 176, h: 50 },
  { x: 10610, y: 140, w: 90, h: 188 }, { x: 12080, y: 138, w: 92, h: 202 },
  { x: 12900, y: 350, w: 180, h: 48 }, { x: 2380, y: 315, w: 46, h: 170 },
  { x: 6060, y: 188, w: 145, h: 45 }, { x: 10280, y: 300, w: 120, h: 70 },
  { x: 13360, y: 170, w: 82, h: 185 }, { x: 13905, y: 0, w: 48, h: 540 },
];
const hauntedPlayerObstacles = [
  ...hauntedObstacles,
  // Only the narrow lower trunk/base is solid. The canopy and branches are decorative
  // and must not create invisible walls across the walking trail.
  ...hauntedTrees.map((tree) => ({
    x: tree.x + 91 * tree.scale,
    y: tree.y + 320 * tree.scale,
    w: 38 * tree.scale,
    h: 32 * tree.scale,
  })),
  { x: 520, y: 190, w: 105, h: 72 },
  { x: 295, y: 326, w: 90, h: 76 }, { x: 386, y: 380, w: 38, h: 42 },
  { x: 245, y: 414, w: 85, h: 60 }, { x: 636, y: 364, w: 44, h: 40 },
  { x: 678, y: 438, w: 86, h: 42 },
  { x: 5590, y: 258, w: 150, h: 194 }, { x: 5740, y: 375, w: 65, h: 75 },
  { x: 6440, y: 345, w: 18, h: 60 }, { x: 6570, y: 345, w: 18, h: 60 },
  { x: 8530, y: 406, w: 26, h: 66 }, { x: 8666, y: 406, w: 26, h: 60 },
  { x: 8793, y: 406, w: 28, h: 70 }, { x: 8917, y: 406, w: 24, h: 64 },
  { x: 11154, y: 365, w: 42, h: 92 }, { x: 11400, y: 365, w: 38, h: 92 },
  { x: 11140, y: 465, w: 150, h: 18 }, { x: 11382, y: 465, w: 84, h: 18 },
];
const hauntedTerrainPath = new Path2D();
hauntedTerrainPath.moveTo(0, 436);
hauntedTerrainPath.bezierCurveTo(540, 432, 766, 330, 1140, 350);
hauntedTerrainPath.bezierCurveTo(1514, 370, 1764, 480, 2130, 441);
hauntedTerrainPath.bezierCurveTo(2496, 402, 2750, 311, 3100, 361);
hauntedTerrainPath.bezierCurveTo(3450, 411, 3739, 491, 4115, 447);
hauntedTerrainPath.bezierCurveTo(4491, 403, 4720, 327, 5080, 359);
hauntedTerrainPath.bezierCurveTo(5440, 391, 5754, 491, 6096, 454);
hauntedTerrainPath.bezierCurveTo(6438, 417, 6778, 327, 7130, 363);
hauntedTerrainPath.bezierCurveTo(7482, 399, 7886, 471, 8252, 421);
hauntedTerrainPath.bezierCurveTo(8618, 371, 8958, 305, 9338, 353);
hauntedTerrainPath.bezierCurveTo(9718, 401, 10024, 456, 10338, 416);
hauntedTerrainPath.bezierCurveTo(10652, 376, 11076, 297, 11400, 326);
hauntedTerrainPath.bezierCurveTo(11724, 355, 12064, 378, 12420, 326);
hauntedTerrainPath.moveTo(1140, 350);
hauntedTerrainPath.lineTo(1160, 238);
hauntedTerrainPath.moveTo(5500, 400);
hauntedTerrainPath.lineTo(5500, 480);
hauntedTerrainPath.lineTo(5880, 480);
hauntedTerrainPath.lineTo(5880, 430);
hauntedTerrainPath.moveTo(6096, 454);
hauntedTerrainPath.lineTo(6240, 440);
hauntedTerrainPath.lineTo(6240, 292);
hauntedTerrainPath.moveTo(8252, 421);
hauntedTerrainPath.lineTo(8580, 355);
hauntedTerrainPath.moveTo(11400, 326);
hauntedTerrainPath.lineTo(11340, 420);
hauntedTerrainPath.moveTo(12420, 326);
hauntedTerrainPath.lineTo(13905, 400);
const hauntedTerrainContext = (() => {
  const context = document.createElement("canvas").getContext("2d");
  if (!context) throw new Error("Unable to initialize Haunted Woods terrain collision.");
  return context;
})();
hauntedTerrainContext.lineCap = "round";
hauntedTerrainContext.lineJoin = "round";
const hauntedDetourPath = new Path2D();
hauntedDetourPath.moveTo(5300, 390);
hauntedDetourPath.lineTo(5500, 480);
hauntedDetourPath.lineTo(6070, 480);
hauntedDetourPath.lineTo(6100, 454);
hauntedDetourPath.moveTo(12780, 360);
hauntedDetourPath.lineTo(12800, 310);
hauntedDetourPath.lineTo(13120, 310);
hauntedDetourPath.lineTo(13150, 365);
const hauntedGhosts: GhostPatrol[] = [
  { id: "mist-01", x: 820, y: 120, route: [[820, 120], [1090, 180], [1420, 118], [1190, 320], [780, 300]], speed: 1.2, vision: 155, fieldOfView: 0.95, targetIndex: 0, facing: 0 },
  { id: "mist-02", x: 2680, y: 136, route: [[2680, 136], [3100, 130], [3220, 300], [2860, 360], [2460, 210]], speed: 1.1, vision: 170, fieldOfView: 1.05, targetIndex: 0, facing: 0 },
  { id: "mist-03", x: 4490, y: 420, route: [[4490, 420], [4820, 396], [5150, 436], [4680, 455]], speed: 1.3, vision: 180, fieldOfView: 1.05, targetIndex: 0, facing: 0 },
  { id: "mist-04", x: 6280, y: 124, route: [[6280, 124], [6660, 130], [6800, 294], [6380, 330], [6020, 220]], speed: 1.15, vision: 170, fieldOfView: 1, targetIndex: 0, facing: 0 },
  { id: "mist-05", x: 8060, y: 418, route: [[8060, 418], [8410, 390], [8760, 440], [8240, 468]], speed: 1.25, vision: 180, fieldOfView: 1, targetIndex: 0, facing: 0 },
  { id: "mist-06", x: 10040, y: 128, route: [[10040, 128], [10420, 130], [10540, 300], [10110, 348], [9780, 214]], speed: 1.2, vision: 175, fieldOfView: 1, targetIndex: 0, facing: 0 },
  { id: "mist-07", x: 12200, y: 420, route: [[12200, 420], [12600, 392], [12980, 438], [12420, 468]], speed: 1.3, vision: 185, fieldOfView: 1, targetIndex: 0, facing: 0 },
  { id: "mist-08", x: 1730, y: 416, route: [[1730, 416], [1900, 405], [2070, 432], [1860, 446]], speed: 1.05, vision: 145, fieldOfView: 0.9, targetIndex: 0, facing: 0, appearance: "lost", vanishes: true },
  { id: "mist-09", x: 3540, y: 418, route: [[3540, 418], [3720, 435], [3910, 454], [3690, 448]], speed: 1.25, vision: 160, fieldOfView: 0.92, targetIndex: 0, facing: 0, appearance: "wisp" },
  { id: "mist-10", x: 5350, y: 374, route: [[5350, 374], [5450, 420], [5530, 466], [5380, 442]], speed: 1.1, vision: 165, fieldOfView: 0.9, targetIndex: 0, facing: 0, appearance: "shade", vanishes: true },
  { id: "mist-11", x: 7160, y: 370, route: [[7160, 370], [7300, 402], [7460, 430], [7250, 424]], speed: 1.2, vision: 155, fieldOfView: 0.95, targetIndex: 0, facing: 0, appearance: "lost" },
  { id: "mist-12", x: 9250, y: 362, route: [[9250, 362], [9430, 346], [9600, 376], [9410, 394]], speed: 1.15, vision: 170, fieldOfView: 1, targetIndex: 0, facing: 0, appearance: "elder", vanishes: true },
  { id: "mist-13", x: 10900, y: 368, route: [[10900, 368], [11030, 348], [11120, 385], [10960, 410]], speed: 1.05, vision: 150, fieldOfView: 0.9, targetIndex: 0, facing: 0, appearance: "wisp" },
  { id: "mist-14", x: 13300, y: 355, route: [[13300, 355], [13480, 342], [13660, 375], [13440, 390]], speed: 1.25, vision: 175, fieldOfView: 0.98, targetIndex: 0, facing: 0, appearance: "shade", vanishes: true },
];

const createHauntedGhosts = () => hauntedGhosts.map((ghost, index) => ({
  ...ghost,
  appearance: ghost.appearance ?? (["wisp", "shade", "elder", "lost"] as const)[index % 4],
  pauseTicks: ghost.pauseTicks ?? 0,
  pauseDuration: ghost.pauseDuration ?? 28 + (index % 3) * 8,
  vanishes: ghost.vanishes ?? index % 2 === 0,
}));

const HAUNTED_COMPANION_KEY = "friendship-game-haunted-companion-v1";

function loadHauntedCompanionUnlocked() {
  try {
    return window.localStorage.getItem(HAUNTED_COMPANION_KEY) === "unlocked";
  } catch {
    return false;
  }
}

function hauntedTrailPoint(trail: HauntedWaypoint[], followDistance: number): HauntedWaypoint {
  let remaining = followDistance;
  for (let index = trail.length - 1; index > 0; index -= 1) {
    const from = trail[index - 1];
    const to = trail[index];
    const distance = Math.hypot(to.x - from.x, to.y - from.y);
    if (distance >= remaining) {
      const progress = remaining / distance;
      return { x: to.x + (from.x - to.x) * progress, y: to.y + (from.y - to.y) * progress };
    }
    remaining -= distance;
  }
  return { ...trail[0] };
}

function segmentIntersectsObstacle(x1: number, y1: number, x2: number, y2: number, obstacle: { x: number; y: number; w: number; h: number }) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  let near = 0;
  let far = 1;
  const edges: [number, number][] = [
    [-dx, x1 - obstacle.x],
    [dx, obstacle.x + obstacle.w - x1],
    [-dy, y1 - obstacle.y],
    [dy, obstacle.y + obstacle.h - y1],
  ];

  for (const [direction, distance] of edges) {
    if (direction === 0) {
      if (distance < 0) return false;
      continue;
    }
    const time = distance / direction;
    if (direction < 0) near = Math.max(near, time);
    else far = Math.min(far, time);
    if (near > far) return false;
  }
  return true;
}

function HauntedForestScreen({ onMap, game, onMusicTrack, audio, musicVolume }: { onMap: () => void; game: GameState; onMusicTrack: (track: "friendship" | "celestial") => void; audio: boolean; musicVolume: number }) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const ambientAudio = useRef<{ context: AudioContext; sources: AudioBufferSourceNode[]; rainGain: GainNode; windGain: GainNode; thunderTimer: number } | null>(null);
  const audioSettings = useRef({ enabled: audio, volume: musicVolume });
  audioSettings.current = { enabled: audio, volume: musicVolume };
  const [stageSize, setStageSize] = useState({ height: window.innerHeight });
  const [cameraX, setCameraX] = useState(0);
  const [player, setPlayer] = useState({ x: 72, y: 390, hiding: false, facing: "down", moving: false, running: false });
  const [ghosts, setGhosts] = useState(createHauntedGhosts);
  const [catUnlocked, setCatUnlocked] = useState(loadHauntedCompanionUnlocked);
  const [cat, setCat] = useState<HauntedWaypoint>({ x: 34, y: 390 });
  const [catReveal, setCatReveal] = useState(false);
  const [found, setFound] = useState<string[]>([]);
  const [status, setStatus] = useState("Follow the whispers, gather the five relics, and leave before the ghosts lock on.");
  const [guidance, setGuidance] = useState("The path ahead is quiet. Listen for the first clue.");
  const [areaNotice, setAreaNotice] = useState("Forgotten Entrance");
  const [warning, setWarning] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [paused, setPaused] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [mechanismOpen, setMechanismOpen] = useState(false);
  const lastInteractionAt = useRef(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [tutorialPage, setTutorialPage] = useState(0);
  const [lanternOn, setLanternOn] = useState(false);
  const [lanternCharge, setLanternCharge] = useState(100);
  const [compassCooldown, setCompassCooldown] = useState(0);
  const [compassSignal, setCompassSignal] = useState(0);
  const [bellUses, setBellUses] = useState(3);
  const [bellCooldown, setBellCooldown] = useState(0);
  const [mapOpen, setMapOpen] = useState(false);
  const [healingReady, setHealingReady] = useState(true);
  const [bellPulse, setBellPulse] = useState(0);
  const [equipmentOpen, setEquipmentOpen] = useState(false);
  const [charmFlash, setCharmFlash] = useState(false);
  const [visitedAreas, setVisitedAreas] = useState<Set<string>>(() => new Set(["Forgotten Entrance"]));
  const [characterAction, setCharacterAction] = useState<"idle" | "interacting" | "collecting" | "using" | "startled">("idle");
  const characterActionTimer = useRef<number | null>(null);
  const keys = useRef({ up: false, down: false, left: false, right: false, sprint: false });
  const playerRef = useRef(player);
  const ghostsRef = useRef(ghosts);
  const catRef = useRef(cat);
  const playerTrail = useRef<HauntedWaypoint[]>([{ x: 34, y: 390 }, { x: 72, y: 390 }]);
  const foundRef = useRef(found);
  const warningRef = useRef(warning);
  const guidanceRef = useRef(guidance);
  const guidanceHoldUntil = useRef(0);

  useEffect(() => { playerRef.current = player; }, [player]);
  useEffect(() => { ghostsRef.current = ghosts; }, [ghosts]);
  useEffect(() => { catRef.current = cat; }, [cat]);
  useEffect(() => { foundRef.current = found; }, [found]);
  useEffect(() => { warningRef.current = warning; }, [warning]);
  useEffect(() => { guidanceRef.current = guidance; }, [guidance]);
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const updateSize = () => setStageSize({ height: stage.clientHeight });
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    onMusicTrack("celestial");
    return () => onMusicTrack("friendship");
  }, [onMusicTrack]);
  const currentArea = hauntedAreas.find((area) => player.x >= area.start && player.x < area.end)?.name ?? "The Final Escape Route";
  useEffect(() => {
    setAreaNotice(currentArea);
    setVisitedAreas((areas) => areas.has(currentArea) ? areas : new Set([...areas, currentArea]));
    const timer = window.setTimeout(() => setAreaNotice(""), 2200);
    return () => window.clearTimeout(timer);
  }, [currentArea]);
  const animateCharacter = useCallback((action: "interacting" | "collecting" | "using" | "startled") => {
    setCharacterAction(action);
    if (characterActionTimer.current !== null) window.clearTimeout(characterActionTimer.current);
    characterActionTimer.current = window.setTimeout(() => {
      characterActionTimer.current = null;
      setCharacterAction("idle");
    }, 650);
  }, []);
  useEffect(() => () => {
    if (characterActionTimer.current !== null) window.clearTimeout(characterActionTimer.current);
  }, []);
  useEffect(() => {
    if (!charmFlash) return;
    const timer = window.setTimeout(() => setCharmFlash(false), 1500);
    return () => window.clearTimeout(timer);
  }, [charmFlash]);
  useEffect(() => {
    if (showTutorial || catUnlocked || paused || gameOver || victory) return;
    const timer = window.setTimeout(() => {
      const companionStart = hauntedTrailPoint(playerTrail.current, 42);
      catRef.current = companionStart;
      setCat(companionStart);
      setCatUnlocked(true);
      setCatReveal(true);
      setStatus("A little shadow has joined your journey.");
      try {
        window.localStorage.setItem(HAUNTED_COMPANION_KEY, "unlocked");
      } catch (error) {
        console.warn("Unable to save the Haunted Woods companion unlock.", error);
      }
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [catUnlocked, gameOver, paused, showTutorial, victory]);
  useEffect(() => {
    if (!catReveal) return;
    const timer = window.setTimeout(() => setCatReveal(false), 4800);
    return () => window.clearTimeout(timer);
  }, [catReveal]);
  useEffect(() => {
    if (!lanternOn || paused || showTutorial || gameOver || victory) return;
    const timer = window.setTimeout(() => {
      setLanternCharge((charge) => {
        const nextCharge = Math.max(0, charge - 1);
        if (nextCharge === 0) setLanternOn(false);
        return nextCharge;
      });
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [lanternOn, paused, showTutorial, gameOver, victory]);

  useEffect(() => {
    if (compassCooldown <= 0) return;
    const timer = window.setTimeout(() => setCompassCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [compassCooldown]);
  useEffect(() => {
    if (compassSignal <= 0) return;
    const timer = window.setTimeout(() => setCompassSignal((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [compassSignal]);

  useEffect(() => {
    if (bellCooldown <= 0) return;
    const timer = window.setTimeout(() => setBellCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [bellCooldown]);

  useEffect(() => {
    if (bellPulse <= 0) return;
    const timer = window.setTimeout(() => setBellPulse((value) => Math.max(0, value - 1)), 260);
    return () => window.clearTimeout(timer);
  }, [bellPulse]);

  const setMovement = (direction: "up" | "down" | "left" | "right", pressed: boolean) => {
    keys.current[direction] = pressed;
  };

  const startAmbientAudio = useCallback(() => {
    if (!audio || !("AudioContext" in window) || ambientAudio.current) return;
    const context = new window.AudioContext();
    const noise = context.createBuffer(1, context.sampleRate * 3, context.sampleRate);
    const noiseData = noise.getChannelData(0);
    for (let index = 0; index < noiseData.length; index += 1) noiseData[index] = Math.random() * 2 - 1;
    const createNoiseSource = () => {
      const source = context.createBufferSource();
      source.buffer = noise;
      source.loop = true;
      return source;
    };
    const rainSource = createNoiseSource();
    const windSource = createNoiseSource();
    const rainFilter = context.createBiquadFilter();
    rainFilter.type = "lowpass";
    rainFilter.frequency.value = 1500;
    const windFilter = context.createBiquadFilter();
    windFilter.type = "lowpass";
    windFilter.frequency.value = 260;
    const volumeScale = musicVolume / MAX_MUSIC_VOLUME;
    const rainGain = context.createGain();
    rainGain.gain.value = audio ? 0.045 * volumeScale : 0;
    const windGain = context.createGain();
    windGain.gain.value = audio ? 0.012 * volumeScale : 0;
    rainSource.connect(rainFilter).connect(rainGain).connect(context.destination);
    windSource.connect(windFilter).connect(windGain).connect(context.destination);
    rainSource.start();
    windSource.start();
    const thunderTimer = window.setInterval(() => {
      if (!audioSettings.current.enabled) return;
      const currentVolumeScale = audioSettings.current.volume / MAX_MUSIC_VOLUME;
      const thunder = context.createOscillator();
      const thunderGain = context.createGain();
      thunder.type = "triangle";
      thunder.frequency.setValueAtTime(54, context.currentTime);
      thunder.frequency.exponentialRampToValueAtTime(31, context.currentTime + 3);
      thunderGain.gain.setValueAtTime(0.0001, context.currentTime);
      thunderGain.gain.exponentialRampToValueAtTime(0.012 * currentVolumeScale, context.currentTime + 0.5);
      thunderGain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 3.5);
      thunder.connect(thunderGain).connect(context.destination);
      thunder.start();
      thunder.stop(context.currentTime + 3.6);
    }, 32000);
    ambientAudio.current = { context, sources: [rainSource, windSource], rainGain, windGain, thunderTimer };
    void context.resume().catch((error: unknown) => console.warn("Unable to start Haunted Woods ambience.", error));
  }, [audio, musicVolume]);

  useEffect(() => {
    if (!audio) return;
    window.addEventListener("pointerdown", startAmbientAudio);
    window.addEventListener("keydown", startAmbientAudio);
    return () => {
      window.removeEventListener("pointerdown", startAmbientAudio);
      window.removeEventListener("keydown", startAmbientAudio);
    };
  }, [audio, startAmbientAudio]);

  useEffect(() => {
    const ambience = ambientAudio.current;
    if (!ambience) return;
    const volumeScale = audio ? musicVolume / MAX_MUSIC_VOLUME : 0;
    ambience.rainGain.gain.setTargetAtTime(0.045 * volumeScale, ambience.context.currentTime, 0.08);
    ambience.windGain.gain.setTargetAtTime(0.012 * volumeScale, ambience.context.currentTime, 0.08);
  }, [audio, musicVolume]);

  useEffect(() => () => {
    const ambience = ambientAudio.current;
    if (!ambience) return;
    window.clearInterval(ambience.thunderTimer);
    ambience.sources.forEach((source) => source.stop());
    void ambience.context.close().catch((error: unknown) => console.warn("Unable to close Haunted Woods ambience.", error));
    ambientAudio.current = null;
  }, []);

  const toggleHide = useCallback(() => {
    const current = playerRef.current;
    const inCover = hauntedCoverZones.some((zone) => current.x >= zone.x && current.x <= zone.x + zone.w && current.y >= zone.y && current.y <= zone.y + zone.h);
    if (!inCover) {
      setStatus("There is no cover here. Keep moving through the brush.");
      return;
    }

    const nextState = !current.hiding;
    const nextPlayer = { ...current, hiding: nextState };
    playerRef.current = nextPlayer;
    setPlayer(nextPlayer);
    if (nextState) {
      warningRef.current = 0;
      setWarning(0);
    }
    setStatus(nextState ? "You slip behind the cover and vanish from the ghosts' sight." : "You step back out, listening through the fog.");
  }, []);

  const triggerHint = useCallback(() => {
    if (compassCooldown > 0) {
      setStatus("The compass is still recalibrating. Wait a breath before sensing again.");
      return;
    }
    const remaining = hauntedItems.filter((item) => !foundRef.current.includes(item.id));
    if (remaining.length === 0) {
      setStatus("The woods have already given you everything they can. Move to the shrine and escape.");
      setGuidance("The path home is clear. You have all five relics.");
      return;
    }

    const target = remaining.slice().sort((a, b) => Math.hypot(playerRef.current.x - a.x, playerRef.current.y - a.y) - Math.hypot(playerRef.current.x - b.x, playerRef.current.y - b.y))[0];
    const nextGuidance = `${target.label}: ${target.clue}`;
    guidanceHoldUntil.current = Date.now() + 6000;
    guidanceRef.current = nextGuidance;
    setCompassCooldown(5);
    setCompassSignal(5);
    setGuidance(nextGuidance);
    setStatus(`A whisper moves toward ${target.area.toUpperCase()}.`);
    animateCharacter("using");
  }, [animateCharacter, compassCooldown]);

  const toggleLantern = useCallback(() => {
    if (lanternCharge <= 0) {
      setStatus("The lantern is out of light. Search for a safer path before it burns dim.");
      return;
    }
    setLanternOn((value) => !value);
    setStatus((previous) => previous.includes("Lantern") ? previous : lanternOn ? "The lantern flickers out, leaving the forest darker again." : "The lantern glows to life, tracing the nearest movement in the fog.");
    animateCharacter("using");
  }, [animateCharacter, lanternCharge, lanternOn]);

  const ringBell = useCallback(() => {
    if (bellUses <= 0 || bellCooldown > 0 || paused || gameOver || victory || showTutorial) return;
    setBellUses((value) => value - 1);
    setBellCooldown(7);
    setBellPulse(2);
    const sound = { ...playerRef.current };
    const updatedGhosts = ghostsRef.current.map((ghost, index) =>
      index % 3 !== 2 && Math.hypot(sound.x - ghost.x, sound.y - ghost.y) < 280
        ? { ...ghost, distractionTarget: { x: sound.x, y: sound.y }, distractedTicks: 150 }
        : ghost
    );
    ghostsRef.current = updatedGhosts;
    setGhosts(updatedGhosts);
    setStatus("The silver bell rings out. Some nearby spirits drift toward the sound; move while they investigate.");
    animateCharacter("using");
  }, [animateCharacter, bellCooldown, bellUses, gameOver, paused, showTutorial, victory]);

  const toggleMap = useCallback(() => {
    setMapOpen((value) => !value);
    setStatus((previous) => (previous.includes("Map") || previous.includes("forest") ? previous : mapOpen ? "The map folds closed." : "The hidden forest map opens, tracing the routes you have already walked."));
    setEquipmentOpen(false);
  }, [mapOpen]);

  const activateCharm = useCallback(() => {
    if (!healingReady) {
      setStatus("The charm is spent. The forest will not let you cheat twice.");
      return;
    }
    setHealingReady(false);
    warningRef.current = Math.min(warningRef.current, 0.2);
    setWarning(0.2);
    setCharmFlash(true);
    setStatus("The healing charm flares. The ghost loses its grip for a breathless second.");
    animateCharacter("using");
  }, [animateCharacter, healingReady]);

  const collectNearbyItem = useCallback((targetId?: string) => {
    const now = Date.now();
    if (now - lastInteractionAt.current < 350) return;
    lastInteractionAt.current = now;
    const current = playerRef.current;
    const nearby = hauntedItems
      .filter((item) => !foundRef.current.includes(item.id))
      .map((item) => ({ item, distance: Math.hypot(current.x - item.x, current.y - item.y) }))
      .sort((a, b) => a.distance - b.distance)
      .find(({ item, distance }) => (!targetId || item.id === targetId) && distance < 70)?.item;
    if (nearby) {
      const nextFound = [...foundRef.current, nearby.id];
      foundRef.current = nextFound;
      setFound(nextFound);
      setStatus(`${nearby.label} recovered. The woods whisper a little less now.`);
      guidanceHoldUntil.current = Date.now() + 4000;
      guidanceRef.current = nearby.clue;
      setGuidance(nearby.clue);
      game.award(nearby.label, 120);
      animateCharacter("collecting");
      return;
    }

    if ((!targetId || targetId === "ancient-gate") && Math.hypot(current.x - 2403, current.y - 400) < 72) {
      if (foundRef.current.includes("silver-key")) {
        setGateOpen(true);
        setStatus("The silver key turns. The ruined gate groans open.");
      } else {
        setStatus("The gate is locked. The key's metallic ring may be somewhere in the woods.");
      }
      return;
    }

    if ((!targetId || targetId === "old-mechanism") && Math.hypot(current.x - 6590, current.y - 372) < 76) {
      if (foundRef.current.includes("music-box-piece")) {
        setMechanismOpen(true);
        const catFoundSwitch = catUnlocked && Math.hypot(catRef.current.x - 6590, catRef.current.y - 372) < 88;
        setStatus(catFoundSwitch
          ? "Your companion slips through a narrow gap and paws the hidden switch. The old mechanism opens."
          : "The music-box piece fits the old mechanism. A hidden passage opens.");
        animateCharacter("interacting");
      } else {
        setStatus("The broken mechanism needs a small, precisely shaped piece.");
      }
      return;
    }

    if ((!targetId || targetId === "cat-companion") && catUnlocked && Math.hypot(current.x - catRef.current.x, current.y - catRef.current.y) < 68) {
      setStatus("Your companion nudges your hand, then points toward the nearest whisper.");
      setGuidance("A quiet purr follows you through the fog.");
      animateCharacter("interacting");
      return;
    }

    if ((!targetId || targetId.startsWith("hiding-cover-")) && hauntedCoverZones.some((zone) => current.x >= zone.x && current.x <= zone.x + zone.w && current.y >= zone.y && current.y <= zone.y + zone.h)) {
      toggleHide();
      return;
    }

    setStatus("Nothing is close enough to touch. Search the trail and listen to the whispers.");
  }, [animateCharacter, catUnlocked, game, toggleHide]);

  const nearbyHauntedInteraction = findNearestInteraction([
    ...hauntedItems
      .filter((item) => !found.includes(item.id))
      .map((item) => ({
        id: item.id,
        title: item.label,
        discovery: `${item.label} is hidden nearby. Move closer to investigate.`,
        instruction: `The ${item.label.toLowerCase().replace(/^the /, "")} is within reach. Press E to collect it.`,
        control: "E · COLLECT",
        x: item.x,
        y: item.y,
        detectionRadius: 155,
        interactionRadius: 70,
        onInteract: () => collectNearbyItem(item.id),
      })),
    ...(!gateOpen ? [{
      id: "ancient-gate",
      title: "AN ANCIENT GATE",
      discovery: "An ancient gate blocks the forest trail. Move closer to inspect it.",
      instruction: found.includes("silver-key")
        ? "The Silver Key fits the gate. Press E to unlock it."
        : "The gate is locked. Find the Silver Key in the woods.",
      control: found.includes("silver-key") ? "E · UNLOCK" : "E · INSPECT",
      x: 2403,
      y: 400,
      detectionRadius: 170,
      interactionRadius: 72,
      onInteract: () => collectNearbyItem("ancient-gate"),
    }] : []),
    ...(!mechanismOpen ? [{
      id: "old-mechanism",
      title: "THE OLD MECHANISM",
      discovery: "A weathered mechanism is set into the abandoned structure.",
      instruction: found.includes("music-box-piece")
        ? "The Music Box Piece may fit here. Press E to open the passage."
        : "The mechanism needs a small, precisely shaped piece.",
      control: "E · INSPECT",
      x: 6590,
      y: 372,
      detectionRadius: 160,
      interactionRadius: 76,
      onInteract: () => collectNearbyItem("old-mechanism"),
    }] : []),
    ...hauntedCoverZones.map((zone, index) => ({
      id: `hiding-cover-${index}`,
      title: "A GHOST HIDING SPOT",
      discovery: "A patch of deep shadow offers a place to hide from the ghosts.",
      instruction: player.hiding ? "You are hidden here. Press E to step back out." : "You are in cover. Press E to hide from the ghosts.",
      control: player.hiding ? "E · EMERGE" : "E · HIDE",
      x: Math.max(zone.x, Math.min(player.x, zone.x + zone.w)),
      y: Math.max(zone.y, Math.min(player.y, zone.y + zone.h)),
      detectionRadius: 125,
      interactionRadius: 2,
      onInteract: () => collectNearbyItem(`hiding-cover-${index}`),
    })),
    ...(catUnlocked ? [{
      id: "cat-companion",
      title: "YOUR CAT COMPANION",
      discovery: "Your companion has stopped nearby and seems to have noticed something.",
      instruction: "Your companion is close. Press E to check in.",
      control: "E · INTERACT",
      x: cat.x,
      y: cat.y,
      detectionRadius: 110,
      interactionRadius: 68,
      onInteract: () => collectNearbyItem("cat-companion"),
    }] : []),
    ...(!found.length || found.length < hauntedItems.length ? [] : [{
      id: "forest-exit",
      title: "THE FOREST EXIT",
      discovery: "The path home lies ahead through the final opening.",
      instruction: "All five relics are gathered. Move through the final opening to escape.",
      control: "MOVE TO THE EXIT",
      x: 13900,
      y: 400,
      detectionRadius: 220,
      interactionRadius: 160,
    }]),
  ], player);
  const nearbyHauntedInteractionRef = useRef(nearbyHauntedInteraction);
  nearbyHauntedInteractionRef.current = nearbyHauntedInteraction;
  const interactWithNearest = useCallback(() => {
    const nearby = nearbyHauntedInteractionRef.current;
    if (!nearby) {
      setStatus("Nothing is close enough to interact with. Explore the trail and look for a nearby clue.");
      return;
    }
    if (!nearby.inRange) {
      setStatus(`Move closer to ${nearby.interaction.title.toLowerCase()} to interact.`);
      return;
    }
    nearby.interaction.onInteract?.();
  }, []);

  const enterGame = useCallback(() => setShowTutorial(false), []);

  const tryAgain = () => {
    keyReset();
    const freshGhosts = createHauntedGhosts();
    const initialState = { x: 72, y: 390, hiding: false, facing: "down", moving: false, running: false };
    warningRef.current = 0;
    foundRef.current = [];
    ghostsRef.current = freshGhosts;
    playerRef.current = initialState;
    playerTrail.current = [{ x: 34, y: 390 }, { x: 72, y: 390 }];
    catRef.current = { x: 34, y: 390 };
    setGhosts(freshGhosts);
    setPlayer(initialState);
    setCat({ x: 34, y: 390 });
    setFound([]);
    setWarning(0);
    setLanternOn(false);
    setLanternCharge(100);
    setCompassCooldown(0);
    setCompassSignal(0);
    setBellUses(3);
    setBellCooldown(0);
    setMapOpen(false);
    setEquipmentOpen(false);
    setHealingReady(true);
    setBellPulse(0);
    setCharmFlash(false);
    setVisitedAreas(new Set(["Forgotten Entrance"]));
    setStatus("Follow the whispers, gather the five relics, and leave before the ghosts lock on.");
    setGuidance("The path ahead is quiet. Listen for the first clue.");
    setGameOver(false);
    setVictory(false);
    setPaused(false);
    setGateOpen(false);
    setMechanismOpen(false);
  };

  const keyReset = () => {
    keys.current = { up: false, down: false, left: false, right: false, sprint: false };
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const keySet = ["w", "a", "s", "d", "e", "h", "l", "b", "m", "j", "c", "shift", "arrowup", "arrowdown", "arrowleft", "arrowright"];
      if (keySet.includes(key) || ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
      }

      if (showTutorial) return;
      if (mapOpen) {
        if (key === "m" || event.key === "Escape") setMapOpen(false);
        return;
      }
      if (key === "w" || key === "arrowup") keys.current.up = true;
      if (key === "s" || key === "arrowdown") keys.current.down = true;
      if (key === "a" || key === "arrowleft") keys.current.left = true;
      if (key === "d" || key === "arrowright") keys.current.right = true;
      if (key === "shift") keys.current.sprint = true;
      if (key === "e") interactWithNearest();
      if (key === "h") triggerHint();
      if (key === "c") toggleHide();
      if (key === "l") toggleLantern();
      if (key === "b") ringBell();
      if (key === "m") toggleMap();
      if (key === "j") activateCharm();
      if (event.key === "Escape") setPaused((value) => !value);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === "w" || key === "arrowup") keys.current.up = false;
      if (key === "s" || key === "arrowdown") keys.current.down = false;
      if (key === "a" || key === "arrowleft") keys.current.left = false;
      if (key === "d" || key === "arrowright") keys.current.right = false;
      if (key === "shift") keys.current.sprint = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [activateCharm, interactWithNearest, mapOpen, ringBell, showTutorial, toggleHide, toggleLantern, toggleMap, triggerHint]);

  useEffect(() => {
    if (victory || gameOver || paused || showTutorial || mapOpen) return;
    const interval = window.setInterval(() => {
      const currentPlayer = playerRef.current;
      const nextPlayer = { ...currentPlayer };
      const moveX = (keys.current.right ? 1 : 0) - (keys.current.left ? 1 : 0);
      const moveY = (keys.current.down ? 1 : 0) - (keys.current.up ? 1 : 0);
      const obstacleIsSolid = (obstacle: { x: number; y: number; w: number; h: number }) => {
        if (gateOpen && obstacle.x === 2380) return false;
        if (mechanismOpen && obstacle.x === 6510) return false;
        if (foundRef.current.length === hauntedItems.length && obstacle.x === 13905) return false;
        return true;
      };
      const collides = (x: number, y: number) => hauntedObstacles.some((obstacle) =>
        obstacleIsSolid(obstacle) &&
        x > obstacle.x && x < obstacle.x + obstacle.w &&
        y > obstacle.y && y < obstacle.y + obstacle.h
      );
      const canOccupyPlayer = (x: number, y: number) => {
        const feetY = y + 20;
        if (x < 26 || x > HAUNTED_WORLD_WIDTH - 26 || feetY < 40 || feetY > 520) return false;
        const onTrail = (pointX: number, pointY: number) => {
          hauntedTerrainContext.lineWidth = 112;
          if (hauntedTerrainContext.isPointInStroke(hauntedTerrainPath, pointX, pointY)) return true;
          hauntedTerrainContext.lineWidth = 170;
          return hauntedTerrainContext.isPointInStroke(hauntedDetourPath, pointX, pointY);
        };
        // Test the character's actual foot anchor against the walkable trail.
        // Requiring both side points to remain inside the painted path made the
        // character snag on bends and narrow sections despite a clear centre path.
        if (!onTrail(x, feetY)) return false;
        // Keep genuine object collisions, using a small foot-sized footprint.
        return !hauntedPlayerObstacles.some((obstacle) => obstacleIsSolid(obstacle) &&
          x + 4 > obstacle.x && x - 4 < obstacle.x + obstacle.w &&
          feetY + 2 > obstacle.y && feetY - 2 < obstacle.y + obstacle.h
        );
      };

      if (moveX || moveY) {
        const step = keys.current.sprint ? 5.2 : 3.4;
        const magnitude = Math.hypot(moveX, moveY);
        const deltaX = (moveX / magnitude) * step;
        const deltaY = (moveY / magnitude) * step;
        const substeps = Math.ceil(Math.max(Math.abs(deltaX), Math.abs(deltaY)) / 2);
        for (let index = 0; index < substeps; index += 1) {
          const proposedX = nextPlayer.x + deltaX / substeps;
          if (canOccupyPlayer(proposedX, nextPlayer.y)) nextPlayer.x = proposedX;
          const proposedY = nextPlayer.y + deltaY / substeps;
          if (canOccupyPlayer(nextPlayer.x, proposedY)) nextPlayer.y = proposedY;
        }
        nextPlayer.facing = Math.abs(moveX) > Math.abs(moveY) ? (moveX > 0 ? "right" : "left") : moveY > 0 ? "down" : "up";
      }
      nextPlayer.moving = moveX !== 0 || moveY !== 0;
      nextPlayer.running = nextPlayer.moving && keys.current.sprint;
      const stage = stageRef.current;
      if (stage) {
        const scale = stage.clientHeight / 540;
        const visibleWidth = stage.clientWidth / scale;
        setCameraX(Math.max(0, Math.min(HAUNTED_WORLD_WIDTH - visibleWidth, nextPlayer.x - visibleWidth / 2)));
      }

      const inCover = hauntedCoverZones.some((zone) => nextPlayer.x >= zone.x && nextPlayer.x <= zone.x + zone.w && nextPlayer.y >= zone.y && nextPlayer.y <= zone.y + zone.h);
      if (nextPlayer.hiding && !inCover) nextPlayer.hiding = false;
      const trail = playerTrail.current;
      const lastWaypoint = trail[trail.length - 1];
      if (Math.hypot(nextPlayer.x - lastWaypoint.x, nextPlayer.y - lastWaypoint.y) >= 8) {
        trail.push({ x: nextPlayer.x, y: nextPlayer.y });
        if (trail.length > 40) trail.shift();
      }
      if (catUnlocked) {
        const currentCat = catRef.current;
        const catAtClue = hauntedItems.some((item) =>
          ["silver-key", "pendant"].includes(item.id) &&
          !foundRef.current.includes(item.id) &&
          Math.hypot(currentCat.x - item.x, currentCat.y - item.y) < 58
        ) || (foundRef.current.includes("music-box-piece") && !mechanismOpen && Math.hypot(currentCat.x - 6590, currentCat.y - 372) < 58);
        const target = hauntedTrailPoint(trail, 50);
        const catDx = target.x - currentCat.x;
        const catDy = target.y - currentCat.y;
        const catDistance = Math.hypot(catDx, catDy);
        const catStep = catAtClue ? 0 : Math.min(catDistance, 3.8);
        const catSteps = Math.max(1, Math.ceil(catStep / 2));
        let nextCat = { ...currentCat };
        for (let index = 0; index < catSteps; index += 1) {
          const proposedX = nextCat.x + (catDx / (catDistance || 1)) * catStep / catSteps;
          if (canOccupyPlayer(proposedX, nextCat.y)) nextCat.x = proposedX;
          const proposedY = nextCat.y + (catDy / (catDistance || 1)) * catStep / catSteps;
          if (canOccupyPlayer(nextCat.x, proposedY)) nextCat.y = proposedY;
        }
        catRef.current = nextCat;
        setCat(nextCat);
      }
      playerRef.current = nextPlayer;
      setPlayer(nextPlayer);

      const nextGhosts = ghostsRef.current.map((ghost) => {
        if ((ghost.pauseTicks ?? 0) > 0) return { ...ghost, pauseTicks: (ghost.pauseTicks ?? 0) - 1 };
        const target: [number, number] = (ghost.distractedTicks ?? 0) > 0 && ghost.distractionTarget
          ? [ghost.distractionTarget.x, ghost.distractionTarget.y]
          : ghost.route[ghost.targetIndex];
        const targetDx = target[0] - ghost.x;
        const dy = target[1] - ghost.y;
        const distance = Math.hypot(targetDx, dy) || 1;
        if ((ghost.distractedTicks ?? 0) > 0 && distance < 8) {
          return { ...ghost, distractedTicks: 0, distractionTarget: undefined };
        }
        if (distance < 6) {
          return {
            ...ghost,
            targetIndex: (ghost.targetIndex + 1) % ghost.route.length,
            pauseTicks: ghost.pauseDuration ?? 30,
            facing: Math.atan2(dy, targetDx),
          };
        }
        const nextX = ghost.x + (targetDx / distance) * ghost.speed;
        const nextY = ghost.y + (dy / distance) * ghost.speed;
        if (collides(nextX, nextY)) return { ...ghost, targetIndex: (ghost.targetIndex + 1) % ghost.route.length };
        return {
          ...ghost,
          x: nextX,
          y: nextY,
          facing: Math.atan2(dy, targetDx),
          distractedTicks: Math.max(0, (ghost.distractedTicks ?? 0) - 1),
        };
      });
      ghostsRef.current = nextGhosts;
      setGhosts(nextGhosts);

      let activeAlert = false;
      nextGhosts.forEach((ghost) => {
        const dx = nextPlayer.x - ghost.x;
        const dy = nextPlayer.y - ghost.y;
        const distance = Math.hypot(dx, dy);
        const toPlayer = Math.atan2(dy, dx);
        const angleDelta = Math.abs(Math.atan2(Math.sin(toPlayer - ghost.facing), Math.cos(toPlayer - ghost.facing)));
        const blocked = hauntedPlayerObstacles.some((obstacle) =>
          obstacleIsSolid(obstacle) && segmentIntersectsObstacle(ghost.x, ghost.y, nextPlayer.x, nextPlayer.y, obstacle)
        );
        const seesPlayer = !nextPlayer.hiding && distance < ghost.vision + (lanternOn ? 42 : 0) && angleDelta < ghost.fieldOfView && !blocked;
        if (seesPlayer) {
          activeAlert = true;
        }
      });

      const pressure = activeAlert ? 0.008 : -0.04;
      const previousWarning = warningRef.current;
      const nextWarning = Math.min(1, Math.max(0, previousWarning + pressure));
      warningRef.current = nextWarning;
      setWarning(nextWarning);
      if (activeAlert) {
        if (previousWarning < 0.7 && nextWarning >= 0.7) animateCharacter("startled");
        setStatus("A ghost has found your trail. Hide or break line of sight.");
      } else if (nextWarning < 0.2 && !foundRef.current.length) {
        setStatus("The forest is quiet. Listen for the next whisper.");
      }

      const nearestRemaining = hauntedItems
        .filter((item) => !foundRef.current.includes(item.id))
        .map((item) => ({ item, distance: Math.hypot(nextPlayer.x - item.x, nextPlayer.y - item.y) }))
        .sort((a, b) => a.distance - b.distance)[0];
      if (nearestRemaining) {
        const dx = nearestRemaining.item.x - nextPlayer.x;
        const dy = nearestRemaining.item.y - nextPlayer.y;
        const direction = [Math.abs(dy) > 35 ? (dy < 0 ? "north" : "south") : "", Math.abs(dx) > 35 ? (dx < 0 ? "west" : "east") : ""].filter(Boolean).join("-");
        const clue = nearestRemaining.distance < 55
          ? `The ${nearestRemaining.item.label.toLowerCase().replace(/^the /, "")} is almost within reach.`
          : nearestRemaining.distance < 160
            ? `The ${nearestRemaining.item.label.toLowerCase().replace(/^the /, "")} is close.`
            : `The forest's pull points ${direction || "ahead"} toward ${nearestRemaining.item.label.toLowerCase()}.`;
        if (Date.now() >= guidanceHoldUntil.current && guidanceRef.current !== clue) {
          guidanceRef.current = clue;
          setGuidance(clue);
        }
      }

      if (nextWarning >= 0.98) {
        if (healingReady) {
          warningRef.current = 0.2;
          setWarning(0.2);
          setHealingReady(false);
          setCharmFlash(true);
          animateCharacter("using");
          setStatus("The charm flares and the ghost loses its grip for a breathless second.");
          return;
        }
        setGameOver(true);
        setStatus("You were seen. The forest keeps its secrets.");
        game.wrongAnswer();
        return;
      }

      const allFound = foundRef.current.length >= hauntedItems.length;
      if (allFound) {
        const exitZone = nextPlayer.x > 13900 && nextPlayer.y > 250 && nextPlayer.y < 470;
        if (exitZone) {
          setVictory(true);
          setStatus("You slipped through the last fog and escaped with every memory intact.");
          setGuidance("The woods release you. The shrine is behind you now.");
          game.award("THE HAUNTED WOODS", 800);
        } else {
          setStatus("The relics are yours. Head for the shrine gate and escape before the ghosts close in.");
        }
      }
    }, 40);

    return () => window.clearInterval(interval);
  }, [animateCharacter, catUnlocked, game, gameOver, gateOpen, healingReady, lanternOn, mapOpen, mechanismOpen, paused, showTutorial, victory]);

  const completion = Math.min(100, (found.length / hauntedItems.length) * 100);
  const worldScale = stageSize.height / 540;
  const cameraOffset = cameraX * worldScale;
  const worldPosition = (x: number, y: number) => ({ left: `${x}px`, top: `${y}px` });
  const compassTarget = hauntedItems
    .filter((item) => !found.includes(item.id))
    .sort((a, b) => Math.hypot(player.x - a.x, player.y - a.y) - Math.hypot(player.x - b.x, player.y - b.y))[0];
  const compassRotation = compassTarget ? Math.atan2(compassTarget.y - player.y, compassTarget.x - player.x) * (180 / Math.PI) : 0;
  const catAlert = ghosts.some((ghost) => Math.hypot(cat.x - ghost.x, cat.y - ghost.y) < 170);
  const catNearClue = hauntedItems.some((item) =>
    ["silver-key", "pendant"].includes(item.id) && !found.includes(item.id) && Math.hypot(cat.x - item.x, cat.y - item.y) < 110
  );
  const catNearSwitch = catUnlocked && found.includes("music-box-piece") && !mechanismOpen && Math.hypot(cat.x - 6590, cat.y - 372) < 88;
  const catCurious = catNearClue || catNearSwitch;
  const catTree = hauntedTrees.find((tree) => cat.x >= tree.x + 76 * tree.scale && cat.x <= tree.x + 140 * tree.scale);
  const catDepth = catTree ? (cat.y + 10 < catTree.y + 350 * catTree.scale ? 6 : 3) : cat.y > player.y ? 5 : 3;
  const nearestGhostToCat = ghosts
    .map((ghost) => ({ ghost, distance: Math.hypot(cat.x - ghost.x, cat.y - ghost.y) }))
    .sort((a, b) => a.distance - b.distance)[0];
  const catLookingLeft = nearestGhostToCat ? nearestGhostToCat.ghost.x < cat.x : false;
  const hauntedIntroPages = useMemo<{ title: string; content: React.ReactNode }[]>(() => [
    {
      title: "WELCOME TO THE HAUNTED WOODS",
      content: <>
        <p className="haunted-intro-subtitle">SOME THINGS ARE BETTER LEFT UNFOUND.</p>
        <p className="haunted-intro-copy">You have entered a forgotten forest where lost memories, wandering spirits and secrets remain hidden. Find the five lost objects, survive the forest and make your way back before it claims you.</p>
        <section className="haunted-manual-callout">
          <strong>YOUR OBJECTIVE</strong>
          <p>Find all five lost items, survive the forest, and physically reach the final escape route without being caught.</p>
        </section>
        <section className="haunted-manual-card">
          <h3>THE FIVE LOST ITEMS</h3>
          <ol className="haunted-item-list">
            {hauntedItems.map((item) => <li key={item.id}>{item.label}</li>)}
          </ol>
        </section>
        <p className="haunted-manual-duration"><strong>ESTIMATED GAMEPLAY:</strong> 3–4 minutes or longer, depending on how much you explore.</p>
      </>,
    },
    {
      title: "MOVEMENT AND CONTROLS",
      content: <>
        <section className="haunted-manual-card">
          <h3>DESKTOP CONTROLS</h3>
          <ul className="haunted-manual-list">
            <li><strong>WASD / Arrow keys</strong> — Move along the forest paths. Use these to explore and to break a ghost’s line of sight.</li>
            <li><strong>Shift</strong> — Sprint while moving when you need to cross an exposed area quickly.</li>
            <li><strong>E</strong> — Interact: collect a nearby lost item, operate a mechanism, or hide when you are in suitable cover.</li>
            <li><strong>H</strong> — Use supernatural sensing for a clue toward the nearest uncollected item.</li>
            <li><strong>C</strong> — Hide or emerge while beside suitable cover.</li>
            <li><strong>Escape</strong> — Pause or resume the game.</li>
          </ul>
        </section>
        <section className="haunted-manual-card">
          <h3>MOBILE AND TABLET CONTROLS</h3>
          <ul className="haunted-manual-list">
            <li><strong>Floating directional pad</strong> — Hold a direction to move through the forest.</li>
            <li><strong>Interact</strong> — Collect nearby items, use mechanisms, or enter cover.</li>
            <li><strong>Run</strong> — Hold while moving to sprint across danger.</li>
            <li><strong>Hide</strong> — Toggle hiding while close to suitable cover.</li>
            <li><strong>Sense / Hint</strong> — Ask the compass for a directional clue.</li>
            <li><strong>Equipment / Pack</strong> — Open the equipment panel to use the lantern, compass, bell, map, or charm.</li>
            <li><strong>Pause</strong> — Stop the action to resume, review this manual, open your equipment, or return to the World Map.</li>
          </ul>
        </section>
      </>,
    },
    {
      title: "STEALTH AND GHOSTS",
      content: <>
        <p className="haunted-manual-copy">Ghosts patrol set routes and watch the space ahead of them. They can detect you when you are in their vision and have a clear line of sight; lantern light makes their vision reach farther.</p>
        <section className="haunted-manual-card">
          <h3>STAY OUT OF SIGHT</h3>
          <ul className="haunted-manual-list">
            <li>Watch the on-screen <strong>WARNING</strong> and <strong>DETECTED</strong> indicators. They show that a ghost has noticed your trail and detection is rising.</li>
            <li>Break line of sight by moving behind solid trees, pillars, ruins, walls, rocks, or other suitable structures.</li>
            <li>When you reach designated cover, use <strong>C / HIDE</strong> or <strong>E / INTERACT</strong> to hide. Hiding clears the current warning while you remain concealed.</li>
            <li>The silver bell makes a sound that draws selected nearby ghosts toward it. Use the distraction to move away, but remember that the sound may bring spirits close to your position.</li>
            <li>Keep moving carefully, use cover, and avoid leaving the lantern on when stealth matters.</li>
          </ul>
        </section>
        <section className="haunted-manual-callout">
          <strong>IF YOU ARE DETECTED</strong>
          <p>Detection builds while a ghost can see you. Your protection charm can interrupt one critical detection; if the danger rises again after it has been spent, the attempt ends in Game Over. Choose <strong>TRY AGAIN</strong> to restart the attempt with the items, equipment, and protection charm reset.</p>
        </section>
      </>,
    },
    {
      title: "THE MYSTERIOUS CAT",
      content: <>
        <p className="haunted-manual-copy">You are not alone for long. Five seconds into active play, a scripted encounter can reveal the mysterious cat.</p>
        <section className="haunted-manual-card">
          <h3>A COMPANION, NOT A SHIELD</h3>
          <ul className="haunted-manual-list">
            <li>Once discovered, the cat follows the trail you have walked, keeping close as you explore.</li>
            <li>Its eyes and alert behaviour change when ghosts are nearby. Treat this as a warning and look for cover or a safer route.</li>
            <li>The cat grows curious near selected hidden objects, including the Silver Key and the Ancient Pendant, helping draw your attention to clues.</li>
            <li>At the old mechanism, the cat can find and reach the small hidden switch after you have found the Broken Music Box Piece. You still need to interact with the mechanism.</li>
            <li>It helps with selected clues and environmental puzzles, but it does not fight ghosts, collect items for you, reveal every secret, or guarantee your safety.</li>
          </ul>
        </section>
      </>,
    },
    {
      title: "EQUIPMENT AND INVENTORY",
      content: <>
        <p className="haunted-manual-copy">Open the on-screen <strong>PACK</strong> button during play to access your equipment. Keyboard shortcuts are listed where implemented.</p>
        <section className="haunted-manual-card">
          <h3>LANTERN <span className="haunted-manual-shortcut">L / PACK</span></h3>
          <p>Toggle it on or off from PACK or press <strong>L</strong>. Its glow reveals nearby details and items a little farther away. The lantern has limited charge and drains while lit; its light also makes ghost vision reach farther, so switch it off when you need to stay hidden.</p>
        </section>
        <section className="haunted-manual-card">
          <h3>MYSTERIOUS COMPASS <span className="haunted-manual-shortcut">H / PACK</span></h3>
          <p>Activate supernatural sensing with <strong>H</strong> or the compass in PACK. It gives a directional clue toward the nearest missing item, while the on-screen signal points in its direction. The separate proximity whisper sharpens as you approach—from a direction, to close, to almost within reach. The compass has a short five-second cooldown and never gives an exact map marker.</p>
        </section>
        <section className="haunted-manual-card">
          <h3>OLD SILVER BELL <span className="haunted-manual-shortcut">B / PACK</span></h3>
          <p>Ring it with <strong>B</strong> or from PACK. It has three uses and a short cooldown. Selected nearby ghosts investigate the sound, giving you a chance to move away. Not every spirit is affected, so ringing it can also leave other ghosts nearby and create risk.</p>
        </section>
        <section className="haunted-manual-card">
          <h3>HIDDEN FOREST MAP <span className="haunted-manual-shortcut">M / PACK</span></h3>
          <p>Open or close it with <strong>M</strong> or from PACK. The map reveals forest regions as you visit them. It does not show undiscovered collectibles or ghost positions, so you still need to investigate.</p>
        </section>
        <section className="haunted-manual-card">
          <h3>PROTECTION CHARM <span className="haunted-manual-shortcut">J / PACK</span></h3>
          <p>Use <strong>J</strong> or the charm in PACK for emergency protection: it lowers the detection warning and can automatically flare at the critical threshold. It works once per attempt. It resets when you choose TRY AGAIN.</p>
        </section>
      </>,
    },
    {
      title: "COLLECTIBLES AND PUZZLES",
      content: <>
        <section className="haunted-manual-card">
          <h3>SEARCH, LISTEN, INVESTIGATE</h3>
          <ul className="haunted-manual-list">
            <li>Explore the forest regions and watch for a shimmer or other visual clue as you approach one of the five lost items.</li>
            <li>Move close to an item and press <strong>E / INTERACT</strong> (or tap the Interact button) to collect it. The counter shows how many of the five you have found.</li>
            <li>Environmental clues and the compass point toward the nearest missing item. Direction and proximity become more useful as you explore.</li>
            <li>The forest map only records areas you have visited. It deliberately does not mark collectible locations or ghost positions, so look and listen instead of following an exact marker.</li>
          </ul>
        </section>
        <section className="haunted-manual-card">
          <h3>MECHANISMS AND HIDDEN PATHS</h3>
          <ul className="haunted-manual-list">
            <li>Approach a marked gate or mechanism and interact when you are close enough. The Silver Key opens the ruined gate.</li>
            <li>The Broken Music Box Piece fits the old mechanism and opens a hidden passage.</li>
            <li>At selected puzzle locations, the cat may draw your attention to a clue or find the mechanism’s small hidden switch. You still need to investigate and interact yourself.</li>
          </ul>
        </section>
      </>,
    },
    {
      title: "FINAL ESCAPE AND SURVIVAL",
      content: <>
        <section className="haunted-manual-callout">
          <strong>FIVE ITEMS. ONE WAY OUT.</strong>
          <p>Find all five lost objects to make the final escape route available. Then guide your character all the way to the exit; collecting everything alone does not complete the level.</p>
        </section>
        <section className="haunted-manual-card">
          <h3>YOUR LAST STEPS</h3>
          <ul className="haunted-manual-list">
            <li>Ghosts can still detect and catch you on the way out. Use cover, move out of their sight, and watch the warning indicators.</li>
            <li>Your protection charm gives one emergency reprieve per attempt, either when used or when it automatically prevents critical detection. It cannot protect you a second time.</li>
            <li>If detection catches you after the charm is spent, Game Over appears. Choose <strong>TRY AGAIN</strong> to restart the attempt; your collected items and temporary equipment use reset, including the charm.</li>
            <li>Choose <strong>RETURN TO WORLD MAP</strong> from Game Over or the pause menu whenever you want to leave the level.</li>
            <li>When you have all five items and physically reach the exit, you escape the woods and see the victory screen. Choose <strong>RETURN TO MAP</strong> to continue.</li>
          </ul>
        </section>
      </>,
    },
  ], []);

  return <main className={`haunted-screen screen ${showTutorial ? "haunted-manual-open" : ""}`}>
    <header className="haunted-header">
      <div>
        <span>SECRET CHAPTER / THE HAUNTED WOODS</span>
        <h1>KEEP MOVING. KEEP HIDDEN.</h1>
        <p className="haunted-objective">FIND ALL FIVE ITEMS · ESCAPE WITHOUT BEING CAUGHT</p>
      </div>
      <button type="button" className="haunted-exit" onClick={onMap}>RETURN TO MAP</button>
    </header>
    <div className="haunted-info-bar">
      <span>{found.length}/{hauntedItems.length} LOST ITEMS</span>
      <span>{Math.round(completion)}% FOUND</span>
      <span>{warning > 0.7 ? "DANGER" : found.length >= hauntedItems.length ? "ESCAPE" : "STEALTH"}</span>
      <span className={catUnlocked ? "companion-ready" : ""}>{catUnlocked ? "CAT COMPANION" : "COMPANION NEARBY"}</span>
    </div>
    {showTutorial && <InstructionGuide
      pages={hauntedIntroPages}
      pageIndex={tutorialPage}
      onPageChange={setTutorialPage}
      onStart={enterGame}
      onMap={onMap}
      startLabel="START THE ADVENTURE"
      eyebrow="SECRET CHAPTER / THE HAUNTED WOODS"
      theme="woodland"
      overlay
      className="haunted-manual-overlay"
      panelClassName="haunted-modal haunted-manual"
      headerClassName="haunted-manual-header"
      contentClassName="haunted-manual-content"
      pageClassName="haunted-manual-page"
      footerClassName="haunted-manual-footer"
      navigationClassName="haunted-manual-navigation"
      buttonClassName="haunted-manual-button"
    />}
    <div ref={stageRef} className={`haunted-stage ${lanternOn ? "lantern-lit" : ""}`} aria-live="polite">
      <div className="haunted-world" style={{ width: `${HAUNTED_WORLD_WIDTH}px`, transform: `translate3d(-${cameraOffset}px, 0, 0) scale(${worldScale})` }}>
      <img className="forest-backdrop" src="/haunted-woods-world.svg" alt="" aria-hidden="true" />
      {lanternOn && <div className="lantern-aura" style={worldPosition(player.x, player.y)} aria-hidden="true" />}
      {hauntedItems.map((item) => {
        const foundAlready = found.includes(item.id);
        const itemDistance = Math.hypot(player.x - item.x, player.y - item.y);
        const visible = itemDistance < 155 || foundAlready || (lanternOn && itemDistance < 220);
        return <button key={item.id} type="button" className={`haunted-item item-${item.id} ${visible ? "revealed" : "veiled"} ${foundAlready ? "collected" : ""} ${itemDistance < 155 ? "interaction-discovered" : ""} ${itemDistance < 70 ? "interaction-ready" : ""}`} style={worldPosition(item.x, item.y)} aria-label={item.label} title={item.label} disabled={foundAlready || itemDistance >= 70} onClick={() => collectNearbyItem(item.id)}>
          <span className="item-sprite" aria-hidden="true">
            {item.id === "silver-key" && <svg viewBox="0 0 24 24"><path d="M7 3h7v3h3v3h-3v3h-3v3H8v3H4v-4h3v-3h3V9H7V6H4V3z" /><path d="M7 5h4v2H7zm0 8h4v2H7z" className="item-shine" /></svg>}
            {item.id === "music-box-piece" && <svg viewBox="0 0 24 24"><path d="M4 5h16v3H4zm2 3h12v11H6zm-2 11h16v2H4z" /><path d="M10 10h5v5h-5z" className="item-shine" /></svg>}
            {item.id === "photograph" && <svg viewBox="0 0 24 24"><path d="M3 4h18v16H3z" /><path d="M6 7h12v9H6z" className="item-shine" /><path d="m6 16 4-4 3 3 2-2 3 3v1H6z" /></svg>}
            {item.id === "pendant" && <svg viewBox="0 0 24 24"><path d="M8 3h8v3h3v3h-3v3h-2v3h-4v-3H8V9H5V6h3z" /><path d="M10 8h4v4h-4z" className="item-shine" /><path d="M10 15h4v4h-4z" /></svg>}
            {item.id === "memory-fragment" && <svg viewBox="0 0 24 24"><path d="m12 2 3 5 6 2-4 5v6l-5-3-5 3v-6L3 9l6-2z" /><path d="M11 7h2v7h-2zm0 9h2v2h-2z" className="item-shine" /></svg>}
          </span>
        </button>;
      })}
      {ghosts.map((ghost) => <div key={ghost.id} className={`haunted-ghost ghost-${ghost.appearance ?? "wisp"} ${ghost.vanishes ? "vanishes" : ""}`} style={worldPosition(ghost.x, ghost.y)} aria-label="Patrolling ghost"><i /><i /></div>)}
      {catUnlocked && <div className={`haunted-cat ${catAlert ? "alert" : ""} ${catCurious ? "curious" : ""} ${catLookingLeft ? "looking-left" : ""} ${player.hiding ? "hiding" : ""} ${!player.moving ? "idle" : "moving"}`} style={{ ...worldPosition(cat.x, cat.y), zIndex: catDepth }} aria-label="Mysterious cat companion">
        <i className="cat-ear left" /><i className="cat-ear right" /><i className="cat-body" /><i className="cat-tail" /><i className="cat-eyes" />
      </div>}
      <div className={`haunted-player facing-${player.facing} ${player.moving ? "moving" : ""} ${player.running ? "running" : ""} ${warning > 0.7 ? "detected startled" : ""} ${player.hiding ? "hiding" : ""} ${characterAction}`} style={worldPosition(player.x, player.y)} aria-label="Girl explorer">
        <i className="player-ponytail" /><i className="player-hair" /><i className="player-face" /><i className="player-coat" /><i className="player-pack" /><i className="player-legs" /><i className="player-boots" />
      </div>
      {hauntedTrees.map((tree, index) => {
        const baseY = tree.y + 350 * tree.scale;
        return <img key={index} className="forest-depth-tree" src="/haunted-woods-tree.svg" alt="" aria-hidden="true" style={{
          left: `${tree.x}px`,
          top: `${tree.y}px`,
          width: `${185 * tree.scale}px`,
          height: `${360 * tree.scale}px`,
          zIndex: player.y + 20 < baseY ? 6 : 3,
        }} />;
      })}
      {gateOpen && <span className="haunted-gate-open" style={worldPosition(2403, 400)}>GATE OPEN</span>}
      {mechanismOpen && <span className="haunted-passage-open" style={worldPosition(6590, 372)}>PASSAGE OPEN</span>}
      </div>
      <div className="haunted-rain rain-background" aria-hidden="true" />
      <div className="haunted-rain rain-midground" aria-hidden="true" />
      <div className="haunted-rain rain-foreground" aria-hidden="true" />
      <div className="haunted-rain-splashes" aria-hidden="true" />
      {compassTarget && compassSignal > 0 && <div className="haunted-compass" aria-label={`Compass signal: ${compassSignal} seconds remaining`}><small>SIGNAL / {compassSignal}</small><span style={{ transform: `rotate(${compassRotation}deg)` }}><Icon name="arrow" size={18} /></span></div>}
      <button type="button" className="haunted-pause-button" onClick={() => setPaused((value) => !value)}>PAUSE</button>
      <div className="haunted-pack">
        <button type="button" className={`haunted-pack-toggle ${equipmentOpen ? "active" : ""}`} onClick={() => setEquipmentOpen((value) => !value)} aria-expanded={equipmentOpen}>PACK</button>
        {equipmentOpen && <div className="haunted-equipment" aria-label="Haunted Woods equipment">
          <button type="button" className={`haunted-tool ${lanternOn ? "active" : ""}`} disabled={lanternCharge <= 0} onClick={toggleLantern}>LANTERN <span>{lanternCharge}%</span></button>
          <button type="button" className={`haunted-tool ${compassCooldown > 0 ? "cooldown" : ""}`} disabled={compassCooldown > 0} onClick={triggerHint}>COMPASS <span>{compassCooldown ? `${compassCooldown}s` : "READY"}</span></button>
          <button type="button" className={`haunted-tool ${bellCooldown > 0 ? "cooldown" : ""}`} disabled={bellUses <= 0 || bellCooldown > 0} onClick={ringBell}>BELL <span>{bellUses}</span></button>
          <button type="button" className={`haunted-tool ${mapOpen ? "active" : ""}`} onClick={toggleMap}>MAP</button>
          <button type="button" className={`haunted-tool ${!healingReady ? "disabled" : ""}`} disabled={!healingReady} onClick={activateCharm}>CHARM <span>{healingReady ? "READY" : "USED"}</span></button>
        </div>}
      </div>
      {areaNotice && <span key={areaNotice} className="forest-location" aria-live="polite">{areaNotice}</span>}
      {catReveal && <div className="haunted-companion-reveal" role="status">
        <small>SOMETHING HAS BEEN FOLLOWING YOU...</small>
        <strong>MYSTERIOUS COMPANION UNLOCKED</strong>
        <span>A LITTLE SHADOW HAS JOINED YOUR JOURNEY.</span>
      </div>}
      {catNearSwitch && <div className="haunted-cat-prompt" role="status">YOUR COMPANION FOUND A HIDDEN SWITCH · PRESS E NEAR THE MECHANISM</div>}
      {warning > 0.12 && <div className="haunted-warning" style={{ opacity: Math.min(1, warning) }}>{warning > 0.72 ? "DETECTED" : "WARNING"}</div>}
      {charmFlash && <div className="haunted-charm-flash" role="status">PROTECTION CHARM ACTIVATED</div>}
      {mapOpen && <div className="haunted-overlay haunted-map-overlay" role="dialog" aria-modal="true">
        <div className="haunted-map-panel">
          <span>FOREST MAP</span>
          <h3>EXPLORED ROUTES</h3>
          <p>Only visited regions are revealed. Relics and spirits are never marked.</p>
          <div className="haunted-map-path" aria-label="Explored route through the forest">
            {hauntedAreas.map((area) => <i key={area.name} className={visitedAreas.has(area.name) ? "visited" : ""} />)}
          </div>
          <div className="haunted-map-grid">
            {hauntedAreas.map((area) => <div key={area.name} className={`haunted-map-sector ${visitedAreas.has(area.name) ? "active" : ""}`}>
              {visitedAreas.has(area.name) ? area.name : "UNEXPLORED"}
            </div>)}
          </div>
          <button type="button" onClick={() => setMapOpen(false)}>CLOSE MAP / RESUME</button>
        </div>
      </div>}
      {gameOver && <div className="haunted-overlay"><div className="haunted-modal"><span>THE WOODS FOUND YOU</span><h2>YOU WERE SEEN</h2><p>The silence in the woods is heavier than the fog.</p><button type="button" onClick={tryAgain}>TRY AGAIN</button><button type="button" onClick={onMap}>RETURN TO MAP</button></div></div>}
      {victory && <div className="haunted-overlay"><div className="haunted-modal victory"><span>YOU SURVIVED</span><h2>THE WOODS LET YOU GO</h2><p>ALL FIVE ITEMS FOUND. YOU SURVIVED THE HAUNTED WOODS.</p><button type="button" onClick={onMap}>RETURN TO MAP</button></div></div>}
      {paused && <div className="haunted-overlay"><div className="haunted-modal paused"><span>GAME PAUSED</span><h2>LISTEN TO THE FOREST.</h2><p>Take a breath; the woods will still be waiting.</p><button type="button" onClick={() => setPaused(false)}>RESUME</button><button type="button" onClick={() => { setPaused(false); setTutorialPage(0); setShowTutorial(true); setEquipmentOpen(false); }}>VIEW INSTRUCTIONS</button><button type="button" onClick={() => { setPaused(false); setEquipmentOpen(true); }}>EQUIPMENT / INVENTORY</button><MusicPanelButton /><button type="button" onClick={onMap}>RETURN TO WORLD MAP</button></div></div>}
    </div>
    <div className="haunted-status"><strong>STATUS:</strong> {status}<span className="haunted-guidance"><b>THE FOREST WHISPERS:</b> {guidance}</span></div>
    {nearbyHauntedInteraction && !showTutorial && !paused && !gameOver && !victory && (
      <div className="haunted-interaction-anchor">
        <InteractionGuide
          title={nearbyHauntedInteraction.interaction.title}
          discovery={nearbyHauntedInteraction.interaction.discovery}
          instruction={nearbyHauntedInteraction.interaction.instruction}
          control={nearbyHauntedInteraction.interaction.control}
          inRange={nearbyHauntedInteraction.inRange}
          tone="haunted"
          onInteract={nearbyHauntedInteraction.inRange ? nearbyHauntedInteraction.interaction.onInteract : undefined}
          showTouchButton={false}
        />
      </div>
    )}

    <div className="haunted-touch-controls" aria-label="Touch controls for the haunted woods">
      <div className="haunted-dpad">
        <button type="button" className="touch-direction up" onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); setMovement("up", true); }} onPointerUp={() => setMovement("up", false)} onPointerLeave={() => setMovement("up", false)} onPointerCancel={() => setMovement("up", false)}>↑</button>
        <button type="button" className="touch-direction left" onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); setMovement("left", true); }} onPointerUp={() => setMovement("left", false)} onPointerLeave={() => setMovement("left", false)} onPointerCancel={() => setMovement("left", false)}>←</button>
        <button type="button" className="touch-direction down" onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); setMovement("down", true); }} onPointerUp={() => setMovement("down", false)} onPointerLeave={() => setMovement("down", false)} onPointerCancel={() => setMovement("down", false)}>↓</button>
        <button type="button" className="touch-direction right" onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); setMovement("right", true); }} onPointerUp={() => setMovement("right", false)} onPointerLeave={() => setMovement("right", false)} onPointerCancel={() => setMovement("right", false)}>→</button>
      </div>
      <div className="haunted-action-buttons">
        <button type="button" className="touch-action interact" onClick={interactWithNearest} disabled={!nearbyHauntedInteraction?.inRange}>E / INTERACT</button>
        <button type="button" className="touch-action hide" onClick={toggleHide}>HIDE</button>
        <button type="button" className="touch-action hint" onClick={triggerHint}>HINT</button>
        <button type="button" className="touch-action sprint" onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); keys.current.sprint = true; }} onPointerUp={() => { keys.current.sprint = false; }} onPointerLeave={() => { keys.current.sprint = false; }} onPointerCancel={() => { keys.current.sprint = false; }}>RUN</button>
        <button type="button" className="touch-action pause" onClick={() => setPaused((value) => !value)}>PAUSE</button>
      </div>
    </div>
  </main>;
}

function LevelShell({ children, level, title, subtitle, onMap, audio, toggleAudio, game, tone = "" }: { children: React.ReactNode; level: string; title: string; subtitle: string; onMap: () => void; audio: boolean; toggleAudio: () => void; game: GameState; tone?: string }) {
  return <main className={`level-screen screen ${tone}`}><TopBar onMap={onMap} game={game} /><div className="level-titlebar"><button className="back-link" onClick={onMap}><Icon name="back" /> WORLD MAP</button><div><span>LEVEL {level}</span><h1>{title}</h1><p>{subtitle}</p></div><div className="level-hearts"><PixelHeart /><PixelHeart /><PixelHeart /></div></div>{children}</main>;
}

function memoryStart(memory: Memory) {
  return Date.parse(`${memory.dateStart}T00:00:00Z`);
}

function memoryEnd(memory: Memory) {
  return Date.parse(`${memory.dateEnd}T23:59:59Z`);
}

function getValidMemoryOrders() {
  const orders: number[][] = [];
  const visit = (order: number[], remaining: Memory[]) => {
    if (remaining.length === 0) {
      orders.push(order);
      return;
    }
    remaining.forEach((candidate) => {
      const canFollowPlaced = order.every((id) => {
        const placed = memories.find((memory) => memory.id === id);
        return placed !== undefined && memoryEnd(candidate) >= memoryStart(placed);
      });
      if (canFollowPlaced) visit([...order, candidate.id], remaining.filter((memory) => memory.id !== candidate.id));
    });
  };
  visit([], memories);
  return orders;
}

function shuffleMemoryIds(previousOrder: number[] | null) {
  const shuffled = memories.map((memory) => memory.id);
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  if (previousOrder && shuffled.every((id, index) => id === previousOrder[index]) && shuffled.length > 1) {
    [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
  }
  return shuffled;
}

const timelineReactions = [
  { minimum: 0.75, message: "GIRL, YOU REMEMBER EVERYTHING. THE LORE IS LORE-ING." },
  { minimum: 0.4, message: "Not bad, detective. A few chapters got mixed up!" },
  { minimum: 0, message: "THE MEMORY ARCHIVES NEED A LITTLE RESTORATION." },
];

function TimelineScreen({ onMap, onComplete, audio, toggleAudio, game, startDirectly = false }: { onMap: () => void; onComplete: () => void; audio: boolean; toggleAudio: () => void; game: GameState; startDirectly?: boolean }) {
  const [phase, setPhase] = useState<"intro" | "challenge" | "reveal">(startDirectly ? "challenge" : "intro");
  const [order, setOrder] = useState<number[]>(() => startDirectly ? shuffleMemoryIds(null) : []);
  const [result, setResult] = useState<{ score: number; correctlyPlaced: Set<number>; originalOrder: number[] } | null>(null);
  const [orderMessage, setOrderMessage] = useState("");
  const draggedMemory = useRef<number | null>(null);
  const previousOrder = useRef<number[] | null>(startDirectly ? order : null);
  const [core, setCore] = useState(false);
  const unlockCore = () => {
    if (core) return;
    setCore(true);
    game.award("CORE MEMORY KEEPER", 300);
  };
  const validOrders = useMemo(() => getValidMemoryOrders(), []);
  const canonicalOrder = useMemo(() => [...memories].sort((a, b) => memoryStart(a) - memoryStart(b) || memoryEnd(a) - memoryEnd(b) || a.id - b.id), []);
  const validPositions = useMemo(() => {
    const positions = new Map<number, Set<number>>();
    validOrders.forEach((validOrder) => validOrder.forEach((id, index) => {
      const existing = positions.get(id) ?? new Set<number>();
      existing.add(index);
      positions.set(id, existing);
    }));
    return positions;
  }, [validOrders]);
  const startAttempt = () => {
    const nextOrder = shuffleMemoryIds(previousOrder.current);
    previousOrder.current = nextOrder;
    setOrder(nextOrder);
    setResult(null);
    setOrderMessage("");
    setPhase("challenge");
  };
  const reposition = (sourceId: number, targetId: number) => {
    if (sourceId === targetId) return;
    setOrder((current) => {
      const sourceIndex = current.indexOf(sourceId);
      const targetIndex = current.indexOf(targetId);
      if (sourceIndex < 0 || targetIndex < 0) return current;
      const next = [...current];
      next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, sourceId);
      return next;
    });
    setOrderMessage("");
  };
  const move = (index: number, direction: -1 | 1) => {
    const next = index + direction;
    if (next < 0 || next >= order.length) return;
    reposition(order[index], order[next]);
  };
  const check = () => {
    const hasEveryMemory = order.length === memories.length
      && new Set(order).size === memories.length
      && memories.every((memory) => order.includes(memory.id));
    if (!hasEveryMemory) {
      setOrderMessage("A memory card went missing along the way. Put every card back in the timeline, then try again.");
      return;
    }
    const correctlyPlaced = new Set(order.filter((id, index) => validPositions.get(id)?.has(index)));
    setResult({ score: correctlyPlaced.size, correctlyPlaced, originalOrder: [...order] });
    setPhase("reveal");
    game.award("TIMELINE RESTORER", 250);
  };
  return <LevelShell level="01" title="MEMORY MEADOW" subtitle="Walk through the moments that made us." onMap={onMap} audio={audio} toggleAudio={toggleAudio} game={game} tone="warm-level">
    {phase === "intro" && <section className="timeline-intro memory-meadow timeline-challenge-intro"><button className="ordinary-star" onClick={() => game.secret("memory-star", "THE STAR THAT REMEMBERED")} aria-label="A suspiciously ordinary star">+</button><div className="chapter-label">{celebrationProfile.playerName} / MEMORY QUEST</div><h2>THE MEMORY TIMELINE</h2><p className="timeline-question">Can you put our friendship back in order?</p><p>From our earliest chaos to our latest memories.</p><div className="mission-copy"><b>{celebrationProfile.playerName}, YOUR MISSION</b><p>These are pieces of our friendship, all mixed up. Put them in the order you think they happened, from our earliest memory to our latest. No dates, no hints. Just your memory of us.</p></div><Button onClick={startAttempt} icon="play">START THE CHALLENGE</Button></section>}
    {phase === "challenge" && <section className="timeline-challenge">
      <button className="ordinary-star" onClick={() => game.secret("memory-star", "THE STAR THAT REMEMBERED")} aria-label="A suspiciously ordinary star">+</button>
      <div className="challenge-heading"><span className="chapter-label">THE MEMORY TIMELINE</span><h2>Can you put our friendship back in order?</h2><p>Drag the cards to rearrange them: <b>OLDEST → NEWEST.</b></p><span className="timeline-no-hints">No dates. No hints. Just your memory of us.</span></div>
      <InteractionGuide title="MEMORY CARDS" discovery="These cards hold pieces of your shared story." instruction="Drag a card into its place, or use the arrow buttons to reorder it." control="DRAG / ARROW BUTTONS" inRange tone="meadow" />
      <div className="challenge-list" aria-label="Friendship memory cards, ordered oldest to newest">
        {order.map((id, index) => {
          const memory = memories.find((item) => item.id === id);
          if (!memory) return null;
          return <article key={memory.id} className="challenge-memory-card" draggable onDragStart={(event) => { draggedMemory.current = memory.id; event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", String(memory.id)); }} onDragEnd={() => { draggedMemory.current = null; }} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const sourceId = Number(event.dataTransfer.getData("text/plain")) || draggedMemory.current; if (sourceId !== null) reposition(sourceId, memory.id); }}>
            <span className="challenge-position" aria-label={`Position ${index + 1}`}>{String(index + 1).padStart(2, "0")}</span>
            <span className="challenge-photo">{memory.image ? <img src={memory.image} alt="" /> : <Icon name="camera" size={34} />}</span>
            <div className="challenge-card-copy"><span>MEMORY CARD</span><h3>{memory.title}</h3></div>
            <div className="challenge-move-controls">
              <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Move ${memory.title} earlier`} title="Move earlier">↑</button>
              <button type="button" onClick={() => move(index, 1)} disabled={index === order.length - 1} aria-label={`Move ${memory.title} later`} title="Move later">↓</button>
            </div>
          </article>;
        })}
      </div>
      {orderMessage && <p className="timeline-validation" role="alert">{orderMessage}</p>}
      <div className="challenge-submit"><Button onClick={check}>LOCK IN MY ANSWER</Button></div>
    </section>}
    {phase === "reveal" && result && <section className="timeline-reveal">
      <div className="timeline-result-banner"><span className="chapter-label">THE ARCHIVES ARE OPEN</span><h2>THE REAL LORE HAS BEEN UNLOCKED</h2><p>Let's see how our story actually unfolded.</p><strong>{result.score}/{memories.length} memories in the correct position.</strong><small>Score = cards that could occupy their selected position in a valid chronological order. Overlapping date ranges may have more than one fair position.</small><b>{timelineReactions.find((reaction) => result.score / memories.length >= reaction.minimum)?.message}</b></div>
      <div className="revealed-timeline">{canonicalOrder.map((memory, index) => {
        const placedIndex = result.originalOrder.indexOf(memory.id);
        const correctlyPlaced = result.correctlyPlaced.has(memory.id);
        const possiblePositions = validPositions.get(memory.id);
        return <article className={`revealed-memory-card ${correctlyPlaced ? "placed-correctly" : "placed-misplaced"}`} key={memory.id}>
          <div className="reveal-position"><span>TRUE TIMELINE POSITION</span><b>{String(index + 1).padStart(2, "0")}</b></div>
          <div className="revealed-photo">{memory.image ? <img src={memory.image} alt={memory.title} /> : <Icon name="camera" size={38} />}</div>
          <div className="revealed-copy"><span className="reveal-status">{correctlyPlaced ? "✓ CORRECT POSITION" : "↗ MISPLACED"}</span><small>{memory.date}</small><h3>{memory.title}</h3><b>{memory.caption}</b><p>{memory.story}</p><span className="player-position">PLAYER 2 PLACED THIS AT POSITION {placedIndex + 1}</span>{possiblePositions && possiblePositions.size > 1 && <span className="ambiguity-note">Date range overlap: this memory can fairly fit in more than one position.</span>}</div>
        </article>;
      })}</div>
      <div className="timeline-replay-actions"><Button onClick={startAttempt} icon="sparkle">PLAY AGAIN</Button><Button variant="secondary" onClick={onMap} icon="map">BACK TO MAP</Button></div>
    </section>}
    <section className={`core-memory-vault ${core ? "unlocked" : ""}`}>
      {!core && <InteractionGuide title="A MEMORY FLOWER" discovery="This flower seems to be holding onto a memory." instruction="Tap the flower to reveal its hidden memory." control="TAP THE FLOWER" inRange tone="meadow" onInteract={unlockCore} />}
      <button className="meadow-flower" onClick={unlockCore}><Icon name={core ? "heart" : "sparkle"} size={32} /><span>{core ? "CORE MEMORY UNLOCKED" : "THIS FLOWER SEEMS IMPORTANT"}</span></button>{core && <div><small>UNIQUE MEMORY BADGE FOUND</small><p>MWEHEHEHEHEHE.<br /><br />YOU HAVE UNLOCKED A MEMORY.<br /><br />And unfortunately for you, I remember EVERYTHING.</p></div>}</section>
    {phase === "reveal" && <div className="level-complete-row"><p>Meadow status: <b>{core ? "core memory recovered" : "timeline restored"}</b></p><Button onClick={onComplete}>COMPLETE LEVEL</Button></div>}
  </LevelShell>;
}

type FightPhase = "intro" | "answering" | "attacking" | "result" | "victory" | "defeated" | "draw";
type FightOutcome = "victory" | "defeated" | "draw";

function FriendshipFightClub({ onMap, onBattleComplete, audio, toggleAudio, game, startDirectly = false }: { onMap: () => void; onBattleComplete: () => void; audio: boolean; toggleAudio: () => void; game: GameState; startDirectly?: boolean }) {
  const [phase, setPhase] = useState<FightPhase>(startDirectly ? "answering" : "intro");
  const [round, setRound] = useState(0);
  const [playerHp, setPlayerHp] = useState<number>(FIGHT_RULES.startingHealth);
  const [monsterHp, setMonsterHp] = useState<number>(FIGHT_RULES.startingHealth);
  const [selectedAnswer, setSelectedAnswer] = useState<FightOptionId | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [attackSide, setAttackSide] = useState<"player" | "monster" | null>(null);
  const submittedRound = useRef(false);
  const timerRef = useRef<number | null>(null);
  const resultRecorded = useRef(false);
  const damage = FIGHT_RULES.damagePerHit;
  const question = fightQuestions[round];

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  const resetBattle = () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    submittedRound.current = false;
    resultRecorded.current = false;
    setRound(0);
    setPlayerHp(FIGHT_RULES.startingHealth);
    setMonsterHp(FIGHT_RULES.startingHealth);
    setSelectedAnswer(null);
    setCorrectCount(0);
    setIncorrectCount(0);
    setAttackSide(null);
    setPhase("answering");
  };

  const answerQuestion = (answerId: FightOptionId) => {
    if (phase !== "answering" || submittedRound.current) return;
    submittedRound.current = true;
    setSelectedAnswer(answerId);
    const correct = answerId === question.correctAnswer;
    const nextPlayerHp = correct ? playerHp : Math.max(0, playerHp - damage);
    const nextMonsterHp = correct ? Math.max(0, monsterHp - damage) : monsterHp;
    const isFinalQuestion = round === fightQuestions.length - 1;
    const outcome: FightOutcome | null = nextPlayerHp === 0 && nextMonsterHp === 0
      ? "draw"
      : nextPlayerHp === 0
        ? "defeated"
        : isFinalQuestion
          ? nextPlayerHp === nextMonsterHp ? "draw" : nextMonsterHp < nextPlayerHp ? "victory" : "defeated"
          : null;

    setPlayerHp(nextPlayerHp);
    setMonsterHp(nextMonsterHp);
    setAttackSide(correct ? "player" : "monster");
    if (correct) setCorrectCount((count) => count + 1);
    else {
      setIncorrectCount((count) => count + 1);
      game.wrongAnswer();
    }
    if (correct) game.playAttack();
    setPhase("attacking");
    timerRef.current = window.setTimeout(() => {
      setPhase("result");
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null;
        if (outcome) {
          setPhase(outcome);
          if (outcome === "victory" && !resultRecorded.current) {
            resultRecorded.current = true;
            onBattleComplete();
            game.award("BESTIE COMBAT CHAMPION", 250);
          }
          return;
        }
        submittedRound.current = false;
        setSelectedAnswer(null);
        setAttackSide(null);
        setRound((currentRound) => currentRound + 1);
        setPhase("answering");
      }, 900);
    }, 650);
  };

  const shell = (children: React.ReactNode) => (
    <LevelShell
      level="02"
      title="THE FRIENDSHIP FIGHT CLUB"
      subtitle="10 questions. One friendship. Absolutely zero mercy."
      onMap={onMap}
      audio={audio}
      toggleAudio={toggleAudio}
      game={game}
      tone="fight-club-level"
    >
      {children}
    </LevelShell>
  );

  if (phase === "intro") return shell(
    <section className="fight-intro arcade-cabinet">
      <div className="arcade-marquee"><span>PLAYER 2 ENTERS THE ARENA</span><h2>FRIENDSHIP<br />FIGHT CLUB</h2><p>10 QUESTIONS. ONE FRIENDSHIP. ABSOLUTELY ZERO MERCY.</p></div>
      <div className="fight-intro-stage">
        <div className="fighter human-fighter" role="img" aria-label="Original pixel-art human fighter"><span className="fighter-hair" /><span className="fighter-face"><i /><i /></span><span className="fighter-shirt" /><span className="fighter-arm" /><span className="fighter-leg" /></div>
        <b className="versus-mark">VS</b>
        <div className="fighter monster-fighter" role="img" aria-label="Original pixel-art mischievous monster"><span className="monster-horn" /><span className="monster-head"><i /><i /><b /></span><span className="monster-body" /><span className="monster-arm" /><span className="monster-foot" /></div>
      </div>
      <p className="fight-intro-copy">Answer all 10 friendship questions. Every answer changes the battle, but the monster will not interrupt the quiz.</p>
      <div className="fight-intro-actions"><Button onClick={resetBattle} icon="sword">INSERT COIN / START</Button><Button variant="secondary" onClick={onMap} icon="map">RETURN TO MAP</Button></div>
    </section>
  );

  if (phase === "victory" || phase === "defeated" || phase === "draw") {
    const won = phase === "victory";
    const drawn = phase === "draw";
    const title = won ? "FATALITY! THE BESTIE LORE IS UNMATCHED." : drawn ? "DOUBLE K.O. — ABSOLUTE FRIENDSHIP CHAOS." : "GAME OVER! THE MONSTER WON THIS ROUND OF FRIENDSHIP CHAOS.";
    return shell(
      <section className={`fight-ending arcade-cabinet ${won ? "ending-win" : drawn ? "ending-draw" : "ending-loss"}`}>
        <div className="ending-sparks" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
        <span className="fight-ending-kicker">{won ? "CHAMPION / PLAYER 2" : drawn ? "RESULT / DOUBLE K.O." : "RESULT / MONSTER WINS"}</span>
        <div className={`fight-ending-characters ${won ? "monster-defeated" : drawn ? "draw-result" : "player-defeated"}`}>
          <div className="fighter human-fighter" role="img" aria-label={won ? "Victorious Player 2" : "Player 2"}><span className="fighter-hair" /><span className="fighter-face"><i /><i /></span><span className="fighter-shirt" /><span className="fighter-arm" /><span className="fighter-leg" /></div>
          <b className="versus-mark">VS</b>
          <div className="fighter monster-fighter" role="img" aria-label={won ? "Defeated monster" : "The monster"}><span className="monster-horn" /><span className="monster-head"><i /><i /><b /></span><span className="monster-body" /><span className="monster-arm" /><span className="monster-foot" /></div>
        </div>
        <h2>{title}</h2>
        {won && <p>YOU DEFEATED THE MONSTER AND PROVED YOUR BESTIE KNOWLEDGE.</p>}
        <div className="fight-final-stats">
          <span><small>CORRECT</small><b>{correctCount}</b></span>
          <span><small>INCORRECT</small><b>{incorrectCount}</b></span>
          <span><small>ROUNDS COMPLETED</small><b>{correctCount + incorrectCount} / 10</b></span>
          <span><small>FINAL SCORE</small><b>{correctCount * 100}</b></span>
          <span><small>PLAYER 2 HP</small><b>{playerHp}%</b></span>
          <span><small>MONSTER HP</small><b>{monsterHp}%</b></span>
        </div>
        {won && <div className="fight-achievement"><Icon name="trophy" size={24} /><span><small>ACHIEVEMENT UNLOCKED</small><b>BESTIE COMBAT CHAMPION</b></span></div>}
        <div className="fight-ending-actions">
          <Button onClick={resetBattle} icon="play">{won ? "PLAY AGAIN" : "RETRY BATTLE"}</Button>
          <Button variant="secondary" onClick={onMap} icon="map">RETURN TO MAP</Button>
        </div>
      </section>
    );
  }

  const isCorrect = selectedAnswer === question.correctAnswer;
  return shell(
    <section className={`fight-game arcade-cabinet ${round === fightQuestions.length - 1 ? "final-round" : ""} ${phase === "attacking" ? "impact-shake" : ""}`}>
      <div className="fight-machine-lights" aria-hidden="true"><i /><i /><i /><i /><i /></div>
      <div className="fight-hud">
        <div className="fighter-health player-health">
          <div className="health-name"><b>PLAYER 2</b><small>HUMAN FIGHTER</small><strong>{playerHp}% HP</strong></div>
          <div className="health-track" role="progressbar" aria-label="Player 2 health" aria-valuemin={0} aria-valuemax={100} aria-valuenow={playerHp}><i style={{ width: `${playerHp}%` }} /></div>
        </div>
        <div className="round-readout"><small>{round === 9 ? "FINAL ROUND" : "FIGHT!"}</small><b>QUESTION {round + 1}<i>/ 10</i></b><span>{10 - round} QUESTIONS LEFT</span></div>
        <div className="fighter-health monster-health">
          <div className="health-name"><b>THE MONSTER</b><small>OPPONENT / CHAOS</small><strong>{monsterHp}% HP</strong></div>
          <div className="health-track" role="progressbar" aria-label="Monster health" aria-valuemin={0} aria-valuemax={100} aria-valuenow={monsterHp}><i style={{ width: `${monsterHp}%` }} /></div>
        </div>
      </div>
      <div className="fight-arena">
        <div className="arena-skyline" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
        <div className={`fighter human-fighter ${attackSide === "player" && phase === "attacking" ? "fighter-attack" : ""} ${attackSide === "monster" && phase === "attacking" ? "fighter-hit" : ""}`} role="img" aria-label={`Player 2, ${playerHp} percent health`}><span className="fighter-hair" /><span className="fighter-face"><i /><i /></span><span className="fighter-shirt" /><span className="fighter-arm" /><span className="fighter-leg" /></div>
        <span className="arena-vs">VS</span>
        <div className={`fighter monster-fighter ${attackSide === "monster" && phase === "attacking" ? "fighter-attack" : ""} ${attackSide === "player" && phase === "attacking" ? "fighter-hit" : ""}`} role="img" aria-label={`The monster, ${monsterHp} percent health`}><span className="monster-horn" /><span className="monster-head"><i /><i /><b /></span><span className="monster-body" /><span className="monster-arm" /><span className="monster-foot" /></div>
        <div className="arena-floor" />
        {phase === "attacking" && <span className="impact-effect" aria-hidden="true">{isCorrect ? "POW!" : "BONK!"}<i /><i /><i /></span>}
        {round === fightQuestions.length - 1 && <span className="final-round-flare" aria-hidden="true" />}
      </div>
      <section className="fight-question">
        <div className="question-progress" role="progressbar" aria-label="Question progress" aria-valuemin={0} aria-valuemax={10} aria-valuenow={round + 1}><i style={{ width: `${(round + 1) * 10}%` }} /></div>
        <div className="question-meta"><span>QUESTION {round + 1} / 10</span><small>DIFFICULTY: {question.difficulty}</small></div>
        <h2>{question.question}</h2>
        {question.note && <p className="fight-question-note">{question.note}</p>}
        {phase === "answering" && <InteractionGuide title="BATTLE ACTION" discovery="Choose the answer that best fits your shared memories." instruction="Select one answer to make your move in the battle." control="TAP AN ANSWER" inRange tone="arcade" />}
        <div className="fight-answer-grid">
          {question.options.map((option) => {
            const revealed = phase === "result";
            const correctChoice = revealed && option.id === question.correctAnswer;
            const wrongChoice = revealed && option.id === selectedAnswer && !isCorrect;
            return <button key={`${question.id}-${option.id}`} className={`fight-answer ${selectedAnswer === option.id ? "chosen" : ""} ${correctChoice ? "answer-correct" : ""} ${wrongChoice ? "answer-wrong" : ""}`} onClick={() => answerQuestion(option.id)} disabled={phase !== "answering"} aria-pressed={selectedAnswer === option.id}>
              <span>{option.id}</span>{option.text}
            </button>;
          })}
        </div>
        {(phase === "attacking" || phase === "result") && <div className={`fight-feedback ${isCorrect ? "good-hit" : "bad-hit"}`} role="status" aria-live={phase === "attacking" ? "assertive" : "polite"}>
          <div>
            <b>{isCorrect ? "CORRECT! PLAYER 2 ATTACKS." : "NOT QUITE! THE MONSTER ATTACKS."}</b>
            <span>{isCorrect ? `The monster lost ${damage} HP.` : `Player 2 lost ${damage} HP.`}</span>
            {phase === "result" && <small><strong>Correct answer:</strong> {question.options.find((option) => option.id === question.correctAnswer)?.text}</small>}
          </div>
        </div>}
      </section>
    </section>
  );
}

function BossFigure({ friendly = false }: { friendly?: boolean }) {
  return <div className={`boss-character ${friendly ? "friendly-boss" : ""}`}><div className="boss-aura" /><div className="boss-head"><span className="boss-eye" /><span className="boss-eye right" /></div><div className="boss-body"><Icon name={friendly ? "heart" : "sword"} size={45} /></div></div>;
}

function QuizScreen({ onMap, onComplete, audio, toggleAudio, game, startDirectly = false }: { onMap: () => void; onComplete: () => void; audio: boolean; toggleAudio: () => void; game: GameState; startDirectly?: boolean }) {
  const [mode, setMode] = useState<"intro" | "battle" | "lost" | "reveal" | "results">(startDirectly ? "battle" : "intro");
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [selected, setSelected] = useState<number | null>(null);
  const [hidden, setHidden] = useState<number[]>([]);
  const [transition, setTransition] = useState(false);
  const reset = () => { setMode("battle"); setCurrent(0); setScore(0); setLives(3); setSelected(null); setHidden([]); };
  const answer = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    if (index === questions[current].answer) { setScore((s) => s + (current === 3 ? 400 : 250)); game.award(`ROUND ${current + 1} CRITICAL HIT`, current === 3 ? 150 : 75); }
    else { setLives((l) => Math.max(0, l - 1)); game.wrongAnswer(); }
  };
  const next = () => {
    const nextLives = selected === questions[current].answer ? lives : Math.max(0, lives);
    if (nextLives === 0) { setMode("lost"); return; }
    if (current === questions.length - 1) { setMode("reveal"); game.award("KEEPER OF THE LORE DEFEATED", 500); return; }
    setTransition(true);
    window.setTimeout(() => { setCurrent((c) => c + 1); setSelected(null); setHidden([]); setTransition(false); }, 700);
  };
  const hint = () => {
    if (selected !== null || hidden.length) return;
    if (!game.spend(50)) return;
    const wrong = [0, 1, 2, 3].filter((i) => i !== questions[current].answer).slice(0, 2);
    setHidden(wrong);
  };
  const shell = (content: React.ReactNode, title = "BOSS BATTLE") => <LevelShell level="03" title={title} subtitle="The Keeper of Obscure Memories" onMap={onMap} audio={audio} toggleAudio={toggleAudio} game={game} tone="battle-level">{content}</LevelShell>;
  if (mode === "intro") return shell(<section className="boss-intro"><div className="boss-alert">WARNING: BOSS APPROACHING</div><BossFigure /><div className="boss-copy"><span>FINAL BOSS</span><h2>THE KEEPER OF<br />OBSCURE MEMORIES</h2><p>Four editable rounds. Correct answers deal damage. Wrong answers cost a heart. Hints cost 50 friendship XP.</p><Button onClick={reset} icon="sword">ENTER THE ARENA</Button></div></section>);
  if (mode === "lost") return shell(<section className="results-card defeat-card"><span className="result-trophy"><PixelHeart filled={false} /></span><small>PARTY DEFEATED</small><h2>THE LORE FOUGHT BACK.</h2><p>No friendship was harmed. The Keeper has agreed to a rematch.</p><div className="button-pair"><Button onClick={reset}>RETRY BATTLE</Button><Button variant="secondary" onClick={onMap}>RETREAT TO MAP</Button></div></section>, "TRY AGAIN");
  if (mode === "reveal") return shell(<section className="boss-reveal"><BossFigure friendly /><div><span>BOSS TRANSFORMATION COMPLETE</span><h2>THE KEEPER WAS<br />A FRIEND ALL ALONG.</h2><blockquote>"YOU HAVE DEFEATED THE FINAL BOSS. BUT THE REAL TREASURE WAS THE FRIENDSHIP ALL ALONG."</blockquote><Button onClick={() => setMode("results")}>CLAIM THE BOSS KEY</Button></div></section>, "BOSS DEFEATED");
  if (mode === "results") return shell(<section className="results-card"><span className="result-trophy"><Icon name="trophy" size={64} /></span><small>SPECIAL REWARD UNLOCKED</small><h2>{score >= 1150 ? "CERTIFIED SOULMATE" : score >= 750 ? "FRIENDSHIP EXPERT" : "SUSPICIOUSLY GOOD MEMORY"}</h2><div className="final-score"><span>SCORE</span><b>{score}</b><em>XP</em></div><p>The Boss Key has been added to your permanent inventory.</p><div className="button-pair"><Button variant="secondary" onClick={reset}>REPLAY BATTLE</Button><Button onClick={onComplete}>COMPLETE LEVEL</Button></div></section>, "VICTORY!");
  const q = questions[current];
  return shell(<><section className="battle-hud"><div className="hud-block"><span>THE KEEPER — HP</span><div className="hp-bar"><i style={{ width: `${100 - current * 25 - (selected === q.answer ? 25 : 0)}%` }} /></div></div><div className="score-block"><small>BATTLE XP</small><b>{score.toString().padStart(4, "0")}</b></div><div className="lives-block"><small>LIVES</small><span>{[0, 1, 2].map((n) => <PixelHeart key={n} filled={n < lives} />)}</span></div></section><section className={`question-panel ${transition ? "round-transition" : ""}`}><div className="round-banner">ROUND {current + 1} / {questions.length} <span>{q.category}</span></div><div className="boss-dialogue">KEEPER: {current === 3 ? "No more warm-up questions. Show me what you remember." : "Answer carefully, Player 2."}</div><h2>{q.question}</h2>{selected === null && <InteractionGuide title="BOSS MECHANIC" discovery="Correct answers damage the Keeper. Wrong answers cost a heart." instruction="Choose one answer; you can spend 50 XP for a hint first." control="TAP AN ANSWER" inRange tone="arcade" />}<div className="answer-grid">{q.options.map((option, i) => <button key={option} disabled={hidden.includes(i)} onClick={() => answer(i)} className={`answer-button ${hidden.includes(i) ? "hint-hidden" : ""} ${selected === i ? (i === q.answer ? "correct" : "wrong") : ""} ${selected !== null && i === q.answer ? "correct reveal" : ""}`}><span>{String.fromCharCode(65 + i)}</span>{hidden.includes(i) ? "OPTION REMOVED BY HINT" : option}</button>)}</div><div className="hint-row"><button onClick={hint} disabled={selected !== null || hidden.length > 0}><Icon name="sparkle" size={15} /> USE HINT (-50 XP)</button>{hidden.length > 0 && <span>{q.hint}</span>}</div>{selected !== null && <div className={`feedback ${selected === q.answer ? "success" : "error"}`}><Icon name={selected === q.answer ? "sword" : "heart"} /><div><b>{selected === q.answer ? "CRITICAL HIT!" : "THE KEEPER ATTACKS!"}</b><p>{selected === q.answer ? `Correct. ${current === 3 ? "Final-round bonus awarded." : "The boss loses 25% HP."}` : q.wrong}</p></div><Button onClick={next}>{current === questions.length - 1 ? "FINAL STRIKE" : "NEXT ROUND"}</Button></div>}</section></>);
}

function Typewriter({ text, speed = 24, onDone }: { text: string; speed?: number; onDone?: () => void }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    setCount(0);
    const timer = window.setInterval(() => setCount((n) => { if (n >= text.length) { window.clearInterval(timer); onDone?.(); return n; } return n + 1; }), speed);
    return () => window.clearInterval(timer);
  }, [text, speed]);
  return <>{text.slice(0, count)}<span className="type-cursor">|</span></>;
}

function InventoryScreen({ onMap, onComplete, audio, toggleAudio, game }: { onMap: () => void; onComplete: () => void; audio: boolean; toggleAudio: () => void; game: GameState }) {
  const [selected, setSelected] = useState<typeof collectibles[0] | null>(null);
  const [secretVisible, setSecretVisible] = useState(game.secrets.has("cove-glint"));
  const inspect = (item: typeof collectibles[0]) => { setSelected(item); game.collect(item.id, item.title); };
  return <LevelShell level="04" title="TREASURE COVE" subtitle="Collect the objects that carry our stories." onMap={onMap} audio={audio} toggleAudio={toggleAudio} game={game} tone="inventory-level">
    <section className="inventory-intro"><div><span className="section-kicker">TREASURE COVE / {game.foundItems.size} OF {collectibles.length} COLLECTED</span><h2>NOT ALL TREASURE<br /><em>GLITTERS.</em></h2><p>Some treasure looks like old messages, blurry photos, familiar songs, and places that still remember you.</p></div><div className="treasure-chest"><Icon name="chest" size={90} /><button className="cove-glint" onClick={() => { setSecretVisible(true); game.secret("cove-glint", "THE GLINT BENEATH THE CHEST"); }} aria-label="A glint beneath the treasure chest">+</button><span className="chest-glow" /></div></section>
    <section className="inventory-grid">{collectibles.map((item) => {
      const hiddenLegendary = item.id === 6 && !secretVisible;
      if (hiddenLegendary) return <button className="inventory-item secret-slot" key={item.id} onClick={() => game.award("LOCKED CHEST POKER", 0)}><div className="item-visual"><Icon name="lock" size={42} /></div><div className="item-details"><small>UNKNOWN ITEM</small><h3>Something is hidden nearby...</h3><span className="rarity legendary">SECRET</span></div></button>;
      return <button className={`inventory-item ${item.rarity.toLowerCase()} ${game.foundItems.has(item.id) ? "collected" : ""}`} key={item.id} onClick={() => inspect(item)}><div className="item-visual"><span className="item-shine" />{item.image ? <img src={item.image} alt="" /> : <Icon name={item.icon} size={42} />}{!game.foundItems.has(item.id) && <i className="new-item">NEW</i>}</div><div className="item-details"><small>{item.type}</small><h3>{item.title}</h3><span className={`rarity ${item.rarity.toLowerCase()}`}>{item.rarity}</span></div><span className="inspect">{game.foundItems.has(item.id) ? "REVISIT" : "DISCOVER"} <Icon name="arrow" size={14} /></span></button>;
    })}</section>
    <div className="level-complete-row"><p>Inventory: <b>{game.foundItems.size} stories recovered</b></p><Button onClick={onComplete}>COMPLETE COLLECTION</Button></div>
    {selected && <div className="modal-backdrop"><section className="modal-window item-reveal"><button className="modal-close" onClick={() => setSelected(null)}><Icon name="close" /></button><small>COLLECTIBLE DISCOVERED</small><h2>{selected.title}</h2><div className={`modal-item ${selected.rarity.toLowerCase()}`}>{selected.image ? <img src={selected.image} alt={selected.title} /> : <Icon name={selected.icon} size={64} />}</div><span className={`rarity ${selected.rarity.toLowerCase()}`}>{selected.rarity} {selected.type}</span><p className="story-copy">{selected.id === 6 ? <Typewriter text={selected.story} /> : selected.story}</p></section></div>}
  </LevelShell>;
}

function EndingScreen({ onMap, onFinalComplete, audio, toggleAudio, game, setMusicDucked }: { onMap: () => void; onFinalComplete?: () => void; audio: boolean; toggleAudio: () => void; game: GameState; setMusicDucked: (ducked: boolean) => void }) {
  const [scene, setScene] = useState(0);
  const [revealIndex, setRevealIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [letterReplayKey, setLetterReplayKey] = useState(0);

  useEffect(() => {
    setMusicDucked(scene === 2);
    return () => setMusicDucked(false);
  }, [scene, setMusicDucked]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotionPreference = () => setPrefersReducedMotion(media.matches);
    syncMotionPreference();
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", syncMotionPreference);
      return () => media.removeEventListener("change", syncMotionPreference);
    }
    media.addListener(syncMotionPreference);
    return () => media.removeListener(syncMotionPreference);
  }, []);

  useEffect(() => {
    if (scene !== 2) return;

    if (prefersReducedMotion) {
      setRevealIndex(letterParagraphs.length);
      return;
    }

    setRevealIndex(0);
    const timers: number[] = [];

    letterParagraphs.forEach((_, index) => {
      const ms = 550 + index * 460;
      const timer = window.setTimeout(() => setRevealIndex((current) => Math.max(current, index + 1)), ms);
      timers.push(timer);
    });

    const doneTimer = window.setTimeout(() => {
      setRevealIndex(letterParagraphs.length);
    }, 550 + letterParagraphs.length * 460 + 260);

    timers.push(doneTimer);

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [scene, prefersReducedMotion, letterReplayKey]);

  const revealReady = revealIndex >= letterParagraphs.length;

  const resetLetter = () => {
    setRevealIndex(0);
    setLetterReplayKey((value) => value + 1);
    setScene(2);
  };

  if (scene === 0) {
    return <main className="ending-screen screen"><TopBar onMap={onMap} game={game} /><section className="finale-victory"><div className="completion-pill"><Icon name="trophy" /> FINAL QUEST COMPLETE</div><h1>QUEST COMPLETE.<br />FRIENDSHIP STATUS: <em>LEGENDARY.</em></h1><BossFigure friendly /><div className="earned-badges">{Array.from(game.achievements).slice(-6).map((badge) => <span key={badge}><Icon name="trophy" size={16} />{badge}</span>)}</div><Button onClick={() => setScene(1)}>CONTINUE</Button></section></main>;
  }

  if (scene === 1) {
    return <main className="ending-screen quiet-ending screen"><button className="skip-finale" onClick={() => setScene(2)}>SKIP</button><section><span>GAME PAUSED</span><h1>You've made it this far.</h1><p>There's just one last thing I wanted you to read.</p><Button onClick={() => setScene(2)}>Open your letter</Button></section></main>;
  }

  return <main className="ending-screen letter-scene screen"><button className="skip-finale" onClick={() => { setRevealIndex(letterParagraphs.length); }}>SKIP ANIMATION</button><div className="letter-stage"><article className="letter-paper finale-letter">
    <div className="letter-header"><span>TO: MY PLAYER 2</span><span>PRIVATE MESSAGE</span></div>
    <div className="letter-body">
      {letterParagraphs.map((paragraph, index) => {
        const isVisible = prefersReducedMotion || revealIndex > index;
        const isOpening = index === 0;
        return <p key={`${paragraph.slice(0, 20)}-${index}`} className={`letter-paragraph ${isVisible ? "visible" : ""} ${isOpening ? "letter-opening" : ""}`} style={{ transitionDelay: `${index * 120}ms` }}>{paragraph}</p>;
      })}
      {revealReady && <>
        <div className="letter-signoff">
          <p>See you in our dream life.</p>
          <small>— Your partner in crime</small>
        </div>
        <div className="letter-end-message">
          <p>And that is the end of this little adventure.</p>
          <div className="letter-end-actions">
            <button type="button" className="letter-action secondary" onClick={resetLetter}>Read the letter again</button>
            <button type="button" className="letter-action ghost" onClick={onFinalComplete ?? onMap}>Return to map</button>
          </div>
        </div>
      </>}
    </div>
  </article></div></main>;
}

const hauntedRevealMessages = [
  "Wait... there's something else.",
  "Something has awakened beyond this world.",
  "SECRET LOCATION UNLOCKED",
  "THE HAUNTED WOODS",
];

function HauntedUnlockReveal({ onComplete }: { onComplete: () => void }) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const delay = messageIndex === hauntedRevealMessages.length - 1 ? 1700 : 1250;
    const timer = window.setTimeout(() => {
      if (messageIndex === hauntedRevealMessages.length - 1) {
        onComplete();
      } else {
        setMessageIndex((index) => index + 1);
      }
    }, delay);
    return () => window.clearTimeout(timer);
  }, [messageIndex, onComplete]);

  return <main className="haunted-reveal screen" aria-live="polite">
    <div className="haunted-reveal-glow" aria-hidden="true" />
    <span className="haunted-reveal-kicker">A NEW SIGNAL</span>
    <h1 key={messageIndex} className={messageIndex >= 2 ? "unlocked" : ""}>{hauntedRevealMessages[messageIndex]}</h1>
    {messageIndex === hauntedRevealMessages.length - 1 && <div className="haunted-reveal-portal" aria-hidden="true"><i /></div>}
  </main>;
}

export default function App() {
  const initialProgress = useMemo(loadProgress, []);
  const [musicPreference, setMusicPreference] = useState<MusicPreference>(loadMusicPreference);
  const audio = musicPreference.enabled;
  const musicVolume = musicPreference.volume;
  const audioSystem = useRef<GameAudio | null>(null);
  const finalStoryActive = useRef(false);
  const [screen, setScreen] = useState<Screen>("start");
  const [guideKind, setGuideKind] = useState<GuideKind>("game");
  const [guidePage, setGuidePage] = useState(0);
  const [guidedLevel, setGuidedLevel] = useState<Screen | null>(null);
  const [isPortrait, setIsPortrait] = useState(() => window.matchMedia("(orientation: portrait)").matches);
  const portraitInstructionsAvailable = screen === "guide" || screen === "adventure" || screen === "haunted";
  const [musicStatus, setMusicStatus] = useState<MusicStatus>("ready");
  const [isMusicPanelOpen, setIsMusicPanelOpen] = useState(false);
  const [letterMode, setLetterMode] = useState(false);
  const [xp, setXp] = useState(initialProgress.xp);
  const [achievements, setAchievements] = useState<Set<string>>(new Set(initialProgress.achievements));
  const [secrets, setSecrets] = useState<Set<string>>(new Set(initialProgress.secrets));
  const [foundItems, setFoundItems] = useState<Set<number>>(new Set(initialProgress.foundItems));
  const [completed, setCompleted] = useState<Set<Screen>>(new Set(initialProgress.completed));
  const [finalCompleted, setFinalCompleted] = useState(initialProgress.finalCompleted);
  const [ghostLevelUnlocked, setGhostLevelUnlocked] = useState(initialProgress.ghostLevelUnlocked);
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    const orientationQuery = window.matchMedia("(orientation: portrait)");
    const syncOrientation = () => setIsPortrait(orientationQuery.matches);
    syncOrientation();
    if (typeof orientationQuery.addEventListener === "function") {
      orientationQuery.addEventListener("change", syncOrientation);
      return () => orientationQuery.removeEventListener("change", syncOrientation);
    }
    orientationQuery.addListener(syncOrientation);
    return () => orientationQuery.removeListener(syncOrientation);
  }, []);
  useEffect(() => {
    const blockPortraitGameplay = (event: KeyboardEvent) => {
      if (event.type !== "keydown" || portraitInstructionsAvailable || !window.matchMedia("(orientation: portrait)").matches) return;
      event.preventDefault();
      event.stopPropagation();
    };
    window.addEventListener("keydown", blockPortraitGameplay, true);
    return () => window.removeEventListener("keydown", blockPortraitGameplay, true);
  }, [portraitInstructionsAvailable]);
  useEffect(() => {
    const manager = new GameAudio(setMusicStatus);
    audioSystem.current = manager;
    manager.setMusicVolume(musicVolume);
    if (!audio) manager.setEnabled(false);
    const retryIntro = () => {
      void manager.startMusic().then((started) => {
        if (started) {
          window.removeEventListener("pointerdown", retryIntro, true);
          window.removeEventListener("keydown", retryIntro, true);
        }
      });
    };
    void manager.startMusic().then((started) => {
      if (started) {
        window.removeEventListener("pointerdown", retryIntro, true);
        window.removeEventListener("keydown", retryIntro, true);
      }
    });
    window.addEventListener("pointerdown", retryIntro, true);
    window.addEventListener("keydown", retryIntro, true);
    return () => {
      window.removeEventListener("pointerdown", retryIntro, true);
      window.removeEventListener("keydown", retryIntro, true);
      manager.destroy();
      if (audioSystem.current === manager) audioSystem.current = null;
    };
  }, []);
  useEffect(() => {
    if (!window.matchMedia("(pointer: coarse)").matches) return;

    const requestPresentation = () => {
      if (document.fullscreenElement) return;

      const fullscreenRequest = document.documentElement.requestFullscreen?.();
      if (fullscreenRequest) {
        void fullscreenRequest.then(() => {
          window.removeEventListener("pointerdown", requestPresentation, true);
          window.removeEventListener("keydown", requestPresentation, true);
        }, (error) => console.warn("Unable to enter fullscreen presentation.", error));
      }
    };

    window.addEventListener("pointerdown", requestPresentation, true);
    window.addEventListener("keydown", requestPresentation, true);
    return () => {
      window.removeEventListener("pointerdown", requestPresentation, true);
      window.removeEventListener("keydown", requestPresentation, true);
    };
  }, []);
  useEffect(() => {
    try {
      window.localStorage.setItem(MUSIC_PREFERENCE_KEY, JSON.stringify(musicPreference));
    } catch (error) {
      console.warn("Unable to save music preferences.", error);
    }
  }, [musicPreference]);
  useEffect(() => {
    const progress: StoredProgress = {
      version: 1,
      xp,
      achievements: Array.from(achievements),
      secrets: Array.from(secrets),
      foundItems: Array.from(foundItems),
      completed: Array.from(completed),
      finalCompleted,
      ghostLevelUnlocked,
    };
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    window.localStorage.setItem(GHOST_LEVEL_KEY, JSON.stringify({ unlocked: ghostLevelUnlocked }));
  }, [xp, achievements, secrets, foundItems, completed, finalCompleted, ghostLevelUnlocked]);
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(null), 3200); };
  const award = (label: string, amount = 100) => {
    if (achievements.has(label)) return;
    if (amount > 0) audioSystem.current?.playReward();
    setAchievements((old) => new Set(old).add(label));
    setXp((value) => value + amount);
    notify(label);
  };
  const secret = (id: string, label: string) => {
    if (secrets.has(id)) { notify("SECRET ALREADY RECOVERED"); return; }
    audioSystem.current?.playReward();
    setSecrets((old) => new Set(old).add(id));
    setXp((value) => value + 200);
    setAchievements((old) => new Set(old).add(label));
    notify(label);
  };
  const collect = (id: number, title: string) => {
    if (foundItems.has(id)) return;
    audioSystem.current?.playReward();
    setFoundItems((old) => new Set(old).add(id));
    setXp((value) => value + 100);
    setAchievements((old) => new Set(old).add(`COLLECTED: ${title}`));
    notify(`NEW ITEM: ${title}`);
  };
  const spend = (amount: number) => {
    if (xp < amount) { notify("NOT ENOUGH XP. EXPLORE ANOTHER MEMORY."); return false; }
    setXp((value) => value - amount);
    notify(`HINT PURCHASED — ${amount} XP`);
    return true;
  };
  const game: GameState = { xp, achievements, secrets, foundItems, award, spend, playAttack: () => audioSystem.current?.playReward(), wrongAnswer: () => audioSystem.current?.playPenalty(), secret, collect };
  const recordCompletion = (level: Screen) => {
    if (completed.has(level)) return;
    setCompleted((old) => new Set(old).add(level));
    award(`${level === "lore" ? "FIGHT CLUB" : level.toUpperCase()} QUEST COMPLETE`, 300);
  };
  const complete = (level: Screen) => { recordCompletion(level); navigate("map"); };
  const navigate = (next: Screen) => {
    setIsMusicPanelOpen(false);
    setScreen(next);
    if (next !== "guide") {
      setGuidedLevel(null);
      setGuidePage(0);
    }
  };
  const openGameGuide = () => {
    setGuideKind("game");
    setGuidedLevel(null);
    setGuidePage(0);
    setIsMusicPanelOpen(false);
    setScreen("guide");
  };
  const selectLevel = (level: Screen) => {
    if (level === "timeline" || level === "lore" || level === "quiz") {
      setGuideKind(level);
      setGuidedLevel(level);
      setGuidePage(0);
      setIsMusicPanelOpen(false);
      setScreen("guide");
      return;
    }
    navigate(level);
  };
  const startGuidedLevel = () => {
    if (guidedLevel) {
      setIsMusicPanelOpen(false);
      setScreen(guidedLevel);
      return;
    }
    navigate("map");
  };
  const toggleAudio = () => {
    const enabled = !audio;
    setMusicEnabled(enabled);
  };
  const setMusicEnabled = (enabled: boolean) => {
    audioSystem.current?.setEnabled(enabled);
    setMusicPreference((current) => ({ ...current, enabled }));
  };
  const setMusicTrack = useCallback((track: "friendship" | "celestial") => {
    audioSystem.current?.setMusicTrack(track);
  }, []);
  const changeMusicVolume = (volume: number) => {
    const nextVolume = Math.max(0, Math.min(MAX_MUSIC_VOLUME, volume));
    audioSystem.current?.setMusicVolume(nextVolume);
    setMusicPreference((current) => ({ ...current, volume: nextVolume }));
  };
  const setMusicDucked = useCallback((ducked: boolean) => {
    audioSystem.current?.setMusicDucked(ducked);
    setLetterMode(ducked);
  }, []);
  const startHauntedReveal = useCallback(() => {
    if (!completed.has("adventure")) return;
    setGhostLevelUnlocked(true);
    setIsMusicPanelOpen(false);
    audioSystem.current?.setMusicTrack("celestial");
    setScreen("hauntedReveal");
  }, [completed]);
  const finishHauntedReveal = useCallback(() => {
    audioSystem.current?.setMusicTrack("friendship");
    navigate("map");
  }, []);
  const leaveFinalStory = useCallback(() => {
    finalStoryActive.current = false;
    setIsMusicPanelOpen(false);
    audioSystem.current?.setMusicTrack("friendship");
    setScreen("map");
  }, []);
  const finishFinalStory = useCallback(() => {
    if (!finalStoryActive.current) return;
    setFinalCompleted(true);
    setGhostLevelUnlocked(true);
    leaveFinalStory();
  }, [leaveFinalStory]);
  useEffect(() => {
    setIsMusicPanelOpen(false);
  }, [screen]);
  const shared = { audio, toggleAudio, game };
  const view = useMemo(() => {
    switch (screen) {
      case "start": return <StartScreen onStart={() => navigate("map")} {...shared} />;
      case "map": return <MapScreen selectLevel={selectLevel} onHelp={openGameGuide} completed={completed} finalCompleted={finalCompleted} ghostLevelUnlocked={ghostLevelUnlocked} {...shared} />;
      case "guide": return <InstructionScreen kind={guideKind} pageIndex={guidePage} onPageChange={setGuidePage} onStart={startGuidedLevel} onMap={() => navigate("map")} />;
      case "timeline": return <TimelineScreen onMap={() => navigate("map")} onComplete={() => complete("timeline")} startDirectly={guidedLevel === "timeline"} {...shared} />;
      case "lore": return <FriendshipFightClub onMap={() => navigate("map")} onBattleComplete={() => recordCompletion("lore")} startDirectly={guidedLevel === "lore"} {...shared} />;
      case "quiz": return <QuizScreen onMap={() => navigate("map")} onComplete={() => complete("quiz")} startDirectly={guidedLevel === "quiz"} {...shared} />;
      case "inventory": return <InventoryScreen onMap={() => navigate("map")} onComplete={() => complete("inventory")} {...shared} />;
      case "adventure": return <LevelFour onMap={() => navigate("map")} onLetterComplete={startHauntedReveal} onComplete={() => recordCompletion("adventure")} setMusicDucked={setMusicDucked} {...shared} />;
      case "haunted": return <HauntedForestScreen onMap={() => navigate("map")} onMusicTrack={setMusicTrack} musicVolume={musicVolume} {...shared} />;
      case "hauntedReveal": return <HauntedUnlockReveal onComplete={finishHauntedReveal} />;
      case "ending": return <EndingScreen onMap={() => finalStoryActive.current ? leaveFinalStory() : navigate("map")} onFinalComplete={finalStoryActive.current ? finishFinalStory : undefined} setMusicDucked={setMusicDucked} {...shared} />;
      case "finalStory": return <CelestialRealm onComplete={() => navigate("ending")} onMap={leaveFinalStory} isMusicPanelOpen={isMusicPanelOpen} onToggleMusicPanel={() => setIsMusicPanelOpen((open) => !open)} />;
    }
  }, [screen, guideKind, guidePage, guidedLevel, audio, musicVolume, isMusicPanelOpen, completed, finalCompleted, ghostLevelUnlocked, xp, achievements, secrets, foundItems, setMusicDucked, setMusicTrack, leaveFinalStory, finishFinalStory, startHauntedReveal, finishHauntedReveal]);
  const musicPanelContext = useMemo(() => ({
    isOpen: isMusicPanelOpen,
    toggle: () => setIsMusicPanelOpen((open) => !open),
  }), [isMusicPanelOpen]);
  return <MusicPanelContext.Provider value={musicPanelContext}>
    <div className="game-viewport" inert={isPortrait && !portraitInstructionsAvailable} aria-hidden={isPortrait && !portraitInstructionsAvailable}>{view}</div>
    <div className={`orientation-overlay ${isPortrait && !portraitInstructionsAvailable ? "active" : ""}`} role="status" aria-live="polite">
      <div className="orientation-card">
        <span className="orientation-icon" aria-hidden="true"><i /></span>
        <h1>ROTATE YOUR DEVICE</h1>
        <p>Please turn your device horizontally to enter the game.</p>
      </div>
    </div>
    {isMusicPanelOpen && <MusicControl enabled={audio} status={musicStatus} volume={musicVolume} onToggle={toggleAudio} onVolumeChange={changeMusicVolume} />}
    <AchievementToast toast={toast} />
  </MusicPanelContext.Provider>;
}
