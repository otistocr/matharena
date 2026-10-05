/**
 * Fiches de cours : un fichier Markdown léger par chapitre dans /cours (même syntaxe que les
 * explications : $…$, **gras**, listes, blocs [cours] [methode] [exemple] [piege]…).
 * Les sections s'écrivent « ## Titre {#ch1.s3} » pour être reliées à l'entraînement.
 */
const fichiers = import.meta.glob('../../cours/*.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>

export interface SectionCours {
  titre: string
  /** Section du chapitre (ex. "ch1.s3"), pour le bouton « S'entraîner ». */
  section?: string
  corps: string
}
export interface Fiche {
  chapitre: string
  titre: string
  intro: string
  sections: SectionCours[]
}

function lire(chapitre: string, texte: string): Fiche {
  const lignes = texte.replace(/\r/g, '').split('\n')
  let titre = chapitre
  const intro: string[] = []
  const sections: SectionCours[] = []
  for (const l of lignes) {
    if (l.startsWith('# ')) titre = l.slice(2).trim()
    else if (l.startsWith('## ')) {
      const m = /^##\s+(.*?)\s*(?:\{#([\w.-]+)\})?\s*$/.exec(l)!
      sections.push({ titre: m[1], section: m[2], corps: '' })
    } else if (sections.length) sections[sections.length - 1].corps += l + '\n'
    else intro.push(l)
  }
  return { chapitre, titre, intro: intro.join('\n').trim(), sections }
}

export const FICHES: Fiche[] = Object.entries(fichiers).map(([chemin, texte]) => lire(chemin.split('/').pop()!.replace(/\.md$/, ''), texte))
export const getFiche = (chapitre: string) => FICHES.find((f) => f.chapitre === chapitre)
