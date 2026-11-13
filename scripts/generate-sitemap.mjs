import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createServer } from 'vite'

const configuredSiteUrl = process.env.VITE_SITE_URL?.trim()

if (!configuredSiteUrl) {
    console.warn(
        'VITE_SITE_URL is not set; skipping sitemap generation. Set it to the canonical production origin.'
    )
    process.exit(0)
}

const parsedSiteUrl = new URL(configuredSiteUrl)
if (
    !['http:', 'https:'].includes(parsedSiteUrl.protocol) ||
    parsedSiteUrl.username ||
    parsedSiteUrl.password ||
    parsedSiteUrl.pathname !== '/' ||
    parsedSiteUrl.search ||
    parsedSiteUrl.hash
) {
    throw new Error(
        'VITE_SITE_URL must be an http(s) origin, for example https://ticketlite.example.'
    )
}

const siteOrigin = parsedSiteUrl.origin
const distDirectory = resolve('dist')
const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
})

try {
    const { mockEvents } = await vite.ssrLoadModule('/src/mock/mock-data.ts')
    const publicPaths = [
        '/',
        ...mockEvents.map((event) => `/events/${encodeURIComponent(event.id)}`),
    ]
    const sitemapEntries = publicPaths
        .map(
            (path) =>
                `    <url><loc>${new URL(path, `${siteOrigin}/`)}</loc></url>`
        )
        .join('\n')
    const sitemap = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        sitemapEntries,
        '</urlset>',
        '',
    ].join('\n')

    await mkdir(distDirectory, { recursive: true })
    await writeFile(resolve(distDirectory, 'sitemap.xml'), sitemap)

    const robotsPath = resolve(distDirectory, 'robots.txt')
    const robots = await readFile(robotsPath, 'utf8')
    const sitemapDirective = `Sitemap: ${siteOrigin}/sitemap.xml`
    if (!robots.includes(sitemapDirective)) {
        await writeFile(
            robotsPath,
            `${robots.trimEnd()}\n${sitemapDirective}\n`
        )
    }

    console.info(
        `Generated sitemap.xml with ${publicPaths.length} URLs for ${siteOrigin}.`
    )
} finally {
    await vite.close()
}
