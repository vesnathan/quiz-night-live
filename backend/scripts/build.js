const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const handlers = [
  'handlers/game',
  'handlers/leaderboard',
  'handlers/user',
  'handlers/ably-auth',
];

async function build() {
  const outdir = path.join(__dirname, '..', 'dist');

  // Clean output directory
  if (fs.existsSync(outdir)) {
    fs.rmSync(outdir, { recursive: true });
  }
  fs.mkdirSync(outdir, { recursive: true });

  // Build handlers
  for (const handler of handlers) {
    const entryPoint = path.join(__dirname, '..', 'src', `${handler}.ts`);
    const outfile = path.join(outdir, `${handler.split('/').pop()}.js`);

    await esbuild.build({
      entryPoints: [entryPoint],
      bundle: true,
      platform: 'node',
      target: 'node18',
      outfile,
      external: ['@aws-sdk/*'],
      sourcemap: true,
      minify: true,
    });

    console.log(`Built: ${handler}`);
  }

  // Build orchestrator (for Fargate)
  const orchestratorOutdir = path.join(outdir, 'orchestrator');
  fs.mkdirSync(orchestratorOutdir, { recursive: true });

  await esbuild.build({
    entryPoints: [path.join(__dirname, '..', 'src', 'orchestrator', 'index.ts')],
    bundle: true,
    platform: 'node',
    target: 'node20',
    outfile: path.join(orchestratorOutdir, 'index.js'),
    external: ['@aws-sdk/*'],
    sourcemap: true,
    minify: false, // Keep readable for debugging
  });

  console.log('Built: orchestrator');

  console.log('Build complete!');
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
