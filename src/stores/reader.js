import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { readFileWithEncoding, splitIntoChapters, paginateText, isPdfFile, parsePdfFromFile, parsePdfFromBuffer } from '../utils/fileReader'

export const useReaderStore = defineStore('reader', () => {
  const fileName = ref('')
  const fileEncoding = ref('')
  const chapters = ref([])
  const currentChapter = ref(0)
  const currentPage = ref(0)
  const pages = ref([])
  const pagesRead = ref(0)
  const bookmarks = ref([])
  const isLoaded = ref(false)
  const charsPerPage = ref(600)
  const fontSize = ref(16)
  const lineHeight = ref(1.8)
  const viewMode = ref('single')
  const scrollMode = ref('pagination')

  const totalPages = computed(() => pages.value.length)
  const currentContent = computed(() => pages.value[currentPage.value] || '')
  const chapterTitle = computed(() => {
    if (chapters.value.length === 0) return ''
    return chapters.value[currentChapter.value]?.title || ''
  })
  const progressPercent = computed(() => {
    if (totalPages.value === 0) return 0
    return Math.round(((currentPage.value + 1) / totalPages.value) * 100)
  })

  async function loadFile(file) {
    try {
      let text, encoding
      if (isPdfFile(file.name)) {
        text = await parsePdfFromFile(file)
        encoding = 'pdf'
      } else {
        const result = await readFileWithEncoding(file)
        text = result.text
        encoding = result.encoding
      }
      fileName.value = file.name
      fileEncoding.value = encoding
      chapters.value = splitIntoChapters(text)
      currentChapter.value = 0
      loadChapter(0)
      isLoaded.value = true
      return true
    } catch (e) {
      console.error('File load failed:', e)
      return false
    }
  }

  async function loadFromElectron(name, content, encoding) {
    try {
      let text = content
      if (encoding === 'pdf') {
        const binaryStr = atob(content)
        const bytes = new Uint8Array(binaryStr.length)
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i)
        }
        text = await parsePdfFromBuffer(bytes)
      }
      fileName.value = name
      fileEncoding.value = encoding
      chapters.value = splitIntoChapters(text)
      currentChapter.value = 0
      loadChapter(0)
      isLoaded.value = true
      return true
    } catch (e) {
      console.error('Electron file load failed:', e)
      return false
    }
  }

  function loadChapter(index) {
    if (index < 0 || index >= chapters.value.length) return
    currentChapter.value = index
    pages.value = paginateText(chapters.value[index].content, charsPerPage.value)
    currentPage.value = 0
    loadProgress()
  }

  function nextPage() {
    if (currentPage.value < totalPages.value - 1) {
      currentPage.value++
      pagesRead.value++
      saveProgress()
      return true
    }

    if (currentChapter.value < chapters.value.length - 1) {
      loadChapter(currentChapter.value + 1)
      pagesRead.value++
      saveProgress()
      return true
    }

    return false
  }

  function prevPage() {
    if (currentPage.value > 0) {
      currentPage.value--
      saveProgress()
      return true
    }

    if (currentChapter.value > 0) {
      loadChapter(currentChapter.value - 1)
      currentPage.value = totalPages.value - 1
      saveProgress()
      return true
    }

    return false
  }

  function goToPage(page) {
    if (page >= 0 && page < totalPages.value) {
      currentPage.value = page
      saveProgress()
    }
  }

  function addBookmark() {
    const bm = {
      id: Date.now(),
      fileName: fileName.value,
      chapter: currentChapter.value,
      page: currentPage.value,
      chapterTitle: chapterTitle.value,
      preview: currentContent.value.substring(0, 50),
      createdAt: Date.now()
    }
    bookmarks.value.push(bm)
    saveBookmarks()
    return bm
  }

  function removeBookmark(id) {
    bookmarks.value = bookmarks.value.filter(b => b.id !== id)
    saveBookmarks()
  }

  function goToBookmark(bm) {
    if (bm.fileName !== fileName.value) return false
    loadChapter(bm.chapter)
    currentPage.value = bm.page
    saveProgress()
    return true
  }

  function saveProgress() {
    if (!fileName.value) return
    const key = `reading_teapet_progress_${fileName.value}`
    localStorage.setItem(key, JSON.stringify({
      chapter: currentChapter.value,
      page: currentPage.value,
      pagesRead: pagesRead.value,
      savedAt: Date.now()
    }))
  }

  function loadProgress() {
    if (!fileName.value) return
    const key = `reading_teapet_progress_${fileName.value}`
    try {
      const data = JSON.parse(localStorage.getItem(key))
      if (data) {
        if (data.chapter === currentChapter.value) {
          currentPage.value = Math.min(data.page, totalPages.value - 1)
        }
        pagesRead.value = data.pagesRead || 0
      }
    } catch (e) {
      // ignore
    }
  }

  function saveBookmarks() {
    localStorage.setItem('reading_teapet_bookmarks', JSON.stringify(bookmarks.value))
  }

  function loadBookmarks() {
    try {
      const data = JSON.parse(localStorage.getItem('reading_teapet_bookmarks'))
      if (Array.isArray(data)) bookmarks.value = data
    } catch (e) {
      // ignore
    }
  }

  return {
    fileName, fileEncoding, chapters, currentChapter, currentPage,
    pages, pagesRead, bookmarks, isLoaded,
    charsPerPage, fontSize, lineHeight, viewMode, scrollMode,
    totalPages, currentContent, chapterTitle, progressPercent,
    loadFile, loadFromElectron, loadChapter, nextPage, prevPage, goToPage,
    addBookmark, removeBookmark, goToBookmark,
    saveProgress, loadProgress, loadBookmarks
  }
})
