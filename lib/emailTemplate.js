// Shared email template function
export function generateEmailTemplate(name) {
  const capitalizedName = name ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() : null;
  const greeting = capitalizedName ? `Dear ${capitalizedName},` : 'Dear Hiring Manager,';
  
  return {
    subject: 'Application for Frontend Developer Position',
    greeting,
    htmlBody: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <p><strong>${greeting}</strong></p>
        
        <p>I am excited to apply for the <strong>Frontend Developer</strong> role. With <strong>2 years of experience</strong>, 
        I have worked with <strong>React.js, Next.js, Tailwind CSS, Material UI, Redux, JavaScript (ES6+), HTML5, 
        and CSS3</strong>, along with proficiency in <strong>RESTful APIs, Git, and Node.js</strong>.</p>
        
        <p>I am passionate about building scalable, user-friendly web applications 
        with expertise in <strong>responsive UI, API integrations, and performance optimization</strong>.</p>
        
        <p>I have collaborated with backend and design teams to deliver <strong>pixel-perfect, data-driven solutions</strong>. 
        As an <strong>immediate joiner</strong>, I look forward to discussing how my skills can contribute to your team's success.</p>
        
        <p>Looking forward to your response.</p>
        
        <p>Best regards,<br>
        <strong>Prashant Singh</strong></p>
        
        <div style="margin-top: 20px;">
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <img src="cid:mobile" style="width: 24px; height: 24px; margin-right: 12px;" alt="Mobile" />
            <span style="color: #333; font-size: 14px;">+91 9504334245</span>
          </div>
          
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <img src="cid:linkedin" style="width: 24px; height: 24px; margin-right: 12px;" alt="LinkedIn" />
            <a href="https://www.linkedin.com/in/prashantuff/" style="color: #0077B5; text-decoration: underline; font-size: 14px;">LinkedIn</a>
          </div>
          
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <img src="cid:portfolio" style="width: 24px; height: 24px; margin-right: 12px;" alt="Portfolio" />
            <a href="https://prashant-137prashants-projects.vercel.app/" style="color: #1E40AF; text-decoration: underline; font-size: 14px;">Portfolio</a>
          </div>
          
          <div style="display: flex; align-items: center;">
            <img src="cid:github" style="width: 24px; height: 24px; margin-right: 12px;" alt="GitHub" />
            <a href="https://github.com/137prashant" style="color: #333; text-decoration: underline; font-size: 14px;">GitHub</a>
          </div>
        </div>
      </div>
    `,
    textBody: `
${greeting}

I am excited to apply for the Frontend Developer role. With 2 years of experience, 
I have worked with React.js, Next.js, Tailwind CSS, Material UI, Redux, JavaScript (ES6+), HTML5, 
and CSS3, along with proficiency in RESTful APIs, Git, and Node.js.

I am passionate about building scalable, user-friendly web applications 
with expertise in responsive UI, API integrations, and performance optimization.

I have collaborated with backend and design teams to deliver pixel-perfect, data-driven solutions. 
As an immediate joiner, I look forward to discussing how my skills can contribute to your team's success.

Looking forward to your response.

Best regards,
Prashant Singh

📱 +91 9504334245
LinkedIn: https://www.linkedin.com/in/prashantuff/
Portfolio: https://prashant-137prashants-projects.vercel.app/
GitHub: https://github.com/137prashant
    `
  };
}

// Function to generate preview HTML (uses direct image paths for web preview)
export function generatePreviewTemplate(name) {
  const capitalizedName = name ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() : null;
  const greeting = capitalizedName ? `Dear ${capitalizedName},` : 'Dear Hiring Manager,';
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <p><strong>${greeting}</strong></p>
      
      <p>I am excited to apply for the <strong>Frontend Developer</strong> role. With <strong>2 years of experience</strong>, 
      I have worked with <strong>React.js, Next.js, Tailwind CSS, Material UI, Redux, JavaScript (ES6+), HTML5, 
      and CSS3</strong>, along with proficiency in <strong>RESTful APIs, Git, and Node.js</strong>.</p>
      
      <p>I am passionate about building scalable, user-friendly web applications 
      with expertise in <strong>responsive UI, API integrations, and performance optimization</strong>.</p>
      
      <p>I have collaborated with backend and design teams to deliver <strong>pixel-perfect, data-driven solutions</strong>. 
      As an <strong>immediate joiner</strong>, I look forward to discussing how my skills can contribute to your team's success.</p>
      
      <p>Looking forward to your response.</p>
      
      <p>Best regards,<br>
      <strong>Prashant Singh</strong></p>
      
      <div style="margin-top: 20px;">
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <img src="/mobile.png" style="width: 24px; height: 24px; margin-right: 12px;" alt="Mobile" />
          <span style="color: #333; font-size: 14px;">+91 9504334245</span>
        </div>
        
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <img src="/linkedin.png" style="width: 24px; height: 24px; margin-right: 12px;" alt="LinkedIn" />
          <a href="https://www.linkedin.com/in/prashantuff/" style="color: #0077B5; text-decoration: underline; font-size: 14px;">LinkedIn</a>
        </div>
        
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <img src="/portfolio.png" style="width: 24px; height: 24px; margin-right: 12px;" alt="Portfolio" />
          <a href="https://prashant-137prashants-projects.vercel.app/" style="color: #1E40AF; text-decoration: underline; font-size: 14px;">Portfolio</a>
        </div>
        
        <div style="display: flex; align-items: center;">
          <img src="/github.png" style="width: 24px; height: 24px; margin-right: 12px;" alt="GitHub" />
          <a href="https://github.com/137prashant" style="color: #333; text-decoration: underline; font-size: 14px;">GitHub</a>
        </div>
      </div>
    </div>
  `;
}
