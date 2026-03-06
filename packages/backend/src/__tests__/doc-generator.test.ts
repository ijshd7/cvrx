import { describe, it, expect } from 'vitest'
import { parseMarkdownContent, stripMarkdownFormatting, createTextRuns } from '../services/doc-generator'

describe('Markdown Content Parser', () => {
  describe('parseMarkdownContent', () => {
    it('parses level 1 heading', () => {
      const result = parseMarkdownContent('# Heading 1')
      expect(result).toEqual([
        { type: 'heading', text: 'Heading 1', level: 1 }
      ])
    })

    it('parses level 2 heading', () => {
      const result = parseMarkdownContent('## Heading 2')
      expect(result).toEqual([
        { type: 'heading', text: 'Heading 2', level: 2 }
      ])
    })

    it('parses level 3 heading', () => {
      const result = parseMarkdownContent('### Heading 3')
      expect(result).toEqual([
        { type: 'heading', text: 'Heading 3', level: 3 }
      ])
    })

    it('parses bullet points with dash', () => {
      const result = parseMarkdownContent('- First bullet')
      expect(result).toEqual([
        { type: 'bullet', text: 'First bullet' }
      ])
    })

    it('parses bullet points with asterisk', () => {
      const result = parseMarkdownContent('* Second bullet')
      expect(result).toEqual([
        { type: 'bullet', text: 'Second bullet' }
      ])
    })

    it('parses plain text', () => {
      const result = parseMarkdownContent('Plain text content')
      expect(result).toEqual([
        { type: 'text', text: 'Plain text content' }
      ])
    })

    it('skips empty lines', () => {
      const result = parseMarkdownContent('## Header\n\n- Bullet')
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ type: 'heading', text: 'Header', level: 2 })
      expect(result[1]).toEqual({ type: 'bullet', text: 'Bullet' })
    })

    it('handles mixed content', () => {
      const content = `# Resume
## Experience
- Led team projects
- Developed features

Plain paragraph text`
      const result = parseMarkdownContent(content)
      expect(result).toHaveLength(5)
      expect(result[0].type).toBe('heading')
      expect(result[1].type).toBe('heading')
      expect(result[2].type).toBe('bullet')
      expect(result[3].type).toBe('bullet')
      expect(result[4].type).toBe('text')
    })

    it('handles whitespace in headers', () => {
      const result = parseMarkdownContent('##   Header with spaces  ')
      expect(result[0].text).toBe('Header with spaces')
    })
  })

  describe('stripMarkdownFormatting', () => {
    it('removes bold formatting', () => {
      const result = stripMarkdownFormatting('This is **bold** text')
      expect(result).toBe('This is bold text')
    })

    it('removes italic formatting', () => {
      const result = stripMarkdownFormatting('This is *italic* text')
      expect(result).toBe('This is italic text')
    })

    it('removes multiple bold markings', () => {
      const result = stripMarkdownFormatting('**bold** and **more bold**')
      expect(result).toBe('bold and more bold')
    })

    it('removes mixed formatting', () => {
      const result = stripMarkdownFormatting('This has **bold** and *italic* text')
      expect(result).toBe('This has bold and italic text')
    })

    it('handles nested markers correctly', () => {
      const result = stripMarkdownFormatting('Text *with **nested** formatting*')
      expect(result).toBe('Text with nested formatting')
    })

    it('leaves plain text unchanged', () => {
      const result = stripMarkdownFormatting('Plain text without any formatting')
      expect(result).toBe('Plain text without any formatting')
    })
  })

  describe('createTextRuns', () => {
    it('creates a single text run for plain text', () => {
      const result = createTextRuns('Plain text')
      expect(result).toHaveLength(1)
      expect(result[0]).toBeDefined()
    })

    it('creates text runs for bold formatted text', () => {
      const result = createTextRuns('**bold text**')
      expect(result).toHaveLength(1)
      expect(result[0]).toBeDefined()
    })

    it('creates multiple runs for mixed content', () => {
      const result = createTextRuns('Normal **bold** normal')
      // Should create multiple runs for mixed bold and normal text
      expect(result.length).toBeGreaterThan(1)
    })

    it('creates runs for multiple bold sections', () => {
      const result = createTextRuns('**first** middle **second**')
      // Should create multiple runs for multiple bold sections
      expect(result.length).toBeGreaterThanOrEqual(3)
    })

    it('creates text runs without errors for various inputs', () => {
      const inputs = [
        'Plain text',
        '**bold**',
        'Mixed **bold** content',
        '**start** middle **end**',
      ]

      inputs.forEach(input => {
        const result = createTextRuns(input)
        expect(result).toBeDefined()
        expect(Array.isArray(result)).toBe(true)
        result.forEach(run => {
          expect(run).toBeDefined()
        })
      })
    })

    it('handles empty strings', () => {
      const result = createTextRuns('')
      expect(result).toHaveLength(0)
    })
  })
})
