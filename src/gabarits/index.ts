import { GABARITS_CH1 } from './ch1'
import { GABARITS_SOCLE } from './socle'
import { GABARITS_TRIGO } from './trigo'
import type { Gabarit } from './types'

/** Tous les gabarits (questions à variantes). Ajouter ici ceux des prochains chapitres. */
export const GABARITS: Gabarit[] = [...GABARITS_SOCLE, ...GABARITS_TRIGO, ...GABARITS_CH1]
