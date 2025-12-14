const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const { generateEmailTemplate } = require('./emailTemplate');

class EmailService {
  constructor() {
    // You'll need to configure these with your email credentials
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // or your email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }



  async sendApplicationEmail(toEmail, name, company = null, cvPath = null) {
    try {
      const template = generateEmailTemplate({
        name: name,
        company: company || 'your company'
      });
      
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
          filename: 'github.png',
          path: path.join(process.cwd(), 'public', 'github.png'),
          cid: 'github'
        }
      ];

      mailOptions.attachments.push(...iconAttachments);

      // Add CV attachment - use provided path or default CV
      const defaultCvPath = path.join(process.cwd(), 'public', 'Niketan-Wadaskar-Resume.pdf');
      const cvToUse = cvPath || defaultCvPath;
      
      // Always try to attach CV from public folder
      if (fs.existsSync(defaultCvPath)) {
        mailOptions.attachments.push({
          filename: 'Niketan-Wadaskar-Resume.pdf',
          path: defaultCvPath,
          contentType: 'application/pdf'
        });
      } else {
        console.warn('CV file not found at:', defaultCvPath);
        // List files in public directory for debugging
        try {
          const publicFiles = fs.readdirSync(path.join(process.cwd(), 'public'));
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
        emailData.company,
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
      
      await this.transporter.verify();
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

