import type { Chapter } from '../types';
const coreSelectors = ['.welcome-layout', '.delegation-board', '.failover-board', '.breaker-board', '.module-exploration', '.config-board', '.economy-board', '.notebook-layout', '.duplicate-board', '.finale-board'];
const guideSelectors: Record<number, string> = { 1: '.delegation-story', 3: '.breaker-instruction', 5: '#config-explanation', 6: '#economy-explanation', 7: '#notebook-explanation', 8: '#duplicate-guide' };
/** One continuous chapter: introduction, guided scroll, original interactive nodes. */
export function createStage(root: HTMLElement, index: number, chapter: Chapter) {
    let cancelGuidance = () => { };
    const intro = root.querySelector<HTMLElement>('.chapter-intro');
    const sourceGroup = root.querySelector<HTMLElement>('.failover-content');
    const presentation = document.createElement('section');
    presentation.className = 'chapter-presentation';
    presentation.setAttribute('aria-label', 'Presentación del capítulo');
    const frame = document.createElement('section');
    frame.className = 'play-frame';
    frame.id = 'chapter-experience';
    frame.tabIndex = -1;
    frame.setAttribute('aria-label', 'Experiencia interactiva: ' + chapter.label);
    const body = document.createElement('div');
    body.className = 'frame-body';
    const main = document.createElement('div');
    main.className = 'frame-main';
    const aside = document.createElement('aside');
    aside.className = 'frame-aside';
    aside.setAttribute('aria-label', 'Qué está pasando');
    const controls = document.createElement('div');
    controls.className = 'frame-controls';
    const extras = document.createElement('div');
    extras.className = 'frame-extras';
    const core = root.querySelector(coreSelectors[index]);
    if (core)
        main.append(core);
    if (index === 0 && core) {
        const context = document.createElement('p');
        context.className = 'welcome-context';
        context.textContent = chapter.subtitle;
        core.querySelector('.welcome-copy')?.prepend(context);
    }
    const guideSelector = guideSelectors[index];
    if (guideSelector) {
        const guide = root.querySelector(guideSelector) ?? main.querySelector(guideSelector);
        if (guide)
            aside.append(guide);
    }
    for (const selector of ['#case-conclusion', '#notebook-status']) {
        const el = root.querySelector(selector);
        if (el)
            aside.append(el);
    }
    // Keep live descriptions next to the visual, rather than making the papers taller.
    if (index === 6) {
        for (const selector of ['#economy-step', '#physical-detail', '#logical-detail']) {
            const description = main.querySelector(selector);
            if (description)
                aside.append(description);
        }
    }
    if (index === 7) {
        for (const selector of ['.notebook-keeper>p', '.notebook-facts']) {
            const description = main.querySelector(selector);
            if (description)
                aside.append(description);
        }
    }
    if (index === 5) {
        for (const selector of ['.config-admin>b', '#config-result']) {
            const description = main.querySelector(selector);
            if (description) {
                description.classList.add('config-context');
                aside.append(description);
            }
        }
    }
    const help = document.createElement('dialog');
    help.className = 'scene-help-dialog';
    help.setAttribute('aria-label', 'Guía y explicación del capítulo');
    help.innerHTML = '<button class="dialog-close" aria-label="Cerrar explicación">×</button><span class="eyebrow">GUÍA DEL CAPÍTULO</span><h2>El recorrido, con calma.</h2><div class="help-live"></div><div class="help-notes"></div>';
    root.querySelectorAll('.scene-controls').forEach(el => controls.append(el));
    root.querySelectorAll('.state-trail').forEach(el => extras.append(el));
    root.querySelectorAll('.scene-note,.fineprint').forEach(el => help.querySelector('.help-notes')!.append(el));
    // Keep the deadline explanation visible with the introduction, before Comenzar.
    const staticGuides = [...root.querySelectorAll<HTMLElement>('.scene-guidance')].filter(el => !aside.contains(el) && !main.contains(el));
    if (intro) {
        intro.hidden = false;
        intro.querySelectorAll('button').forEach(b => b.remove());
        presentation.append(intro);
    }
    staticGuides.forEach(el => presentation.append(el));
    const heading = root.querySelector('.experiment-heading');
    const ribbon = root.querySelector('.simulation-ribbon');
    if (ribbon)
        frame.prepend(ribbon);
    if (index === 2) {
        const options = root.querySelector('.choices');
        if (options)
            main.prepend(options);
        if (heading)
            main.prepend(heading);
    }
    if (sourceGroup)
        sourceGroup.remove();
    body.append(main);
    if (controls.children.length)
        body.append(controls);
    if (extras.children.length && aside.children.length)
        aside.prepend(extras);
    else if (extras.children.length)
        body.append(extras);
    if (aside.children.length)
        body.append(aside);
    else
        body.classList.add('no-aside');
    const lane = document.createElement('div');
    lane.className = 'frame-lane';
    lane.append(main);
    if (controls.parentElement === body)
        lane.append(controls);
    if (extras.parentElement === body)
        lane.append(extras);
    body.prepend(lane);
    frame.append(body);
    const tools = document.createElement('div');
    tools.className = 'scene-tools';
    tools.innerHTML = '<button class="text-button" data-scene-help>ⓘ Guía y explicación</button>';
    if (!intro && index > 0) {
        const start = document.createElement('button');
        start.className = 'btn btn-primary compact-start';
        start.dataset.startScene = '';
        start.textContent = 'Comenzar ↓';
        start.addEventListener('click', () => { cancelGuidance(); cancelGuidance = scrollToActivity(main, controls, frame); });
        tools.prepend(start);
    }
    if (index === 7) {
        const tabs = document.createElement('div');
        tabs.className = 'ticket-view-tabs';
        tabs.setAttribute('aria-label', 'Consultar tickets');
        tabs.innerHTML = [101, 102, 103].map(n => `<button data-ticket-view="F-${n}" aria-label="Ver ticket F-${n}">${n - 100}</button>`).join('');
        tools.prepend(tabs);
    }
    if (index === 0)
        frame.append(tools);
    else
        frame.prepend(tools);
    root.replaceChildren();
    if (intro || staticGuides.length) {
        const start = document.createElement('button');
        start.className = 'btn btn-primary begin-scene';
        start.dataset.startScene = '';
        start.textContent = 'Comenzar ↓';
        presentation.append(start);
        start.addEventListener('click', () => { cancelGuidance(); cancelGuidance = scrollToActivity(main, controls, frame); });
        root.append(presentation);
    }
    root.append(frame, help);
    const openHelp = () => {
        const live = help.querySelector('.help-live')!;
        live.replaceChildren();
        if (intro) {
            const clone = intro.cloneNode(true) as HTMLElement;
            clone.hidden = false;
            live.append(clone);
        }
        const subtitle = document.createElement('p');
        subtitle.textContent = chapter.subtitle;
        live.append(subtitle);
        const nodes = root.querySelectorAll<HTMLElement>([guideSelector ?? '.nothing', '.module-story', '.shared-neighborhood>p', '.shared-neighbor', '.notebook-facts', '#case-conclusion', '#notebook-status', '#economy-step', '.economy-ledgers'].join(','));
        nodes.forEach(el => { if (help.contains(el))
            return; const section = document.createElement('div'); section.className = 'help-current'; const clone = el.cloneNode(true) as HTMLElement; clone.querySelectorAll('svg,button').forEach(n => n.remove()); clone.querySelectorAll('[id]').forEach(n => n.removeAttribute('id')); section.append(clone); live.append(section); });
        const gati = document.createElement('p');
        gati.textContent = 'Gati: ' + document.querySelector('#dialogue')!.textContent;
        live.append(gati);
        help.showModal();
    };
    tools.querySelector('[data-scene-help]')!.addEventListener('click', openHelp);
    help.querySelector('button')!.addEventListener('click', () => help.close());
    const enterBuilding = (event: Event) => {
        if (index === 4 && (event.target as HTMLElement).closest('[data-module]') && matchMedia('(max-width:1000px)').matches) {
            const theatre = root.querySelector<HTMLElement>('#module-theatre')!;
            cancelGuidance();
            cancelGuidance = scrollToActivity(theatre, null, theatre);
        }
    };
    root.addEventListener('click', enterBuilding);
    const followRequestStep = (event: Event) => {
        if (index !== 1 || !(event.target as Element).closest('[data-action="advance"],[data-action="replay"]')) return;
        cancelGuidance();
        cancelGuidance = scrollToActivity(main, controls, frame);
    };
    root.addEventListener('click', followRequestStep);
    const syncTickets = () => root.querySelectorAll<HTMLButtonElement>('[data-ticket-view]').forEach(button => {
        const ticket = root.querySelector(`[data-ticket="${button.dataset.ticketView}"]`)!;
        button.disabled = !ticket.classList.contains('sorted');
        button.setAttribute('aria-pressed', String(ticket.classList.contains('ticket-current')));
    });
    tools.querySelectorAll<HTMLButtonElement>('[data-ticket-view]').forEach(button => button.addEventListener('click', () => root.querySelectorAll<HTMLElement>('[data-ticket]').forEach(ticket => ticket.classList.toggle('ticket-current', ticket.dataset.ticket === button.dataset.ticketView))));
    const observer = index === 7 ? new MutationObserver(syncTickets) : null;
    observer?.observe(main, { subtree: true, attributes: true, attributeFilter: ['class'] });
    syncTickets();
    return { openHelp, dispose: () => { cancelGuidance(); observer?.disconnect(); root.removeEventListener('click', enterBuilding); root.removeEventListener('click', followRequestStep); help.close(); } };
}
function scrollToActivity(target: HTMLElement, controls: HTMLElement | null, focus: HTMLElement) {
    const chrome = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--chrome-height')) || 130;
    const hud = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hud-height')) || 80;
    const rect = target.getBoundingClientRect();
    let end = controls?.children.length ? controls.getBoundingClientRect().bottom : rect.bottom;
    const aside = target.closest('.frame-body')?.querySelector<HTMLElement>('.frame-aside')?.getBoundingClientRect();
    if (aside && aside.left >= rect.right)
        end = Math.max(end, aside.bottom);
    const available = innerHeight - chrome - hud;
    const height = end - rect.top;
    const inset = height <= available ? Math.max(0, (available - height) / 2) : 16;
    const top = Math.min(Math.max(0, document.documentElement.scrollHeight - innerHeight), Math.max(0, scrollY + rect.top - chrome - inset));
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let ended = false;
    const finish = () => {
        if (ended)
            return;
        ended = true;
        window.removeEventListener('scrollend', finish);
        document.removeEventListener('scrollend', finish);
        focus.dataset.guiding = 'false';
        focus.removeAttribute('aria-busy');
        focus.focus({ preventScroll: true });
    };
    focus.dataset.guiding = 'true';
    focus.setAttribute('aria-busy', 'true');
    if (reduced || Math.abs(top - scrollY) < 1 || !('onscrollend' in window)) {
        window.scrollTo({ top, behavior: 'instant' });
        finish();
    }
    else {
        window.addEventListener('scrollend', finish, { once: true });
        document.addEventListener('scrollend', finish, { once: true });
        window.scrollTo({ top, behavior: 'smooth' });
    }
    return () => { ended = true; window.removeEventListener('scrollend', finish); document.removeEventListener('scrollend', finish); focus.removeAttribute('aria-busy'); focus.dataset.guiding = 'false'; };
}
