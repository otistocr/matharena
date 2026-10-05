import { z } from 'zod'

/**
 * Schéma commun des banques de questions (un fichier JSON par chapitre dans /questions).
 * Utilisé à la fois par l'app et par `npm run validate-questions`.
 */

export const Niveau = z.union([z.literal(1), z.literal(2), z.literal(3)])
export type Niveau = z.infer<typeof Niveau>

export const NIVEAUX: Record<Niveau, string> = {
  1: 'Indispensable',
  2: 'Application',
  3: 'Pour aller plus loin',
}

const base = z.object({
  /** Identifiant stable, ex. "ch1-012". Ne jamais le réutiliser : l'historique s'y rattache. */
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*(~[0-9]+)?$/, 'id en minuscules/chiffres/tirets (+ ~graine pour une variante)'),
  chapitre: z.string().min(1),
  /** Section de l'arborescence, ex. "ch1.s3". */
  section: z.string().min(1),
  niveau: Niveau,
  /** Énoncé en texte + LaTeX ($…$ en ligne, $$…$$ en bloc). */
  enonce: z.string().min(5),
  /** Explication détaillée : calculs, définitions utilisées. */
  explication: z.string().min(20, 'explication trop courte'),
  /** D'où vient la question : "TD1 ex 3", "poly p.42 (Test)", "CC1 2023 ScFo ex 2", "cours perso", "créée". */
  source: z.string().min(2),
  origine: z.enum(['transposée', 'créée']),
  /** Où relire le cours, ex. "poly §1.2.3 p.12". */
  refCours: z.string().min(2),
  /** Numéro d'Énoncé indispensable (1–25), ou true pour un énoncé indispensable non numéroté. */
  indispensable: z.union([z.number().int().min(1).max(25), z.literal(true)]).optional(),
  /** Indice facultatif affiché à la demande (mode Entraînement). */
  indice: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export const QcmQuestion = base.extend({
  type: z.literal('qcm'),
  choix: z.array(z.string().min(1)).min(2).max(6),
  /** Index (à partir de 0) de la bonne réponse dans `choix`. */
  reponse: z.number().int().min(0),
})

export const VfQuestion = base.extend({
  type: z.literal('vf'),
  reponse: z.boolean(),
})

export const NumQuestion = base.extend({
  type: z.literal('num'),
  /** Valeur attendue : nombre ou expression exacte ("sqrt(2)/2", "3pi/4", "1+i"). */
  reponse: z.union([z.number(), z.string().min(1)]),
  /** Tolérance absolue (défaut : 1e-6 relatif). */
  tolerance: z.number().positive().optional(),
  unite: z.string().optional(),
})

export const CourtQuestion = base.extend({
  type: z.literal('court'),
  /**
   * Formes acceptées (syntaxe calculatrice ou LaTeX simple). La première est affichée comme corrigé.
   * Vérification par évaluation numérique en des points aléatoires, pas par comparaison de texte.
   */
  reponse: z.array(z.string().min(1)).min(1),
  /** Variables libres de l'expression, ex. ["x","y"]. */
  variables: z.array(z.string().regex(/^[a-zA-Z]$/)).default([]),
  /**
   * "expression" : égalité de fonctions ;
   * "equation"   : même ensemble de solutions (membres proportionnels, ex. 2x+3y=1 ≡ 4x+6y-2=0).
   */
  mode: z.enum(['expression', 'equation']).default('expression'),
  /** Aide à la saisie affichée sous le champ, ex. "forme ax+by+c=0". */
  format: z.string().optional(),
  /** Forme exigée en plus de l'égalité (sinon recopier l'énoncé serait « juste »). */
  forme: z.enum(['developpee', 'factorisee']).optional(),
})

export const RedactionQuestion = base.extend({
  type: z.literal('redaction'),
  /** Corrigé rédigé modèle. */
  corrige: z.string().min(20),
  bareme: z
    .array(z.object({ points: z.number().positive(), critere: z.string().min(3) }))
    .min(1),
})

export const Question = z
  .discriminatedUnion('type', [QcmQuestion, VfQuestion, NumQuestion, CourtQuestion, RedactionQuestion])
  .superRefine((q, ctx) => {
    if (q.type === 'qcm' && q.reponse >= q.choix.length) {
      ctx.addIssue({ code: 'custom', message: `reponse ${q.reponse} hors des choix`, path: ['reponse'] })
    }
    if (!q.section.startsWith(q.chapitre + '.')) {
      ctx.addIssue({ code: 'custom', message: `section ${q.section} hors du chapitre ${q.chapitre}`, path: ['section'] })
    }
  })
export type Question = z.infer<typeof Question>
export type QuestionType = Question['type']

export const Section = z.object({
  id: z.string().min(1),
  titre: z.string().min(1),
  /** Référence au poly, ex. "§1.3 p.14". */
  ref: z.string().optional(),
})

export const ChapitreMeta = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  titre: z.string().min(1),
  /** Titre court pour les petits écrans. */
  court: z.string().min(1),
  /** "sorbonne" = programme UL1MA001 (poly) ; "lycee" = parcours alternatif (cours perso). */
  parcours: z.enum(['sorbonne', 'lycee']),
  ordre: z.number(),
  pages: z.string().optional(),
  sections: z.array(Section).min(1),
})
export type ChapitreMeta = z.infer<typeof ChapitreMeta>

export const BankFile = z
  .object({
    chapitre: ChapitreMeta,
    questions: z.array(Question),
  })
  .superRefine((f, ctx) => {
    const sections = new Set(f.chapitre.sections.map((s) => s.id))
    f.questions.forEach((q, i) => {
      if (q.chapitre !== f.chapitre.id) {
        ctx.addIssue({ code: 'custom', message: `chapitre "${q.chapitre}" ≠ "${f.chapitre.id}"`, path: ['questions', i, 'chapitre'] })
      }
      if (!sections.has(q.section)) {
        ctx.addIssue({ code: 'custom', message: `section inconnue "${q.section}"`, path: ['questions', i, 'section'] })
      }
    })
  })
export type BankFile = z.infer<typeof BankFile>
