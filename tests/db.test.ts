import 'fake-indexeddb/auto'
import { describe, expect, it } from 'vitest'
import { exporter, importer, enregistrerTentative, sauverCarte, toutesTentatives, toutesCartes, toutEffacer, type Sauvegarde } from '../src/lib/db'

describe('export / import', () => {
  it('fusionne sans doublon et garde la carte la plus récente', async () => {
    await toutEffacer()
    await enregistrerTentative({ qid: 'ch1-001', chapitre: 'ch1', section: 'ch1.s1', mode: 'entrainement', score: 0, at: 1000, duree: 5000, saisie: '7' })
    await sauverCarte({ qid: 'ch1-001', ef: 2.5, intervalle: 1, repetitions: 0, echeance: '2026-09-29', derniere: '2026-09-28' })
    const s = await exporter()
    expect(s.tentatives).toHaveLength(1)

    // « Autre appareil » : une réponse en commun + une nouvelle, carte révisée plus tard.
    const autre: Sauvegarde = {
      ...s,
      tentatives: [...s.tentatives, { qid: 'ch1-001', chapitre: 'ch1', section: 'ch1.s1', mode: 'erreurs', score: 1, at: 2000, duree: 4000 }],
      cartes: [{ qid: 'ch1-001', ef: 2.5, intervalle: 1, repetitions: 1, echeance: '2026-09-30', derniere: '2026-09-29' }],
    }
    expect((await importer(autre)).tentatives).toBe(1)
    expect(await toutesTentatives()).toHaveLength(2)
    expect((await toutesCartes())[0].repetitions).toBe(1)
    expect((await importer(autre)).tentatives).toBe(0)
  })
  it('refuse un fichier qui n’est pas une sauvegarde', async () => {
    await expect(importer({ foo: 1 } as unknown as Sauvegarde)).rejects.toThrow()
  })
})
