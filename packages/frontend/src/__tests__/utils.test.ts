import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('Utility Functions', () => {
  describe('cn (className merger)', () => {
    it('merges non-conflicting classes', () => {
      const result = cn('p-4', 'text-sm')
      expect(result).toContain('p-4')
      expect(result).toContain('text-sm')
    })

    it('handles Tailwind class conflicts with later value winning', () => {
      const result = cn('p-4', 'p-8')
      expect(result).toContain('p-8')
      expect(result).not.toContain('p-4')
    })

    it('handles conditional classes', () => {
      const result = cn('base', false && 'skipped', true && 'included')
      expect(result).toContain('base')
      expect(result).toContain('included')
      expect(result).not.toContain('skipped')
    })

    it('handles array inputs', () => {
      const result = cn(['p-4', 'text-sm'])
      expect(result).toContain('p-4')
      expect(result).toContain('text-sm')
    })

    it('handles object inputs with boolean values', () => {
      const result = cn({ 'p-4': true, 'text-sm': false })
      expect(result).toContain('p-4')
      expect(result).not.toContain('text-sm')
    })

    it('handles mixed inputs', () => {
      const result = cn('base', ['flex', 'gap-2'], { 'justify-center': true })
      expect(result).toContain('base')
      expect(result).toContain('flex')
      expect(result).toContain('gap-2')
      expect(result).toContain('justify-center')
    })

    it('handles undefined and null values gracefully', () => {
      const result = cn('p-4', undefined, 'text-sm', null)
      expect(result).toContain('p-4')
      expect(result).toContain('text-sm')
    })

    it('resolves color class conflicts', () => {
      const result = cn('text-red-500', 'text-blue-500')
      expect(result).toContain('text-blue-500')
      expect(result).not.toContain('text-red-500')
    })

    it('returns empty string for empty input', () => {
      const result = cn()
      expect(result).toBe('')
    })
  })
})
