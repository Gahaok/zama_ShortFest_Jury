import * as fs from 'fs';
import * as path from 'path';

const APP_DIR = path.resolve('./app');
const VIOLATIONS = [];

// Prohibited patterns for static export
const PROHIBITED_PATTERNS = [
  { pattern: /getServerSideProps/, description: 'getServerSideProps (SSR)' },
  { pattern: /export\s+const\s+dynamic\s*=\s*['"]force-dynamic['"]/, description: "dynamic = 'force-dynamic'" },
  { pattern: /from\s+['"]next\/headers['"]/, description: 'next/headers import' },
  { pattern: /\bcookies\s*\(/, description: 'cookies() call' },
  { pattern: /\bheaders\s*\(/, description: 'headers() call' },
  { pattern: /from\s+['"]server-only['"]/, description: 'server-only import' },
];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const relativePath = path.relative(process.cwd(), filePath);

  for (const { pattern, description } of PROHIBITED_PATTERNS) {
    if (pattern.test(content)) {
      VIOLATIONS.push({
        file: relativePath,
        issue: description,
      });
    }
  }
}

function scanDirectory(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Check for API routes
      if (entry.name === 'api') {
        VIOLATIONS.push({
          file: path.relative(process.cwd(), fullPath),
          issue: 'API routes directory (app/api)',
        });
      } else {
        scanDirectory(fullPath);
      }
    } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      scanFile(fullPath);
    }
  }
}

function checkDynamicRoutes(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Check if directory name contains dynamic segment
      if (/\[.+\]/.test(entry.name)) {
        // Look for generateStaticParams in the directory
        const files = fs.readdirSync(fullPath);
        let hasGenerateStaticParams = false;

        for (const file of files) {
          if (/\.(ts|tsx|js|jsx)$/.test(file)) {
            const content = fs.readFileSync(path.join(fullPath, file), 'utf-8');
            if (/export\s+(async\s+)?function\s+generateStaticParams/.test(content)) {
              hasGenerateStaticParams = true;
              break;
            }
          }
        }

        if (!hasGenerateStaticParams) {
          VIOLATIONS.push({
            file: path.relative(process.cwd(), fullPath),
            issue: 'Dynamic route without generateStaticParams',
          });
        }
      }

      // Recurse into subdirectories
      checkDynamicRoutes(fullPath);
    }
  }
}

console.log('🔍 Checking static export compatibility...\n');

// Scan app directory
scanDirectory(APP_DIR);

// Check dynamic routes
checkDynamicRoutes(APP_DIR);

// Report results
if (VIOLATIONS.length === 0) {
  console.log('✅ No static export violations found!');
  console.log('   Your app is ready for static export.\n');
  process.exit(0);
} else {
  console.error('❌ Found static export violations:\n');

  for (const violation of VIOLATIONS) {
    console.error(`   ${violation.file}`);
    console.error(`   └─ ${violation.issue}\n`);
  }

  console.error(`Total violations: ${VIOLATIONS.length}\n`);
  console.error('Please fix these issues before running `npm run build`.\n');
  process.exit(1);
}


