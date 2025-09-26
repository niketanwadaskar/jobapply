const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const { generateEmailTemplate } = require('./emailTemplate');

class EmailService {
  constructor() {
    // Log environment variables in EmailService constructor
    console.log('=== EMAIL SERVICE CONSTRUCTOR - Environment Check ===');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS set:', !!process.env.EMAIL_PASS);
    console.log('EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);
    console.log('Using fallback user:', process.env.EMAIL_USER);
    console.log('Using fallback pass:', process.env.EMAIL_PASS ? '***SET***' : '***NOT SET***');
    console.log('=====================================================');
    
    // You'll need to configure these with your email credentials
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // or your email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }



  async sendApplicationEmail(toEmail, name, cvPath = null) {
    try {
      const template = generateEmailTemplate(name);
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: toEmail,
        subject: template.subject,
        html: template.htmlBody,
        text: template.textBody,
        attachments: []
      };

      // Add icon attachments
      const iconAttachments = [
        {
          filename: 'mobile.png',
          path: path.join(process.cwd(), 'public', 'mobile.png'),
          cid: 'mobile'
        },
        {
          filename: 'linkedin.png',
          path: path.join(process.cwd(), 'public', 'linkedin.png'),
          cid: 'linkedin'
        },
        {
          filename: 'portfolio.png',
          path: path.join(process.cwd(), 'public', 'portfolio.png'),
          cid: 'portfolio'
        },
        {
          filename: 'github.png',
          path: path.join(process.cwd(), 'public', 'github.png'),
          cid: 'github'
        }
      ];

      mailOptions.attachments.push(...iconAttachments);

      // Add CV attachment - use provided path or default CV
      const defaultCvPath = path.join(process.cwd(), 'public', 'Prashant cv new.pdf');
      const cvToUse = cvPath || defaultCvPath;
      
      console.log('Looking for CV at:', cvToUse);
      console.log('CV exists:', fs.existsSync(cvToUse));
      
      // Always try to attach CV from public folder
      if (fs.existsSync(defaultCvPath)) {
        mailOptions.attachments.push({
          filename: 'Prashant_Singh_CV.pdf',
          path: defaultCvPath,
          contentType: 'application/pdf'
        });
        console.log('CV attached successfully from public folder');
      } else {
        console.warn('CV file not found at:', defaultCvPath);
        // List files in public directory for debugging
        try {
          const publicFiles = fs.readdirSync(path.join(process.cwd(), 'public'));
          console.log('Files in public folder:', publicFiles);
        } catch (err) {
          console.error('Error reading public folder:', err);
        }
      }

      const result = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendBulkEmails(emails, cvPath = null) {
    const results = [];
    
    for (const emailData of emails) {
      const result = await this.sendApplicationEmail(
        emailData.email, 
        emailData.name, 
        cvPath
      );
      
      results.push({
        email: emailData.email,
        ...result
      });
      
      // Add delay between emails to avoid being flagged as spam
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    return results;
  }

  async verifyConnection() {
    try {
      console.log('Verifying email connection...');
      console.log('Email user:', process.env.EMAIL_USER);
      console.log('Email pass set:', !!process.env.EMAIL_PASS);
      
      await this.transporter.verify();
      console.log('Email service verified successfully');
      return { success: true, message: 'Email service is ready' };
    } catch (error) {
      console.error('Email verification failed:', error);
      console.error('Error details:', {
        code: error.code,
        command: error.command,
        response: error.response,
        message: error.message
      });
      return { success: false, error: error.message };
    }
  }
}

module.exports = EmailService;

