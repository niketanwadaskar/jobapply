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
    name = 'Hiring Manager',
    myName = 'Niketan Wadaskar',
    phone = '+91 7387162902',
    linkedin = 'https://www.linkedin.com/in/niketan-wadaskar-3188321a0/',
    github = 'https://github.com/niketanwadaskar',
    isImmediateJoiner = true,
    yearsExperience = "3.7",
    title = 'Frontend Developer',
  } = opts;

  const capRecipient = capitalizeName(name);
  const greeting = capRecipient ? `Dear ${capRecipient},` : 'Dear Hiring Manager,';
  const joinerText = isImmediateJoiner
    ? 'I am available to join immediately.'
    : 'I am available to join as per your timeline.';

  return {
    subject: `Application — ${title} — ${myName}`,
    greeting,
    htmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; padding: 20px; color: #111;">
        <p><strong>${greeting}</strong></p>

        <p>I’m applying for the <strong>${title}</strong> position. With <strong>${yearsExperience} years of experience</strong>, 
        I build scalable, fast, and maintainable web applications using <strong>React, Next.js, TypeScript, Tailwind CSS, Material UI, and Redux</strong>. 
        I also have backend experience with <strong>Node.js & Express.js</strong>, and use Git daily.</p>

        <p>I enjoy shipping pixel-perfect interfaces, optimising performance, and collaborating with design and backend teams to deliver production-ready features.</p>

        <p>${joinerText} I’d love to discuss how I can contribute to your team.</p>

        <p>Best regards,<br/>
        <strong>${myName}</strong></p>

        <div style="margin-top: 18px;">
          <div style="display:flex; align-items:center; margin-bottom:8px;">
            <img src="cid:mobile" style="width:20px; height:20px; margin-right:10px;" alt="Mobile" />
            <span style="font-size:14px; color:#333;">${phone}</span>
          </div>

          <div style="display:flex; align-items:center; margin-bottom:8px;">
            <img src="cid:linkedin" style="width:20px; height:20px; margin-right:10px;" alt="LinkedIn" />
            <a href="${linkedin}" style="font-size:14px; color:#0077B5; text-decoration:underline;">LinkedIn</a>
          </div>

          <div style="display:flex; align-items:center;">
            <img src="cid:github" style="width:20px; height:20px; margin-right:10px;" alt="GitHub" />
            <a href="${github}" style="font-size:14px; color:#333; text-decoration:underline;">GitHub</a>
          </div>
        </div>
      </div>
    `,
    textBody: `
${greeting}

I’m applying for the ${title} role. With ${yearsExperience} years of experience in frontend development, I’ve worked with React, Next.js, TypeScript, Tailwind CSS, Material UI, Redux, and have backend experience with Node.js and Express.js.

${joinerText} I’d like to discuss how I can contribute to your team.

Best regards,
${myName}

📱 ${phone}
LinkedIn: ${linkedin}
GitHub: ${github}
    `.trim()
  };
}

export function generatePreviewTemplate(arg) {
  const opts = arg == null ? {} : arg;

  const {
    name,
    myName = 'Niketan Wadaskar',
    phone = '+91 7387162902',
    linkedin = 'https://www.linkedin.com/in/niketan-wadaskar-3188321a0/',
    github = 'https://github.com/niketanwadaskar',
    yearsExperience = 3.7,
    title = 'Frontend Developer',
    isImmediateJoiner = true,
  } = opts;

  const greeting = `Dear ${capitalizeName(name) || 'Hiring Manager'},`;
  const joinerText = isImmediateJoiner ? 'I am available to join immediately.' : 'Available to join as per your timeline.';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 680px; margin:0 auto; padding:20px; color:#111;">
      <p><strong>${greeting}</strong></p>

      <p>I’m applying for the <strong>${title}</strong> role. With <strong>${yearsExperience} years</strong> of experience, 
      I build fast, clean, and reliable frontend systems using <strong>React, Next.js, and TypeScript</strong>.</p>

      <p>${joinerText} I’d like to discuss how I can contribute to your team.</p>

      <p>Best regards,<br/><strong>${myName}</strong></p>

      <div style="margin-top:18px;">
        <div style="display:flex; align-items:center; margin-bottom:6px;">
          <img src="/mobile.png" style="width:20px; height:20px; margin-right:10px;" alt="Mobile" />
          <span>${phone}</span>
        </div>

        <div style="display:flex; align-items:center; margin-bottom:6px;">
          <img src="/linkedin.png" style="width:20px; height:20px; margin-right:10px;" alt="LinkedIn" />
          <a href="${linkedin}" style="text-decoration:underline;">LinkedIn</a>
        </div>

        <div style="display:flex; align-items:center;">
          <img src="/github.png" style="width:20px; height:20px; margin-right:10px;" alt="GitHub" />
          <a href="${github}" style="text-decoration:underline;">GitHub</a>
        </div>
      </div>
    </div>
  `;
}
