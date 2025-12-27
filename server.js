import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import multer from 'multer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;
const execAsync = promisify(exec);

// Setup multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Only enable content management API in development
const isDev = process.env.NODE_ENV !== 'production';

// Helper to get file path based on category
const getFilePath = (category, filename) => {
  const baseDir = path.join(__dirname, 'src', 'content');
  const sanitized = filename.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
  
  switch (category) {
    case 'essay':
      return path.join(baseDir, 'essays', `${sanitized}.md`);
    case 'article':
      return path.join(baseDir, 'essays', `${sanitized}.md`);
    case 'note':
      return path.join(baseDir, 'notes', `${sanitized}.json`);
    case 'experiment':
      return path.join(baseDir, 'essays', `${sanitized}.md`);
    default:
      return path.join(baseDir, 'essays', `${sanitized}.md`);
  }
};

// Helper to generate filename from title
const generateFilename = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
};

// GET all articles (reads from file system) - DEV ONLY
app.get('/api/articles', (req, res, next) => {
  if (!isDev) {
    return res.status(403).json({ error: 'Not available in production' });
  }
  next();
}, async (req, res) => {
  try {
    const articles = [];
    const contentDir = path.join(__dirname, 'src', 'content');

    // Read essays
    const essaysDir = path.join(contentDir, 'essays');
    try {
      const essayFiles = await fs.readdir(essaysDir);
      for (const file of essayFiles) {
        if (file.endsWith('.md')) {
          const content = await fs.readFile(path.join(essaysDir, file), 'utf-8');
          const parsed = parseMarkdownFile(content, file);
          if (parsed) {
            articles.push({
              id: file.replace('.md', ''),
              category: 'essay',
              type: 'ESSAY',
              ...parsed
            });
          }
        }
      }
    } catch (e) {
      // essays dir might not exist yet
    }

    // Read notes
    const notesDir = path.join(contentDir, 'notes');
    try {
      const noteFiles = await fs.readdir(notesDir);
      for (const file of noteFiles) {
        if (file.endsWith('.json')) {
          const content = await fs.readFile(path.join(notesDir, file), 'utf-8');
          const data = JSON.parse(content);
          articles.push({
            id: file.replace('.json', ''),
            category: 'note',
            type: 'NOTE',
            title: data.title || 'Untitled Note',
            content: data.text || '',
            excerpt: data.text?.slice(0, 100) || '',
            date: data.date || new Date().toISOString().split('T')[0]
          });
        }
      }
    } catch (e) {
      // notes dir might not exist yet
    }

    // Read tapes (audio)
    const tapesDir = path.join(contentDir, 'tapes');
    try {
      const tapeFiles = await fs.readdir(tapesDir);
      for (const file of tapeFiles) {
        if (file.endsWith('.json')) {
          const content = await fs.readFile(path.join(tapesDir, file), 'utf-8');
          const data = JSON.parse(content);
          articles.push({
            id: file.replace('.json', ''),
            category: 'tape',
            type: 'TAPE',
            title: data.title || 'Untitled Recording',
            content: data.description || '',
            excerpt: data.description?.slice(0, 100) || '',
            date: data.date || new Date().toISOString().split('T')[0],
            duration: data.duration || '0:00',
            hasAudio: true
          });
        }
      }
    } catch (e) {
      // tapes dir might not exist yet
    }

    // Sort by date descending
    articles.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    res.json(articles);
  } catch (error) {
    console.error('Error reading articles:', error);
    res.status(500).json({ error: 'Failed to read articles' });
  }
});

