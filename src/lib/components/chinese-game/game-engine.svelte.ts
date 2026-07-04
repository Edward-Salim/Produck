export interface SentenceData {
  hanzi: string;
  pinyin: string;
  translation: string;
  level: number;
}

export type GameState = 'menu' | 'playing' | 'gameover';
export type MenuScreen = 'main' | 'mode' | 'difficulty' | 'readingDifficulty' | 'options';
export type Feedback = 'correct' | 'wrong' | null;

export const STORAGE_KEY = 'hanzi-game-save';
const SETTINGS_KEY = 'hanzi-game-settings';
const READING_SUCCESS_KEY = 'chinese-reading-success-counts';

type SavedGameData = ReturnType<GameEngine['buildGameData']>;

// ── Sound callbacks ──
export interface EngineCallbacks {
  onCorrect?: () => void;
  onWrong?: () => void;
  onGameOver?: () => void;
  onHealthGain?: () => void;
  onStroke?: () => void;
  onClick?: () => void;
  onMusicToggle?: (enabled: boolean) => void;
  getAudioCtx?: () => AudioContext | undefined;
  setAudioCtx?: (ctx: AudioContext) => void;
}

const PUNCT_RE = /[，。？、！；：]/;

export function isPunct(c: string) {
  return PUNCT_RE.test(c);
}

export const levelColorConfig = [
  {
    base: 'border-cork-300/40 bg-cork-100/50 text-cork-600',
    active: 'border-red-400 bg-red-300 text-red-950 shadow-sm',
    mastered: 'border-yellow-400 bg-yellow-200/80 text-yellow-900 shadow-sm shadow-yellow-300/40'
  },
  {
    base: 'border-cork-300/40 bg-cork-100/50 text-cork-600',
    active: 'border-emerald-400 bg-emerald-300 text-emerald-950 shadow-sm',
    mastered: 'border-yellow-400 bg-yellow-200/80 text-yellow-900 shadow-sm shadow-yellow-300/40'
  },
  {
    base: 'border-cork-300/40 bg-cork-100/50 text-cork-600',
    active: 'border-sky-400 bg-sky-300 text-sky-950 shadow-sm',
    mastered: 'border-yellow-400 bg-yellow-200/80 text-yellow-900 shadow-sm shadow-yellow-300/40'
  },
  {
    base: 'border-cork-300/40 bg-cork-100/50 text-cork-600',
    active: 'border-violet-400 bg-violet-300 text-violet-950 shadow-sm',
    mastered: 'border-yellow-400 bg-yellow-200/80 text-yellow-900 shadow-sm shadow-yellow-300/40'
  },
  {
    base: 'border-cork-300/40 bg-cork-100/50 text-cork-600',
    active: 'border-rose-400 bg-rose-300 text-rose-950 shadow-sm',
    mastered: 'border-yellow-400 bg-yellow-200/80 text-yellow-900 shadow-sm shadow-yellow-300/40'
  },
  {
    base: 'border-cork-300/40 bg-cork-100/50 text-cork-600',
    active: 'border-teal-400 bg-teal-300 text-teal-950 shadow-sm',
    mastered: 'border-yellow-400 bg-yellow-200/80 text-yellow-900 shadow-sm shadow-yellow-300/40'
  },
  {
    base: 'border-cork-300/40 bg-cork-100/50 text-cork-600',
    active: 'border-orange-400 bg-orange-300 text-orange-950 shadow-sm',
    mastered: 'border-yellow-400 bg-yellow-200/80 text-yellow-900 shadow-sm shadow-yellow-300/40'
  }
];

export class GameEngine {
  // ── Data refs ──
  sentences: SentenceData[] = [];
  levelNames: Record<string, string> = {};

  // ── Callbacks ──
  private cb: EngineCallbacks = {};

  // ── Settings ──
  musicEnabled = $state(true);
  soundsEnabled = $state(true);
  hintAlwaysOn = $state(false);
  hintsUsed = $state(0);
  masteredHanzi: Record<number, string[]> = $state({});

