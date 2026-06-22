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
  const paragraphs = text.split(/\n|\r\n/).filter(p => p.trim())
  const pages = []
  let currentPage = ''
  let currentLength = 0

  for (const para of paragraphs) {
    if (currentLength + para.length > charsPerPage && currentPage.length > 0) {
      pages.push(currentPage.trim())
      currentPage = ''
      currentLength = 0
    }
    currentPage += para + '\n'
    currentLength += para.length
  }

  if (currentPage.trim()) {
    pages.push(currentPage.trim())
  }

  return pages.length > 0 ? pages : [text]
}
