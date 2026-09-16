const fs = require('fs');
const { execSync } = require('child_process');

const promptText = process.argv.slice(2).join(' ');
const apiKey = process.env.GEMINI_API_KEY;

if (!promptText) {
  console.error('❌ Error: Provide an instruction. Example: ai "add a print button"');
  process.exit(1);
}
if (!apiKey) {
  console.error('❌ Error: GEMINI_API_KEY not found in environment.');
  process.exit(1);
}

const htmlPath = './index.html';
if (!fs.existsSync(htmlPath)) {
  console.error('❌ Error: index.html not found. Make sure you are in ~/resume');
  process.exit(1);
}

const currentHtml = fs.readFileSync(htmlPath, 'utf8');

const systemPrompt = `You are an expert front-end developer modifying a single-file application (index.html).
Read the user instruction and the current code, and output ONLY the complete updated HTML file.
Do NOT output markdown backticks (\`\`\`html), fences, or conversational text. Output pure HTML only.`;

const fullPrompt = `${systemPrompt}\n\n[CURRENT CODE]:\n${currentHtml}\n\n[USER REQUEST]:\n${promptText}`;

async function run() {
  console.log('🤖 Sending instruction to Gemini 3.6 Flash...');
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }] })
  });

  if (!res.ok) {
    console.error('❌ API Error:', await res.text());
    process.exit(1);
  }

  const data = await res.json();
  let newCode = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!newCode) {
    console.error('❌ No code returned by the model.');
    process.exit(1);
  }

  // Strip accidental markdown artifacts
  newCode = newCode.trim()
    .replace(/^```html\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim();

  // Create backup and save
  fs.copyFileSync(htmlPath, `${htmlPath}.bak`);
  fs.writeFileSync(htmlPath, newCode, 'utf8');
  console.log('✅ index.html updated successfully.');

  // Push to GitHub & deploy OTA
  console.log('🚀 Triggering deploy pipeline...');
  try {
    execSync(`./deploy.sh "AI: ${promptText.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });
  } catch (err) {
    console.error('❌ Deployment script hit an issue.');
  }
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
