import { experimental_evaluate as evaluate } from 'ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { input } = await req.json();

    const result = await evaluate({
      model: 'typesafe-ai/jev',
      state: input,
      questions: {
        // Correct key for choice is 'criteria' (map of option -> description)
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
        // Correct key for score is 'criteria' (array of scale labels)
        sentimentScore: {
          type: 'score',
          instructions: 'Score the customer sentiment.',
          criteria: ['Frustrated/Angry', 'Neutral', 'Delighted/Satisfied'],
        },
        // Correct type is 'boolean'
        isUrgent: {
          type: 'boolean',
          instructions: 'Is the customer experiencing an active blocking outage?',
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