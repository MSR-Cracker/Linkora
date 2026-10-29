const crypto = require('node:crypto');
const path = require('node:path');
const express = require('express');
const multer = require('multer');
const mysql = require('mysql2/promise');
const QRCode = require('qrcode');

const app = express();
const port = Number(process.env.PORT || 3000);
const MAX_FILE_BYTES = 25 * 1024 * 1024;
const EXPIRY_OPTIONS = new Set([3600, 86400, 604800]);
const rateBuckets = new Map();
const passwordAttempts = new Map();

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});
app.use(express.json({ limit: '32kb' }));

const pool = process.env.DATABASE_URL
  ? mysql.createPool(process.env.DATABASE_URL + (process.env.DATABASE_URL.includes('?') ? '&' : '?') + 'timezone=Z')
  : null;

const schemaSql = `CREATE TABLE IF NOT EXISTS droplink_drops (
  id VARCHAR(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL PRIMARY KEY,
  kind VARCHAR(8) NOT NULL,
  title VARCHAR(180) NOT NULL,
  content LONGTEXT NULL,
  object_key VARCHAR(255) CHARACTER SET ascii NULL,
  file_name VARCHAR(255) NULL,
  mime_type VARCHAR(255) NULL,
  file_size BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL,
  expires_at DATETIME NOT NULL,
  burn_after_read TINYINT(1) NOT NULL DEFAULT 0,
  password_salt CHAR(32) CHARACTER SET ascii NULL,
  password_hash CHAR(128) CHARACTER SET ascii NULL,
  views INT UNSIGNED NOT NULL DEFAULT 0,
  consumed_at DATETIME NULL,
  INDEX idx_droplink_expiry (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;

const grantsSql = `CREATE TABLE IF NOT EXISTS droplink_download_grants (
  token_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL PRIMARY KEY,
  drop_id VARCHAR(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  expires_at DATETIME NOT NULL,
  one_time TINYINT(1) NOT NULL DEFAULT 0,
  used_at DATETIME NULL,
  INDEX idx_droplink_grant_expiry (expires_at),
  INDEX idx_droplink_grant_drop (drop_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;

const dbReady = pool ? (async () => {
  await pool.query(schemaSql);
  await pool.query(grantsSql);
})() : Promise.reject(new Error('Database is not configured'));
dbReady.catch((error) => console.error('Linkora database initialization failed:', error.message));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_BYTES, files: 1, fields: 8, fieldSize: 20 * 1024 },
});

function rateLimit(req, res, next) {
  const now = Date.now();
  const key = req.ip || req.socket.remoteAddress || 'unknown';
  let bucket = rateBuckets.get(key);
  if (!bucket || now - bucket.startedAt > 60 * 60 * 1000) {
    bucket = { startedAt: now, count: 0 };
    rateBuckets.set(key, bucket);
  }
  bucket.count += 1;
  if (bucket.count > 20) {
    return res.status(429).json({ error: 'Too many new drops from this connection. Please try again later.' });
  }
  next();
}

setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateBuckets) {
    if (now - bucket.startedAt > 2 * 60 * 60 * 1000) rateBuckets.delete(key);
  }
  for (const [key, attempt] of passwordAttempts) {
    if (attempt.resetAt <= now) passwordAttempts.delete(key);
  }
}, 15 * 60 * 1000).unref();

