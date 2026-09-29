import JSZip from 'jszip';

/**
 * Format bytes into human-readable string (KB, MB, GB)
 */
export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Parse an uploaded ZIP file and extract real metadata, file counts,
 * languages, services, and project structure.
 */
export async function parseProjectZip(file, customProjectName = '') {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(file);

  const fileEntries = [];
  const dirSet = new Set();
  const extCounts = {};
  let packageJsonContent = null;
  let pyprojectContent = null;
  let dockerComposeContent = null;

  // Process all files in the zip
  for (const [relativePath, zipEntry] of Object.entries(loadedZip.files)) {
    // Ignore OS metadata files
    if (relativePath.includes('__MACOSX') || relativePath.includes('.DS_Store')) {
      continue;
    }

    if (zipEntry.dir) {
      dirSet.add(relativePath.replace(/\/$/, ''));
      continue;
    }

    fileEntries.push(relativePath);

    // Track directories
    const parts = relativePath.split('/');
    if (parts.length > 1) {
      dirSet.add(parts.slice(0, -1).join('/'));
    }

    // Track extensions
    const extMatch = relativePath.match(/\.([0-9a-z_-]+)$/i);
    if (extMatch) {
      const ext = extMatch[1].toLowerCase();
      extCounts[ext] = (extCounts[ext] || 0) + 1;
    }

    // Inspect key configuration files
    const lowerPath = relativePath.toLowerCase();
    if (lowerPath.endsWith('package.json') && !packageJsonContent) {
      try {
        const text = await zipEntry.async('string');
        packageJsonContent = JSON.parse(text);
      } catch (e) {
        console.warn('Failed to parse package.json from zip:', e);
      }
    } else if (lowerPath.endsWith('pyproject.toml') || lowerPath.endsWith('requirements.txt')) {
      pyprojectContent = relativePath;
    } else if (lowerPath.endsWith('docker-compose.yml') || lowerPath.endsWith('docker-compose.yaml')) {
      dockerComposeContent = relativePath;
    }
  }

  // Derive project name
  let projectName = customProjectName.trim();
  if (!projectName) {
    if (packageJsonContent && packageJsonContent.name) {
      projectName = packageJsonContent.name;
    } else {
      // Use zip base name without extension
      projectName = file.name.replace(/\.zip$/i, '');
    }
  }

  // Language mapping from extensions
  const langMap = {
    js: 'JavaScript',
    jsx: 'React (JS)',
    ts: 'TypeScript',
    tsx: 'React (TS)',
    py: 'Python',
    go: 'Go',
    java: 'Java',
    rs: 'Rust',
    cpp: 'C++',
    c: 'C',
    cs: 'C#',
    rb: 'Ruby',
    php: 'PHP',
    html: 'HTML',
    css: 'CSS',
    json: 'JSON',
    yaml: 'YAML',
    yml: 'YAML',
    sql: 'SQL',
    sh: 'Shell',
  };

  const detectedLangs = new Set();
  for (const ext of Object.keys(extCounts)) {
    if (langMap[ext]) {
      detectedLangs.add(langMap[ext]);
    }
  }

  // Detect services or modules based on directory patterns or package.json
  const detectedServices = new Set();

  // 1. Check directories for service patterns
  fileEntries.forEach((filePath) => {
    const parts = filePath.split('/');
    if (parts.length >= 2) {
      const top = parts[0];
      const second = parts[1];
      if (['services', 'apps', 'packages', 'microservices', 'modules'].includes(top.toLowerCase())) {
        detectedServices.add(second);
      } else if (parts.length >= 3 && parts[1].toLowerCase() === 'services') {
        detectedServices.add(parts[2]);
      }
    }
  });

  // 2. If no explicit services folders, detect standard functional modules
  if (detectedServices.size === 0) {
    fileEntries.forEach((filePath) => {
      const lower = filePath.toLowerCase();
      if (lower.includes('auth') || lower.includes('login')) detectedServices.add('Auth Service');
      if (lower.includes('pay') || lower.includes('checkout') || lower.includes('billing')) detectedServices.add('Payment Gateway');
      if (lower.includes('order') || lower.includes('cart')) detectedServices.add('Order Service');
      if (lower.includes('api') || lower.includes('server') || lower.includes('gateway')) detectedServices.add('API Gateway');
      if (lower.includes('db') || lower.includes('database') || lower.includes('model')) detectedServices.add('Database Layer');
    });
  }

  // If still none, add default service labeled with the project name
  if (detectedServices.size === 0) {
    detectedServices.add(`${projectName} Core`);
  }

  // Sort sample files
  const sampleFiles = fileEntries.slice(0, 15);

  return {
    id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: projectName,
    fileName: file.name,
    fileSize: formatBytes(file.size),
    fileSizeBytes: file.size,
    fileCount: fileEntries.length,
    directoriesCount: dirSet.size,
    primaryLanguage: Array.from(detectedLangs)[0] || 'Unknown',
    languages: Array.from(detectedLangs),
    detectedServices: Array.from(detectedServices),
    sampleFiles,
    dockerSupported: !!dockerComposeContent,
    packageInfo: packageJsonContent
      ? {
          name: packageJsonContent.name || projectName,
          version: packageJsonContent.version || '1.0.0',
          dependenciesCount: Object.keys(packageJsonContent.dependencies || {}).length,
        }
      : null,
    uploadedAt: new Date().toISOString(),
    uploadStatus: 'Uploaded',
    analysisStatus: 'Ready',
  };
}
