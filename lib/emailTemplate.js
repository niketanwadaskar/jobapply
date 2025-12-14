// emailTemplate.js

function capitalizeName(name) {
  if (!name) return null;
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

/**
 * Safe: accepts null/undefined and still uses defaults.
 * Usage: generateEmailTemplate(null) or generateEmailTemplate({ recipientName: 'Foo' })
 */
export function generateEmailTemplate(arg) {
  const opts = arg == null ? {} : arg;

  const {
    name = null,
    company = 'your company',
    myName = 'Niketan Wadaskar',
    phone = '+91 7387162902',
    linkedin = 'https://www.linkedin.com/in/niketan-wadaskar-3188321a0/',
    github = 'https://github.com/niketanwadaskar',
    isImmediateJoiner = true,
    yearsExperience = "3.7",
    title = 'Frontend Developer',
  } = opts;

  // Use the name if provided, otherwise default to "Hiring Manager"
  const recipientName = name && name.trim() !== '' ? capitalizeName(name) : null;
  const greeting = recipientName ? `Dear ${recipientName},` : 'Dear Hiring Manager,';
  const joinerText = isImmediateJoiner
    ? "I'm available to join immediately and would love to discuss how I can contribute to"
    : "I'm available to join as per your timeline and would love to discuss how I can contribute to";

  return {
    subject: `Application for ${title} – ${company}`,
    greeting,
    htmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; padding: 20px; color: #111;">
        <p><strong>${greeting}</strong></p>

        <p>I'm applying for the <strong>${title}</strong> role at <strong>${company}</strong>. With <strong>${yearsExperience} years of experience</strong>, I build fast, scalable, and maintainable web applications using <strong>React, Next.js, and TypeScript</strong>, backed by <strong>Node.js and Express</strong> for API development.</p>

        <p>I've worked on production systems involving SSR/SSG, performance optimization, clean component architecture, REST APIs, authentication flows, and backend integrations. I'm comfortable owning features end-to-end—from UI to server logic—and collaborating closely with product and backend teams.</p>

        <p>${joinerText} <strong>${company}</strong>'s frontend and web platform initiatives.</p>

        <p>Best regards,<br/>
        <strong>${myName}</strong></p>

        <div style="margin-top: 18px; font-size:14px; color:#333;">
          <p style="margin: 4px 0;">📞 ${phone}</p>
          <p style="margin: 4px 0;">🔗 LinkedIn: <a href="${linkedin}" style="color:#0077B5; text-decoration:underline;">${linkedin}</a></p>
          <p style="margin: 4px 0;">💻 GitHub: <a href="${github}" style="color:#333; text-decoration:underline;">${github}</a></p>
        </div>
      </div>
    `,
    textBody: `
${greeting}

I'm applying for the ${title} role at ${company}. With ${yearsExperience} years of experience, I build fast, scalable, and maintainable web applications using React, Next.js, and TypeScript, backed by Node.js and Express for API development.

I've worked on production systems involving SSR/SSG, performance optimization, clean component architecture, REST APIs, authentication flows, and backend integrations. I'm comfortable owning features end-to-end—from UI to server logic—and collaborating closely with product and backend teams.

${joinerText} ${company}'s frontend and web platform initiatives.

Best regards,
${myName}

📞 ${phone}
🔗 LinkedIn: ${linkedin}
💻 GitHub: ${github}
    `.trim()
  };
}

export function generatePreviewTemplate(arg) {
  const opts = arg == null ? {} : arg;

  const {
    name,
    company = 'your company',
    myName = 'Niketan Wadaskar',
    phone = '+91 7387162902',
    linkedin = 'https://www.linkedin.com/in/niketan-wadaskar-3188321a0/',
    github = 'https://github.com/niketanwadaskar',
    yearsExperience = 3.7,
    title = 'Frontend Developer',
    isImmediateJoiner = true,
  } = opts;

  // Use the name if provided, otherwise default to "Hiring Manager"
  const recipientName = name && name.trim() !== '' ? capitalizeName(name) : null;
  const greeting = recipientName ? `Dear ${recipientName},` : 'Dear Hiring Manager,';
  const joinerText = isImmediateJoiner
    ? "I'm available to join immediately and would love to discuss how I can contribute to"
    : "I'm available to join as per your timeline and would love to discuss how I can contribute to";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 680px; margin:0 auto; padding:20px; color:#111;">
      <p><strong>${greeting}</strong></p>

      <p>I'm applying for the <strong>${title}</strong> role at <strong>${company}</strong>. With <strong>${yearsExperience} years of experience</strong>, I build fast, scalable, and maintainable web applications using <strong>React, Next.js, and TypeScript</strong>, backed by <strong>Node.js and Express</strong> for API development.</p>

      <p>I've worked on production systems involving SSR/SSG, performance optimization, clean component architecture, REST APIs, authentication flows, and backend integrations. I'm comfortable owning features end-to-end—from UI to server logic—and collaborating closely with product and backend teams.</p>

      <p>${joinerText} <strong>${company}</strong>'s frontend and web platform initiatives.</p>

      <p>Best regards,<br/><strong>${myName}</strong></p>

      <div style="margin-top:18px; font-size:14px; color:#333;">
        <p style="margin: 4px 0;">📞 ${phone}</p>
        <p style="margin: 4px 0;">🔗 LinkedIn: <a href="${linkedin}" style="color:#0077B5; text-decoration:underline;">${linkedin}</a></p>
        <p style="margin: 4px 0;">💻 GitHub: <a href="${github}" style="color:#333; text-decoration:underline;">${github}</a></p>
      </div>
    </div>
  `;
}