function cleanText(value, maxLength) {
  return String(value || '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, maxLength);
}

function makeId() {
  return crypto.randomBytes(12).toString('base64url').slice(0, 16);
}

function passwordAttemptKey(req, id) {
  return `${req.ip || req.socket.remoteAddress || 'unknown'}:${id}`;
}

function makeFileName(value) {
  const raw = path.basename(String(value || 'shared-file')).normalize('NFKD');
  const safe = raw.replace(/[^\w. -]/g, '_').replace(/[ ]+/g, '-').replace(/\.{2,}/g, '.').slice(0, 180);
  return safe || 'shared-file';
}

function hashPassword(password, saltHex) {
  return crypto.scryptSync(password, Buffer.from(saltHex, 'hex'), 64).toString('hex');
}

function validPassword(password, saltHex, expectedHex) {
  if (!saltHex || !expectedHex || typeof password !== 'string') return false;
  const actual = Buffer.from(hashPassword(password, saltHex), 'hex');
  const expected = Buffer.from(expectedHex, 'hex');
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

function publicDrop(drop, extra = {}) {
  return {
    id: drop.id,
    kind: drop.kind,
    title: drop.title,
    originalName: drop.file_name,
    mimeType: drop.mime_type,
    size: drop.file_size == null ? null : Number(drop.file_size),
    content: drop.kind === 'note' ? drop.content : null,
    expiresAt: new Date(drop.expires_at).toISOString(),
    createdAt: new Date(drop.created_at).toISOString(),
    views: Number(drop.views || 0),
    burnAfterRead: Boolean(drop.burn_after_read),
    ...extra,
  };
}

function statusFor(drop) {
  if (new Date(drop.expires_at).getTime() <= Date.now()) return 'expired';
  if (drop.consumed_at) return 'gone';
  return 'ready';
}

async function accessDrop(id, password) {
  if (!pool) throw new Error('DATABASE_UNAVAILABLE');
  await dbReady;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute('SELECT * FROM droplink_drops WHERE id = ? FOR UPDATE', [id]);
    const drop = rows[0];
    if (!drop) {
      await connection.rollback();
      return { status: 'not_found' };
    }
    const status = statusFor(drop);
    if (status !== 'ready') {
      await connection.rollback();
      return { status };
    }
    if (drop.password_hash && password == null) {
      await connection.rollback();
      return { status: 'password_required', drop };
    }
    if (drop.password_hash && !validPassword(password, drop.password_salt, drop.password_hash)) {
      await connection.rollback();
      return { status: 'wrong_password' };
    }
    await connection.execute(
      'UPDATE droplink_drops SET views = views + 1, consumed_at = IF(burn_after_read = 1, UTC_TIMESTAMP(), consumed_at) WHERE id = ?',
      [id],
    );
    drop.views = Number(drop.views || 0) + 1;
    if (drop.burn_after_read) drop.consumed_at = new Date();
    let fileToken = null;
    if (drop.kind === 'file') {
      fileToken = crypto.randomBytes(32).toString('base64url');
      const fileTokenHash = crypto.createHash('sha256').update(fileToken).digest('hex');
      const shareExpiry = new Date(drop.expires_at).getTime();
      const grantExpiry = new Date(Math.min(Date.now() + 30 * 60 * 1000, shareExpiry));
      await connection.execute(
        'INSERT INTO droplink_download_grants (token_hash, drop_id, expires_at, one_time) VALUES (?, ?, ?, ?)',
        [fileTokenHash, id, grantExpiry, drop.burn_after_read ? 1 : 0],
      );
    }
    await connection.commit();
    return { status: 'ready', drop, fileToken };
  } catch (error) {
    await connection.rollback().catch(() => {});
    throw error;
  } finally {
    connection.release();
  }
}

async function inspectDrop(id) {
  if (!pool) throw new Error('DATABASE_UNAVAILABLE');
  await dbReady;
  const [rows] = await pool.execute(
    'SELECT id, kind, title, file_name, mime_type, file_size, created_at, expires_at, burn_after_read, views, consumed_at, password_hash FROM droplink_drops WHERE id = ?',
    [id],
  );
  const drop = rows[0];
  if (!drop) return { status: 'not_found' };
  const status = statusFor(drop);
  return { status, drop };
}

async function platformPresign(action, objectKey) {
  const base = process.env.MANUS_API_URL;
  const apiKey = process.env.MANUS_API_KEY;
  if (!base || !apiKey) throw new Error('FILE_STORAGE_UNAVAILABLE');
  const endpoint = new URL(`/v1/storage/presign/${action}`, base);
  endpoint.searchParams.set('path', objectKey);
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: { Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(20_000),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || typeof result.url !== 'string') {
    console.error('Linkora storage presign failed with status', response.status);
    throw new Error('FILE_STORAGE_UNAVAILABLE');
  }
  return result.url;
}

app.get('/healthz', (_req, res) => res.status(200).json({ ok: true }));

app.get('/api/qr', async (req, res) => {
  const value = String(req.query.text || '');
  if (value.length > 2048) return res.status(400).end();
  let parsed;
  try { parsed = new URL(value); } catch { return res.status(400).end(); }
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password || !/^\/s\/[A-Za-z0-9_-]{1,24}\/?$/.test(parsed.pathname) || parsed.search || parsed.hash) {
    return res.status(400).end();
  }
  try {
    const svg = await QRCode.toString(value, { type: 'svg', margin: 1, color: { dark: '#191519', light: '#ffffff' } });
    return res.set({ 'Content-Type': 'image/svg+xml; charset=utf-8', 'Cache-Control': 'private, no-store' }).send(svg);
  } catch (error) {
    console.error('Linkora QR generation failed:', error.message);
    return res.status(500).end();
  }
});

