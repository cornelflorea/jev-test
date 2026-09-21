import { NextResponse } from 'next/server';
import { experimental_evaluate as evaluate } from 'ai';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = body?.input;

    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Input must be a non-empty string.' },
        { status: 400 }
      );
    }

    const result = await evaluate({
      model: 'typesafe-ai/jev',
      state: input,
      questions: {
        category: {
          type: 'choice',
          instructions: 'Which area does this input belong to?',
          criteria: {
            bug_report: 'Reporting a system break, error, or glitch',
            feature_request: 'Asking for new capabilities or enhancements',
            billing: 'Payment, subscription, or account issues',
            spam: 'Irrelevant or promotional text',
          },
        },
        sentimentScore: {
          type: 'score',
          instructions: 'Score customer sentiment from lowest to highest.',
          criteria: ['Frustrated', 'Neutral', 'Satisfied'],
        },
        isUrgent: {
          type: 'boolean',
          instructions: 'Is the customer reporting an active system blocking outage?',
        },
      },
    });

    return NextResponse.json({
      success: true,
      decision: result.answers,
      usage: result.usage,
    });
  } catch (err: any) {
    console.error('Jev Evaluation Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'An unknown error occurred during evaluation.' },
      { status: 500 }
    );
  }
}
