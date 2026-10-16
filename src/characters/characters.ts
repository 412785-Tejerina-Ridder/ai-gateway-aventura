import type { Character } from "../types";
const palette: Record<Character, string> = {
  gati: "#6ccfbb",
  tutor: "#f8bb77",
  evaluator: "#c5b3ee",
  rag: "#8fbfa0",
  moderation: "#9cbde6",
  agent: "#e8a8c8",
  generator: "#f1c86c",
  calibration: "#b6cce8",
  admin: "#d6c5e6",
  provider: "#b1c9d0",
};
const faces = `<g class="face"><ellipse cx="65" cy="73" rx="5" ry="7" fill="#284749"/><ellipse cx="95" cy="73" rx="5" ry="7" fill="#284749"/><path d="M72 89 Q80 96 89 87" fill="none" stroke="#284749" stroke-width="3" stroke-linecap="round"/><ellipse cx="53" cy="85" rx="7" ry="4" fill="#ed9c9d" opacity=".7"/><ellipse cx="107" cy="85" rx="7" ry="4" fill="#ed9c9d" opacity=".7"/></g>`;
export function character(
  kind: Character = "gati",
  mood = "happy",
  extra = "",
): string {
  const c = palette[kind];
  let art = "";
  if (kind === "gati" || kind === "provider")
    art = `<path d="M48 134 L42 153 Q43 160 58 157 L65 137 M95 137 L103 157 Q120 161 118 152 L111 133" fill="${c}" stroke="#284749" stroke-width="3"/><rect x="43" y="98" width="74" height="46" rx="19" fill="${c}" stroke="#284749" stroke-width="3"/><rect x="57" y="108" width="46" height="23" rx="8" fill="#fff7d9"/><circle cx="70" cy="119" r="4" fill="#f19478"/><circle cx="86" cy="119" r="4" fill="#6ab8a5"/><path class="arm arm-left" d="M43 112 Q17 116 22 95" fill="none" stroke="${c}" stroke-width="15" stroke-linecap="round"/><path class="arm arm-right" d="M118 111 Q140 121 141 99" fill="none" stroke="${c}" stroke-width="15" stroke-linecap="round"/><path d="M80 35 V20" stroke="#284749" stroke-width="4"/><circle cx="80" cy="16" r="7" fill="#f5b965" stroke="#284749" stroke-width="3"/><rect x="29" y="39" width="102" height="69" rx="26" fill="${c}" stroke="#284749" stroke-width="3"/><rect x="40" y="50" width="80" height="47" rx="18" fill="#284749"/><g class="robot-eyes" fill="#fff2b0"><rect x="53" y="63" width="13" height="15" rx="6"/><rect x="94" y="63" width="13" height="15" rx="6"/></g><path d="M72 83 Q80 91 88 83" fill="none" stroke="#fff2b0" stroke-width="3" stroke-linecap="round"/><rect x="21" y="60" width="9" height="25" rx="4" fill="#f6c46c"/><rect x="131" y="60" width="9" height="25" rx="4" fill="#f6c46c"/>`;
  else {
    art = `<path d="M57 133 L52 153 M102 133 L110 153" stroke="#284749" stroke-width="8" stroke-linecap="round"/><path d="M42 115 Q23 116 24 98 M117 115 Q136 119 138 100" fill="none" stroke="${c}" stroke-width="12" stroke-linecap="round"/><path d="M43 142 V111 Q45 96 80 97 Q114 97 117 111 V142Z" fill="${c}" stroke="#284749" stroke-width="3"/><rect x="37" y="37" width="86" height="69" rx="31" fill="#fff0d2" stroke="#284749" stroke-width="3"/>${faces}`;
    if (kind === "tutor")
      art += `<path d="M35 51 L42 26 64 39 83 24 99 37 120 26 126 56" fill="#c88553" stroke="#284749" stroke-width="3"/><g fill="none" stroke="#284749" stroke-width="3"><circle cx="64" cy="73" r="13"/><circle cx="97" cy="73" r="13"/><path d="M77 72H84"/></g><path d="M68 112 L83 119 99 111V145 L83 152 68 145Z" fill="#548b79" stroke="#284749" stroke-width="3"/>`;
    if (kind === "evaluator")
      art += `<path d="M38 50 Q42 16 81 23 Q119 19 125 50" fill="#68748c" stroke="#284749" stroke-width="3"/><rect x="83" y="108" width="42" height="43" rx="4" fill="#fff8dd" stroke="#284749" stroke-width="3"/><path d="M92 121H116 M92 131H109" stroke="#a6a8b1" stroke-width="3"/><path d="M93 140l5 5 10-12" stroke="#70ad94" stroke-width="4" fill="none"/>`;
    if (kind === "rag")
      art = `<path d="M53 134l-5 20 M107 134l8 20" stroke="#284749" stroke-width="8" stroke-linecap="round"/><path d="M31 101 Q8 110 22 125 M129 99 Q150 107 139 125" fill="none" stroke="#284749" stroke-width="7" stroke-linecap="round"/><rect x="30" y="39" width="100" height="99" rx="10" fill="#9d7156" stroke="#284749" stroke-width="3"/><path d="M39 48H121V129H39Z" fill="#fff0cf"/><g stroke="#284749" stroke-width="2"><path d="M44 51V91H60V51Z" fill="#f2a489"/><path d="M63 48V91H80V48Z" fill="#9fcbba"/><path d="M84 56L92 92 107 88 99 52Z" fill="#e3c36d"/><path d="M40 97H120V126H40Z" fill="#b9b0d5"/></g><g transform="translate(0 32)">${faces}</g><path d="M27 40 Q78 14 134 41" fill="#c1dfc4" stroke="#284749" stroke-width="3"/>`;
    if (kind === "moderation")
      art += `<path d="M34 56 Q36 16 80 17 Q124 16 127 56Z" fill="#7ea6c6" stroke="#284749" stroke-width="3"/><path d="M80 18V53 M50 49H112" stroke="#fff5d5" stroke-width="5"/><path d="M99 107L129 116 125 139 112 151 98 137Z" fill="#f2d27d" stroke="#284749" stroke-width="3"/><path d="M107 126l6 6 10-12" fill="none" stroke="#4e8277" stroke-width="4"/>`;
    if (kind === "agent")
      art += `<path d="M80 36V14" stroke="#284749" stroke-width="3"/><circle cx="80" cy="12" r="9" fill="#e8a8c8" stroke="#284749" stroke-width="3"/><path d="M48 111H111V141H48Z" fill="#fff7d9" stroke="#284749" stroke-width="3"/><path d="M49 112L80 132 110 112" fill="none" stroke="#c480a4" stroke-width="3"/><text x="72" y="79" fill="#284749" font-size="18" font-weight="bold">@</text>`;
    if (kind === "generator")
      art += `<path d="M31 46 Q28 25 79 23 Q132 20 129 47Z" fill="#e99d89" stroke="#284749" stroke-width="3"/><path d="M91 27L101 12" stroke="#284749" stroke-width="4"/><path d="M97 134L122 95 130 100 105 139Z" fill="#f1c86c" stroke="#284749" stroke-width="3"/><path d="M49 108V143H91V108" fill="#faf4dc" stroke="#284749" stroke-width="3"/><circle cx="69" cy="127" r="7" fill="#f09980"/>`;
    if (kind === "calibration")
      art += `<path d="M36 54L28 38 46 34 47 16 70 28 88 13 97 30 121 26 120 52" fill="#fdfbf1" stroke="#284749" stroke-width="3"/><g fill="none" stroke="#284749" stroke-width="3"><circle cx="64" cy="73" r="13"/><circle cx="97" cy="73" r="13"/><path d="M77 72H84"/></g><path d="M52 111L80 143 107 110V146H52Z" fill="#fffaf0" stroke="#284749" stroke-width="2"/><path d="M113 112V129L129 147H99L113 129" fill="#7ac6bb" stroke="#284749" stroke-width="3"/>`;
    if (kind === "admin")
      art += `<path d="M37 51 Q38 19 80 20 Q126 20 123 58L104 47 84 39 62 50Z" fill="#67798f" stroke="#284749" stroke-width="3"/><path d="M62 113H105V143H62Z" fill="#355956" stroke="#284749" stroke-width="3"/><circle cx="83" cy="127" r="7" fill="#f3cf7d"/>`;
  }
  return `<svg class="character char-${kind} mood-${mood} ${extra}" viewBox="0 0 160 170" aria-hidden="true"><ellipse cx="80" cy="158" rx="47" ry="7" fill="#294a49" opacity=".10"/><g class="char-body">${art}</g><g class="mood-mark"><path d="M139 29l5-12 M148 40l10-3" stroke="#f1ae5c" stroke-width="4" stroke-linecap="round"/></g></svg>`;
}
export const names: Record<Character, string> = {
  gati: "Gati",
  tutor: "Profe Tutor",
  evaluator: "Eva",
  rag: "Biblio RAG",
  moderation: "Mora",
  agent: "Ari",
  generator: "Geno",
  calibration: "Cali",
  admin: "Administración",
  provider: "Proveedor",
};
