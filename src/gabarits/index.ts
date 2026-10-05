import { GABARITS_CH1 } from './ch1'
import { GABARITS_CH3 } from './ch3'
import { GABARITS_CH4 } from './ch4'
import { GABARITS_SOCLE } from './socle'
import { GABARITS_TRIGO } from './trigo'
import type { Gabarit } from './types'

/** Tous les gabarits (questions à variantes). Ajouter ici ceux des prochains chapitres. */
export const GABARITS: Gabarit[] = [...GABARITS_SOCLE, ...GABARITS_TRIGO, ...GABARITS_CH1, ...GABARITS_CH3, ...GABARITS_CH4]
