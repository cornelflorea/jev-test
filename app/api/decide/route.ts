import { NextResponse } from 'next/server';
import { experimental_evaluate as evaluate } from 'ai';

export async function POST(req: Request) {
  try {
    const { userText } = await req.json();

    // Send context to Jev to get sub-second evaluations
    const result = await evaluate({
      model: 'typesafe-ai/jev',
      state: userText,
      questions: {
        category: {
          type: 'choice',
          options: ['support', 'feature_request', 'bug_report', 'general'],
          instructions: 'Categorize the user inquiry.',
        },
        priorityScore: {
          type: 'score',
          range: [1, 5],
          instructions: 'Rate the urgency from 1 (low) to 5 (critical).',
        },
        isSpam: {
          type: 'noul', // Boolean probability
          instructions: 'Is this promotional or spam content?',
        },
      },
    });

    return NextResponse.json({ success: true, decision: result });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}