<template>
  <div class="status-bar" v-if="characterStore.character">
    <div class="status-left">
      <span class="char-icon">{{ characterStore.character.classIcon }}</span>
      <span class="char-name">{{ characterStore.character.name }}</span>
      <span class="char-level">Lv.{{ characterStore.character.level }}</span>
    </div>

    <div class="status-bars">
      <div class="mini-bar">
        <span class="bar-label hp">HP</span>
        <div class="bar-track"><div class="bar-fill hp" :style="{ width: characterStore.hpPercent + '%' }"></div></div>
        <span class="bar-val">{{ characterStore.character.currentHp }}/{{ characterStore.character.maxHp }}</span>
      </div>
      <div class="mini-bar">
        <span class="bar-label mp">MP</span>
        <div class="bar-track"><div class="bar-fill mp" :style="{ width: characterStore.mpPercent + '%' }"></div></div>
        <span class="bar-val">{{ characterStore.character.currentMp }}/{{ characterStore.character.maxMp }}</span>
      </div>
      <div class="mini-bar">
        <span class="bar-label exp">EXP</span>
        <div class="bar-track"><div class="bar-fill exp" :style="{ width: characterStore.expPercent + '%' }"></div></div>
        <span class="bar-val">{{ characterStore.character.exp }}/{{ expNeeded }}</span>
      </div>
    </div>

    <div class="status-right">
      <span class="gold">💰 {{ characterStore.gold }}</span>
      <span class="kills" v-if="game.totalKills > 0">⚔️ {{ game.totalKills }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCharacterStore } from '../stores/character'
import { useGameStore } from '../stores/game'
import { calculateExpForLevel } from '../utils/combat'

const characterStore = useCharacterStore()
const game = useGameStore()
const expNeeded = computed(() => calculateExpForLevel(characterStore.character?.level || 1))
</script>

<style scoped>
.status-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 6px 16px;
  background: #1a1510;
  color: #e8dcc8;
  font-size: 12px;
  border-top: 1px solid #3a3530;
}
.status-left {
  display: flex;
  align-items: center;
  gap: 6px;
}
.char-icon { font-size: 18px; }
.char-name { font-weight: 600; color: #f5e6c8; }
.char-level { color: #d4a017; }

.status-bars {
  flex: 1;
  display: flex;
  gap: 12px;
}
.mini-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
}
.bar-label {
  width: 24px;
  font-size: 10px;
  font-weight: 600;
}
.bar-label.hp { color: #e74c3c; }
.bar-label.mp { color: #3498db; }
.bar-label.exp { color: #d4a017; }
.bar-track {
  flex: 1;
  height: 6px;
  background: #2a2520;
  border-radius: 3px;
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s;
}
.bar-fill.hp { background: linear-gradient(90deg, #c0392b, #e74c3c); }
.bar-fill.mp { background: linear-gradient(90deg, #2980b9, #3498db); }
.bar-fill.exp { background: linear-gradient(90deg, #b8860b, #d4a017); }
.bar-val { width: 70px; text-align: right; font-size: 10px; color: #8a7a6a; }

.status-right {
  display: flex;
  gap: 12px;
}
.gold { color: #d4a017; }
.kills { color: #e74c3c; }
</style>
