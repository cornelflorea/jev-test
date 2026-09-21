import { experimental_evaluate as evaluate } from 'ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { input } = await req.json();

    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: 'Please provide a valid input string.' },
        { status: 400 }
      );
    }

    const result = await evaluate({
      model: 'typesafe-ai/jev',
      // Ensure state is passed as a structured object
      state: {
        user_text: input,
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
          instructions: 'Score the customer sentiment from lowest (negative) to highest (positive).',
          criteria: ['Frustrated/Angry', 'Neutral', 'Delighted/Satisfied'],
        },
        isUrgent: {
          type: 'boolean',
          instructions: 'Is the customer experiencing an active blocking outage or severe loss of functionality?',
        },
      },
    });

    return NextResponse.json({
      success: true,
      decision: result.answers,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}