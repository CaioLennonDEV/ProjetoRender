import { createServer } from 'http'
import { readFileSync, statSync } from 'fs'
import { join, extname } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PORT = process.env.PORT || 3000
const distDir = join(__dirname, 'dist')

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
}

function getContentType(filePath) {
  const ext = extname(filePath).toLowerCase()
  return mimeTypes[ext] || 'application/octet-stream'
}

function serveFile(filePath, res) {
  try {
    const stats = statSync(filePath)
    if (!stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('404 Not Found')
      return
    }

    const content = readFileSync(filePath)
    const contentType = getContentType(filePath)
    
    res.writeHead(200, { 'Content-Type': contentType })
    res.end(content)
  } catch (error) {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('404 Not Found')
  }
}

const server = createServer((req, res) => {
  let filePath = req.url === '/' ? '/index.html' : req.url
  filePath = filePath.split('?')[0] // Remove query string
  
  // Resolve full path
  const fullPath = join(distDir, filePath)

  // Security: prevent directory traversal
  if (!fullPath.startsWith(distDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' })
    res.end('403 Forbidden')
    return
  }

  // Try to serve the file
  try {
    const stats = statSync(fullPath)
    if (stats.isFile()) {
      serveFile(fullPath, res)
      return
    }
  } catch (error) {
    // File doesn't exist, try index.html for SPA routing
  }

  // For SPA: serve index.html for all routes
  const indexPath = join(distDir, 'index.html')
  serveFile(indexPath, res)
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`)
})

