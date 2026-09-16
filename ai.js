const fs = require('fs');
const { execSync } = require('child_process');

const prompt = process.argv.slice(2).join(' ');
const key = process.env.GEMINI_API_KEY;
if (!prompt || !key) { console.error('Usage: node ai.js "instruction"'); process.exit(1); }

const oldCode = fs.existsSync('index.html') ? fs.readFileSync('index.html', 'utf8') : '';

// Flash endpoints available on your free tier
const MODELS = ['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.5-flash', 'gemini-3.1-flash-lite'];

async function requestModel(model) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const payload = {
    contents: [{ parts: [{ text: `You are an expert mobile frontend engineer. Refactor this single-file index.html. Output ONLY valid complete HTML without markdown code fences (\`\`\`html) or notes.\n\nCODE:\n${oldCode}\n\nREQUEST:\n${prompt}` }] }]
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.candidates?.[0]?.content?.parts?.[0]?.text;
}

async function run() {
  let raw = '';

  for (const model of MODELS) {
    try {
      console.log(`⚡ Querying ${model}...`);
      raw = await requestModel(model);
      if (raw) {
        console.log(`✅ Success via ${model}`);
        break;
      }
    } catch (err) {
      console.log(`⚠️ ${model} unavailable: ${err.message}`);
      console.log(`⏳ Trying next tier model...`);
    }
  }

  const code = (raw || '').trim().replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();

  if (!code) {
    console.error('❌ All available models encountered high demand. Try again in 30s.');
    process.exit(1);
  }

  fs.copyFileSync('index.html', 'index.html.bak');
  fs.writeFileSync('index.html', code, 'utf8');
  console.log('✅ index.html updated successfully.');

  console.log('🚀 Deploying to Vercel...');
  execSync(`./deploy.sh "Spatial Glass UI Update"`, { stdio: 'inherit' });
}

run().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
