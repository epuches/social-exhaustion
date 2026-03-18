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
    
    // Use an environment variable for the 'from' email, defaulting to Resend's onboarding address
    // Note: Resend requires a verified domain to send from anything other than onboarding@resend.dev
    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
    const fromName = process.env.FROM_NAME || 'Recharge AI';
    const fromField = `"${fromName}" <${fromEmail}>`;

    console.log('Sending email with payload:', {
      from: fromField,
      to,
      subject,
      htmlLength: html.length
    });

    const { data, error } = await resend.emails.send({
      from: fromField,
      to: to, // Resend accepts string or array
      subject,
      html,
    });

    if (error) {
      console.error('Resend API Error Detail:', JSON.stringify(error, null, 2));
      return NextResponse.json({ 
        error: error.message || 'Validation Error',
        details: error
      }, { status: 400 });
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
