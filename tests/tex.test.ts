import { describe, expect, it } from 'vitest'
import { richHtml } from '../src/components/Tex'

describe('texte riche : code de la partie informatique', () => {
  it('rend les blocs ``` sans interpréter ** ni $', () => {
    const html = richHtml('Que vaut `2 ** 3` ?\n```\ndef f(x: int) -> int:\n    return x ** 2 * x ** 2\n```')
    expect(html).toContain('<code>2 ** 3</code>')
    expect(html).toContain('<pre class="code"><code>def f(x: int) -&gt; int:\n    return x ** 2 * x ** 2</code></pre>')
    expect(html).not.toContain('<strong>')
  })
  it('garde le gras et les formules en dehors du code', () => {
    const html = richHtml('[calcul] **Simulation** de `f(2)` : $2^4$')
    expect(html).toContain('<strong>Simulation</strong>')
    expect(html).toContain('<code>f(2)</code>')
    expect(html).toContain('katex')
  })
})