  // ── Menu state ──
  menuScreen = $state<MenuScreen>('main');
  selectedLevels = $state<Set<number>>(new Set());
  selectedReadingLevel = $state(1);
  readingSuccessCounts: Record<number, number> = $state({});

  // ── Game state ──
  gameState = $state<GameState>('menu');
  currentSentence = $state<SentenceData | null>(null);
  currentLevel = $state(0);
  userChars = $state<string[]>([]);
  hintedSlots = $state<Set<number>>(new Set());
  hintUsedThisSentence = $state(false);
  advancing = $state(false);
  health = $state(3);
  unlockedHealth = $state(3);
  justGainedHealth = $state(false);
  streak = $state(0);
  bestStreak = $state(0);
  totalCorrect = $state(0);
  totalAttempts = $state(0);
  feedback = $state<Feedback>(null);
  revealedHanzi = $state('');
  revealedPinyin = $state('');
  poolIndex = $state(0);
  shuffled = $state<SentenceData[]>([]);

  // ── Persistence ──
  restored = $state(false);
  highscore = $state<{ score: number; name: string }>({ score: 0, name: '' });
  leaderboard = $state<{ name: string; score: number }[]>([]);

  // ── Anti-repetition ──
  private recentHanzi: string[] = [];

  // ── Derived ──
  get maxHealth() {
    return 3;
  }
  get absoluteMaxHealth() {
    return 5;
  }
  get bonusHearts() {
    return Math.max(0, this.health - 3);
  }
  get accuracy() {
    return this.totalAttempts > 0 ? Math.round((this.totalCorrect / this.totalAttempts) * 100) : 0;
  }
  get sentenceCount() {
    return this.sentences.length;
  }
  get levelSentenceCounts(): Record<number, number> {
    return Object.fromEntries(
      Object.keys(this.levelNames).map((k) => {
        const lv = Number(k);
        return [lv, this.sentences.filter((s: SentenceData) => s.level === lv).length];
      })
    );
  }
  get heat(): string {
    if (this.streak >= 21) return 'inferno';
    if (this.streak >= 14) return 'blaze';
    if (this.streak >= 8) return 'fire';
    if (this.streak >= 5) return 'hot';
    if (this.streak >= 3) return 'warm';
    return '';
  }

  isLevelMastered(level: number): boolean {
    const mastered = this.masteredHanzi[level] ?? [];
    const total = this.sentences.filter((s) => s.level === level).length;
    return total > 0 && mastered.length >= total;
  }

  // ── Initialization ──
  init(sentences: SentenceData[], levelNames: Record<string, string>, callbacks?: EngineCallbacks) {
    this.sentences = sentences;
    this.levelNames = levelNames;
    this.loadReadingSuccessCounts();
    if (callbacks) this.cb = callbacks;
  }

  setCallbacks(cb: EngineCallbacks) {
    this.cb = { ...this.cb, ...cb };
  }

