import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export async function parseResume(
  buffer: Buffer,
  mimetype: string,
): Promise<string> {
  switch (mimetype) {
    case "application/pdf":
      return parsePdf(buffer);
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return parseDocx(buffer);
    case "text/plain":
      return buffer.toString("utf-8");
    default:
      throw new Error(`Unsupported file type: ${mimetype}`);
  }
}

async function parsePdf(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer);
  const text = data.text.trim();
  if (!text) {
    throw new Error(
      "Could not extract text from PDF. The file may be image-based. Please upload a text-based PDF or paste your resume as a .txt file.",
    );
  }
  return text;
}

async function parseDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  const text = result.value.trim();
  if (!text) {
    throw new Error("Could not extract text from DOCX file.");
  }
  return text;
}
