<template>
  <div class="create-overlay">
    <div class="create-panel">
      <div class="create-header">
        <h2>🗡️ 创建你的冒险者</h2>
        <p>选择职业，开始你的阅读冒险之旅</p>
      </div>

      <div v-if="step === 1" class="step-content">
        <div class="name-input">
          <label>冒险者名称</label>
          <input v-model="name" placeholder="输入你的名字..." maxlength="12" />
        </div>

        <div class="class-grid">
          <div v-for="cls in classList" :key="cls.id"
            class="class-card" :class="{ selected: selectedClass === cls.id }"
            @click="selectedClass = cls.id">
            <div class="class-icon">{{ cls.icon }}</div>
            <div class="class-name">{{ cls.name }}</div>
            <div class="class-desc">{{ cls.description }}</div>
            <div class="class-stats">
              <span>HP {{ cls.baseStats.hp }}</span>
              <span>MP {{ cls.baseStats.mp }}</span>
              <span>攻 {{ cls.baseStats.attack }}</span>
              <span>防 {{ cls.baseStats.defense }}</span>
              <span>速 {{ cls.baseStats.speed }}</span>
            </div>
            <div class="class-skills">
              <div v-for="(skill, i) in cls.skills" :key="i" class="skill-tag">
                {{ skill.name }}
              </div>
            </div>
          </div>
        </div>

        <button class="create-btn" :disabled="!name.trim() || !selectedClass" @click="doCreate">
          开始冒险
        </button>
      </div>

      <div v-if="step === 2" class="step-content">
        <div class="load-section">
          <h3>📂 加载存档</h3>
          <div v-if="characterStore.savedCharacters.length > 0" class="saved-list">
            <div v-for="(saved, i) in characterStore.savedCharacters" :key="i"
              class="saved-item" @click="loadSaved(saved)">
              <span class="saved-icon">{{ saved.classIcon }}</span>
              <div class="saved-info">
                <div class="saved-name">{{ saved.name }}</div>
                <div class="saved-detail">Lv.{{ saved.level }} {{ saved.className }}</div>
              </div>
              <div class="saved-time">{{ formatTime(saved.savedAt) }}</div>
            </div>
          </div>
          <div v-else class="no-saves">暂无存档</div>
        </div>
        <button class="back-btn" @click="step = 1">← 创建新角色</button>
      </div>

      <div class="step-toggle">
        <button @click="step = step === 1 ? 2 : 1">
          {{ step === 1 ? '📂 加载存档' : '🗡️ 创建新角色' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCharacterStore } from '../stores/character'
import { CLASS_LIST } from '../data/classes'

const emit = defineEmits(['created'])
const characterStore = useCharacterStore()
const classList = CLASS_LIST

const step = ref(1)
const name = ref('')
const selectedClass = ref(null)

onMounted(() => {
  characterStore.loadSavedCharacters()
  if (characterStore.loadGame()) {
    emit('created')
  }
})

function doCreate() {
  if (!name.value.trim() || !selectedClass.value) return
  characterStore.createCharacter(name.value.trim(), selectedClass.value)
  emit('created')
}

function loadSaved(saved) {
  if (characterStore.loadGame()) {
    emit('created')
  }
}

function formatTime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>

<style scoped>
.create-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 8, 6, 0.97);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.create-panel {
  background: #2a2520;
  border: 1px solid #3a3530;
  border-radius: 20px;
  width: 600px;
  max-width: 95vw;
  max-height: 90vh;
  overflow-y: auto;
  padding: 32px;
  color: #e8dcc8;
}
.create-header {
  text-align: center;
  margin-bottom: 24px;
}
.create-header h2 {
  margin: 0 0 8px;
  font-size: 24px;
  color: #f5e6c8;
}
.create-header p {
  margin: 0;
  color: #8a7a6a;
  font-size: 14px;
}

.step-content { margin-bottom: 16px; }

.name-input {
  margin-bottom: 20px;
}
.name-input label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  color: #b8a080;
}
.name-input input {
  width: 100%;
  padding: 10px 14px;
  background: #1a1510;
  border: 1px solid #3a3530;
  border-radius: 8px;
  color: #f5e6c8;
  font-size: 16px;
  outline: none;
  box-sizing: border-box;
}
.name-input input:focus { border-color: #b8860b; }

.class-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;
}
.class-card {
  background: #1a1510;
  border: 2px solid #3a3530;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
}
.class-card:hover { border-color: #5a4a3a; }
.class-card.selected { border-color: #b8860b; background: #2a2010; }
.class-icon { font-size: 36px; margin-bottom: 8px; }
.class-name { font-size: 18px; font-weight: 700; color: #f5e6c8; margin-bottom: 4px; }
.class-desc { font-size: 12px; color: #8a7a6a; margin-bottom: 10px; }
.class-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}
.class-stats span {
  background: #2a2520;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  color: #b8a080;
}
.class-skills { display: flex; flex-wrap: wrap; gap: 4px; }
.skill-tag {
  background: #3a3530;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  color: #d4a017;
}

.create-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #b8860b, #d4a017);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.create-btn:hover:not(:disabled) { transform: scale(1.02); box-shadow: 0 4px 16px rgba(184, 134, 11, 0.4); }
.create-btn:disabled { opacity: 0.4; cursor: default; }

.load-section { margin-bottom: 16px; }
.load-section h3 { color: #f5e6c8; margin-bottom: 12px; }
.saved-list { display: flex; flex-direction: column; gap: 8px; }
.saved-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #1a1510;
  border: 1px solid #3a3530;
  border-radius: 8px;
  cursor: pointer;
}
.saved-item:hover { border-color: #b8860b; }
.saved-icon { font-size: 28px; }
.saved-info { flex: 1; }
.saved-name { font-size: 15px; font-weight: 600; color: #f5e6c8; }
.saved-detail { font-size: 12px; color: #8a7a6a; }
.saved-time { font-size: 11px; color: #5a4a3a; }
.no-saves { text-align: center; color: #5a4a3a; padding: 24px; }

.back-btn {
  width: 100%;
  padding: 10px;
  background: #1a1510;
  border: 1px solid #3a3530;
  color: #8a7a6a;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}
.back-btn:hover { border-color: #5a4a3a; color: #e8dcc8; }

.step-toggle {
  text-align: center;
  padding-top: 12px;
  border-top: 1px solid #3a3530;
}
.step-toggle button {
  background: none;
  border: none;
  color: #b8860b;
  cursor: pointer;
  font-size: 14px;
}
.step-toggle button:hover { text-decoration: underline; }
</style>
