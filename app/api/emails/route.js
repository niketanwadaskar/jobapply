import { NextResponse } from 'next/server';
import Database from '../../../lib/database';
import EmailFilter from '../../../lib/emailFilter';

const db = new Database();

export async function POST(request) {
  try {
    // Log environment variables
    console.log('=== EMAIL ADD API - Environment Check ===');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS set:', !!process.env.EMAIL_PASS);
    console.log('EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);
    console.log('==========================================');
    
    const { emails } = await request.json();
    
    if (!emails || !Array.isArray(emails)) {
      return NextResponse.json(
        { error: 'Emails array is required' },
        { status: 400 }
      );
    }

    // Process emails: filter Gmail, remove duplicates, validate
    const processedEmails = EmailFilter.processEmailList(emails);
    
    // Check for existing emails in database
    const newEmails = await EmailFilter.checkExistingEmails(processedEmails, db);
    
    if (newEmails.length === 0) {
      return NextResponse.json({
        message: 'No new emails to add',
        processedCount: processedEmails.length,
        newCount: 0
      });
    }

    // Add new emails to database
    const result = await db.addEmails(newEmails);
    
    return NextResponse.json({
      message: 'Emails processed successfully',
      processedCount: processedEmails.length,
      newCount: result.successCount,
      duplicateCount: processedEmails.length - newEmails.length,
      gmailFilteredCount: emails.length - processedEmails.length
    });
    
  } catch (error) {
    console.error('Error processing emails:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const unappliedOnly = searchParams.get('unapplied') === 'true';
    
    const applications = unappliedOnly 
      ? await db.getUnappliedEmails()
      : await db.getAllApplications();
    
    return NextResponse.json({ applications });
    
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

