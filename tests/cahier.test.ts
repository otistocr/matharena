import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { toutEffacer } from '../src/lib/db'
import { ITEMS, tirer } from '../src/data/bank'
import { chargerStatuts, enregistrerReponse, nbErreurs, selectionEntrainement } from '../src/lib/session'

const item = ITEMS.find((it) => it.gabarit)!
const q = tirer(item, 1)

describe('cahier d’erreurs', () => {
  it('une question ratée entre dans le cahier et en sort après 2 réussites d’affilée', async () => {
    await toutEffacer()
    expect((await chargerStatuts()).statuts.get(item.cle)).toBe('nouvelle')

    expect(await enregistrerReponse(q, 0, 'entrainement', 5000, 'faux')).toBe('cahier')
    expect((await chargerStatuts()).statuts.get(item.cle)).toBe('erreur')
    expect(await nbErreurs()).toBe(1)

    // une AUTRE variante du même gabarit compte pour la même notion
    expect(await enregistrerReponse(tirer(item, 2), 1, 'erreurs', 5000)).toBe('progres')
    expect(await nbErreurs()).toBe(1)
    expect(await enregistrerReponse(q, 1, 'erreurs', 5000)).toBe('corrigee')
    expect(await nbErreurs()).toBe(0)
    expect((await chargerStatuts()).statuts.get(item.cle)).toBe('reussie')

    // Rater à nouveau la remet dans le cahier.
    expect(await enregistrerReponse(q, 0, 'blitz', 5000)).toBe('cahier')
    expect(await nbErreurs()).toBe(1)
  })
  it('réussie du premier coup : jamais dans le cahier', async () => {
    await toutEffacer()
    expect(await enregistrerReponse(q, 1, 'entrainement', 5000)).toBe('nouvelle-reussie')
    expect(await nbErreurs()).toBe(0)
    expect(await enregistrerReponse(q, 1, 'entrainement', 5000)).toBe('reussie')
  })
  it('l’entraînement propose TOUTES les questions, les nouvelles d’abord', async () => {
    await toutEffacer()
    await enregistrerReponse(q, 1, 'entrainement', 5000)
    const qs = await selectionEntrainement({ chapitre: item.chapitre })
    expect(qs).toHaveLength(ITEMS.filter((x) => x.chapitre === item.chapitre).length)
    expect(qs.at(-1)!.id.split('~')[0]).toBe(item.cle)
    // chaque tirage d'un gabarit est une nouvelle variante
    const autres = await selectionEntrainement({ chapitre: item.chapitre })
    expect(autres.find((x) => x.id.startsWith(item.cle))!.id).not.toBe(qs.at(-1)!.id)
  })
})
