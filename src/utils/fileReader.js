let pdfjsLib = null

async function ensurePdfJs() {
  if (pdfjsLib) return pdfjsLib
  const pdfjs = await import('pdfjs-dist')
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`
  pdfjsLib = pdfjs
  return pdfjs
}

export function isPdfFile(name) {
  return /\.pdf$/i.test(name)
}

export async function parsePdfFromFile(file) {
  const pdfjs = await ensurePdfJs()
  const buf = await file.arrayBuffer()
  const doc = await pdfjs.getDocument({ data: buf }).promise
  const pages = []
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    const text = content.items.map(item => item.str).join(' ')
    pages.push(text)
  }
  return pages.join('\n\n')
}

export async function parsePdfFromBuffer(buf, encoding) {
  const pdfjs = await ensurePdfJs()
  const doc = await pdfjs.getDocument({ data: buf }).promise
  const pages = []
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    const text = content.items.map(item => item.str).join(' ')
    pages.push(text)
  }
  return pages.join('\n\n')
}

export async function readFileWithEncoding(file) {
  const encodings = ['utf-8', 'gbk', 'gb2312', 'big5', 'euc-jp', 'shift_jis']

  for (const encoding of encodings) {
    try {
      const text = await readAsText(file, encoding)
      if (isValidText(text)) {
        return { text, encoding }
      }
    } catch (e) {
      continue
    }
  }

  const text = await readAsText(file, 'utf-8')
  return { text, encoding: 'utf-8' }
}

function readAsText(file, encoding) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file, encoding)
  })
}

function isValidText(text) {
  if (!text || text.length < 10) return false
  const sample = text.substring(0, 1000)
  const replacementChars = (sample.match(/\uFFFD/g) || []).length
  return replacementChars / sample.length < 0.05
}

export function splitIntoChapters(text) {
  const chapterRegex = /^(第[一二三四五六七八九十百千零\d]+[章节回卷篇集部][\s\S]*?)(?=^第[一二三四五六七八九十百千零\d]+[章节回卷篇集部]|\Z)/gm
  const matches = text.match(chapterRegex)

  if (matches && matches.length > 1) {
    return matches.map((content, index) => ({
      id: index,
      title: extractChapterTitle(content),
      content: content.trim()
    }))
  }

  const paragraphs = text.split(/\n\s*\n|\r\n\s*\r\n/).filter(p => p.trim())
  const chunkSize = Math.max(20, Math.floor(paragraphs.length / 10))
  const chapters = []

  for (let i = 0; i < paragraphs.length; i += chunkSize) {
    const chunk = paragraphs.slice(i, i + chunkSize)
    chapters.push({
      id: chapters.length,
      title: `片段 ${chapters.length + 1}`,
      content: chunk.join('\n\n').trim()
    })
  }

  return chapters.length > 0 ? chapters : [{ id: 0, title: '全文', content: text }]
}

function extractChapterTitle(content) {
  const firstLine = content.split(/\n|\r\n/)[0].trim()
  if (firstLine.length <= 50) return firstLine
  return firstLine.substring(0, 50) + '...'
}

export function paginateText(text, charsPerPage) {
  // Split by double newlines (paragraph breaks), not single newlines
  const paragraphs = text.split(/\n\s*\n|\r\n\s*\r\n/).filter(p => p.trim())
  const pages = []
  let currentPage = ''
  let currentLength = 0

  for (const para of paragraphs) {
    const paraLen = para.replace(/\n|\r\n/g, '').length

    // If this paragraph alone is longer than a page, split it internally
    if (paraLen > charsPerPage) {
      if (currentPage.trim()) {
        pages.push(currentPage.trim())
        currentPage = ''
        currentLength = 0
      }
      const lines = para.split(/\n|\r\n/).filter(l => l.trim())
      for (const line of lines) {
        if (currentLength + line.length > charsPerPage && currentPage.length > 0) {
          pages.push(currentPage.trim())
          currentPage = ''
          currentLength = 0
        }
        currentPage += line + '\n'
        currentLength += line.length + 1
      }
      continue
    }

    if (currentLength + paraLen > charsPerPage && currentPage.length > 0) {
      pages.push(currentPage.trim())
      currentPage = ''
      currentLength = 0
    }
    currentPage += para + '\n'
    currentLength += paraLen + 1
  }

  if (currentPage.trim()) {
    pages.push(currentPage.trim())
  }

  return pages.length > 0 ? pages : [text]
}
