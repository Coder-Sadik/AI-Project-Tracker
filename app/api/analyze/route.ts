import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type, Schema } from '@google/genai';

function getGemini() {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'missing' });
}

const SYSTEM_PROMPT = `Role: You are a senior technical project manager and business analyst specializing in web development.

Task: Analyze the provided client conversation, brief, or document. Extract the exact project scope into structured requirements.

Strict Constraints for Missing Data:
* Do not guess, infer, or fabricate any information.
* If a specific data point (like price, deadline, or page count) is not explicitly stated in the text, you must output [REQUIRES CLARIFICATION].

Output Requirements:
You must extract information into the following categories. Note that Budget and Timeline are top-level properties, while the rest are individual requirements:

1. Project Overview: Agreed Price/Budget and Deadline/Timeline (output at the top level of JSON)
2. Site Architecture: Total Estimated Pages and Page Breakdown
3. Core Requirements & Features: Functionality, Integrations, and Design/Branding
4. Operational Agreements: Assets, Logistics, and Post-Launch
5. Clarifications Needed: For any [REQUIRES CLARIFICATION] tags, generate polite, professional questions to send to the client.

IMPORTANT: You must respond ONLY with valid JSON in this exact format. Map the categories above into the requirements array:
{
  "projectName": "(Identify the core build or service)",
  "budget": "(Extract exact amount or [REQUIRES CLARIFICATION])",
  "timeline": "(Extract specific dates or [REQUIRES CLARIFICATION])",
  "requirements": [
    { "description": "Total Estimated Pages: ...", "confidence": 0.9 },
    { "description": "Page Breakdown: ...", "confidence": 0.9 },
    { "description": "Functionality: ...", "confidence": 1.0 },
    { "description": "Integrations: ...", "confidence": 1.0 },
    { "description": "Design/Branding: ...", "confidence": 1.0 },
    { "description": "Assets: ...", "confidence": 1.0 },
    { "description": "Logistics: ...", "confidence": 1.0 },
    { "description": "Post-Launch: ...", "confidence": 1.0 },
    { "description": "Clarification Question: ...", "confidence": 1.0 }
  ]
}`;

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let text = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const textInput = formData.get('text') as string | null;
      const file = formData.get('file') as File | null;

      if (textInput) text += textInput + '\n\n';

      if (file) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = file.name.toLowerCase();

        if (fileName.endsWith('.txt')) {
          text += buffer.toString('utf-8');
        } else if (fileName.endsWith('.pdf')) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const pdfMod = await import('pdf-parse') as any;
            const pdfFn = pdfMod.default ?? pdfMod;
            const parsed = await pdfFn(buffer);
            text += parsed.text;

          } catch {
            return NextResponse.json(
              { error: 'Failed to parse PDF file' },
              { status: 400 }
            );
          }
        } else if (fileName.endsWith('.docx')) {
          try {
            const mammoth = await import('mammoth');
            const result = await mammoth.extractRawText({ buffer });
            text += result.value;
          } catch {
            return NextResponse.json(
              { error: 'Failed to parse DOCX file' },
              { status: 400 }
            );
          }
        } else {
          return NextResponse.json(
            { error: 'Unsupported file type. Use PDF, DOCX, or TXT.' },
            { status: 400 }
          );
        }
      }
    } else {
      const body = await req.json();
      text = body.text || '';
    }

    if (!text.trim()) {
      return NextResponse.json(
        { error: 'No text content provided' },
        { status: 400 }
      );
    }

    const ai = getGemini();
    
    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        projectName: {
          type: Type.STRING,
        },
        budget: {
          type: Type.STRING,
        },
        timeline: {
          type: Type.STRING,
        },
        requirements: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              description: {
                type: Type.STRING,
              },
              confidence: {
                type: Type.NUMBER,
              },
            },
            required: ["description", "confidence"],
          },
        },
      },
      required: ["projectName", "requirements"],
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Extract requirements from this document:\n\n${text.slice(0, 15000)}`,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const raw = response.text;
    if (!raw) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(raw);
    return NextResponse.json({
      projectName: parsed.projectName || 'Untitled Project',
      budget: parsed.budget || '[REQUIRES CLARIFICATION]',
      timeline: parsed.timeline || '[REQUIRES CLARIFICATION]',
      requirements: parsed.requirements || [],
    });
  } catch (err: unknown) {
    console.error('Analyze error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
