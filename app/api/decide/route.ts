import { experimental_evaluate as evaluate } from 'ai';
import { typeSafeAi } from '@ai-sdk/typesafe-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input = body?.input;

    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: 'Input must be a non-empty string.' },
        { status: 400 }
      );
    }

    // Call Jev model directly via TypeSafe provider
    const result = await evaluate({
      model: typeSafeAi.evaluationModel('jev-latest'),
      state: {
        message: input,
      },
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
    });
  } catch (err: any) {
    console.error('Jev Evaluation Error:', err);
    return NextResponse.json(
      {
        error: err.message || 'An unknown error occurred during evaluation.',
        details: String(err),
      },
      { status: 500 }
    );
  }
}