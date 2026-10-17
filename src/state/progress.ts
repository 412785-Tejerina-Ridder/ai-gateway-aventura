export const MODULE_IDS = [
    "tutor",
    "evaluator",
    "rag",
    "moderation",
    "agent",
    "generator",
    "calibration",
] as const;
/** Chapter 03 (index 2) asks for three different failover scenarios. */
export const FAILOVER_CHAPTER = 2;
export const FAILOVER_SCENARIOS = ["a", "b", "c", "none", "invalid", "timeout"] as const;
export const FAILOVER_REQUIRED = 3;
const isFailoverScenario = (key: string) =>
    (FAILOVER_SCENARIOS as readonly string[]).includes(key);
export interface CelebrationTicket {
    readonly chapter: number;
    readonly id: number;
}
export type ChapterPhase = "pending" | "celebrating" | "completed";
export class AdventureProgress {
    finished = new Set<number>();
    stamps = new Set<string>();
    private pendingStar: CelebrationTicket | null = null;
    private sequence = 0;
    constructor(saved: unknown = {}) {
        const value = saved && typeof saved === "object"
            ? (saved as Record<string, unknown>)
            : {};
        if (Array.isArray(value.finished))
            for (const n of value.finished)
                if (Number.isInteger(n) && n >= 0 && n < 10)
                    this.finished.add(n);
        if (Array.isArray(value.stamps))
            for (const s of value.stamps)
                if (typeof s === "string")
                    this.stamps.add(s);
        // Recover evidence saved by earlier versions without counting arbitrary
        // keys or requiring the visitor to answer obsolete questions again.
        for (const id of MODULE_IDS)
            if (this.stamps.has(`4:module-${id}`))
                this.stamps.add(`module-${id}`);
        for (let i = 0; i < 10; i++)
            if (i !== 4 && [...this.stamps].some((s) => s.startsWith(`${i}:`)))
                this.finished.add(i);
        if (this.modulesComplete)
            this.finished.add(4);
    }
    get modulesComplete() {
        return MODULE_IDS.every((id) => this.stamps.has(`module-${id}`));
    }
    /** Scenarios that reached a terminal state at least once (durable, deduplicated). */
    get failoverExplored(): string[] {
        return FAILOVER_SCENARIOS.filter((id) => this.stamps.has(`failover-${id}`));
    }
    /**
     * Records evidence that does not complete a chapter by itself. Only the
     * failover scenarios use it; it returns true the first time a scenario counts.
     */
    explore(chapter: number, key: string) {
        if (chapter !== FAILOVER_CHAPTER || !isFailoverScenario(key))
            return false;
        const stamp = `failover-${key}`;
        if (this.stamps.has(stamp))
            return false;
        this.stamps.add(stamp);
        return true;
    }
    complete(chapter: number, key = "done") {
        if (!Number.isInteger(chapter) || chapter < 0 || chapter > 9)
            return false;
        const wasComplete = this.finished.has(chapter);
        // A single run cannot complete the failover lab: three different
        // scenarios must have been explored first. Without them nothing is stamped,
        // so a reload cannot turn a partial attempt into a star either.
        if (chapter === FAILOVER_CHAPTER && !wasComplete &&
            this.failoverExplored.length < FAILOVER_REQUIRED)
            return false;
        this.stamps.add(`${chapter}:${key}`);
        if (chapter === 4) {
            if (MODULE_IDS.some((id) => key === `module-${id}`))
                this.stamps.add(key);
            if (this.modulesComplete)
                this.finished.add(chapter);
        }
        else
            this.finished.add(chapter);
        const fresh = !wasComplete && this.finished.has(chapter);
        if (fresh)
            this.pendingStar = { chapter, id: ++this.sequence };
        return fresh;
    }
    get celebration(): CelebrationTicket | null { return this.pendingStar; }
    phase(chapter: number): ChapterPhase {
        if (!this.finished.has(chapter))
            return "pending";
        return this.pendingStar?.chapter === chapter ? "celebrating" : "completed";
    }
    acknowledge(ticket: CelebrationTicket): boolean {
        if (this.pendingStar?.id !== ticket.id || this.pendingStar.chapter !== ticket.chapter)
            return false;
        this.pendingStar = null;
        return true;
    }
    leaveChapter() {
        // Completion is already durable. Navigation only ends its visual presentation.
        this.pendingStar = null;
    }
    get missing() {
        return Array.from({ length: 10 }, (_, i) => i).filter((i) => !this.finished.has(i));
    }
    reset() {
        this.finished.clear();
        this.stamps.clear();
        this.pendingStar = null;
        this.sequence++;
    }
    serialize() {
        return { finished: [...this.finished], stamps: [...this.stamps] };
    }
}
