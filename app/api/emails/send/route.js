import { NextResponse } from 'next/server';
import Database from '../../../../lib/database';
import EmailService from '../../../../lib/emailService';

const db = new Database();
const emailService = new EmailService();

export async function POST(request) {
  try {
    // Log environment variables
    console.log('=== EMAIL SEND API - Environment Check ===');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS set:', !!process.env.EMAIL_PASS);
    console.log('EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);
    console.log('==========================================');
    
    const { emails, cvPath } = await request.json();
    
    console.log('Received request:', { emails: emails?.length, cvPath });
    
    if (!emails || !Array.isArray(emails)) {
      return NextResponse.json(
        { error: 'Emails array is required' },
        { status: 400 }
      );
    }

    // Clean email data
    const cleanedEmails = emails.map(email => ({
      ...email,
      email: email.email?.replace(/^"(.*)"$/, '$1').trim() || email.email
    }));

    console.log('Cleaned emails:', cleanedEmails);

    // Verify email service connection
    const connectionTest = await emailService.verifyConnection();
    if (!connectionTest.success) {
      console.error('Email service connection failed:', connectionTest.error);
      return NextResponse.json(
        { error: 'Email service not configured properly', details: connectionTest.error },
        { status: 500 }
      );
    }

    // Send emails
    const results = await emailService.sendBulkEmails(cleanedEmails, cvPath);
    
    console.log('Email sending results:', results);
    
    // Update database with successful sends
    const successfulSends = results.filter(result => result.success);
    const currentDate = new Date().toISOString();
    
    for (const result of successfulSends) {
      await db.updateApplicationStatus(result.email, true, currentDate);
    }
    
    return NextResponse.json({
      message: 'Email sending completed',
      totalSent: successfulSends.length,
      totalFailed: results.length - successfulSends.length,
      results: results
    });
    
  } catch (error) {
    console.error('Error sending emails:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

