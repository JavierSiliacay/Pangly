// src/services/ocrService.ts
// On-device text extraction from document photos.
// Runs once at save time — extracted text stored as metadata so queries are instant.
// Uses Google ML Kit Text Recognition (on-device, no cloud, no API key needed).

import TextRecognition from '@react-native-ml-kit/text-recognition';

/**
 * Extract all readable text from a document photo URI.
 * Called immediately after a user confirms a document photo (Gate 1 → Gate 2).
 *
 * @param imageUri - Local file URI of the document photo (sandboxed vault path)
 * @returns Extracted text string, or empty string if extraction fails
 */
export async function extractTextFromImage(imageUri: string): Promise<string> {
  try {
    const result = await TextRecognition.recognize(imageUri);

    if (!result || !result.blocks || result.blocks.length === 0) {
      return '';
    }

    // Join all text blocks with newlines, preserving document structure
    const text = result.blocks
      .map((block) => block.text.trim())
      .filter(Boolean)
      .join('\n');

    return text;
  } catch (error) {
    // Non-fatal — OCR failure should not block document saving
    console.warn('[ocrService] Text extraction failed:', error);
    return '';
  }
}

/**
 * Parse common Philippine government ID fields from raw OCR text.
 * Used to pre-fill Gate 2 (OCR review screen) fields for user verification.
 *
 * Returns a best-effort object — user always reviews and corrects before saving.
 */
export function parseDocumentFields(ocrText: string): {
  documentNumber?: string;
  fullName?: string;
  issueDate?: string;
  expiryDate?: string;
} {
  const lines = ocrText.split('\n').map((l) => l.trim()).filter(Boolean);

  let documentNumber: string | undefined;
  let fullName: string | undefined;
  let issueDate: string | undefined;
  let expiryDate: string | undefined;

  for (const line of lines) {
    const upper = line.toUpperCase();

    // Document / ID number patterns
    if (!documentNumber) {
      // SSS format: 03-1234567-8
      const sssMatch = line.match(/\b\d{2}-\d{7}-\d\b/);
      // Passport: 1-2 letters + 6-7 digits
      const passportMatch = line.match(/\b[A-Z]{1,2}\d{6,8}\b/);
      // Generic numeric ID: 8-15 digits possibly with dashes
      const genericMatch = line.match(/\b[\d-]{8,20}\b/);

      if (sssMatch) documentNumber = sssMatch[0];
      else if (passportMatch) passportMatch ? (documentNumber = passportMatch[0]) : null;
      else if (genericMatch && !documentNumber) documentNumber = genericMatch[0];
    }

    // Date patterns: MM/DD/YYYY, DD-MM-YYYY, YYYY-MM-DD, Month DD YYYY
    if (!issueDate || !expiryDate) {
      const dateMatch = line.match(
        /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{2}[\/\-]\d{2})\b/g
      );
      if (dateMatch) {
        if (upper.includes('ISSUE') || upper.includes('DATE OF ISSUE') || upper.includes('ISSUED')) {
          issueDate = dateMatch[0];
        } else if (upper.includes('EXPIR') || upper.includes('VALID UNTIL') || upper.includes('VALID THRU')) {
          expiryDate = dateMatch[0];
        } else {
          // Assign first date as issue, second as expiry if unmarked
          if (!issueDate) issueDate = dateMatch[0];
          else if (!expiryDate && dateMatch.length > 1) expiryDate = dateMatch[1];
        }
      }
    }

    // Name: lines with 2-3 ALL CAPS words often contain the name on Philippine IDs
    if (!fullName) {
      const nameMatch = line.match(/^([A-Z][A-Z\s,\.]+){2,}$/);
      if (nameMatch && line.length > 6 && line.length < 60) {
        fullName = line;
      }
    }
  }

  return { documentNumber, fullName, issueDate, expiryDate };
}
