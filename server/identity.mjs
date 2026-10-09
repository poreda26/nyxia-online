import { createHash, createPublicKey, randomBytes, randomInt, verify } from 'node:crypto';

// Giriş seçenekleri: Google / Apple ile giriş (kimlik belgesi sunucuda doğrulanır), doğrulanmış e-posta (kurtarma ve e-postayla giriş).
// İstemciye güvenilmez: Google/Apple'ın imzaladığı kimlik belgesi herkese açık anahtarlarıyla doğrulanır; aud/iss/exp denetlenir.
const PROVIDERS = {
  google: { issuers: ['https://accounts.google.com', 'accounts.google.com'], jwks: 'https://www.googleapis.com/oauth2/v3/certs' },
  apple: { issuers: ['https://appleid.apple.com'], jwks: 'https://appleid.apple.com/auth/keys' },
};
const CODE_TTL_MS = 15 * 60 * 1000;
const RESEND_GAP_MS = 60 * 1000;
const MAX_SENDS_PER_HOUR = 5;
const MAX_ATTEMPTS = 5;
const decode = (part) => JSON.parse(Buffer.from(part, 'base64url').toString('utf8'));
const normalizeEmail = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '');
const validEmail = (value) => value.length <= 120 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
const digest = (email, code) => createHash('sha256').update(`${email}:${code}`).digest('hex');

