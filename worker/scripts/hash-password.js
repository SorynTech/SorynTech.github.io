#!/usr/bin/env node
/**
 * Generate PBKDF2 password hash for Worker env (OWNER_PASSWORD_HASH, GUEST_PASSWORD_HASH).
 * Usage: node scripts/hash-password.js <password>
 * Optional: PASSWORD_SALT=<base64> for reproducible hash (must match Worker env).
 */
const crypto = require('crypto');

const password = process.argv[2];
const salt = process.env.PASSWORD_SALT || crypto.randomBytes(16).toString('base64');

if (!password) {
  console.error('Usage: node hash-password.js <password>');
  console.error('Optional: PASSWORD_SALT=<base64> for reproducible hash');
  process.exit(1);
}

const hash = crypto.pbkdf2Sync(
  password,
  Buffer.from(salt, 'base64'),
  100000,
  32,
  'sha256'
);

console.log('PASSWORD_SALT (use same for both users):', salt);
console.log('Hash (hex):', hash.toString('hex'));
console.log('Set via: wrangler secret put OWNER_PASSWORD_HASH');
console.log('Then paste the hex value when prompted.');
