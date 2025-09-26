import { NextResponse } from 'next/server';
import EmailService from '../../../lib/emailService';

export async function GET(request) {
  try {
    const emailService = new EmailService();
    
    // Test email configuration
    const connectionTest = await emailService.verifyConnection();
    
    return NextResponse.json({
      emailConfig: {
        user: process.env.EMAIL_USER,
        passSet: !!process.env.EMAIL_PASS,
        passLength: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0,
        envFileExists: 'Check server console for details'
      },
      connectionTest,
      message: 'Check server console for detailed environment variable info'
    });
    
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error.message },
      { status: 500 }
    );
  }
}
