<template>
  <div class="reader-panel">
    <div class="reader-header">
      <div class="reader-info">
        <span class="file-name">{{ reader.fileName }}</span>
        <span class="chapter-name" v-if="reader.chapterTitle">· {{ reader.chapterTitle }}</span>
      </div>
      <div class="reader-controls">
        <button class="ctrl-btn" @click="reader.prevPage()" :disabled="reader.currentPage === 0 && reader.currentChapter === 0" title="上一页">◀</button>
        <span class="page-info">{{ reader.currentPage + 1 }} / {{ reader.totalPages }}</span>
        <button class="ctrl-btn" @click="goNext" title="下一页">▶</button>
        <button class="ctrl-btn" @click="toggleBookmark" :class="{ active: isBookmarked }" title="书签">🔖</button>
      </div>
    </div>

    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: reader.progressPercent + '%' }"></div>
    </div>

    <div class="reader-body" :class="[reader.viewMode]">
      <div class="page-content" :style="{ fontSize: reader.fontSize + 'px', lineHeight: reader.lineHeight }">
        <div v-for="(para, i) in paragraphs" :key="i" class="paragraph" :class="{ highlight: isHighlighted(i) }">{{ para }}</div>
      </div>
    </div>

    <div class="reader-footer">
      <div class="settings-row">
        <label>字体</label>
        <button class="sm-btn" @click="reader.fontSize = Math.max(12, reader.fontSize - 2)">A-</button>
        <span>{{ reader.fontSize }}px</span>
        <button class="sm-btn" @click="reader.fontSize = Math.min(32, reader.fontSize + 2)">A+</button>

        <label style="margin-left:16px">行距</label>
        <button class="sm-btn" @click="reader.lineHeight = Math.max(1.2, +(reader.lineHeight - 0.2).toFixed(1))">-</button>
        <span>{{ reader.lineHeight }}</span>
        <button class="sm-btn" @click="reader.lineHeight = Math.min(3, +(reader.lineHeight + 0.2).toFixed(1))">+</button>

        <label style="margin-left:16px">布局</label>
        <button class="sm-btn" :class="{ active: reader.viewMode === 'single' }" @click="reader.viewMode = 'single'">单栏</button>
        <button class="sm-btn" :class="{ active: reader.viewMode === 'double' }" @click="reader.viewMode = 'double'">双栏</button>
      </div>
      <div class="stats-row">
        <span>已读 {{ reader.pagesRead }} 页</span>
        <span>编码: {{ reader.fileEncoding }}</span>
        <span v-if="game.encounterCooldown > 0" class="cooldown">🛡️ 安全 {{ game.encounterCooldown }} 页</span>
      </div>
    </div>

    <div v-if="showChapterList" class="chapter-list-overlay" @click.self="showChapterList = false">
      <div class="chapter-list">
        <div class="chapter-list-header">
          <span>目录</span>
          <button @click="showChapterList = false">✕</button>
        </div>
        <div v-for="(ch, i) in reader.chapters" :key="i"
          class="chapter-item" :class="{ active: i === reader.currentChapter }"
          @click="reader.loadChapter(i); showChapterList = false">
          {{ ch.title }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useReaderStore } from '../stores/reader'
import { useGameStore } from '../stores/game'
import { useCharacterStore } from '../stores/character'

const emit = defineEmits(['page-changed'])
const reader = useReaderStore()
const game = useGameStore()
const character = useCharacterStore()
const showChapterList = ref(false)

const paragraphs = computed(() => {
  return reader.currentContent.split(/\n|\r\n/).filter(p => p.trim())
})

const isBookmarked = computed(() => {
  return reader.bookmarks.some(b =>
    b.fileName === reader.fileName &&
    b.chapter === reader.currentChapter &&
    b.page === reader.currentPage
  )
})

function isHighlighted(index) {
  return false
}

function goNext() {
  const changed = reader.nextPage()
  if (changed) {
    emit('page-changed')
  }
}

function toggleBookmark() {
  const existing = reader.bookmarks.find(b =>
    b.fileName === reader.fileName &&
    b.chapter === reader.currentChapter &&
    b.page === reader.currentPage
  )
  if (existing) {
    reader.removeBookmark(existing.id)
  } else {
    reader.addBookmark()
  }
}
</script>

<style scoped>
.reader-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #faf6ee;
}
.reader-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background: #f0e8d8;
  border-bottom: 1px solid #e0d5c0;
  flex-shrink: 0;
}
.reader-info {
  font-size: 13px;
  color: #6b5b4a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 50%;
}
.file-name { font-weight: 600; color: #3a2e1f; }
.reader-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}
.ctrl-btn {
  background: none;
  border: 1px solid #d0c5b0;
  border-radius: 6px;
  padding: 4px 10px;
  cursor: pointer;
  font-size: 14px;
  color: #5a4a3a;
  transition: all 0.2s;
}
.ctrl-btn:hover:not(:disabled) { background: #e8dcc8; }
.ctrl-btn:disabled { opacity: 0.4; cursor: default; }
.ctrl-btn.active { color: #b8860b; border-color: #b8860b; }
.page-info { font-size: 12px; color: #8a7a6a; min-width: 60px; text-align: center; }

.progress-bar {
  height: 3px;
  background: #e0d5c0;
  flex-shrink: 0;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #b8860b, #d4a017);
  transition: width 0.3s;
}

.reader-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
}
.reader-body.double {
  column-count: 2;
  column-gap: 32px;
  column-rule: 1px solid #e0d5c0;
}
.page-content {
  color: #2a1f0f;
  white-space: pre-wrap;
  word-break: break-all;
}
.paragraph {
  margin-bottom: 12px;
  text-indent: 2em;
}
.paragraph.highlight {
  background: rgba(184, 134, 11, 0.1);
  border-radius: 4px;
  padding: 2px 4px;
}

.reader-footer {
  padding: 8px 16px;
  background: #f0e8d8;
  border-top: 1px solid #e0d5c0;
  flex-shrink: 0;
}
.settings-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b5b4a;
  margin-bottom: 4px;
}
.sm-btn {
  background: #e8dcc8;
  border: 1px solid #d0c5b0;
  border-radius: 4px;
  padding: 2px 8px;
  cursor: pointer;
  font-size: 11px;
  color: #5a4a3a;
}
.sm-btn:hover { background: #d8ccb8; }
.sm-btn.active { background: #b8860b; color: #fff; border-color: #b8860b; }
.stats-row {
  display: flex;
  gap: 16px;
  font-size: 11px;
  color: #9a8a7a;
}
.cooldown { color: #2e7d32; }

.chapter-list-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.3);
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
}
.chapter-list {
  background: #faf6ee;
  border-radius: 12px;
  width: 320px;
  max-height: 70vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
}
.chapter-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e0d5c0;
  font-weight: 600;
  color: #3a2e1f;
}
.chapter-list-header button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
}
.chapter-item {
  padding: 10px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #5a4a3a;
  border-bottom: 1px solid #f0e8d8;
}
.chapter-item:hover { background: #f0e8d8; }
.chapter-item.active { color: #b8860b; font-weight: 600; }
</style>
