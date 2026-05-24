import postgres from "postgres"
import crypto from "crypto"

let sql: ReturnType<typeof postgres> | null = null

function getSql() {
  if (!sql) {
    sql = postgres(process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:54322/postgres", {
      max: 5,
      connect_timeout: 5,
    })
  }
  return sql
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex")
}

export async function createUserAccount(email: string, password: string, username?: string) {
  const s = getSql()
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = hashPassword(password, salt)

  const rows = await s`
    INSERT INTO user_accounts (email, password_hash, password_salt, username, role, tier)
    VALUES (${email.toLowerCase()}, ${hash}, ${salt}, ${username || email.split("@")[0]}, 'creator', 'creator')
    ON CONFLICT (email) DO NOTHING
    RETURNING id, email, username, role, tier
  `
  if (rows.length === 0) {
    throw new Error("Email already exists")
  }
  return rows[0]
}

export async function authenticateUser(email: string, password: string) {
  const s = getSql()

  const rows = await s`
    SELECT id, email, username, role, tier, password_hash, password_salt
    FROM user_accounts
    WHERE email = ${email.toLowerCase()}
  `
  if (rows.length === 0) return null

  const user = rows[0]
  const hash = hashPassword(password, user.password_salt)

  if (hash !== user.password_hash) return null

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
    tier: user.tier,
  }
}

export async function getUserById(id: string) {
  const s = getSql()
  const rows = await s`
    SELECT id, email, username, role, tier
    FROM user_accounts
    WHERE id = ${id}
  `
  if (rows.length === 0) return null
  return rows[0]
}

export async function createSessionToken(userId: string): Promise<string> {
  const s = getSql()
  const token = crypto.randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  await s`
    INSERT INTO user_sessions (user_id, token, expires_at)
    VALUES (${userId}, ${token}, ${expiresAt})
  `
  return token
}

export async function getUserBySessionToken(token: string) {
  const s = getSql()
  const rows = await s`
    SELECT u.id, u.email, u.username, u.role, u.tier
    FROM user_sessions s
    JOIN user_accounts u ON u.id = s.user_id
    WHERE s.token = ${token} AND s.expires_at > now()
  `
  if (rows.length === 0) return null
  return rows[0]
}

export async function deleteSessionToken(token: string) {
  const s = getSql()
  await s`DELETE FROM user_sessions WHERE token = ${token}`
}
