"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { batchImportProducts } from "@/lib/actions/import"

interface ImportFormProps {
  userId: string
}

export function ImportForm({ userId }: ImportFormProps) {
  const [csvText, setCsvText] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null)
  const router = useRouter()

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setCsvText(ev.target?.result as string || "")
      setResult(null)
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (!csvText.trim()) return
    setLoading(true)
    setResult(null)

    // Parse CSV. Note: naive split(",") does not handle quoted fields
    // containing commas. For production, use a proper CSV parser.
    const lines = csvText.trim().split("\n")
    if (lines.length < 2) {
      setResult({ imported: 0, skipped: 0, errors: ["CSV must have header + at least 1 data row"] })
      setLoading(false)
      return
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/"/g, ""))
    const titleIdx = headers.findIndex((h) => h.includes("title") || h.includes("name"))
    const urlIdx = headers.findIndex((h) => h.includes("url") || h.includes("link"))
    const priceIdx = headers.findIndex((h) => h.includes("price"))
    const sizesIdx = headers.findIndex((h) => h.includes("size"))
    const catIdx = headers.findIndex((h) => h.includes("categor"))

    const rows = lines.slice(1).map((line) => {
      const cols = line.split(",").map((c) => c.trim().replace(/"/g, ""))
      return {
        title: titleIdx >= 0 ? cols[titleIdx] : undefined,
        source_url: urlIdx >= 0 ? cols[urlIdx] : cols[0],
        price: priceIdx >= 0 ? cols[priceIdx] : undefined,
        sizes: sizesIdx >= 0 ? cols[sizesIdx] : undefined,
        category: catIdx >= 0 ? cols[catIdx] : undefined,
      }
    }).filter((r) => r.source_url)

    const res = await batchImportProducts(userId, rows)
    setResult(res)
    setLoading(false)
    router.refresh()
  }

  const handlePasteLinks = async () => {
    if (!csvText.trim()) return
    setLoading(true)
    setResult(null)

    // One URL per line
    const lines = csvText.trim().split("\n").filter(Boolean)
    const rows = lines.map((line) => ({
      source_url: line.trim(),
    }))

    const res = await batchImportProducts(userId, rows)
    setResult(res)
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-sm text-white">Upload CSV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed border-zinc-700 p-8 text-center hover:border-zinc-500">
            <Upload className="h-8 w-8 text-zinc-500" />
            <span className="text-xs text-zinc-400">Drop CSV or click to browse</span>
            <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
          </label>
          <Textarea
            placeholder="Or paste CSV here..."
            value={csvText}
            onChange={(e) => { setCsvText(e.target.value); setResult(null) }}
            className="min-h-[120px] border-zinc-700 bg-zinc-800 text-xs text-white placeholder:text-zinc-500"
          />
          <Button onClick={handleImport} disabled={loading} className="w-full gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Import CSV
          </Button>
        </CardContent>
      </Card>

      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-sm text-white">Paste Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Paste URLs (one per line)..."
            value={csvText}
            onChange={(e) => { setCsvText(e.target.value); setResult(null) }}
            className="min-h-[120px] border-zinc-700 bg-zinc-800 text-xs text-white placeholder:text-zinc-500"
          />
          <Button onClick={handlePasteLinks} disabled={loading} className="w-full gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Import Links
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className={`border-zinc-800 bg-zinc-900 md:col-span-2 ${result.errors.length > 0 ? "border-l-rose-500" : "border-l-emerald-500"}`}>
          <CardContent className="flex items-center gap-3 p-4">
            {result.errors.length === 0 ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-400" />
            )}
            <div>
              <p className="text-sm text-white">
                <span className="text-emerald-400">{result.imported} imported</span>
                {result.skipped > 0 && <>, <span className="text-zinc-500">{result.skipped} skipped (duplicates)</span></>}
              </p>
              {result.errors.map((e, i) => (
                <p key={i} className="font-mono text-[10px] text-rose-400">{e}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
