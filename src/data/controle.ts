/**
 * Contrôles de qualité d'une question (fixe ou variante de gabarit), partagés par
 * `npm run validate-questions` et les tests.
 */
import { Question } from './schema'
import { checkExpression, checkNumeric } from '../lib/mathexpr'

const TAGS = new Set(['cours', 'methode', 'calcul', 'resultat', 'piege', 'verif'])

/** Explications en blocs colorés : au moins [cours] et [resultat], tags connus, dollars équilibrés. */
export function checkExplication(q: Question): string | null {
  const tags = [...q.explication.matchAll(/^\[([a-z]+)\]/gm)].map((m) => m[1])
  const inconnus = tags.filter((t) => !TAGS.has(t))
  if (inconnus.length) return `bloc(s) inconnu(s) : ${inconnus.join(', ')}`
  if (!tags.includes('cours')) return 'explication sans bloc [cours] (définition / énoncé utilisé)'
  if (!tags.includes('resultat')) return 'explication sans bloc [resultat]'
  const champs = [q.enonce, q.explication, ...(q.type === 'qcm' ? q.choix : [])]
  for (const champ of champs) {
    if ((champ.replace(/\\\$/g, '').match(/\$/g) ?? []).length % 2) return 'nombre impair de $ (formule non fermée)'
    if (/\$\{|undefined|NaN|\[object /.test(champ)) return `texte suspect (interpolation ratée) : ${champ.slice(0, 80)}`
  }
  return null
}

/** La réponse attendue doit être acceptée par le correcteur ; un QCM doit avoir des choix distincts. */
export function checkAnswer(q: Question): string | null {
  if (q.type === 'num' && !checkNumeric(String(q.reponse), q.reponse, q.tolerance)) return `réponse numérique non évaluable : ${q.reponse}`
  if (q.type === 'court') {
    for (const r of q.reponse) {
      if (!checkExpression(r, [q.reponse[0]], q.variables, q.mode)) return `forme acceptée « ${r} » refusée par le correcteur (variables : [${q.variables}])`
    }
  }
  if (q.type === 'qcm') {
    if (new Set(q.choix).size !== q.choix.length) return 'choix de QCM en double'
    if (q.reponse < 0) return 'bonne réponse absente des choix'
  }
  return null
}

/** Contrôle complet : schéma + réponse + explication (+ section connue). */
export function controler(q: unknown, sections?: Set<string>): string | null {
  const res = Question.safeParse(q)
  if (!res.success) return res.error.issues.map((i) => `${i.path.join('.')} — ${i.message}`).join(' ; ')
  if (sections && !sections.has(res.data.section)) return `section inconnue ${res.data.section}`
  return checkAnswer(res.data) ?? checkExplication(res.data)
}
