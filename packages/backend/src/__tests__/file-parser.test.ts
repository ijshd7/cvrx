import { describe, it, expect, vi, beforeEach } from 'vitest'
import { parseResume } from '../services/file-parser'

// Mock the external modules
vi.mock('pdf-parse', () => ({
  default: vi.fn(),
}))

vi.mock('mammoth', () => ({
  default: {
    extractRawText: vi.fn(),
  },
}))

import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'

describe('File Parser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('parseResume', () => {
    it('parses PDF files', async () => {
      const mockBuffer = Buffer.from('pdf content')
      const expectedText = 'Parsed resume text'
      vi.mocked(pdfParse).mockResolvedValue({ text: expectedText } as any)

      const result = await parseResume(mockBuffer, 'application/pdf')

      expect(result).toBe(expectedText)
      expect(pdfParse).toHaveBeenCalledWith(mockBuffer)
    })

    it('parses DOCX files', async () => {
      const mockBuffer = Buffer.from('docx content')
      const expectedText = 'Parsed resume from docx'
      vi.mocked(mammoth.extractRawText).mockResolvedValue({ value: expectedText } as any)

      const result = await parseResume(mockBuffer, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')

      expect(result).toBe(expectedText)
      expect(mammoth.extractRawText).toHaveBeenCalledWith({ buffer: mockBuffer })
    })

    it('parses plain text files', async () => {
      const textContent = 'John Doe\nSoftware Engineer'
      const mockBuffer = Buffer.from(textContent)

      const result = await parseResume(mockBuffer, 'text/plain')

      expect(result).toBe(textContent)
    })

    it('throws error for unsupported MIME type', async () => {
      const mockBuffer = Buffer.from('content')

      await expect(parseResume(mockBuffer, 'application/unknown')).rejects.toThrow(
        'Unsupported file type'
      )
    })

    it('throws error when PDF has no extractable text', async () => {
      const mockBuffer = Buffer.from('pdf content')
      vi.mocked(pdfParse).mockResolvedValue({ text: '   ' } as any)

      await expect(parseResume(mockBuffer, 'application/pdf')).rejects.toThrow(
        /Could not extract text from PDF/
      )
    })

    it('throws error when DOCX has no extractable text', async () => {
      const mockBuffer = Buffer.from('docx content')
      vi.mocked(mammoth.extractRawText).mockResolvedValue({ value: '' } as any)

      await expect(parseResume(mockBuffer, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')).rejects.toThrow(
        'Could not extract text from DOCX file'
      )
    })

    it('trims whitespace from PDF text', async () => {
      const mockBuffer = Buffer.from('pdf')
      const textWithWhitespace = '  Resume text with whitespace  \n'
      vi.mocked(pdfParse).mockResolvedValue({ text: textWithWhitespace } as any)

      const result = await parseResume(mockBuffer, 'application/pdf')

      expect(result).toBe('Resume text with whitespace')
    })

    it('trims whitespace from DOCX text', async () => {
      const mockBuffer = Buffer.from('docx')
      const textWithWhitespace = '  Resume from docx  \n'
      vi.mocked(mammoth.extractRawText).mockResolvedValue({ value: textWithWhitespace } as any)

      const result = await parseResume(mockBuffer, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')

      expect(result).toBe('Resume from docx')
    })
  })
})
