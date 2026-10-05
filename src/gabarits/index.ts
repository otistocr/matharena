import { GABARITS_CH1 } from './ch1'
import { GABARITS_CH2 } from './ch2'
import { GABARITS_CH3 } from './ch3'
import { GABARITS_CH4 } from './ch4'
import { GABARITS_INFO } from './info'
import { GABARITS_INFO_CODE } from './infoCode'
import { GABARITS_SOCLE } from './socle'
import { GABARITS_SOCLE2 } from './socle2'
import { GABARITS_TRIGO } from './trigo'
import type { Gabarit } from './types'

/** Tous les gabarits (questions à variantes). Ajouter ici ceux des prochains chapitres. */
export const GABARITS: Gabarit[] = [...GABARITS_SOCLE, ...GABARITS_SOCLE2, ...GABARITS_TRIGO, ...GABARITS_CH1, ...GABARITS_CH2, ...GABARITS_CH3, ...GABARITS_CH4, ...GABARITS_INFO, ...GABARITS_INFO_CODE]
