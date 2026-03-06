import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from "docx";
import PDFDocument from "pdfkit";
import type { OutputFormat } from "@cvrx/shared";

export async function generateDocument(
  content: string,
  format: OutputFormat,
  title: string
): Promise<Buffer> {
  if (format === "docx") {
    return generateDocx(content, title);
  }
  return generatePdf(content, title);
}

export function parseMarkdownContent(
  content: string
): Array<{ type: "heading" | "bullet" | "text"; text: string; level?: number }> {
  const lines = content.split("\n");
  const parsed: Array<{
    type: "heading" | "bullet" | "text";
    text: string;
    level?: number;
  }> = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("## ")) {
      parsed.push({ type: "heading", text: trimmed.replace(/^##\s+/, ""), level: 2 });
    } else if (trimmed.startsWith("### ")) {
      parsed.push({ type: "heading", text: trimmed.replace(/^###\s+/, ""), level: 3 });
    } else if (trimmed.startsWith("# ")) {
      parsed.push({ type: "heading", text: trimmed.replace(/^#\s+/, ""), level: 1 });
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      parsed.push({ type: "bullet", text: trimmed.replace(/^[-*]\s+/, "") });
    } else {
      parsed.push({ type: "text", text: trimmed });
    }
  }

  return parsed;
}

export function stripMarkdownFormatting(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1");
}

export function createTextRuns(text: string): TextRun[] {
  const runs: TextRun[] = [];
  const parts = text.split(/(\*\*.*?\*\*)/g);

  for (const part of parts) {
    if (part.startsWith("**") && part.endsWith("**")) {
      runs.push(new TextRun({ text: part.slice(2, -2), bold: true, size: 22 }));
    } else if (part) {
      runs.push(new TextRun({ text: part, size: 22 }));
    }
  }

  return runs;
}

async function generateDocx(content: string, title: string): Promise<Buffer> {
  const parsed = parseMarkdownContent(content);
  const children: Paragraph[] = [];

  // Title
  children.push(
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, size: 32 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  for (const item of parsed) {
    if (item.type === "heading") {
      const level =
        item.level === 1
          ? HeadingLevel.HEADING_1
          : item.level === 2
            ? HeadingLevel.HEADING_2
            : HeadingLevel.HEADING_3;

      children.push(
        new Paragraph({
          text: stripMarkdownFormatting(item.text),
          heading: level,
          spacing: { before: 240, after: 120 },
        })
      );
    } else if (item.type === "bullet") {
      children.push(
        new Paragraph({
          children: createTextRuns(item.text),
          bullet: { level: 0 },
          spacing: { after: 60 },
        })
      );
    } else {
      children.push(
        new Paragraph({
          children: createTextRuns(item.text),
          spacing: { after: 120 },
        })
      );
    }
  }

  const doc = new Document({
    sections: [{ children }],
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}

function generatePdf(content: string, title: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 50, bottom: 50, left: 60, right: 60 },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Title
    doc.fontSize(18).font("Helvetica-Bold").text(title, { align: "center" });
    doc.moveDown(0.5);

    const parsed = parseMarkdownContent(content);

    for (const item of parsed) {
      const plain = stripMarkdownFormatting(item.text);

      if (item.type === "heading") {
        const fontSize = item.level === 1 ? 16 : item.level === 2 ? 14 : 12;
        doc.moveDown(0.5);
        doc.fontSize(fontSize).font("Helvetica-Bold").text(plain);
        doc.moveDown(0.3);
      } else if (item.type === "bullet") {
        doc.fontSize(10).font("Helvetica").text(`  •  ${plain}`, {
          indent: 10,
        });
      } else {
        doc.fontSize(10).font("Helvetica").text(plain);
      }
    }

    doc.end();
  });
}
