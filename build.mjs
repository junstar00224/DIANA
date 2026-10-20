import { mkdir, copyFile, writeFile } from 'node:fs/promises';
const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
if (!key || !/^pk_(test|live)_/.test(key)) throw new Error('Clerk publishable key is required');
await mkdir('public', { recursive: true });
for (const file of ['index.html', 'about.html', 'style.css', 'script.js', 'auth.js']) {
  await copyFile(file, `public/${file}`);
}
// Only the public browser key is emitted. Server credentials never enter the website.
await writeFile('public/auth-config.js', `window.DIANA_AUTH = ${JSON.stringify({ publishableKey: key })};\n`);
console.log('DIANA built with Clerk authentication.');
