const post = {
  slug: "ats-resume-2026",
  title: "How to Write an ATS-Friendly Resume in 2026",
  date: "May 16, 2026",
  readTime: "10 min read",
  category: "Resume Tips",
  categoryColor: "#0d9488",
  excerpt: "90% of large companies use Applicant Tracking Systems to filter resumes before a human ever sees them. Here's exactly how to beat the algorithm and get your resume in front of real people.",
  coverEmoji: "📄",
  tags: ["Resume", "ATS", "Job Search", "Career"],
  content: [
    {
      type: "intro",
      text: "You spent hours crafting the perfect resume. You applied to 50 jobs. You heard back from almost none of them. Sound familiar? The culprit is likely an Applicant Tracking System — and most candidates have no idea how they work or how to write for them."
    },
    {
      type: "h2",
      text: "What is an ATS and Why Does It Matter?"
    },
    {
      type: "p",
      text: "An Applicant Tracking System (ATS) is software that companies use to collect, sort, and filter job applications automatically. Think of it as a gatekeeper robot that reads your resume before any human does. Companies like TCS, Infosys, Wipro, Google, Amazon, and virtually every MNC uses one. Popular ATS platforms include Workday (used by Amazon, Google), Greenhouse (used by Stripe, Airbnb), Lever (used by Netflix, Shopify), and iCIMS (used by TCS, Infosys) — each parses resumes slightly differently, but all follow the same core rules."
    },
    {
      type: "p",
      text: "The ATS parses your resume, extracts information, and scores it against the job description. If your score is too low, your application gets filtered out — no matter how qualified you are. Studies suggest that up to 75% of resumes are rejected by ATS before a recruiter ever sees them."
    },
    {
      type: "callout",
      icon: "💡",
      text: "Key insight: You're not just writing for a human reader. You're writing for a machine first. Your resume needs to pass the ATS filter before it can impress a hiring manager."
    },
    {
      type: "h2",
      text: "ATS Formatting Rules — What the Machine Can Read"
    },
    {
      type: "p",
      text: "Most ATS systems struggle with complex formatting. Here's what to do and what to avoid:"
    },
    {
      type: "do-dont",
      items: [
        { do: "Use standard fonts: Arial, Calibri, Times New Roman, Georgia", dont: "Use decorative or custom fonts" },
        { do: "Use standard section headings: Experience, Education, Skills", dont: "Use creative headings like 'My Journey' or 'What I've Built'" },
        { do: "Save as .docx or simple PDF", dont: "Use image-based PDFs or heavily designed templates" },
        { do: "Use bullet points with standard symbols (•, -, *)", dont: "Use tables, text boxes, columns, or graphics for content" },
        { do: "Include dates in clear format: Jan 2024 – Present", dont: "Use timeline graphics or visual date representations" },
        { do: "Put contact info in the main body", dont: "Put contact info in headers or footers (ATS often ignores them)" },
      ]
    },
    {
      type: "h2",
      text: "Keywords — The Most Important ATS Factor"
    },
    {
      type: "p",
      text: "ATS systems compare your resume against the job description using keyword matching. If the job description says 'Python' and your resume says 'programming in Python', the match might not register correctly. Exact keyword matching is crucial."
    },
    {
      type: "steps",
      items: [
        { num: "1", title: "Copy the job description", text: "Paste the full JD into a text document. This is your keyword source." },
        { num: "2", title: "Identify hard skills mentioned", text: "Look for specific technologies, tools, certifications, and methodologies. Examples: 'React.js', 'data analysis', 'Agile', 'SQL', 'project management'." },
        { num: "3", title: "Mirror the exact language", text: "If the JD says 'machine learning' don't write 'ML'. If it says 'customer success', don't write 'client happiness'. Use their exact terms." },
        { num: "4", title: "Place keywords naturally", text: "Work keywords into your bullet points and skills section naturally. Don't keyword-stuff — ATS systems in 2026 are smarter than that." },
        { num: "5", title: "Include both acronyms and full forms", text: "Write 'Search Engine Optimization (SEO)' once. Some ATS search for acronyms, others for full names — cover both." }
      ]
    },
    {
      type: "h2",
      text: "Every Section Your ATS Resume Needs"
    },
    {
      type: "sections-list",
      items: [
        { title: "Contact Information", desc: "Full name, phone, professional email, city/state, LinkedIn URL. No photo, no date of birth (illegal to ask in many countries anyway)." },
        { title: "Professional Summary (2–3 lines)", desc: "A targeted summary that includes your job title, years of experience, and 2-3 key skills from the job description. Rewrite this for every application." },
        { title: "Work Experience", desc: "Reverse chronological order. Company name, your title, dates, location. Each role needs 3-5 bullet points using strong action verbs and measurable results." },
        { title: "Skills", desc: "A dedicated skills section is critical. ATS often specifically looks here. Separate technical skills, tools, and soft skills. Match terminology from the JD." },
        { title: "Education", desc: "Degree, institution, graduation year. Include CGPA if 7.5+. Include relevant coursework if you're a fresher." },
        { title: "Certifications (if relevant)", desc: "AWS, Google, Microsoft, Coursera, NPTEL — list them with the issuing body and year. These are high-value keywords." }
      ]
    },
    {
      type: "h2",
      text: "Writing Bullet Points That Beat ATS and Impress Humans"
    },
    {
      type: "p",
      text: "Your bullet points do double duty — they need to contain the right keywords for the ATS, and the right impact for the human reviewer. Use the CAR format: Context, Action, Result."
    },
    {
      type: "example-box",
      bad: "Worked on the backend team and helped with API development.",
      good: "Developed 12 REST APIs using Node.js and Express, reducing average response time by 40% and supporting 10,000+ daily active users."
    },
    {
      type: "example-box",
      bad: "Responsible for data analysis tasks.",
      good: "Analyzed 2M+ customer records using Python (pandas, NumPy) to identify churn patterns, enabling targeted retention campaigns that reduced churn by 18%."
    },
    {
      type: "h2",
      text: "Mistakes That Get You Filtered Out Immediately"
    },
    {
      type: "mistakes",
      items: [
        { title: "Using a designer template with columns", text: "Canva, Zety, and similar templates look beautiful but ATS systems parse them linearly — your columns get jumbled into nonsense." },
        { title: "Putting key info in images or graphics", text: "Skill bars, infographics, logos — ATS can't read images. If your skill level is shown as a visual bar, it doesn't exist to the ATS." },
        { title: "Using headers/footers for contact info", text: "Many ATS systems completely ignore headers and footers. Put your name and contact details in the main body of the document." },
        { title: "Inconsistent date formats", text: "Mixing 'Jan 2024', '01/2024', and 'January 2024' confuses ATS parsers. Pick one format and stick to it throughout." },
        { title: "Generic objective statements", text: "'Seeking a challenging role to utilize my skills' wastes your summary section. Replace with a targeted professional summary matching the role." },
        { title: "Spelling errors in skill names", text: "Writing 'JavaScrip' or 'Pyhon' means the ATS keyword match fails. Double-check all technical terms." },
      ]
    },
    {
      type: "h2",
      text: "File Naming & LinkedIn — The Details That Matter"
    },
    {
      type: "p",
      text: "Small details separate professional candidates from the rest. Your file name should be: FirstName_LastName_Role.pdf (e.g., 'Rahul_Sharma_Frontend_Developer.pdf'). Never submit 'Resume_Final_v3.pdf'."
    },
    {
      type: "p",
      text: "Recruiters often cross-reference your resume with your LinkedIn profile. Make sure your LinkedIn headline matches your target role, your 'About' section contains keywords from your industry, and your skills section is filled out with endorsements."
    },
    {
      type: "h2",
      text: "Handling Career Gaps and Job Changes"
    },
    {
      type: "p",
      text: "ATS systems don't penalize gaps — humans do. But if your gap is formatted confusingly, the ATS may misparse your timeline. Use a simple format: 'Jan 2022 – Mar 2023' followed by 'Apr 2023 – Present'. If you have a gap, consider adding a one-line explanation in your cover letter, not the resume."
    },
    {
      type: "h2",
      text: "Your ATS Resume Checklist"
    },
    {
      type: "checklist",
      items: [
        "Contact info in the main body (not header/footer)",
        "Standard font (Arial, Calibri, or Times New Roman)",
        "No tables, columns, or text boxes",
        "Standard section headings (Experience, Education, Skills)",
        "Keywords from the job description included naturally",
        "Both acronyms and full forms used where relevant",
        "Action verbs starting each bullet point",
        "Quantified results in at least 50% of bullets",
        "Consistent date format throughout",
        "Saved as .docx (preferred) or simple PDF",
        "No photos, graphics, or skill bars",
        "Professional email address",
        "LinkedIn URL included",
        "Proofread for spelling (especially technical terms)",
        "Tailored summary matching the specific role",
        "File named: FirstName_LastName_Role.pdf",
      ]
    },
    {
      type: "h2",
      text: "How to Check Your ATS Score Before Applying"
    },
    {
      type: "p",
      text: "Before submitting any application, run your resume through an ATS checker. Our free Resume Analyzer at ZeroAPI gives you an ATS score estimate, identifies weaknesses, and suggests specific improvements — no signup required."
    },
    {
      type: "cta",
      text: "Check Your ATS Score Free →",
      href: "/#tools",
      note: "No signup. No data stored. Instant results."
    },
    {
      type: "h2",
      text: "The Bottom Line"
    },
    {
      type: "p",
      text: "Writing an ATS-friendly resume is not about gaming the system — it's about communicating clearly so both machines and humans can understand your value. Keep your format clean, use the employer's exact language, quantify your impact, and tailor each application. The candidates who get interviews aren't always the most qualified. They're the ones whose resumes are easiest for both ATS and humans to read."
    },
    {
      type: "p",
      text: "Start with the job description. End with a tailored, keyword-rich, cleanly formatted resume. Use our free tools to analyze and build yours — then go get that interview."
    }
  ]
};

export default post;
