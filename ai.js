const fs = require('fs');
const { execSync } = require('child_process');

const prompt = process.argv.slice(2).join(' ');
const key = process.env.GEMINI_API_KEY;
if (!prompt || !key) { console.error('Usage: ai "instruction" (ensure GEMINI_API_KEY is set)'); process.exit(1); }

const oldCode = fs.existsSync('index.html') ? fs.readFileSync('index.html', 'utf8') : '';
const reqBody = (model) => ({
  url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
  body: JSON.stringify({
    contents: [{ parts: [{ text: `You are an expert mobile frontend engineer. Refactor this single-file index.html. Output ONLY valid complete HTML. No markdown backticks, no fences, no notes.\n\nCODE:\n${oldCode}\n\nREQUEST:\n${prompt}` }] }]
  })
});

async function callModel(model) {
  const { url, body } = reqBody(model);
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.candidates?.[0]?.content?.parts?.[0]?.text;
}

async function run() {
  let text = '';
  try {
    console.log('🧠 Querying Gemini 3.1 Pro (Advanced Reasoning)...');
    text = await callModel('gemini-3.1-pro-preview');
  } catch (err) {
    console.log('⚡ Pro unavailable, switching to Gemini 3.6 Flash...');
    text = await callModel('gemini-3.6-flash');
  }

  let code = (text || '').trim().replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
  if (!code) { console.error('❌ Error: No code received.'); process.exit(1); }

  fs.copyFileSync('index.html', 'index.html.bak');
  fs.writeFileSync('index.html', code, 'utf8');
  console.log('✅ index.html updated.');
  execSync(`./deploy.sh "AI: ${prompt.replace(/["`$]/g, '')}"`, { stdio: 'inherit' });
}
run().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
