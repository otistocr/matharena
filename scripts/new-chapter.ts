/**
 * npm run new-chapter -- <id> "<Titre>" "<Titre court>" [sorbonne|lycee]
 * ex. : npm run new-chapter -- ly-polynomes "Polynômes (lycée)" "Polynômes lycée" lycee
 * Crée questions/<id>.json avec une section et une question modèle à remplacer.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const [id, titre, court, parcours = 'sorbonne'] = process.argv.slice(2)
if (!id || !titre || !court || !/^[a-z0-9-]+$/.test(id) || !['sorbonne', 'lycee'].includes(parcours)) {
  console.error('Usage : npm run new-chapter -- <id> "<Titre>" "<Titre court>" [sorbonne|lycee]')
  process.exit(1)
}
const dir = join(import.meta.dirname, '..', 'questions')
const file = join(dir, `${id}.json`)
if (existsSync(file)) {
  console.error(`${file} existe déjà.`)
  process.exit(1)
}
const ordre =
  Math.max(0, ...readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')).chapitre.ordre)) + 1

const bank = {
  chapitre: {
    id,
    titre,
    court,
    parcours,
    ordre,
    sections: [{ id: `${id}.s1`, titre: 'Première section', ref: 'poly §? p.?' }],
  },
  questions: [
    {
      id: `${id}-001`,
      chapitre: id,
      section: `${id}.s1`,
      type: 'qcm',
      niveau: 1,
      enonce: 'Énoncé avec du LaTeX : $x^2$',
      choix: ['Bonne réponse', 'Distracteur'],
      reponse: 0,
      explication: 'Explication détaillée : définitions utilisées et calculs pas à pas.',
      source: 'créée',
      origine: 'créée',
      refCours: 'poly §? p.?',
    },
  ],
}
writeFileSync(file, JSON.stringify(bank, null, 2) + '\n')
console.log(`✓ ${file} créé. Complète les sections et les questions, puis lance : npm run validate-questions`)