export function createIdentity(db, { fail, mailer, clientIds = {}, fetchJwks = defaultFetchJwks, setPassword, revokeSessions }) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS account_identities(provider TEXT NOT NULL, subject TEXT NOT NULL, account INTEGER NOT NULL REFERENCES accounts(id), email TEXT, created_at INTEGER NOT NULL, PRIMARY KEY(provider, subject));
    CREATE INDEX IF NOT EXISTS account_identities_account ON account_identities(account);
    CREATE TABLE IF NOT EXISTS account_emails(account INTEGER PRIMARY KEY REFERENCES accounts(id), email TEXT NOT NULL UNIQUE, verified_at INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS email_codes(email TEXT NOT NULL, purpose TEXT NOT NULL, account INTEGER, code_hash TEXT NOT NULL, expires INTEGER NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL, PRIMARY KEY(email, purpose));
    CREATE TABLE IF NOT EXISTS email_sends(email TEXT NOT NULL, at INTEGER NOT NULL);
    CREATE INDEX IF NOT EXISTS email_sends_email ON email_sends(email, at);
  `);

  const jwksCache = new Map();
  const keyFor = async (provider, kid) => {
    const cached = jwksCache.get(provider);
    const now = Date.now();
    if (cached && cached.keys.has(kid)) return cached.keys.get(kid);
    if (cached && now - cached.at < 60000) return null;
    const keys = new Map((await fetchJwks(PROVIDERS[provider].jwks)).map((jwk) => [jwk.kid, jwk]));
    jwksCache.set(provider, { at: now, keys });
    return keys.get(kid) || null;
  };

  const providersConfig = () => ({
    google: clientIds.google?.length ? { clientId: clientIds.google[0] } : null,
    apple: clientIds.apple?.length ? { clientId: clientIds.apple[0] } : null,
    email: !!mailer?.configured,
  });

  // Kimlik belgesini doğrular → { subject, email, emailVerified }.
  const verifyToken = async (provider, idToken, now = Date.now()) => {
    if (!PROVIDERS[provider] || !clientIds[provider]?.length) throw fail(400, 'PROVIDER_UNAVAILABLE');
    const parts = typeof idToken === 'string' ? idToken.split('.') : [];
    if (parts.length !== 3 || idToken.length > 6000) throw fail(401, 'INVALID_ID_TOKEN');
    let header; let payload;
    try { header = decode(parts[0]); payload = decode(parts[1]); } catch { throw fail(401, 'INVALID_ID_TOKEN'); }
    if (header.alg !== 'RS256' || !header.kid) throw fail(401, 'INVALID_ID_TOKEN');
    const jwk = await keyFor(provider, header.kid).catch(() => null);
    if (!jwk) throw fail(401, 'INVALID_ID_TOKEN');
    const valid = verify('RSA-SHA256', Buffer.from(`${parts[0]}.${parts[1]}`), createPublicKey({ key: jwk, format: 'jwk' }), Buffer.from(parts[2], 'base64url'));
    const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    if (!valid || !PROVIDERS[provider].issuers.includes(payload.iss) || !audiences.some((a) => clientIds[provider].includes(a))
      || !Number.isFinite(payload.exp) || payload.exp * 1000 < now - 60000 || typeof payload.sub !== 'string' || !payload.sub) throw fail(401, 'INVALID_ID_TOKEN');
    return { subject: payload.sub, email: normalizeEmail(payload.email), emailVerified: payload.email_verified === true || payload.email_verified === 'true' };
  };

  const identityOwner = (provider, subject) => db.prepare('SELECT account FROM account_identities WHERE provider=? AND subject=?').get(provider, subject)?.account ?? null;
  const emailOwner = (email) => db.prepare('SELECT account FROM account_emails WHERE email=?').get(email)?.account ?? null;
  const emailOf = (account) => db.prepare('SELECT email FROM account_emails WHERE account=?').get(account)?.email ?? null;

  const setVerifiedEmail = (account, email, now) => {
    if (emailOwner(email) && emailOwner(email) !== account) return false;
    db.prepare('INSERT OR REPLACE INTO account_emails(account,email,verified_at) VALUES(?,?,?)').run(account, email, now);
    return true;
  };

  const link = (account, provider, identity, now = Date.now()) => {
    const owner = identityOwner(provider, identity.subject);
    if (owner && owner !== account) throw fail(409, 'IDENTITY_TAKEN');
    if (!owner) db.prepare('INSERT INTO account_identities(provider,subject,account,email,created_at) VALUES(?,?,?,?,?)').run(provider, identity.subject, account, identity.email || null, now);
    if (identity.email && identity.emailVerified && !emailOf(account)) setVerifiedEmail(account, identity.email, now);
  };

  const security = (account) => ({
    email: emailOf(account),
    identities: db.prepare('SELECT provider FROM account_identities WHERE account=?').all(account).map((row) => row.provider),
  });

  // --- E-posta doğrulama kodu (kurtarma / e-postayla giriş)
  const sendCode = async (email, purpose, account, now = Date.now()) => {
    if (!mailer?.configured) throw fail(503, 'MAIL_UNAVAILABLE');
    const last = db.prepare('SELECT created_at FROM email_codes WHERE email=? AND purpose=?').get(email, purpose);
    if (last && now - last.created_at < RESEND_GAP_MS) throw fail(429, 'CODE_TOO_SOON');
    db.prepare('DELETE FROM email_sends WHERE at<?').run(now - 3600000);
    if (db.prepare('SELECT COUNT(*) AS n FROM email_sends WHERE email=?').get(email).n >= MAX_SENDS_PER_HOUR) throw fail(429, 'TOO_MANY_CODES');
    const code = String(randomInt(0, 1000000)).padStart(6, '0');
    db.prepare('INSERT OR REPLACE INTO email_codes(email,purpose,account,code_hash,expires,attempts,created_at) VALUES(?,?,?,?,?,0,?)').run(email, purpose, account, digest(email, code), now + CODE_TTL_MS, now);
    db.prepare('INSERT INTO email_sends(email,at) VALUES(?,?)').run(email, now);
    await mailer.send({
      to: email,
      subject: purpose === 'reset' ? 'Nyxia Online şifre sıfırlama kodu' : 'Nyxia Online doğrulama kodu',
      text: `Nyxia Online kodun: ${code}\nBu kod 15 dakika geçerlidir. Bunu sen istemediysen bu iletiyi yok say; hesabın güvende.`,
    });
  };

  const checkCode = (email, purpose, code, now = Date.now()) => {
    const row = db.prepare('SELECT * FROM email_codes WHERE email=? AND purpose=?').get(email, purpose);
    if (!row || row.expires < now || row.attempts >= MAX_ATTEMPTS) throw fail(400, 'INVALID_CODE');
    db.prepare('UPDATE email_codes SET attempts=attempts+1 WHERE email=? AND purpose=?').run(email, purpose);
    if (typeof code !== 'string' || !/^\d{6}$/.test(code) || digest(email, code) !== row.code_hash) throw fail(400, 'INVALID_CODE');
    db.prepare('DELETE FROM email_codes WHERE email=? AND purpose=?').run(email, purpose);
    return row;
  };

  const startEmail = async (account, rawEmail, now = Date.now()) => {
    const email = normalizeEmail(rawEmail);
    if (!validEmail(email)) throw fail(400, 'INVALID_EMAIL');
    if (emailOwner(email) && emailOwner(email) !== account) throw fail(409, 'EMAIL_TAKEN');
    await sendCode(email, 'verify', account, now);
  };

  const verifyEmail = (account, rawEmail, code, now = Date.now()) => {
    const email = normalizeEmail(rawEmail);
    if (!validEmail(email)) throw fail(400, 'INVALID_EMAIL');
    const row = checkCode(email, 'verify', code, now);
    if (row.account !== account) throw fail(400, 'INVALID_CODE');
    if (!setVerifiedEmail(account, email, now)) throw fail(409, 'EMAIL_TAKEN');
  };

  // E-postanın hesabı olup olmadığı dışarıya sızdırılmaz: her durumda aynı yanıt.
  const forgot = async (rawEmail, now = Date.now()) => {
    const email = normalizeEmail(rawEmail);
    if (!validEmail(email)) throw fail(400, 'INVALID_EMAIL');
    const account = emailOwner(email);
    if (!account) return;
    try { await sendCode(email, 'reset', account, now); } catch (error) { if (error.status !== 429) throw error; }
  };

  const reset = async (rawEmail, code, newPassword, now = Date.now()) => {
    const email = normalizeEmail(rawEmail);
    if (!validEmail(email)) throw fail(400, 'INVALID_EMAIL');
    if (typeof newPassword !== 'string' || newPassword.length < 12 || newPassword.length > 128) throw fail(400, 'INVALID_CREDENTIAL_FORMAT');
    const row = checkCode(email, 'reset', code, now);
    const account = emailOwner(email);
    if (!account || account !== row.account) throw fail(400, 'INVALID_CODE');
    await setPassword(account, newPassword);
    revokeSessions(account);
    return account;
  };

  const randomName = () => {
    for (let i = 0; i < 20; i++) {
      const name = `oyuncu_${randomBytes(4).toString('hex').slice(0, 6)}`;
      if (!db.prepare('SELECT 1 FROM accounts WHERE name=?').get(name)) return name;
    }
    return `oyuncu_${randomBytes(8).toString('hex')}`;
  };

  return { providersConfig, verifyToken, identityOwner, link, security, emailOf, emailOwner, startEmail, verifyEmail, forgot, reset, randomName, normalizeEmail };
}

async function defaultFetchJwks(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('JWKS_UNAVAILABLE');
  return (await response.json()).keys || [];
}
