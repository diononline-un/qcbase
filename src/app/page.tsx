import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Store, Zap, Globe } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold tracking-tight">
            QCBase
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-4 py-24 text-center sm:py-32">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Dein Proxy-Shopping{" "}
            <span className="text-primary">Creator Hub</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Zentralisiere deine Finds, teile sie mit deiner Community und verdiene an jedem
            Click-Out. Kein Spreadsheet-Chaos mehr.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="gap-2">
                Jetzt starten <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                Demo ansehen
              </Button>
            </Link>
          </div>
        </section>

        <section className="border-t bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:py-24">
            <div className="grid gap-8 sm:grid-cols-3">
              <div className="space-y-3 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Store className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Multi-Agent Support</h3>
                <p className="text-sm text-muted-foreground">
                  11 Agenten integriert – deine Community wählt frei.
                </p>
              </div>
              <div className="space-y-3 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Auto-OOS & QC</h3>
                <p className="text-sm text-muted-foreground">
                  Automatische OOS-Erkennung und QC-Bilder direkt von Agenten.
                </p>
              </div>
              <div className="space-y-3 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Eigene Domain</h3>
                <p className="text-sm text-muted-foreground">
                  Subdomain oder Custom Domain – dein Hub, deine Marke.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-muted-foreground">
          QCBase – Der Creator Hub für Proxy-Shopping
        </div>
      </footer>
    </div>
  )
}
