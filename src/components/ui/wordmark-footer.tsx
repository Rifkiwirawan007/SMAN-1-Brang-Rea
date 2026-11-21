"use client"

import * as React from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// at least 44 px tall wherever a finger taps it
const tap = "max-md:inline-flex max-md:min-h-11 max-md:items-center pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:items-center"
const serif = "var(--font-display, var(--font-serif, ui-serif, Georgia, serif))"

export type FooterColumn = { title: string; links: { label: string; href: string }[] }

export interface WordmarkFooterProps extends React.HTMLAttributes<HTMLElement> {
  /** The product name: the wordmark top left and the large name at the bottom. */
  name: string
  /** The name in the © line. */
  legalName?: string
  year: number
  description?: string
  email?: string
  /** A short status line next to a green dot, such as "All systems normal". */
  status?: string
  /** What screen readers call the footer navigation. */
  navLabel?: string
  columns: FooterColumn[]
  /** A small link at the end of the bottom line. */
  credit?: { label: string; href: string }
  /** (Tambahan) Ganti wordmark kiri atas, mis. logo + nama sekolah. Bawaan: teks `name`. */
  brand?: React.ReactNode
  /** (Tambahan) Isi ekstra di bawah deskripsi, mis. ikon media sosial. */
  aside?: React.ReactNode
}

/** Tautan internal pakai next/link (tanpa muat ulang halaman), tautan luar pakai <a>. */
function Tautan({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} className={className}>
      {children}
    </a>
  )
}

/**
 * A footer with a short description, link columns that fold on phones, and the product name set large,
 * fading into the background.
 */
export function WordmarkFooter({
  name,
  legalName,
  year,
  description,
  email,
  status,
  navLabel = "Footer",
  columns,
  credit,
  brand,
  aside,
  className,
  ...props
}: WordmarkFooterProps) {
  return (
    <footer className={cn("relative overflow-hidden bg-background text-foreground", className)} {...props}>
      <div className="mx-auto grid w-full max-w-[1200px] gap-12 px-6 pt-16 pb-10 max-md:gap-6 max-md:pt-12 max-md:pb-6 md:grid-cols-12 md:px-10">
        <div className="md:col-span-12 lg:col-span-4">
          {brand ?? (
            <span className="block text-[25px] leading-none tracking-[-0.02em]" style={{ fontFamily: serif, fontWeight: 380 }}>
              {name}
            </span>
          )}
          {description && <p className="mt-4 max-w-[300px] text-[14px] leading-[22px] text-muted-foreground">{description}</p>}
          {status && (
            <p className="mt-6 inline-flex items-center gap-2 text-[13px] text-muted-foreground">
              <span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" />
              {status}
            </p>
          )}
          {aside}
        </div>
        <nav aria-label={navLabel} className="grid grid-cols-2 gap-8 max-md:hidden md:col-span-12 lg:col-span-8 lg:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title}>
              <p className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground/80 uppercase">{col.title}</p>
              <ul className="mt-4 grid gap-2.5 pointer-coarse:mt-2 pointer-coarse:gap-0">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Tautan href={l.href} className={cn("text-[14px] text-muted-foreground transition-colors hover:text-foreground", tap)}>
                      {l.label}
                    </Tautan>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        {/* phones: each column folds away; tap a heading to open it */}
        <nav aria-label={navLabel} className="-mx-4 grid gap-1 md:hidden">
          {columns.map((col) => (
            <details key={col.title} className="group rounded-2xl open:bg-foreground/[0.03]">
              <summary className="flex h-14 cursor-pointer list-none items-center justify-between px-4 [&::-webkit-details-marker]:hidden">
                <span className="font-mono text-[12px] tracking-[0.14em] text-muted-foreground uppercase">{col.title}</span>
                <Plus className="size-4 text-muted-foreground/80 transition-transform duration-300 group-open:rotate-45 motion-reduce:transition-none" strokeWidth={1.75} aria-hidden="true" />
              </summary>
              <ul className="px-4 pb-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Tautan href={l.href} className="block py-3 text-[15px] text-muted-foreground">
                      {l.label}
                    </Tautan>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </nav>
      </div>
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-2 px-6 pb-6 text-[13px] text-muted-foreground/80 sm:flex-row sm:items-center sm:gap-6 md:px-10">
        <p className="font-mono tabular-nums">
          © {year} {legalName ?? name}
        </p>
        {email && (
          <a href={`mailto:${email}`} className={cn("hover:text-foreground", tap)}>
            {email}
          </a>
        )}
        {credit && (
          <Tautan href={credit.href} className={cn("hover:text-foreground sm:ml-auto", tap)}>
            {credit.label}
          </Tautan>
        )}
      </div>
      {/* the name, set large and fading into the background */}
      <p
        aria-hidden="true"
        className="pointer-events-none -mb-[0.2em] text-center text-[clamp(96px,24vw,360px)] leading-[0.9] tracking-[-0.04em] text-transparent select-none [background-clip:text] [-webkit-background-clip:text] [background-image:linear-gradient(to_bottom,color-mix(in_oklab,var(--color-primary)_32%,transparent),transparent_85%)] max-md:text-[23vw]"
        style={{ fontFamily: serif, fontWeight: 340 }}
      >
        {name}
      </p>
    </footer>
  )
}

export default WordmarkFooter
