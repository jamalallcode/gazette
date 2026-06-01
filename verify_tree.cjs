const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.tsx');
const content = fs.readFileSync(filePath, 'utf8');

// Simple parser to find balanced divs and curly braces
let openDivs = 0;
let lines = content.split('\n');

// Let's run eslint or typescript compiler checker inside our workspace using npx
const { execSync } = require('child_process');
try {
  console.log('Running typescript typecheck/parser compiler...');
  execSync('npx tsc --noEmit --jsx react-jsx src/App.tsx', { stdio: 'pipe' });
  console.log('TSC suggests code is perfect!');
} catch (err) {
  console.log('TSC caught syntax errors:');
  console.log(err.stdout ? err.stdout.toString() : err.message);
  console.log(err.stderr ? err.stderr.toString() : '');
}
