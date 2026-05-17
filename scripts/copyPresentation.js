const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, '..', 'src', 'presentation');
const targetDir = path.join(__dirname, '..', 'dist', 'presentation');

async function copyDirectory(source, target) {
  await fs.promises.mkdir(target, { recursive: true });
  const entries = await fs.promises.readdir(source, { withFileTypes: true });

  await Promise.all(entries.map(async (entry) => {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, targetPath);
    } else if (entry.isFile()) {
      await fs.promises.copyFile(sourcePath, targetPath);
    }
  }));
}

copyDirectory(sourceDir, targetDir)
  .then(() => {
    console.log('Presentation assets copied to dist/presentation');
  })
  .catch((error) => {
    console.error('Failed to copy presentation assets:', error);
    process.exit(1);
  });
