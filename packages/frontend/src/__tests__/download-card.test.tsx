import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DownloadCard } from '@/components/download-card'
import type { GenerateResponse } from '@cvrx/shared'

// Mock the api module
vi.mock('@/lib/api', () => ({
  getDownloadUrl: (path: string) => `http://example.com${path}`,
}))

describe('DownloadCard Component', () => {
  const mockResult: GenerateResponse = {
    jobId: '123e4567-e89b-12d3-a456-426614174000',
    resumeDownloadUrl: '/api/download/123e4567-e89b-12d3-a456-426614174000/resume',
    cvDownloadUrl: '/api/download/123e4567-e89b-12d3-a456-426614174000/cv',
    coverLetterDownloadUrl: '/api/download/123e4567-e89b-12d3-a456-426614174000/cover_letter',
    outputFormat: 'pdf',
  }

  it('renders the success card title', () => {
    render(<DownloadCard result={mockResult} />)
    expect(screen.getByText('Your Documents Are Ready')).toBeInTheDocument()
  })

  it('renders the description', () => {
    render(<DownloadCard result={mockResult} />)
    expect(screen.getByText(/tailored resume, CV, and cover letter/)).toBeInTheDocument()
  })

  it('displays PDF format when outputFormat is pdf', () => {
    render(<DownloadCard result={mockResult} />)
    expect(screen.getByText('Resume (PDF)')).toBeInTheDocument()
    expect(screen.getByText('CV (PDF)')).toBeInTheDocument()
    expect(screen.getByText('Cover Letter (PDF)')).toBeInTheDocument()
  })

  it('displays DOCX format when outputFormat is docx', () => {
    const docxResult: GenerateResponse = {
      ...mockResult,
      outputFormat: 'docx',
    }
    render(<DownloadCard result={docxResult} />)
    expect(screen.getByText('Resume (DOCX)')).toBeInTheDocument()
    expect(screen.getByText('CV (DOCX)')).toBeInTheDocument()
    expect(screen.getByText('Cover Letter (DOCX)')).toBeInTheDocument()
  })

  it('renders three download buttons', () => {
    render(<DownloadCard result={mockResult} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(3)
  })

  it('sets correct href for resume download link', () => {
    render(<DownloadCard result={mockResult} />)
    const resumeLink = screen.getByRole('link', { name: /Resume/ })
    expect(resumeLink).toHaveAttribute('href', expect.stringContaining('resume'))
    expect(resumeLink).toHaveAttribute('download')
  })

  it('sets correct href for CV download link', () => {
    render(<DownloadCard result={mockResult} />)
    const cvLink = screen.getByRole('link', { name: /CV/ })
    expect(cvLink).toHaveAttribute('href', expect.stringContaining('cv'))
    expect(cvLink).toHaveAttribute('download')
  })

  it('sets correct href for cover letter download link', () => {
    render(<DownloadCard result={mockResult} />)
    const coverLetterLink = screen.getByRole('link', { name: /Cover Letter/ })
    expect(coverLetterLink).toHaveAttribute('href', expect.stringContaining('cover_letter'))
    expect(coverLetterLink).toHaveAttribute('download')
  })

  it('applies proper styling classes to links', () => {
    render(<DownloadCard result={mockResult} />)
    const links = screen.getAllByRole('link')
    links.forEach(link => {
      expect(link).toHaveClass('flex-1')
    })
  })

  it('renders download icons', () => {
    const { container } = render(<DownloadCard result={mockResult} />)
    // Check that SVG icons are rendered (lucide-react icons)
    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
  })
})
