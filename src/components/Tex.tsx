import katex from 'katex'
import { useMemo } from 'react'

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * Surligneurs utilisables dans les formules (couleurs adaptées au thème clair/sombre via CSS) :
 * \ok{…} résultat (vert) · \cle{…} valeur clé (ambre) · \cours{…} formule du cours (bleu) · \ko{…} erreur/piège (rouge)
 */
const MACROS = {
  '\\ok': '\\htmlClass{hl-ok}{#1}',
  '\\cle': '\\htmlClass{hl-cle}{#1}',
  '\\cours': '\\htmlClass{hl-cours}{#1}',
  '\\ko': '\\htmlClass{hl-ko}{#1}',
}

function renderMath(src: string, display: boolean) {
  return katex.renderToString(src, {
    displayMode: display,
    throwOnError: false,
    strict: false,
    output: 'html',
    macros: { ...MACROS },
    trust: (ctx) => ctx.command === '\\htmlClass',
  })
}

/** Blocs colorés des explications : une ligne « [cours] … » ouvre un bloc jusqu'au tag suivant. */
export const BLOCS = {
  cours: { label: 'Cours', icone: '📘' },
  methode: { label: 'Méthode', icone: '🧭' },
  calcul: { label: 'Calcul', icone: '✏️' },
  resultat: { label: 'Résultat', icone: '✅' },
  piege: { label: 'Piège', icone: '⚠️' },
  verif: { label: 'Vérification', icone: '🔎' },
  exemple: { label: 'Exemple', icone: '💡' },
} as const
export type Bloc = keyof typeof BLOCS
const TAG = /^\[(cours|methode|calcul|resultat|piege|verif|exemple)\]\s*(.*)$/

/** Paragraphes + listes « - » pour un morceau de texte déjà converti en HTML (formules en marqueurs). */
function paragraphes(lines: string[]): string {
  const out: string[] = []
  let list: string[] | null = null
  for (const line of lines) {
    if (line.startsWith('### ')) {
      if (list) {
        out.push(`<ul>${list.join('')}</ul>`)
        list = null
      }
      out.push(`<h3>${line.slice(4)}</h3>`)
      continue
    }
    if (line.startsWith('- ')) {
      ;(list ??= []).push(`<li>${line.slice(2)}</li>`)
      continue
    }
    if (list) {
      out.push(`<ul>${list.join('')}</ul>`)
      list = null
    }
    if (line.trim()) out.push(`<p>${line}</p>`)
  }
  if (list) out.push(`<ul>${list.join('')}</ul>`)
  return out.join('')
}

/**
 * Rend un texte « Markdown léger + LaTeX » :
 * $…$ en ligne, $$…$$ en bloc, **gras**, lignes « - » en liste, retours à la ligne = paragraphes,
 * lignes « [cours] », « [calcul] »… = blocs colorés.
 */
export function richHtml(text: string): string {
  // Les formules sont rendues à part (le HTML de KaTeX contient des retours à la ligne)
  // puis réinjectées via des marqueurs après la mise en paragraphes.
  const formules: string[] = []
  const html = text
    .split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g)
    .map((p) => {
      if (p.startsWith('$$')) return `\u0000${formules.push(renderMath(p.slice(2, -2), true)) - 1}\u0000`
      if (p.startsWith('$') && p.length > 1) return `\u0000${formules.push(renderMath(p.slice(1, -1), false)) - 1}\u0000`
      return escapeHtml(p).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    })
    .join('')

  const out: string[] = []
  let bloc: { type: Bloc; lines: string[] } | null = null
  let libres: string[] = []
  const fermer = () => {
    if (bloc) {
      const b = BLOCS[bloc.type]
      out.push(`<div class="bloc bloc-${bloc.type}"><div class="bloc-label">${b.icone} ${b.label}</div>${paragraphes(bloc.lines)}</div>`)
      bloc = null
    }
  }
  for (const line of html.split('\n')) {
    const m = TAG.exec(line)
    if (m) {
      out.push(paragraphes(libres))
      libres = []
      fermer()
      bloc = { type: m[1] as Bloc, lines: m[2] ? [m[2]] : [] }
    } else if (bloc) bloc.lines.push(line)
    else libres.push(line)
  }
  out.push(paragraphes(libres))
  fermer()
  return out.join('').replace(/\u0000(\d+)\u0000/g, (_, i) => formules[Number(i)])
}

export function Tex({ children, className = '' }: { children: string; className?: string }) {
  const html = useMemo(() => richHtml(children), [children])
  return <div className={`rich ${className}`} dangerouslySetInnerHTML={{ __html: html }} />
}

/** Formule seule (sans paragraphes). */
export function TexInline({ math, display = false }: { math: string; display?: boolean }) {
  const html = useMemo(() => renderMath(math, display), [math, display])
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}
