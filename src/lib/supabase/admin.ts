import { createClient } from "@supabase/supabase-js"
import postgres from "postgres"

let sql: ReturnType<typeof postgres> | null = null

function getSql() {
  if (!sql) {
    sql = postgres(process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:54322/postgres", {
      max: 5,
      connect_timeout: 5,
      idle_timeout: 10,
    })
  }
  return sql
}

function cols(s: string): string {
  if (s.trim() === "*") return "*"
  return s.split(",").map((c) => `"${c.trim()}"`).join(", ")
}

function esc(v: any): string {
  if (v === null || v === undefined) return "NULL"
  if (typeof v === "boolean") return v ? "true" : "false"
  if (typeof v === "number") return String(v)
  return `'${String(v).replace(/'/g, "''")}'`
}

function ident(s: string): string {
  return `"${s}"`
}

function buildUpdateSet(data: Record<string, any>): string {
  return Object.entries(data)
    .map(([k, v]) => `${ident(k)} = ${esc(v)}`)
    .join(", ")
}

async function query(sqlClient: ReturnType<typeof postgres>, sqlStr: string): Promise<any[]> {
  return sqlClient.unsafe(sqlStr)
}

// Direct Postgres query helper for local dev when Supabase API is unavailable
function wrapSql(sqlClient: ReturnType<typeof postgres>) {
  return {
    from: (table: string) => ({
      select: (columns: string) => ({
        eq: (col: string, val_: string) => ({
          single: async () => {
            const rows = await query(sqlClient, `SELECT ${cols(columns)} FROM ${ident(table)} WHERE ${ident(col)} = ${esc(val_)} LIMIT 1`)
            return { data: rows[0] || null, error: null }
          },
          limit: (n: number) => ({
            then: async (resolve: any) => {
              const rows = await query(sqlClient, `SELECT ${cols(columns)} FROM ${ident(table)} WHERE ${ident(col)} = ${esc(val_)} LIMIT ${n}`)
              resolve({ data: rows, error: null, count: rows.length })
            }
          }),
          eq: (col2: string, val2_: string) => ({
            order: (col3: string, opts: { ascending: boolean }) => ({
              then: async (resolve: any) => {
                const dir = opts.ascending ? "ASC" : "DESC"
                const rows = await query(sqlClient, `SELECT ${cols(columns)} FROM ${ident(table)} WHERE ${ident(col)} = ${esc(val_)} AND ${ident(col2)} = ${esc(val2_)} ORDER BY ${ident(col3)} ${dir}`)
                resolve({ data: rows, error: null, count: rows.length })
              }
            }),
            single: async () => {
              const rows = await query(sqlClient, `SELECT ${cols(columns)} FROM ${ident(table)} WHERE ${ident(col)} = ${esc(val_)} AND ${ident(col2)} = ${esc(val2_)} LIMIT 1`)
              return { data: rows[0] || null, error: null }
            },
            then: async (resolve: any) => {
              const rows = await query(sqlClient, `SELECT ${cols(columns)} FROM ${ident(table)} WHERE ${ident(col)} = ${esc(val_)} AND ${ident(col2)} = ${esc(val2_)}`)
              resolve({ data: rows, error: null, count: rows.length })
            }
          }),
          order: (col2: string, opts: { ascending: boolean }) => ({
            limit: (n: number) => ({
              then: async (resolve: any) => {
                const dir = opts.ascending ? "ASC" : "DESC"
                const rows = await query(sqlClient, `SELECT ${cols(columns)} FROM ${ident(table)} WHERE ${ident(col)} = ${esc(val_)} ORDER BY ${ident(col2)} ${dir} LIMIT ${n}`)
                resolve({ data: rows, error: null })
              }
            }),
            order: (col3: string, opts2: { ascending: boolean }) => ({
              limit: (n: number) => ({
                then: async (resolve: any) => {
                  const dir = opts.ascending ? "ASC" : "DESC"
                  const dir2 = opts2.ascending ? "ASC" : "DESC"
                  const rows = await query(sqlClient, `SELECT ${cols(columns)} FROM ${ident(table)} WHERE ${ident(col)} = ${esc(val_)} ORDER BY ${ident(col2)} ${dir}, ${ident(col3)} ${dir2} LIMIT ${n}`)
                  resolve({ data: rows, error: null })
                }
              }),
              then: async (resolve: any) => {
                const dir = opts.ascending ? "ASC" : "DESC"
                const dir2 = opts2.ascending ? "ASC" : "DESC"
                const rows = await query(sqlClient, `SELECT ${cols(columns)} FROM ${ident(table)} WHERE ${ident(col)} = ${esc(val_)} ORDER BY ${ident(col2)} ${dir}, ${ident(col3)} ${dir2}`)
                resolve({ data: rows, error: null, count: rows.length })
              }
            }),
            then: async (resolve: any) => {
              const dir = opts.ascending ? "ASC" : "DESC"
              const rows = await query(sqlClient, `SELECT ${cols(columns)} FROM ${ident(table)} WHERE ${ident(col)} = ${esc(val_)} ORDER BY ${ident(col2)} ${dir}`)
              resolve({ data: rows, error: null, count: rows.length })
            }
          }),
          select: (cols2: string) => ({
            single: async () => {
              const rows = await query(sqlClient, `SELECT ${cols(cols2)} FROM ${ident(table)} WHERE ${ident(col)} = ${esc(val_)} LIMIT 1`)
              return { data: rows[0] || null, error: null, count: rows.length }
            },
            then: async (resolve: any) => {
              const rows = await query(sqlClient, `SELECT ${cols(cols2)} FROM ${ident(table)} WHERE ${ident(col)} = ${esc(val_)}`)
              resolve({ data: rows, error: null, count: rows.length })
            }
          }),
          then: async (resolve: any) => {
            const rows = await query(sqlClient, `SELECT ${cols(columns)} FROM ${ident(table)} WHERE ${ident(col)} = ${esc(val_)}`)
            resolve({ data: rows, error: null, count: rows.length })
          }
        }),
        ilike: (col: string, val_: string) => ({
          limit: (n: number) => ({
            then: async (resolve: any) => {
              const rows = await query(sqlClient, `SELECT ${cols(columns)} FROM ${ident(table)} WHERE ${ident(col)} ILIKE ${esc(val_)} LIMIT ${n}`)
              resolve({ data: rows, error: null })
            }
          })
        }),
        in: (col: string, vals: string[]) => ({
          order: (col2: string, opts: { ascending: boolean }) => ({
            then: async (resolve: any) => {
              const dir = opts.ascending ? "ASC" : "DESC"
              const valsStr = vals.map((v) => esc(v)).join(", ")
              const rows = await query(sqlClient, `SELECT ${cols(columns)} FROM ${ident(table)} WHERE ${ident(col)} IN (${valsStr}) ORDER BY ${ident(col2)} ${dir}`)
              resolve({ data: rows, error: null })
            }
          }),
          then: async (resolve: any) => {
            const valsStr = vals.map((v) => esc(v)).join(", ")
            const rows = await query(sqlClient, `SELECT ${cols(columns)} FROM ${ident(table)} WHERE ${ident(col)} IN (${valsStr})`)
            resolve({ data: rows, error: null, count: rows.length })
          }
        }),
        order: (col2: string, opts: { ascending: boolean }) => ({
          limit: (n: number) => ({
            then: async (resolve: any) => {
              const rows = await query(sqlClient, `SELECT ${cols(columns)} FROM ${ident(table)} ORDER BY ${ident(col2)} ${opts.ascending ? "ASC" : "DESC"} LIMIT ${n}`)
              resolve({ data: rows, error: null, count: rows.length })
            }
          }),
          order: (col3: string, opts2: { ascending: boolean }) => ({
            limit: (n: number) => ({
              then: async (resolve: any) => {
                const rows = await query(sqlClient, `SELECT ${cols(columns)} FROM ${ident(table)} ORDER BY ${ident(col2)} ${opts.ascending ? "ASC" : "DESC"}, ${ident(col3)} ${opts2.ascending ? "ASC" : "DESC"} LIMIT ${n}`)
                resolve({ data: rows, error: null, count: rows.length })
              }
            }),
            range: (from: number, to: number) => ({
              then: async (resolve: any) => {
                const rows = await query(sqlClient, `SELECT ${cols(columns)} FROM ${ident(table)} ORDER BY ${ident(col2)} ${opts.ascending ? "ASC" : "DESC"}, ${ident(col3)} ${opts2.ascending ? "ASC" : "DESC"} LIMIT ${to - from + 1} OFFSET ${from}`)
                resolve({ data: rows, error: null, count: rows.length })
              }
            }),
            then: async (resolve: any) => {
              const rows = await query(sqlClient, `SELECT ${cols(columns)} FROM ${ident(table)} ORDER BY ${ident(col2)} ${opts.ascending ? "ASC" : "DESC"}, ${ident(col3)} ${opts2.ascending ? "ASC" : "DESC"}`)
              resolve({ data: rows, error: null, count: rows.length })
            }
          })
        }),
        limit: (n: number) => ({
          then: async (resolve: any) => {
            const rows = await query(sqlClient, `SELECT ${cols(columns)} FROM ${ident(table)} LIMIT ${n}`)
            resolve({ data: rows, error: null, count: rows.length })
          }
        }),
        then: async (resolve: any) => {
          const rows = await query(sqlClient, `SELECT ${cols(columns)} FROM ${ident(table)}`)
          resolve({ data: rows, error: null, count: rows.length })
        }
      }),
      insert: (data: any | any[]) => ({
        select: (cols_: string) => ({
          single: async () => {
            const items = Array.isArray(data) ? data : [data]
            const cols_arr = Object.keys(items[0])
            const vals_list = items.map((item: any) => `(${cols_arr.map((c: string) => esc(item[c])).join(", ")})`).join(", ")
            const sqlStr = `INSERT INTO ${ident(table)} (${cols(cols_arr.join(", "))}) VALUES ${vals_list} RETURNING ${cols(cols_)}`
            const rows = await query(sqlClient, sqlStr)
            return { data: rows[0] || null, error: null }
          },
          then: async (resolve: any) => {
            const items = Array.isArray(data) ? data : [data]
            const cols_arr = Object.keys(items[0])
            const vals_list = items.map((item: any) => `(${cols_arr.map((c: string) => esc(item[c])).join(", ")})`).join(", ")
            const sqlStr = `INSERT INTO ${ident(table)} (${cols(cols_arr.join(", "))}) VALUES ${vals_list} RETURNING ${cols(cols_)}`
            const rows = await query(sqlClient, sqlStr)
            resolve({ data: rows, error: null })
          }
        }),
        then: async (resolve: any) => {
          const items = Array.isArray(data) ? data : [data]
          const cols_arr = Object.keys(items[0])
          const vals_list = items.map((item: any) => `(${cols_arr.map((c: string) => esc(item[c])).join(", ")})`).join(", ")
          const sqlStr = `INSERT INTO ${ident(table)} (${cols(cols_arr.join(", "))}) VALUES ${vals_list}`
          await query(sqlClient, sqlStr)
          resolve({ error: null })
        }
      }),
      update: (data: any) => ({
        eq: (col: string, val_: string) => ({
          then: async (resolve: any) => {
            await query(sqlClient, `UPDATE ${ident(table)} SET ${buildUpdateSet(data)} WHERE ${ident(col)} = ${esc(val_)}`)
            resolve({ error: null })
          }
        })
      }),
      upsert: (data: any, opts?: any) => ({
        then: async (resolve: any) => {
          const cols_arr = Object.keys(data)
          const vals = cols_arr.map((c: string) => esc(data[c])).join(", ")
          let sqlStr = `INSERT INTO ${ident(table)} (${cols(cols_arr.join(", "))}) VALUES (${vals})`
          if (opts?.onConflict) {
            const conflictCols = opts.onConflict.split(",").map((c: string) => ident(c.trim())).join(", ")
            const updates = cols_arr.map((c: string) => `${ident(c)} = EXCLUDED.${ident(c)}`).join(", ")
            sqlStr += ` ON CONFLICT (${conflictCols}) DO UPDATE SET ${updates}`
          }
          await query(sqlClient, sqlStr)
          resolve({ error: null })
        }
      }),
      delete: () => ({
        eq: (col: string, val_: string) => ({
          then: async (resolve: any) => {
            await query(sqlClient, `DELETE FROM ${ident(table)} WHERE ${ident(col)} = ${esc(val_)}`)
            resolve({ error: null })
          }
        })
      })
    })
  }
}

export function createAdminClient() {
  const dbUrl = process.env.DATABASE_URL

  // Use direct postgres connection for local dev
  if (dbUrl) {
    const s = getSql()
    const wrapped: any = wrapSql(s)
    wrapped.auth = {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      admin: { listUsers: async () => ({ data: { users: [] }, error: null }) },
    }
    return wrapped
  }

  // Use Supabase API when available
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