// POST new article (text-based) - DEV ONLY
app.post('/api/articles', (req, res, next) => {
  if (!isDev) {
    return res.status(403).json({ error: 'Not available in production' });
  }
  next();
}, async (req, res) => {
  try {
    const { title, excerpt, content, category, date } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content required' });
    }

    const filename = generateFilename(title);
    const filePath = getFilePath(category, filename);

    // Ensure directory exists
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    if (category === 'note') {
      // JSON format for notes
      const noteData = {
        title,
        text: content,
        date,
        x: 0,
        y: 0,
        r: 0,
        z: 100
      };
      await fs.writeFile(filePath, JSON.stringify(noteData, null, 2));
    } else {
      // Markdown format for essays
      const frontmatter = {
        title,
        excerpt: excerpt || content.slice(0, 150),
        date,
        type: category.toUpperCase()
      };

      const mdContent = `{${Object.entries(frontmatter)
        .map(([k, v]) => `"${k}": "${v.toString().replace(/"/g, '\\"')}"`)
        .join(', ')}}\n${content}`;

      await fs.writeFile(filePath, mdContent);
    }

    res.json({
      id: filename,
      title,
      excerpt,
      content,
      category,
      date,
      message: 'Article created successfully'
    });
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ error: 'Failed to create article' });
  }
});

// POST tape with audio file upload - DEV ONLY
app.post('/api/tapes', (req, res, next) => {
  if (!isDev) {
    return res.status(403).json({ error: 'Not available in production' });
  }
  next();
}, upload.single('audio'), async (req, res) => {
  try {
    const { title, description, duration, date } = req.body;

    if (!title || !req.file) {
      return res.status(400).json({ error: 'Title and audio file required' });
    }

    const filename = generateFilename(title);
    const tapesDir = path.join(__dirname, 'src', 'content', 'tapes');
    await fs.mkdir(tapesDir, { recursive: true });

    // Determine audio extension from original filename
    const ext = req.file.originalname.split('.').pop().toLowerCase();
    const audioPath = path.join(tapesDir, `${filename}.${ext}`);
    const metadataPath = path.join(tapesDir, `${filename}.json`);

    // Save audio file
    await fs.writeFile(audioPath, req.file.buffer);

    // Save metadata
    const tapeData = {
      title,
      date,
      duration: duration || '0:00',
      description: description || '',
      x: 0,
      y: 0,
      r: 0,
      z: 100
    };
    await fs.writeFile(metadataPath, JSON.stringify(tapeData, null, 2));

    res.json({
      id: filename,
      title,
      description,
      duration,
      date,
      hasAudio: true,
      message: 'Tape created successfully'
    });
  } catch (error) {
    console.error('Error creating tape:', error);
    res.status(500).json({ error: 'Failed to create tape' });
  }
});

// PUT (update) article - DEV ONLY
app.put('/api/articles/:id', (req, res, next) => {
  if (!isDev) {
    return res.status(403).json({ error: 'Not available in production' });
  }
  next();
}, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, excerpt, content, category, date } = req.body;

    const filename = generateFilename(title || id);
    const filePath = getFilePath(category, filename);
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    if (category === 'note') {
      const noteData = {
        title,
        text: content,
        date
      };
      await fs.writeFile(filePath, JSON.stringify(noteData, null, 2));
    } else {
      const frontmatter = {
        title,
        excerpt: excerpt || content.slice(0, 150),
        date,
        type: category.toUpperCase()
      };

      const mdContent = `{${Object.entries(frontmatter)
        .map(([k, v]) => `"${k}": "${v.toString().replace(/"/g, '\\"')}"`)
        .join(', ')}}\n${content}`;

      await fs.writeFile(filePath, mdContent);
    }

    res.json({ message: 'Article updated successfully' });
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ error: 'Failed to update article' });
  }
});

// DELETE article - DEV ONLY
app.delete('/api/articles/:id', (req, res, next) => {
  if (!isDev) {
    return res.status(403).json({ error: 'Not available in production' });
  }
  next();
}, async (req, res) => {
  try {
    const { id } = req.params;
    const { category } = req.query;

    const filePath = getFilePath(category, id);
    await fs.unlink(filePath);

    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

// DELETE tape (both metadata and audio file) - DEV ONLY
app.delete('/api/tapes/:id', (req, res, next) => {
  if (!isDev) {
    return res.status(403).json({ error: 'Not available in production' });
  }
  next();
}, async (req, res) => {
  try {
    const { id } = req.params;
    const tapesDir = path.join(__dirname, 'src', 'content', 'tapes');
    
    let deleted = false;

    // Delete JSON metadata
    const metadataPath = path.join(tapesDir, `${id}.json`);
    try {
      await fs.unlink(metadataPath);
      deleted = true;
    } catch (e) {
      // metadata file doesn't exist
    }

    // Delete audio file (try common extensions)
    const audioExts = ['mp3', 'wav', 'm4a', 'ogg', 'flac'];
    for (const ext of audioExts) {
      const audioPath = path.join(tapesDir, `${id}.${ext}`);
      try {
        await fs.unlink(audioPath);
        deleted = true;
      } catch (e) {
        // file doesn't exist with this extension, try next
      }
    }

    if (!deleted) {
      return res.status(404).json({ error: 'Tape not found' });
    }

    res.json({ message: 'Tape deleted successfully' });
  } catch (error) {
    console.error('Error deleting tape:', error);
    res.status(500).json({ error: 'Failed to delete tape' });
  }
});

// Helper to parse markdown frontmatter
function parseMarkdownFile(content, filename) {
  const match = content.match(/^{([\s\S]*?)}\n([\s\S]*)$/);
  if (match) {
    try {
      const metadata = JSON.parse(`{${match[1]}}`);
      const body = match[2].trim();
      return {
        title: metadata.title || filename,
        excerpt: metadata.excerpt || body.slice(0, 150),
        content: body,
        date: metadata.date || new Date().toISOString().split('T')[0]
      };
    } catch (e) {
      return {
        title: filename,
        excerpt: content.slice(0, 150),
        content,
        date: new Date().toISOString().split('T')[0]
      };
    }
  }
  return {
    title: filename,
    excerpt: content.slice(0, 150),
    content,
    date: new Date().toISOString().split('T')[0]
  };
}

// GET deployment status
app.get('/api/deploy/status', (req, res) => {
  res.json({
    ready: true,
    repo: 'raykazine-media-labs',
    branch: 'main'
  });
});

// POST deploy (commit, push, build, deploy to Cloudflare) - DEV ONLY
app.post('/api/deploy', (req, res, next) => {
  if (!isDev) {
    return res.status(403).json({ error: 'Not available in production' });
  }
  next();
}, async (req, res) => {
  try {
    const steps = [];

    // Step 1: Check git status
    console.log('[Deploy] Checking git status...');
    const { stdout: status } = await execAsync('git status --porcelain', { cwd: __dirname });
    
    if (!status.trim()) {
      return res.json({
        success: true,
        message: 'No changes to deploy',
        steps: ['No uncommitted changes found']
      });
    }

    steps.push('Found changes to commit');

    // Step 2: Git add all
    console.log('[Deploy] Adding files...');
    await execAsync('git add .', { cwd: __dirname });
    steps.push('Added files to git');

    // Step 3: Git commit
    console.log('[Deploy] Committing changes...');
    const timestamp = new Date().toISOString();
    await execAsync(`git commit -m "Content update: ${timestamp}"`, { cwd: __dirname });
    steps.push('Committed changes to git');

    // Step 4: Git push
    console.log('[Deploy] Pushing to remote...');
    try {
      await execAsync('git push', { cwd: __dirname });
      steps.push('Pushed to git remote');
    } catch (pushError) {
      console.warn('[Deploy] Git push warning:', pushError.message);
      steps.push('Pushed to git remote (with warning)');
    }

    // Step 5: Build
    console.log('[Deploy] Building project...');
    await execAsync('npm run build', { cwd: __dirname });
    steps.push('Built project successfully');

    // Step 6: Deploy to Cloudflare
    console.log('[Deploy] Deploying to Cloudflare...');
    try {
      await execAsync('npx wrangler deploy', { cwd: __dirname, timeout: 60000 });
      steps.push('Deployed to Cloudflare Pages');
    } catch (deployError) {
      console.error('[Deploy] Cloudflare deploy error:', deployError.message);
      throw new Error(`Cloudflare deployment failed: ${deployError.message}`);
    }

    console.log('[Deploy] Complete!');
    res.json({
      success: true,
      message: 'Successfully deployed to Cloudflare',
      steps,
      deployedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Deploy] Error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Deployment failed. Check server logs for details.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Content API running on http://localhost:${PORT}`);
});
