import { createClient } from "@supabase/supabase-js"
import postgres from "postgres"

let sql: ReturnType<typeof postgres> | null = null

function getSql() {
  if (!sql) {
    sql = postgres(process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:54322/postgres", {
      max: 5,
    })
  }
  return sql
}

// Direct Postgres query helper for local dev when Supabase API is unavailable
function wrapSql(sqlClient: ReturnType<typeof postgres>) {
  return {
    from: (table: string) => ({
      select: (columns: string) => ({
        eq: (col: string, val: string) => ({
          single: async () => {
            const rows = await sqlClient`SELECT ${sqlClient(columns)} FROM ${sqlClient(table)} WHERE ${sqlClient(col)} = ${val} LIMIT 1`
            return { data: rows[0] || null, error: null }
          },
          order: (col: string, opts: { ascending: boolean }) => ({
            limit: (n: number) => ({
              then: async (resolve: any) => {
                const dir = opts.ascending ? "ASC" : "DESC"
                const rows = await sqlClient`SELECT ${sqlClient(columns)} FROM ${sqlClient(table)} WHERE ${sqlClient(col)} = ${val} ORDER BY ${sqlClient(col)} ${sqlClient(dir)} LIMIT ${n}`
                resolve({ data: rows, error: null })
              }
            }),
            async then(resolve: any) {
              const dir = opts.ascending ? "ASC" : "DESC"
              const rows = await sqlClient`SELECT ${sqlClient(columns)} FROM ${sqlClient(table)} WHERE ${sqlClient(col)} = ${val} ORDER BY ${sqlClient(col)} ${dir}`
              resolve({ data: rows, error: null })
            }
          }),
          select: (cols: string) => ({
            single: async () => {
              const rows = await sqlClient`SELECT ${sqlClient(cols)} FROM ${sqlClient(table)} WHERE ${sqlClient(col)} = ${val} LIMIT 1`
              return { data: rows[0] || null, error: null, count: rows.length }
            },
            async then(resolve: any) {
              const rows = await sqlClient`SELECT ${sqlClient(cols)} FROM ${sqlClient(table)} WHERE ${sqlClient(col)} = ${val}`
              resolve({ data: rows, error: null, count: rows.length })
            }
          }),
          async then(resolve: any) {
            const rows = await sqlClient`SELECT ${sqlClient(columns)} FROM ${sqlClient(table)} WHERE ${sqlClient(col)} = ${val}`
            resolve({ data: rows, error: null, count: rows.length })
          }
        }),
        ilike: (col: string, val: string) => ({
          limit: (n: number) => ({
            async then(resolve: any) {
              const rows = await sqlClient`SELECT ${sqlClient(columns)} FROM ${sqlClient(table)} WHERE ${sqlClient(col)} ILIKE ${val} LIMIT ${n}`
              resolve({ data: rows, error: null })
            }
          })
        }),
        or: (condition: string) => ({
          range: (from: number, to: number) => ({
            order: (col: string, opts: { ascending: boolean }) => ({
              order: (col2: string, opts2: { ascending: boolean }) => ({
                async then(resolve: any) {
                  const rows = await sqlClient`SELECT ${sqlClient(columns)} FROM ${sqlClient(table)} WHERE ${sqlClient(condition)} ORDER BY ${sqlClient(col)} ${opts.ascending ? 'ASC' : 'DESC'}, ${sqlClient(col2)} ${opts2.ascending ? 'ASC' : 'DESC'} LIMIT ${to - from + 1} OFFSET ${from}`
                  resolve({ data: rows, error: null, count: rows.length })
                }
              })
            })
          })
        }),
        order: (col: string, opts: { ascending: boolean }) => ({
          order: (col2: string, opts2: { ascending: boolean }) => ({
            limit: (n: number) => ({
              async then(resolve: any) {
                const rows = await sqlClient`SELECT ${sqlClient(columns)} FROM ${sqlClient(table)} ORDER BY ${sqlClient(col)} ${opts.ascending ? 'ASC' : 'DESC'}, ${sqlClient(col2)} ${opts2.ascending ? 'ASC' : 'DESC'} LIMIT ${n}`
                resolve({ data: rows, error: null, count: rows.length })
              }
            }),
            range: (from: number, to: number) => ({
              async then(resolve: any) {
                const rows = await sqlClient`SELECT ${sqlClient(columns)} FROM ${sqlClient(table)} ORDER BY ${sqlClient(col)} ${opts.ascending ? 'ASC' : 'DESC'}, ${sqlClient(col2)} ${opts2.ascending ? 'ASC' : 'DESC'} LIMIT ${to - from + 1} OFFSET ${from}`
                resolve({ data: rows, error: null, count: rows.length })
              }
            }),
            async then(resolve: any) {
              const rows = await sqlClient`SELECT ${sqlClient(columns)} FROM ${sqlClient(table)} ORDER BY ${sqlClient(col)} ${opts.ascending ? 'ASC' : 'DESC'}, ${sqlClient(col2)} ${opts2.ascending ? 'ASC' : 'DESC'}`
              resolve({ data: rows, error: null, count: rows.length })
            }
          })
        }),
        limit: (n: number) => ({
          async then(resolve: any) {
            const rows = await sqlClient`SELECT ${sqlClient(columns)} FROM ${sqlClient(table)} LIMIT ${n}`
            resolve({ data: rows, error: null, count: rows.length })
          }
        }),
        async then(resolve: any) {
          const rows = await sqlClient`SELECT ${sqlClient(columns)} FROM ${sqlClient(table)}`
          resolve({ data: rows, error: null, count: rows.length })
        }
      }),
      insert: (data: any | any[]) => ({
        select: (cols: string) => ({
          single: async () => {
            const items = Array.isArray(data) ? data : [data]
            const cols_arr = Object.keys(items[0])
            // Use raw SQL insert
            const vals_list = items.map((item: any) => {
              const vals = cols_arr.map((c: string) => {
                const v = item[c]
                if (v === null || v === undefined) return 'NULL'
                if (typeof v === 'boolean') return v ? 'true' : 'false'
                return `'${String(v).replace(/'/g, "''")}'`
              })
              return `(${vals.join(', ')})`
            })
            const sql_str = `INSERT INTO ${table} (${cols_arr.join(', ')}) VALUES ${vals_list.join(', ')} RETURNING ${cols}`
            const rows = await sqlClient.unsafe(sql_str)
            return { data: rows[0], error: null }
          }
        })
      }),
      update: (data: any) => ({
        eq: (col: string, val: string) => ({
          async then(resolve: any) {
            const sets = Object.entries(data).map(([k, v]) => {
              if (v === null || v === undefined) return `${sqlClient(k)} = NULL`
              if (typeof v === 'boolean') return `${sqlClient(k)} = ${v}`
              if (typeof v === 'number') return `${sqlClient(k)} = ${v}`
              return `${sqlClient(k)} = '${String(v).replace(/'/g, "''")}'`
            })
            await sqlClient.unsafe(`UPDATE ${table} SET ${sets.join(', ')} WHERE ${sqlClient(col)} = '${val}'`)
            resolve({ error: null })
          }
        })
      }),
      upsert: (data: any, opts?: any) => ({
        async then(resolve: any) {
          const cols = Object.keys(data)
          const vals = cols.map((c: string) => {
            const v = data[c]
            if (v === null || v === undefined) return 'NULL'
            if (typeof v === 'boolean') return v ? 'true' : 'false'
            if (typeof v === 'number') return String(v)
            return `'${String(v).replace(/'/g, "''")}'`
          })
          const conflict = opts?.onConflict || ''
          const conflict_clause = conflict ? ` ON CONFLICT (${sqlClient(conflict)}) DO UPDATE SET ${cols.map((c: string) => `${sqlClient(c)} = EXCLUDED.${sqlClient(c)}`).join(', ')}` : ''
          await sqlClient.unsafe(`INSERT INTO ${table} (${cols.map(c => sqlClient(c)).join(', ')}) VALUES (${vals.join(', ')})${conflict_clause}`)
          resolve({ error: null })
        }
      }),
      delete: () => ({
        eq: (col: string, val: string) => ({
          async then(resolve: any) {
            await sqlClient`DELETE FROM ${sqlClient(table)} WHERE ${sqlClient(col)} = ${val}`
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
    // Add auth stub for server components that check auth
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