  // ── Settings ──
  async loadSettings() {
    try {
      const res = await fetch('/api/preferences');
      if (res.ok) {
        const p = await res.json();
        this.musicEnabled = p.music ?? true;
        this.soundsEnabled = p.sounds ?? true;
        this.hintAlwaysOn = p.hintAlwaysOn ?? false;
        if (p.highscore != null && (p.highscore as number) > this.highscore.score) {
          this.highscore = {
            score: p.highscore as number,
            name: (p.highscoreName as string) ?? 'Edward'
          };
        }
        if (Array.isArray(p.selectedLevels)) {
          this.selectedLevels = new Set(p.selectedLevels);
        }
        if (p.masteredHanzi != null && typeof p.masteredHanzi === 'object') {
          this.masteredHanzi = p.masteredHanzi as Record<number, string[]>;
        }
        if (p.readingSuccessCounts != null && typeof p.readingSuccessCounts === 'object') {
          this.readingSuccessCounts = p.readingSuccessCounts as Record<number, number>;
          localStorage.setItem(READING_SUCCESS_KEY, JSON.stringify(this.readingSuccessCounts));
        }
        return p;
      }
    } catch {}
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        this.musicEnabled = s.music ?? true;
        this.soundsEnabled = s.sounds ?? true;
        this.hintAlwaysOn = s.hintAlwaysOn ?? false;
        if (Array.isArray(s.selectedLevels)) {
          this.selectedLevels = new Set(s.selectedLevels);
        }
        if (s.masteredHanzi != null && typeof s.masteredHanzi === 'object') {
          this.masteredHanzi = s.masteredHanzi as Record<number, string[]>;
        }
        if (s.readingSuccessCounts != null && typeof s.readingSuccessCounts === 'object') {
          this.readingSuccessCounts = s.readingSuccessCounts as Record<number, number>;
        }
      }
    } catch {}
    return null;
  }

  async saveSettings() {
    try {
      await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          music: this.musicEnabled,
          sounds: this.soundsEnabled,
          hintAlwaysOn: this.hintAlwaysOn,
          selectedLevels: [...this.selectedLevels],
          masteredHanzi: this.masteredHanzi,
          readingSuccessCounts: this.readingSuccessCounts
        })
      });
    } catch {}
    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({
          music: this.musicEnabled,
          sounds: this.soundsEnabled,
          hintAlwaysOn: this.hintAlwaysOn,
          selectedLevels: [...this.selectedLevels],
          masteredHanzi: this.masteredHanzi,
          readingSuccessCounts: this.readingSuccessCounts
        })
      );
    } catch {}
  }

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    this.cb.onClick?.();
    this.cb.onMusicToggle?.(this.musicEnabled);
    this.saveSettings();
  }

  toggleSounds() {
    this.soundsEnabled = !this.soundsEnabled;
    this.cb.onClick?.();
    this.saveSettings();
  }

  toggleHintAlwaysOn() {
    this.hintAlwaysOn = !this.hintAlwaysOn;
    this.cb.onClick?.();
    this.saveSettings();
  }

  // ── Menu actions ──
  loadReadingSuccessCounts() {
    try {
      const raw = localStorage.getItem(READING_SUCCESS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed != null && typeof parsed === 'object') {
        this.readingSuccessCounts = parsed as Record<number, number>;
      }
    } catch {}
  }

  openMode() {
    this.menuScreen = 'mode';
    this.cb.onClick?.();
  }

  openDifficulty() {
    this.menuScreen = 'difficulty';
    this.cb.onClick?.();
  }

  openReadingDifficulty() {
    this.loadReadingSuccessCounts();
    this.menuScreen = 'readingDifficulty';
    this.cb.onClick?.();
  }

  selectReadingLevel(level: number) {
    if (level > 7) return;
    this.selectedReadingLevel = level;
    this.cb.onClick?.();
  }

  toggleLevel(level: number) {
    if (level > 7) return;
    this.cb.onClick?.();
    const next = new Set(this.selectedLevels);
    if (next.has(level)) {
      next.delete(level);
    } else {
      next.add(level);
    }
    this.selectedLevels = next;
    this.saveSettings();
  }

  openOptions() {
    this.menuScreen = 'options';
    this.cb.onClick?.();
  }

  backToMain() {
    this.menuScreen = 'main';
    this.cb.onClick?.();
  }

  goToMenu() {
    this.clearState();
    this.cb.onClick?.();
    this.gameState = 'menu';
    this.menuScreen = 'main';
    this.currentSentence = null;
  }

  // ── Game actions ──
  beginGame() {
    this.cb.onClick?.();
    const filtered = this.sentences.filter((s: SentenceData) => this.selectedLevels.has(s.level));
    if (filtered.length === 0) return;

    // Exclude already-mastered sentences so the player practices what they need
    const masteredSet = new Set(Object.values(this.masteredHanzi).flat());
    const fresh = filtered.filter((s) => !masteredSet.has(s.hanzi));

    // If everything is mastered, include all again (full reset)
    const pool = fresh.length > 0 ? fresh : filtered;

    // Fisher-Yates shuffle
    const shuffledSentences = [...pool];
    for (let i = shuffledSentences.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledSentences[i], shuffledSentences[j]] = [shuffledSentences[j], shuffledSentences[i]];
    }

    this.clearState();
    this.shuffled = shuffledSentences;
    this.poolIndex = 0;
    this.health = 3;
    this.unlockedHealth = 3;
    // Dev: ?streak=N in URL to preview fire levels
    const params = new URLSearchParams(window.location.search);
    this.streak = Number(params.get('streak') ?? 0);
    this.bestStreak = Math.max(this.bestStreak, this.streak);
    this.totalCorrect = this.streak;
    this.totalAttempts = this.streak;
    this.hintedSlots = new Set();
    this.feedback = null;
    this.revealedHanzi = '';
    this.revealedPinyin = '';
    this.gameState = 'playing';

    this.showNextSentence();
  }

  checkAnswer() {
    if (!this.currentSentence) return;

    const answer = this.userChars.join('').replace(PUNCT_RE, '');
    const cleanHanzi = this.currentSentence.hanzi.replace(PUNCT_RE, '');
    const isCorrect = answer === cleanHanzi;

    this.totalAttempts++;

    if (isCorrect) {
      this.streak++;
      if (this.streak > this.bestStreak) this.bestStreak = this.streak;
      this.totalCorrect += this.currentSentence?.level ?? 1;

      // Track mastered sentences per level
      const lv = this.currentSentence?.level ?? 0;
      if (lv > 0) {
        const hanzi = this.currentSentence!.hanzi;
        const mastered = this.masteredHanzi[lv] ?? [];
        if (!mastered.includes(hanzi)) {
          this.masteredHanzi[lv] = [...mastered, hanzi];
          this.saveSettings();
        }
      }

      if (this.health < this.absoluteMaxHealth && Math.random() < 0.2) {
        this.health++;
        if (this.health > this.unlockedHealth) this.unlockedHealth = this.health;
        this.justGainedHealth = true;
        this.cb.onHealthGain?.();
      }

      this.feedback = 'correct';
      this.advancing = true;
      this.cb.onCorrect?.();
      this.pushBackCurrent();
      this.saveState();
    } else {
      this.health--;
      this.streak = 0;
      this.feedback = 'wrong';
      this.cb.onWrong?.();
      this.revealedHanzi = this.currentSentence.hanzi;
      this.revealedPinyin = this.currentSentence.pinyin;
      this.pushBackWrong();
      this.saveState();
    }
  }

  skipSentence() {
    if (!this.currentSentence) return;

    this.revealedHanzi = this.currentSentence.hanzi;
    this.revealedPinyin = this.currentSentence.pinyin;
    this.health--;
    this.streak = 0;
    this.totalAttempts++;
    this.feedback = 'wrong';
    this.cb.onWrong?.();
    this.pushBackWrong();
    this.saveState();
  }

  async nextAfterWrong() {
    if (this.advancing) return;
    if (this.health <= 0) {
      await this.updateHighscore(this.totalCorrect);
      this.cb.onGameOver?.();
      this.clearState();
      this.gameState = 'gameover';
    } else {
      this.showNextSentence();
    }
  }

  useHint(): boolean {
    if (!this.currentSentence || this.feedback !== null || this.hintUsedThisSentence) return false;
    const chars = [...this.currentSentence.hanzi];

    const candidates: number[] = [];
    for (let i = 0; i < chars.length; i++) {
      if (!isPunct(chars[i]) && !this.hintedSlots.has(i)) {
        candidates.push(i);
      }
    }
    if (candidates.length === 0) return false;

    const shuffled = [...candidates];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const revealCount = Math.max(1, Math.min(4, Math.ceil(candidates.length * 0.25)));
    const revealed = shuffled.slice(0, Math.min(revealCount, shuffled.length));
    for (const idx of revealed) {
      this.userChars[idx] = chars[idx];
    }
    this.hintedSlots = new Set([...this.hintedSlots, ...revealed]);
    this.hintUsedThisSentence = true;
    this.hintsUsed += revealed.length;
    this.cb.onStroke?.();
    return true;
  }

  // ── Input helpers ──
  nextEditableSlot(fromIndex: number): number {
    if (!this.currentSentence) return fromIndex;
    const chars = [...this.currentSentence.hanzi];
    for (let j = fromIndex + 1; j < chars.length; j++) {
      if (!isPunct(chars[j]) && !this.hintedSlots.has(j)) return j;
    }
    return fromIndex;
  }

  prevEditableSlot(fromIndex: number): number {
    if (!this.currentSentence) return fromIndex;
    const chars = [...this.currentSentence.hanzi];
    for (let j = fromIndex - 1; j >= 0; j--) {
      if (!isPunct(chars[j]) && !this.hintedSlots.has(j)) return j;
    }
    return fromIndex;
  }

  spreadChars(fromIndex: number, chars: string[]): { nextSlot: number; wroteChars: boolean } {
    let slot = fromIndex;
    for (const ch of chars) {
      while (slot < this.userChars.length && isPunct([...this.currentSentence!.hanzi][slot])) {
        slot++;
      }
      if (slot >= this.userChars.length) break;
      if (this.hintedSlots.has(slot) && this.userChars[slot] === ch) {
        slot++;
        continue;
      }
      while (slot < this.userChars.length && this.hintedSlots.has(slot)) {
        slot++;
      }
      if (slot >= this.userChars.length) break;
      this.userChars[slot] = ch;
      slot++;
    }
    const next = this.nextEditableSlot(slot - 1);
    return {
      nextSlot: next > fromIndex || this.userChars[next] ? next : fromIndex,
      wroteChars: true
    };
  }

  // ── Persistence ──
  buildGameData() {
    return {
      gameState: this.gameState,
      poolIndex: this.poolIndex,
      health: this.health,
      unlockedHealth: this.unlockedHealth,
      totalCorrect: this.totalCorrect,
      totalAttempts: this.totalAttempts,
      bestStreak: this.bestStreak,
      streak: this.streak,
      currentLevel: this.currentLevel,
      selectedLevels: [...this.selectedLevels],
      shuffledHanzi: this.shuffled.map((s) => s.hanzi),
      feedback: this.feedback,
      revealedHanzi: this.revealedHanzi,
      revealedPinyin: this.revealedPinyin,
      hintedSlots: [...this.hintedSlots],
      hintUsedThisSentence: this.hintUsedThisSentence
    };
  }

  saveState() {
    if (this.gameState === 'menu') return;
    const data = this.buildGameData();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
    this.syncGameToServer();
  }

  private syncTimer: ReturnType<typeof setTimeout> | undefined;
  private syncGameToServer() {
    clearTimeout(this.syncTimer);
    this.syncTimer = setTimeout(async () => {
      try {
        await fetch('/api/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameState: this.buildGameData() })
        });
      } catch {}
    }, 500);
  }

  loadState(): SavedGameData | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  clearState() {
    this.recentHanzi = [];
    localStorage.removeItem(STORAGE_KEY);
    fetch('/api/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameState: null })
    }).catch(() => {});
  }

  restoreGameData(data: SavedGameData): boolean {
    // Rebuild shuffled array in the exact saved order (preserving swaps)
    const byHanzi = new Map(this.sentences.map((s: SentenceData) => [s.hanzi, s]));
    const savedShuffled = data.shuffledHanzi
      .map((h) => byHanzi.get(h))
      .filter(Boolean) as SentenceData[];
    if (savedShuffled.length === 0) return false;

    this.shuffled = savedShuffled;
    this.poolIndex = data.poolIndex;
    this.health = data.health;
    this.unlockedHealth = Math.max(3, data.unlockedHealth ?? data.health ?? 3);
    this.totalCorrect = data.totalCorrect;
    this.totalAttempts = data.totalAttempts;
    this.bestStreak = data.bestStreak;
    this.streak = data.streak;
    this.currentLevel = data.currentLevel;
    this.selectedLevels = new Set(data.selectedLevels);
    this.gameState = data.gameState;

    const idx = (data.poolIndex - 1 + savedShuffled.length) % savedShuffled.length;
    this.currentSentence = savedShuffled[idx];

    this.hintedSlots = new Set(data.hintedSlots ?? []);
    this.hintUsedThisSentence = data.hintUsedThisSentence ?? false;

    if (data.feedback === 'wrong') {
      this.feedback = 'wrong';
      this.revealedHanzi = data.revealedHanzi || this.currentSentence.hanzi;
      this.revealedPinyin = data.revealedPinyin || this.currentSentence.pinyin;
      this.userChars = [...this.currentSentence.hanzi].map((c) => (isPunct(c) ? c : ''));
    } else {
      this.feedback = null;
      this.revealedHanzi = '';
      this.revealedPinyin = '';
      this.userChars = [...this.currentSentence.hanzi].map((c) => (isPunct(c) ? c : ''));
    }

    for (const i of this.hintedSlots) {
      this.userChars[i] = [...this.currentSentence.hanzi][i];
    }

    return true;
  }

  async fetchLeaderboard() {
    try {
      const res = await fetch('/api/hanzi-leaderboard');
      if (res.ok) this.leaderboard = await res.json();
    } catch {}
  }

  async updateHighscore(score: number) {
    if (score >= this.highscore.score) {
      this.highscore = { score, name: 'Edward' };
      try {
        await fetch('/api/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ highscore: score, highscoreName: 'Edward' })
        });
        await this.fetchLeaderboard();
      } catch {}
    }
  }

  // ── Public helpers ──
  triggerStroke() {
    this.cb.onStroke?.();
  }

  // ── Game logic (internal but exposed for component use) ──
  showNextSentence() {
    if (this.poolIndex >= this.shuffled.length) {
      // Cycle complete — rebuild pool with recent sentences pushed to the end
      const recentSet = new Set(this.recentHanzi);
      const recentItems: SentenceData[] = [];
      const otherItems: SentenceData[] = [];
      for (const s of this.shuffled) {
        if (recentSet.has(s.hanzi)) recentItems.push(s);
        else otherItems.push(s);
      }
      // Fisher-Yates shuffle each group
      const shuffle = (arr: SentenceData[]) => {
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
      };
      shuffle(otherItems);
      shuffle(recentItems);
      this.shuffled = [...otherItems, ...recentItems];
      this.poolIndex = 0;
      this.recentHanzi = [];
    }
    const s = this.shuffled[this.poolIndex];
    this.poolIndex++;

    // Track in recent window (25% of pool, min 3)
    const maxRecent = Math.max(3, Math.ceil(this.shuffled.length * 0.25));
    this.recentHanzi.push(s.hanzi);
    if (this.recentHanzi.length > maxRecent) {
      this.recentHanzi.shift();
    }

    this.currentSentence = s;
    this.currentLevel = s.level;
    this.userChars = [...s.hanzi].map((c) => (isPunct(c) ? c : ''));
    this.hintedSlots = new Set();
    this.hintUsedThisSentence = false;
    this.advancing = false;
    this.feedback = null;
    this.revealedHanzi = '';
    this.revealedPinyin = '';
    this.justGainedHealth = false;

    this.saveState();
  }

  private swapAhead(minPct: number) {
    const idx = (this.poolIndex - 1 + this.shuffled.length) % this.shuffled.length;
    if (this.shuffled.length <= 2) return;
    const minOffset = Math.floor(this.shuffled.length * minPct);
    const maxOffset = this.shuffled.length - 2;
    if (minOffset >= maxOffset) return;
    const offset = minOffset + Math.floor(Math.random() * (maxOffset - minOffset));
    const targetIdx = (this.poolIndex + offset) % this.shuffled.length;
    const tmp = this.shuffled[idx];
    this.shuffled[idx] = this.shuffled[targetIdx];
    this.shuffled[targetIdx] = tmp;
  }

  private pushBackCurrent() {
    this.swapAhead(0.8);
  }

  private pushBackWrong() {
    this.swapAhead(0.4);
  }
}
