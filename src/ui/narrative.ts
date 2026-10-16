import { character } from '../characters/characters';
export function introduction(title: string, text: string, instruction: string) {
    return `<div class="chapter-intro"><div class="intro-mascot">${character('gati')}</div><div><span class="eyebrow">ANTES DE EMPEZAR</span><h2>${title}</h2><p>${text}</p><p class="interaction-hint"><b>Tu papel en esta escena:</b> ${instruction}</p></div></div>`;
}
export function guidance(title: string, text: string) {
    return `<div class="scene-guidance" role="status"><b>${title}</b><p>${text}</p></div>`;
}
