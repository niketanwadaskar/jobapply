class EmailFilter {
  static filterGmailEmails(emails) {
    return emails.filter(email => {
      const emailStr = typeof email === 'string' ? email : email.email || email;
      const lowerEmail = emailStr.toLowerCase();
      
      // Filter out personal email providers
      const personalEmailProviders = [
        '@gmail.com',
        '@yahoo.com',
        '@hotmail.com',
        '@outlook.com',
        '@live.com',
        '@icloud.com',
        '@aol.com',
        '@protonmail.com',
        '@zoho.com'
      ];
      
      return !personalEmailProviders.some(provider => lowerEmail.includes(provider));
    });
  }

  static removeDuplicates(emails) {
    const seen = new Set();
    return emails.filter(email => {
      const emailStr = typeof email === 'string' ? email : email.email || email;
      if (seen.has(emailStr.toLowerCase())) {
        return false;
      }
      seen.add(emailStr.toLowerCase());
      return true;
    });
  }

  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static extractCompanyFromEmail(email) {
    const domain = email.split('@')[1];
    if (!domain) return null;
    
    // Remove common subdomains and extract company name
    const companyName = domain
      .replace(/^(www\.|mail\.|hr\.|jobs\.|careers\.)/, '')
      .split('.')[0];
    
    return companyName.charAt(0).toUpperCase() + companyName.slice(1);
  }

  static suggestNameFromEmail(email) {
    const localPart = email.split('@')[0].toLowerCase();
    
    // Check for common HR/Jobs patterns
    const hrPatterns = ['hr', 'jobs', 'careers', 'recruitment', 'hiring', 'talent', 'people'];
    if (hrPatterns.some(pattern => localPart.includes(pattern))) {
      return 'Hiring Manager';
    }
    
    // Check for company patterns
    const companyPatterns = ['company', 'corp', 'inc', 'ltd', 'llc', 'group'];
    if (companyPatterns.some(pattern => localPart.includes(pattern))) {
      return 'Hiring Manager';
    }
    
    // Extract name from email like john.singh@company.com
    if (localPart.includes('.')) {
      const nameParts = localPart.split('.');
      if (nameParts.length >= 2) {
        // Filter out common non-name parts
        const filteredParts = nameParts.filter(part => 
          !['admin', 'info', 'contact', 'support', 'sales', 'marketing'].includes(part)
        );
        
        if (filteredParts.length >= 2) {
          return filteredParts.map(part => 
            part.charAt(0).toUpperCase() + part.slice(1)
          ).join(' ');
        }
      }
    }
    
    // If it's a single word and not a common pattern, capitalize it
    if (localPart.length > 0 && !localPart.includes('.') && 
        !['admin', 'info', 'contact', 'support', 'sales', 'marketing', 'hr', 'jobs'].includes(localPart)) {
      return localPart.charAt(0).toUpperCase() + localPart.slice(1);
    }
    
    return null;
  }

  static processEmailList(emails) {
    // Convert to array if single email
    const emailArray = Array.isArray(emails) ? emails : [emails];
    
    // Clean email data - remove extra quotes
    const cleanedEmails = emailArray.map(email => {
      if (typeof email === 'string') {
        return email.replace(/^"(.*)"$/, '$1').trim();
      } else if (email && email.email) {
        return {
          ...email,
          email: email.email.replace(/^"(.*)"$/, '$1').trim()
        };
      }
      return email;
    });
    
    // Filter out Gmail emails
    const filteredEmails = this.filterGmailEmails(cleanedEmails);
    
    // Remove duplicates
    const uniqueEmails = this.removeDuplicates(filteredEmails);
    
    // Validate emails and add metadata
    const processedEmails = uniqueEmails.map(email => {
      const emailStr = typeof email === 'string' ? email : email.email || email;
      
      return {
        email: emailStr,
        isValid: this.validateEmail(emailStr),
        company: this.extractCompanyFromEmail(emailStr),
        suggestedName: this.suggestNameFromEmail(emailStr),
        name: typeof email === 'object' ? email.name : null
      };
    }).filter(item => item.isValid);
    
    return processedEmails;
  }

  static async checkExistingEmails(emails, database) {
    const existingEmails = new Set();
    
    for (const emailData of emails) {
      const exists = await database.checkEmailExists(emailData.email);
      if (exists) {
        existingEmails.add(emailData.email);
      }
    }
    
    return emails.filter(emailData => !existingEmails.has(emailData.email));
  }
}

module.exports = EmailFilter;