app.post('/api/drops', rateLimit, upload.single('file'), async (req, res) => {
  try {
    await dbReady;
    const kind = req.body.kind === 'file' ? 'file' : 'note';
    const rawExpiry = Number(req.body.expirySeconds || 86400);
    if (!EXPIRY_OPTIONS.has(rawExpiry)) return res.status(400).json({ error: 'Choose a valid expiry time.' });
    const burnAfterRead = req.body.burnAfterRead === 'true';
    const suppliedPassword = cleanText(req.body.password, 72);
    if (suppliedPassword && suppliedPassword.length < 4) {
      return res.status(400).json({ error: 'Use at least 4 characters for the optional password.' });
    }
    if (kind === 'file' && !req.file) return res.status(400).json({ error: 'Choose a file before creating your link.' });
    if (kind === 'note' && req.file) return res.status(400).json({ error: 'Choose either a note or a file.' });

    const id = makeId();
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + rawExpiry * 1000);
    const content = kind === 'note' ? cleanText(req.body.text, 20_000) : null;
    if (kind === 'note' && !content) return res.status(400).json({ error: 'Write a note before creating your link.' });
    if (kind === 'note' && String(req.body.text || '').length > 20_000) {
      return res.status(400).json({ error: 'Notes can be up to 20,000 characters.' });
    }

    let objectKey = null;
    let fileName = null;
    let mimeType = null;
    let fileSize = null;
    if (kind === 'file') {
      fileName = makeFileName(req.file.originalname);
      mimeType = cleanText(req.file.mimetype, 120) || 'application/octet-stream';
      fileSize = req.file.size;
      objectKey = `droplink/${id}/${fileName}`;
      const putUrl = await platformPresign('put', objectKey);
      const putResponse = await fetch(putUrl, {
        method: 'PUT',
        headers: { 'Content-Type': mimeType },
        body: req.file.buffer,
        signal: AbortSignal.timeout(90_000),
      });
      if (!putResponse.ok) {
        console.error('Linkora object upload failed with status', putResponse.status);
        return res.status(502).json({ error: 'The file could not be uploaded. Please try again.' });
      }
    }

    const salt = suppliedPassword ? crypto.randomBytes(16).toString('hex') : null;
    const digest = suppliedPassword ? hashPassword(suppliedPassword, salt) : null;
    const title = cleanText(req.body.title, 180) || (kind === 'file' ? fileName : 'A note for you');
    await pool.execute(
      `INSERT INTO droplink_drops
       (id, kind, title, content, object_key, file_name, mime_type, file_size, created_at, expires_at, burn_after_read, password_salt, password_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, kind, title, content, objectKey, fileName, mimeType, fileSize, createdAt, expiresAt, burnAfterRead ? 1 : 0, salt, digest],
    );
    return res.status(201).json({
      id,
      url: `/s/${id}`,
      kind,
      title,
      expiresAt: expiresAt.toISOString(),
      fileName,
      fileSize,
      protected: Boolean(suppliedPassword),
      burnAfterRead,
    });
  } catch (error) {
    if (error.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'Files must be 25 MB or smaller.' });
    if (error.code === 'LIMIT_FILE_COUNT') return res.status(400).json({ error: 'Share one file at a time.' });
    if (error.message === 'FILE_STORAGE_UNAVAILABLE') return res.status(503).json({ error: 'File storage is temporarily unavailable. You can still share a note.' });
    if (error.message === 'DATABASE_UNAVAILABLE') return res.status(503).json({ error: 'Linkora is getting ready. Please try again in a moment.' });
    console.error('Linkora create failed:', error.message);
    return res.status(500).json({ error: 'Your drop could not be created. Please try again.' });
  }
});

app.get('/api/drops/:id', async (req, res) => {
  try {
    const result = await inspectDrop(req.params.id);
    if (result.status === 'not_found') return res.status(404).json({ error: 'This link does not exist.' });
    if (result.status === 'expired') return res.status(410).json({ error: 'This drop has expired.', state: 'expired' });
    if (result.status === 'gone') return res.status(410).json({ error: 'This drop has already been opened.', state: 'gone' });
    return res.set('Cache-Control', 'no-store').json({
      requiresPassword: Boolean(result.drop.password_hash),
      kind: result.drop.kind,
      title: result.drop.title,
      originalName: result.drop.file_name,
      mimeType: result.drop.mime_type,
      size: result.drop.file_size == null ? null : Number(result.drop.file_size),
      createdAt: new Date(result.drop.created_at).toISOString(),
      expiresAt: new Date(result.drop.expires_at).toISOString(),
      views: Number(result.drop.views || 0),
      burnAfterRead: Boolean(result.drop.burn_after_read),
    });
  } catch (error) {
    if (error.message === 'DATABASE_UNAVAILABLE') return res.status(503).json({ error: 'Linkora is getting ready. Please try again in a moment.' });
    console.error('Linkora read failed:', error.message);
    return res.status(500).json({ error: 'This drop could not be opened.' });
  }
});

app.post('/api/drops/:id/open', async (req, res) => {
  const attemptKey = passwordAttemptKey(req, req.params.id);
  const existingAttempts = passwordAttempts.get(attemptKey);
  if (existingAttempts && existingAttempts.count >= 10 && existingAttempts.resetAt > Date.now()) {
    return res.status(429).json({ error: 'Too many password attempts. Please try again in 15 minutes.' });
  }
  try {
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    const result = await accessDrop(req.params.id, password);
    if (result.status === 'not_found') return res.status(404).json({ error: 'This link does not exist.' });
    if (result.status === 'expired') return res.status(410).json({ error: 'This drop has expired.', state: 'expired' });
    if (result.status === 'gone') return res.status(410).json({ error: 'This drop has already been opened.', state: 'gone' });
    if (result.status === 'wrong_password') {
      const current = passwordAttempts.get(attemptKey);
      passwordAttempts.set(attemptKey, { count: (current?.count || 0) + 1, resetAt: Date.now() + 15 * 60 * 1000 });
      return res.status(401).json({ error: 'That password is not correct.' });
    }
    passwordAttempts.delete(attemptKey);
    let fileHref = null;
    if (result.drop.kind === 'file') {
      fileHref = `/api/drops/${encodeURIComponent(result.drop.id)}/file?grant=${encodeURIComponent(result.fileToken)}`;
    }
    return res.set('Cache-Control', 'no-store').json(publicDrop(result.drop, { fileHref }));
  } catch (error) {
    if (error.message === 'DATABASE_UNAVAILABLE') return res.status(503).json({ error: 'Linkora is getting ready. Please try again in a moment.' });
    console.error('Linkora protected open failed:', error.message);
    return res.status(500).json({ error: 'This drop could not be opened.' });
  }
});

app.get('/api/drops/:id/file', async (req, res) => {
  const grantToken = String(req.query.grant || '');
  if (grantToken.length < 32 || grantToken.length > 128) {
    return res.status(403).json({ error: 'Open the share link again to request a fresh download.' });
  }
  let connection;
  try {
    await dbReady;
    const tokenHash = crypto.createHash('sha256').update(grantToken).digest('hex');
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [rows] = await connection.execute(
      `SELECT g.expires_at AS grant_expires_at, g.one_time, g.used_at,
              d.kind, d.object_key, d.file_name, d.mime_type, d.expires_at AS drop_expires_at
       FROM droplink_download_grants g
       INNER JOIN droplink_drops d ON d.id = g.drop_id
       WHERE g.token_hash = ? AND g.drop_id = ? FOR UPDATE`,
      [tokenHash, req.params.id],
    );
    const grant = rows[0];
    if (!grant) {
      await connection.rollback();
      return res.status(403).json({ error: 'Open the share link again to request a fresh download.' });
    }
    if (new Date(grant.grant_expires_at).getTime() <= Date.now() || new Date(grant.drop_expires_at).getTime() <= Date.now()) {
      await connection.rollback();
      return res.status(410).json({ error: 'This drop has expired.' });
    }
    if (grant.one_time && grant.used_at) {
      await connection.rollback();
      return res.status(403).json({ error: 'This one-time download has already been used.' });
    }
    if (grant.kind !== 'file') {
      await connection.rollback();
      return res.status(404).json({ error: 'The shared file could not be found.' });
    }
    if (grant.one_time) {
      await connection.execute('UPDATE droplink_download_grants SET used_at = UTC_TIMESTAMP() WHERE token_hash = ? AND used_at IS NULL', [tokenHash]);
    }
    await connection.commit();
    const drop = grant;
    const downloadUrl = await platformPresign('get', drop.object_key);
    const fileResponse = await fetch(downloadUrl, { signal: AbortSignal.timeout(90_000) });
    if (!fileResponse.ok) {
      console.error('Linkora object download failed with status', fileResponse.status);
      return res.status(502).json({ error: 'The file is temporarily unavailable.' });
    }
    const bytes = Buffer.from(await fileResponse.arrayBuffer());
    const safeName = makeFileName(drop.file_name || 'shared-file');
    const encodedName = encodeURIComponent(safeName).replace(/['()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
    res.set({
      'Content-Type': drop.mime_type || 'application/octet-stream',
      'Content-Length': String(bytes.length),
      'Content-Disposition': `attachment; filename="${safeName.replace(/[^\x20-\x7E]|["\\]/g, '_')}"; filename*=UTF-8''${encodedName}`,
      'Cache-Control': 'private, no-store',
    });
    return res.status(200).send(bytes);
  } catch (error) {
    if (connection) await connection.rollback().catch(() => {});
    if (error.message === 'FILE_STORAGE_UNAVAILABLE') return res.status(503).json({ error: 'File storage is temporarily unavailable.' });
    console.error('Linkora file delivery failed:', error.message);
    return res.status(500).json({ error: 'The file could not be downloaded.' });
  } finally {
    connection?.release();
  }
});

app.use('/api', (_req, res) => res.status(404).json({ error: 'API route not found.' }));
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'], maxAge: 0 }));
app.get(['/app', '/s/:id'], (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.use((_req, res) => res.status(404).send('Not found'));
app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'Files must be 25 MB or smaller.' });
  }
  console.error('Linkora request failed:', error.message);
  return res.status(400).json({ error: 'The request could not be processed.' });
});

app.listen(port, '0.0.0.0', () => console.log(`Linkora listening on ${port}`));
