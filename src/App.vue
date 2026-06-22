<template>
  <div class="app" :class="{ 'has-panel': showPanel }">
    <CharacterCreate v-if="!gameStarted" @created="onCreated" />

    <template v-else>
      <div class="main-layout">
        <transition name="slide">
          <CharacterPanel v-if="showPanel" @close="showPanel = false" />
        </transition>

        <div class="content-area">
          <div class="top-bar">
            <button class="menu-btn" @click="showPanel = !showPanel">
              {{ showPanel ? '◀' : '▶' }} {{ showPanel ? '收起' : '角色' }}
            </button>
            <div class="top-title">
              <span v-if="reader.isLoaded">{{ reader.fileName }}</span>
              <span v-else>阅读茶宠</span>
            </div>
            <div class="top-actions">
              <button v-if="reader.isLoaded" class="menu-btn" @click="showBookmarks = !showBookmarks">🔖 书签</button>
              <button class="menu-btn boss-btn" @click="triggerBoss" v-if="reader.isLoaded">🐉 挑战Boss</button>
            </div>
          </div>

          <div class="reader-area">
            <Reader v-if="reader.isLoaded" @page-changed="onPageChanged" />
            <FileLoader v-else />
          </div>

          <StatusBar />
        </div>
      </div>

      <BattleSystem />

      <transition name="fade">
        <div v-if="showBookmarks" class="bookmarks-overlay" @click.self="showBookmarks = false">
          <div class="bookmarks-panel">
            <div class="bm-header">
              <span>书签列表</span>
              <button @click="showBookmarks = false">✕</button>
            </div>
            <div v-if="reader.bookmarks.length === 0" class="bm-empty">暂无书签</div>
            <div v-for="bm in reader.bookmarks" :key="bm.id" class="bm-item" @click="goBookmark(bm)">
              <div class="bm-title">{{ bm.chapterTitle }}</div>
              <div class="bm-preview">{{ bm.preview }}...</div>
              <button class="bm-del" @click.stop="reader.removeBookmark(bm.id)">删除</button>
            </div>
          </div>
        </div>
      </transition>

      <transition name="toast">
        <div v-if="toast.show" class="toast" :class="toast.type">
          {{ toast.message }}
        </div>
      </transition>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useReaderStore } from './stores/reader'
import { useCharacterStore } from './stores/character'
import { useGameStore } from './stores/game'

import CharacterCreate from './components/CharacterCreate.vue'
import FileLoader from './components/FileLoader.vue'
import Reader from './components/Reader.vue'
import CharacterPanel from './components/CharacterPanel.vue'
import StatusBar from './components/StatusBar.vue'
import BattleSystem from './components/BattleSystem.vue'

const reader = useReaderStore()
const characterStore = useCharacterStore()
const game = useGameStore()

const gameStarted = ref(false)
const showPanel = ref(false)
const showBookmarks = ref(false)
const toast = reactive({ show: false, message: '', type: 'info' })

function onCreated() {
  gameStarted.value = true
  reader.loadBookmarks()
}

function onPageChanged() {
  if (!characterStore.character || game.inBattle) return

  const encountered = game.checkEncounter(reader.pagesRead, characterStore.character.level)
  if (encountered) {
    showToast('⚔️ 遭遇敌人！', 'battle')
  }
}

function triggerBoss() {
  if (!characterStore.character) return
  if (game.inBattle) return
  const triggered = game.checkBossEncounter(characterStore.character.level)
  if (!triggered) {
    game.startBattle({
      id: 'demon_lord',
      name: '魔王',
      icon: '😈',
      isBoss: true,
      level: characterStore.character.level + 2,
      currentHp: 300 + characterStore.character.level * 50,
      maxHp: 300 + characterStore.character.level * 50,
      attack: 30 + characterStore.character.level * 5,
      defense: 20 + characterStore.character.level * 3,
      speed: 15,
      critRate: 0.15,
      dodgeRate: 0.05,
      expReward: 200 + characterStore.character.level * 30,
      goldReward: 100 + characterStore.character.level * 20,
      dropTable: [
        { itemId: 'demon_heart', chance: 0.5 },
        { itemId: 'weapon_demon', chance: 0.1 },
        { itemId: 'elixir_power', chance: 0.3 },
        { itemId: 'hp_potion_l', chance: 0.5 }
      ]
    })
    showToast('🐉 Boss战开始！', 'battle')
  }
}

function goBookmark(bm) {
  reader.goToBookmark(bm)
  showBookmarks.value = false
}

function showToast(message, type = 'info') {
  toast.show = true
  toast.message = message
  toast.type = type
  setTimeout(() => { toast.show = false }, 2000)
}

onMounted(() => {
  document.addEventListener('keydown', (e) => {
    if (!reader.isLoaded || game.inBattle) return
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      reader.prevPage()
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
      e.preventDefault()
      onPageChanged()
      reader.nextPage()
    }
  })
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Hiragino Sans GB', sans-serif;
  background: #1a1510;
  color: #e8dcc8;
  overflow: hidden;
  height: 100vh;
}

#app {
  height: 100vh;
}

::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #3a3530;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #5a4a3a;
}
</style>

<style scoped>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.top-bar {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background: #2a2520;
  border-bottom: 1px solid #3a3530;
  gap: 12px;
  flex-shrink: 0;
}
.menu-btn {
  background: #1a1510;
  border: 1px solid #3a3530;
  color: #b8a080;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
  white-space: nowrap;
}
.menu-btn:hover { background: #2a2520; border-color: #b8860b; color: #f5e6c8; }
.boss-btn { border-color: #c0392b; color: #e74c3c; }
.boss-btn:hover { background: #c0392b; color: #fff; }
.top-title {
  flex: 1;
  text-align: center;
  font-size: 14px;
  color: #8a7a6a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.top-actions {
  display: flex;
  gap: 8px;
}

.reader-area {
  flex: 1;
  overflow: hidden;
}

.slide-enter-active, .slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from, .slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

.bookmarks-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
}
.bookmarks-panel {
  background: #2a2520;
  border-radius: 16px;
  width: 360px;
  max-height: 70vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
}
.bm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  border-bottom: 1px solid #3a3530;
  font-weight: 700;
  color: #f5e6c8;
}
.bm-header button {
  background: none;
  border: none;
  color: #8a7a6a;
  cursor: pointer;
  font-size: 18px;
}
.bm-empty {
  text-align: center;
  color: #5a4a3a;
  padding: 32px;
}
.bm-item {
  padding: 12px 18px;
  cursor: pointer;
  border-bottom: 1px solid #1a1510;
  position: relative;
}
.bm-item:hover { background: #1a1510; }
.bm-title { font-size: 14px; color: #f5e6c8; font-weight: 600; }
.bm-preview { font-size: 12px; color: #8a7a6a; margin-top: 4px; }
.bm-del {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #5a4a3a;
  cursor: pointer;
  font-size: 12px;
}
.bm-del:hover { color: #e74c3c; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.toast {
  position: fixed;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  z-index: 3000;
  animation: slideDown 0.3s;
}
.toast.info { background: #2980b9; color: #fff; }
.toast.battle { background: #c0392b; color: #fff; }
.toast.success { background: #27ae60; color: #fff; }
@keyframes slideDown {
  from { opacity: 0; transform: translate(-50%, -20px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}

.toast-enter-active, .toast-leave-active { transition: all 0.3s; }
.toast-enter-from { opacity: 0; transform: translate(-50%, -20px); }
.toast-leave-to { opacity: 0; transform: translate(-50%, -20px); }
</style>
