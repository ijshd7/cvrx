import { describe, it, expect } from 'vitest'
import { buildResumePrompt, buildCvPrompt, buildCoverLetterPrompt } from '../services/prompt-builder'

describe('Prompt Builder', () => {
  const sampleResume = `John Doe
  Senior Software Engineer

  Professional Experience:
  - Developed REST APIs using Node.js and Express
  - Led team of 5 engineers
  `

  const sampleJobDescription = `We're looking for a Senior Software Engineer with:
  - 5+ years of experience with Node.js and Express
  - Experience leading engineering teams
  - RESTful API development experience
  `

  describe('buildResumePrompt', () => {
    it('returns system and user prompts', () => {
      const result = buildResumePrompt(sampleResume, sampleJobDescription)
      expect(result).toHaveProperty('system')
      expect(result).toHaveProperty('user')
      expect(typeof result.system).toBe('string')
      expect(typeof result.user).toBe('string')
    })

    it('includes resume text in user prompt', () => {
      const result = buildResumePrompt(sampleResume, sampleJobDescription)
      expect(result.user).toContain(sampleResume)
    })

    it('includes job description in user prompt', () => {
      const result = buildResumePrompt(sampleResume, sampleJobDescription)
      expect(result.user).toContain(sampleJobDescription)
    })

    it('mentions ATS optimization in system prompt', () => {
      const result = buildResumePrompt(sampleResume, sampleJobDescription)
      expect(result.system.toLowerCase()).toContain('ats')
    })

    it('includes guidance about action verbs in system prompt', () => {
      const result = buildResumePrompt(sampleResume, sampleJobDescription)
      expect(result.system.toLowerCase()).toContain('action verb')
    })
  })

  describe('buildCvPrompt', () => {
    it('returns system and user prompts', () => {
      const result = buildCvPrompt(sampleResume, sampleJobDescription)
      expect(result).toHaveProperty('system')
      expect(result).toHaveProperty('user')
      expect(typeof result.system).toBe('string')
      expect(typeof result.user).toBe('string')
    })

    it('includes resume text in user prompt', () => {
      const result = buildCvPrompt(sampleResume, sampleJobDescription)
      expect(result.user).toContain(sampleResume)
    })

    it('includes job description in user prompt', () => {
      const result = buildCvPrompt(sampleResume, sampleJobDescription)
      expect(result.user).toContain(sampleJobDescription)
    })

    it('mentions comprehensive CV in system prompt', () => {
      const result = buildCvPrompt(sampleResume, sampleJobDescription)
      expect(result.system.toLowerCase()).toContain('comprehensive')
    })

    it('mentions relevance mapping in system prompt', () => {
      const result = buildCvPrompt(sampleResume, sampleJobDescription)
      expect(result.system.toLowerCase()).toContain('relevance')
    })
  })

  describe('buildCoverLetterPrompt', () => {
    it('returns system and user prompts', () => {
      const result = buildCoverLetterPrompt(sampleResume, sampleJobDescription)
      expect(result).toHaveProperty('system')
      expect(result).toHaveProperty('user')
      expect(typeof result.system).toBe('string')
      expect(typeof result.user).toBe('string')
    })

    it('includes resume text in user prompt', () => {
      const result = buildCoverLetterPrompt(sampleResume, sampleJobDescription)
      expect(result.user).toContain(sampleResume)
    })

    it('includes job description in user prompt', () => {
      const result = buildCoverLetterPrompt(sampleResume, sampleJobDescription)
      expect(result.user).toContain(sampleJobDescription)
    })

    it('mentions single-page format in system prompt', () => {
      const result = buildCoverLetterPrompt(sampleResume, sampleJobDescription)
      expect(result.system.toLowerCase()).toContain('single-page')
    })

    it('mentions hiring manager greeting in system prompt', () => {
      const result = buildCoverLetterPrompt(sampleResume, sampleJobDescription)
      expect(result.system).toContain('Dear Hiring Manager')
    })
  })
})
