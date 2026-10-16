import { character } from '../characters/characters';
import { confetti } from '../animations/effects';
import { gameAudio } from '../audio/engine';
import type { AdventureProgress, CelebrationTicket } from '../state/progress';
export class Celebrations {
    private chapter: HTMLDialogElement;
    private final: HTMLDialogElement;
    private active?: {
        ticket: CelebrationTicket;
        dialog: HTMLDialogElement;
        generation: number;
    };
    private generation = 0;
    private dismissing = false;
    private flight?: Animation;
    private flyer?: HTMLElement;
    constructor(private actions: {
        landed: (ticket: CelebrationTicket) => void;
        restart: () => void;
        goTo: (index: number) => void;
    }) {
        document.querySelector('#app')!.insertAdjacentHTML('beforeend', `<dialog class="celebration-dialog chapter-celebration" id="chapter-celebration" aria-labelledby="completed-title"><button class="dialog-close" data-celebrate-confirm aria-label="Guardar estrella y cerrar celebración">×</button><div class="completion-star" aria-hidden="true">★<i>✦</i><i>✧</i><i>✦</i></div><span class="eyebrow" id="completed-number"></span><h2 id="completed-title">¡Capítulo completado!</h2><p id="completed-name"></p><button class="btn btn-primary" data-celebrate-confirm>Guardar mi estrella ★</button></dialog><dialog class="celebration-dialog final-celebration" id="adventure-finale" aria-labelledby="adventure-finale-title"><button class="dialog-close" data-finale-close aria-label="Cerrar festejo">×</button><div class="completion-star" aria-hidden="true">★<i>✦</i><i>✧</i><i>✦</i></div><span class="eyebrow">MISIÓN GATI · AVENTURA COMPLETADA</span><h2 id="adventure-finale-title">¡Ya sos parte de la central!</h2><div class="cast">${(["tutor", "evaluator", "rag", "gati", "moderation", "agent", "generator", "calibration"] as const).map((id) => character(id)).join("")}</div><p class="final-message">Cada módulo tiene su especialidad.<br>Gati ayuda a que pedirle ayuda a una IA no sea un problema nuevo para cada uno.</p><p id="final-progress" role="status"></p><button class="text-button" id="visit-missing" hidden></button><div class="final-actions"><button class="btn btn-primary" id="restart-adventure">Volver a empezar ↻</button><button class="btn btn-secondary" data-finale-close>Quedarme a explorar</button></div><button class="text-button" id="celebration-audio">♫ Activar música y festejos</button><p class="audio-hint">♫ Música y festejos originales. Se escuchan si activaste el sonido.</p></dialog>`);
        this.chapter = document.querySelector('#chapter-celebration')!;
        this.final = document.querySelector('#adventure-finale')!;
        this.chapter.querySelectorAll('[data-celebrate-confirm]').forEach(b => b.addEventListener('click', () => void this.dismiss(this.chapter)));
        this.final.querySelectorAll('[data-finale-close]').forEach(b => b.addEventListener('click', () => void this.dismiss(this.final)));
        for (const dialog of [this.chapter, this.final])
            dialog.addEventListener('cancel', event => { event.preventDefault(); void this.dismiss(dialog); });
        this.final.querySelector('#restart-adventure')!.addEventListener('click', () => { this.close(); this.actions.restart(); });
        this.final.querySelector('#celebration-audio')!.addEventListener('click', async (event) => {
            const button = event.currentTarget as HTMLButtonElement;
            button.disabled = true;
            if (!gameAudio.enabled)
                await gameAudio.toggle();
            if (gameAudio.enabled)
                gameAudio.celebrate();
            button.textContent = gameAudio.enabled ? '♫ Repetir el festejo' : 'No se pudo activar el audio';
            button.disabled = false;
            document.dispatchEvent(new Event('gati-audio-change'));
        });
    }
    showChapter(index: number, title: string, ticket: CelebrationTicket) {
        this.close();
        this.active = { ticket, dialog: this.chapter, generation: this.generation };
        this.chapter.querySelector('#completed-number')!.textContent = `CAPÍTULO ${String(index + 1).padStart(2, '0')}`;
        this.chapter.querySelector('#completed-name')!.textContent = title;
        this.chapter.showModal();
        gameAudio.tone();
    }
    private async dismiss(dialog: HTMLDialogElement) {
        const active = this.active;
        if (!active || active.dialog !== dialog) {
            dialog.close();
            return;
        }
        if (this.dismissing)
            return;
        this.dismissing = true;
        const star = dialog.querySelector<HTMLElement>('.completion-star')!;
        const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
        // Synchronize with actual animation completion, never a guessed timeout.
        if (!reduced)
            await Promise.all(star.getAnimations().filter(a => a.effect?.getTiming().iterations !== Infinity).map(a => a.finished.catch(() => { })));
        if (this.active !== active || this.generation !== active.generation)
            return;
        const from = star.getBoundingClientRect(), to = document.querySelector('#mission-star')!.getBoundingClientRect();
        dialog.close();
        if (!reduced && from.width) {
            const flyer = this.flyer = document.createElement('div');
            flyer.className = 'star-flight';
            flyer.textContent = '★';
            flyer.setAttribute('aria-hidden', 'true');
            flyer.style.cssText = `left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px;font-size:${getComputedStyle(star).fontSize}`;
            document.body.append(flyer);
            const dx = to.left + to.width / 2 - from.left - from.width / 2, dy = to.top + to.height / 2 - from.top - from.height / 2, scale = to.width / from.width;
            this.flight = flyer.animate([{ transform: 'translate(0,0) scale(1)' }, { transform: `translate(${dx * .35}px,${dy * .45}px) scale(.6)`, offset: .5 }, { transform: `translate(${dx}px,${dy}px) scale(${scale})` }], { duration: 650, easing: 'cubic-bezier(.3,.1,.4,1)', fill: 'forwards' });
            try {
                await this.flight.finished;
            }
            catch {
                return;
            }
        }
        if (this.active !== active || this.generation !== active.generation)
            return;
        this.flyer?.remove();
        this.flyer = undefined;
        this.flight = undefined;
        this.active = undefined;
        this.dismissing = false;
        this.actions.landed(active.ticket);
        if (!reduced)
            document.querySelector('#mission-star')?.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.5)' }, { transform: 'scale(1)' }], { duration: 400 });
        document.querySelector<HTMLElement>('#next')?.focus({ preventScroll: true });
    }
    showFinal(progress: AdventureProgress, labels: string[], ticket?: CelebrationTicket) {
        this.close();
        if (ticket)
            this.active = { ticket, dialog: this.final, generation: this.generation };
        const missing = progress.missing;
        this.final.querySelector('#final-progress')!.textContent = missing.length ? `${progress.finished.size}/10 capítulos recorridos. También podés volver a las visitas que te faltan.` : '★ 10/10 capítulos completados. ¡Pasaporte completo!';
        const link = this.final.querySelector<HTMLButtonElement>('#visit-missing')!;
        link.hidden = !missing.length;
        link.textContent = missing.length ? `Visitar lo que falta: ${labels[missing[0]]} →` : '';
        link.onclick = () => { this.close(); this.actions.goTo(missing[0]); };
        this.final.querySelector('#celebration-audio')!.textContent = gameAudio.enabled ? '♫ Repetir el festejo' : '♫ Activar música y festejos';
        this.final.querySelector('.eyebrow')!.textContent = missing.length ? 'MISIÓN FINAL RESUELTA' : 'MISIÓN GATI · AVENTURA COMPLETADA';
        this.final.showModal();
        gameAudio.celebrate();
        confetti();
    }
    close() {
        this.generation++;
        this.active = undefined;
        this.dismissing = false;
        this.flight?.cancel();
        this.flight = undefined;
        this.flyer?.remove();
        this.flyer = undefined;
        this.chapter.close();
        this.final.close();
    }
}
