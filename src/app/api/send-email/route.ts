import { Resend } from 'resend';
import { NextResponse } from 'next/server';

// Initialize Resend lazily to avoid crashing on startup if the key is missing
let resendInstance: Resend | null = null;

function getResend() {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is not configured in environment variables.');
    }
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, subject, html } = body;

    // Basic validation
    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, or html' },
        { status: 400 }
      );
    }

    // Email format validation (simple regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: 'Invalid recipient email address' },
        { status: 400 }
      );
    }

    const resend = getResend();
    
    // Domain Guard: Ensure we don't try to send FROM a public provider like Gmail
    // which Resend will always reject.
    let fromEmail = process.env.FROM_EMAIL || 'guide@social-exhaustion.com';
    const publicProviders = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'];
    
    const isPublicProvider = publicProviders.some(provider => fromEmail.toLowerCase().includes(provider));
    if (isPublicProvider) {
      console.warn(`FROM_EMAIL (${fromEmail}) is a public provider. Falling back to verified domain.`);
      fromEmail = 'guide@social-exhaustion.com';
    }

    const fromName = process.env.FROM_NAME || 'Recharge AI';

    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Email API Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred while sending the email.' },
      { status: 500 }
    );
  }
}
