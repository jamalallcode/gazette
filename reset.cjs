const { execSync } = require('child_process');
try {
  console.log('Running git status...');
  console.log(execSync('git status').toString());
  console.log('Running git checkout on src/App.tsx...');
  console.log(execSync('git checkout -- src/App.tsx').toString());
  console.log('Checkout completed.');
} catch (error) {
  console.error('Error executing git command:', error.message);
  if (error.stdout) console.log('Stdout:', error.stdout.toString());
  if (error.stderr) console.error('Stderr:', error.stderr.toString());
}
