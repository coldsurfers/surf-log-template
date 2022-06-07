const fs = require('fs')
const path = require('path')
const dateFns = require('date-fns')
const articleMetaJSON = require('../public/article-meta.json')
const { homepage } = require('../package.json')

const sitemapPath = path.resolve(__dirname, '../public/sitemap.xml')

const sitemapXmlStringPre = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`
const sitemapXmlStringPost = `</urlset>`
const urlHost = homepage

function generateSitemap() {
    const exist = fs.existsSync(sitemapPath)
    if (exist) {
        fs.rmSync(sitemapPath)
    }

    let sitemapString = ``
    sitemapString += sitemapXmlStringPre

    // root route
    const routes = [
        {
            pathname: '/',
        },
        {
            pathname: '/about',
        },
    ]

    const { articles } = articleMetaJSON
    const categories = [
        ...new Set(
            Object.entries(articles).map(([key, data]) => data.data.category)
        ),
    ].sort()
    const tags = [
        ...new Set(
            Object.entries(articles).flatMap(([key, data]) => data.data.tags)
        ),
    ].filter((tag) => tag !== undefined)

    // category route
    categories.forEach((category) => {
        routes.push({
            pathname: `/category/${category}`,
        })
    })
    const articlesArray = Object.entries(articles).map(([key, data]) => {
        return data
    })
    // tag route
    tags.forEach((tag) => {
        routes.push({
            pathname: `/tags/${encodeURIComponent(tag)}`,
        })
    })
    // article route
    articlesArray.forEach((article) => {
        routes.push({
            pathname: `/article/${article.excerpt}`,
            lastmod: dateFns.format(
                new Date(article.data.createdAt),
                'yyyy-MM-dd'
            ),
        })
    })
    routes.forEach(({ pathname, lastmod }) => {
        sitemapString += `    <url>
        <loc>${urlHost}${pathname}</loc>`
        if (typeof lastmod !== 'undefined') {
            sitemapString += `\n        <lastmod>${lastmod}</lastmod>
    </url>\n`
        } else {
            sitemapString += `\n    </url>\n`
        }
    })
    sitemapString += sitemapXmlStringPost
    fs.writeFileSync(sitemapPath, sitemapString, 'utf8')
}

generateSitemap()
