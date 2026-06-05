import crypto from 'node:crypto';

const iterations = 120000;
const keyLength = 32;
const digest = 'sha256';

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, iterations, keyLength, digest).toString('hex');
  return `pbkdf2$${iterations}$${salt}$${hash}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash?.startsWith('pbkdf2$')) {
    return false;
  }

  const [, storedIterations, salt, hash] = storedHash.split('$');
  const computed = crypto.pbkdf2Sync(password, salt, Number(storedIterations), keyLength, digest).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computed, 'hex'));
}
