import { describe, it, expect } from 'vitest'
import { hexToOklch } from './utils'

function parseOklch(str: string) {
  const m = /oklch\(([^\s]+)\s+([^\s]+)\s+([^\s]+)\)/.exec(str)
  if (!m) throw new Error('Invalid OKLCH string')
  return { L: parseFloat(m[1]), C: parseFloat(m[2]), H: parseFloat(m[3]) }
}

describe('hexToOklch accuracy basics', () => {
  it('white has L near 1 and C near 0', () => {
    const { L, C } = parseOklch(hexToOklch('#FFFFFF'))
    expect(L).toBeGreaterThan(0.98)
    expect(C).toBeLessThan(0.01)
  })

  it('black has L near 0 and C near 0', () => {
    const { L, C } = parseOklch(hexToOklch('#000000'))
    expect(L).toBeLessThan(0.02)
    expect(C).toBeLessThan(0.01)
  })

  it('gray is chroma near 0', () => {
    const { C } = parseOklch(hexToOklch('#808080'))
    expect(C).toBeLessThan(0.02)
  })

  it('red has non-zero chroma and valid hue', () => {
    const { C, H } = parseOklch(hexToOklch('#FF0000'))
    expect(C).toBeGreaterThan(0.1)
    expect(H).toBeGreaterThanOrEqual(0)
    expect(H).toBeLessThan(360)
  })
})
