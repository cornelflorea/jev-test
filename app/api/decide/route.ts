import { NextResponse } from 'next/server';

const TYPESAFE_AI_URL = 'https://api.typesafe.ai/v1/systemone';

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

    const apiKey = process.env.TYPESAFE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'TYPESAFE_AI_API_KEY is not configured.' },
        { status: 500 }
      );
    }

    const upstream = await fetch(TYPESAFE_AI_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        state: input,
        model: 'jev-latest',
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
            type: 'noul',
            instructions: 'Is the customer reporting an active system blocking outage?',
          },
        },
      }),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return NextResponse.json(
        { success: false, error: data?.detail?.message || 'Jev evaluation failed.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      decision: data.answers,
      usage: data.usage,
    });
  } catch (err: any) {
    console.error('Jev Evaluation Error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'An unknown error occurred during evaluation.' },
      { status: 500 }
    );
  }
}
