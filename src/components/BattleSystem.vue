<template>
  <transition name="battle">
    <div v-if="game.inBattle" class="battle-overlay" :class="game.battleMode">
      <div class="battle-container">
        <div class="battle-header">
          <div class="monster-info">
            <span class="monster-icon">{{ game.currentMonster?.icon }}</span>
            <div>
              <div class="monster-name">{{ game.currentMonster?.name }} Lv.{{ game.currentMonster?.level }}</div>
              <div class="monster-hp-bar">
                <div class="hp-fill monster" :style="{ width: monsterHpPercent + '%' }"></div>
              </div>
              <div class="monster-hp-text">{{ game.currentMonster?.currentHp }}/{{ game.currentMonster?.maxHp }}</div>
            </div>
          </div>
          <div class="battle-mode-btns">
            <button @click="game.battleMode = 'mini'" :class="{ active: game.battleMode === 'mini' }">小窗</button>
            <button @click="game.battleMode = 'full'" :class="{ active: game.battleMode === 'full' }">全屏</button>
          </div>
        </div>

        <div class="battle-log">
          <div v-for="(entry, i) in game.battleLog" :key="i"
            class="log-entry" :class="[entry.type, entry.actor]">
            {{ entry.message }}
          </div>
        </div>

        <div class="battle-actions" v-if="!game.battleResult">
          <div class="skill-bar">
            <button class="action-btn attack" @click="doAttack(null)">⚔️ 普通攻击</button>
            <button v-for="(skill, i) in playerSkills" :key="i"
              class="action-btn skill"
              :disabled="skill.mpCost > (characterStore.character?.currentMp || 0)"
              @click="doAttack(skill)">
              {{ skill.name }}
              <span class="mp-cost" v-if="skill.mpCost">MP{{ skill.mpCost }}</span>
            </button>
          </div>
          <div class="extra-actions">
            <button class="action-btn item" @click="useBattleItem" :disabled="!hasHealItem">🧪 使用药水</button>
            <button class="action-btn flee" @click="doFlee">🏃 逃跑</button>
          </div>
        </div>

        <div class="battle-result" v-if="game.battleResult">
          <div class="result-text" :class="game.battleResult">
            {{ game.battleResult === 'victory' ? '🎉 胜利！' : game.battleResult === 'defeat' ? '💀 被击败...' : '🏃 逃跑成功' }}
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '../stores/game'
import { useCharacterStore } from '../stores/character'

const game = useGameStore()
const characterStore = useCharacterStore()

const monsterHpPercent = computed(() => {
  if (!game.currentMonster) return 0
  return (game.currentMonster.currentHp / game.currentMonster.maxHp) * 100
})

const playerSkills = computed(() => {
  return characterStore.character?.skills || []
})

const hasHealItem = computed(() => {
  return characterStore.inventory.some(i => i.type === 'consumable' && i.effect?.type === 'heal_hp')
})

function doAttack(skill) {
  const stats = characterStore.getCombatStats()
  if (!stats) return

  const result = game.executeTurn(stats, skill)
  if (!result) return

  characterStore.character.currentHp = result.playerHp
  characterStore.character.currentMp = result.playerMp

  if (result.monsterDead) {
    game.endBattle('victory')
    const levelUps = characterStore.gainExp(result.expReward)
    characterStore.addGold(result.goldReward)
    for (const itemId of result.drops) {
      characterStore.addItem(itemId)
    }
    characterStore.saveGame()
  } else if (result.playerDead) {
    game.endBattle('defeat')
    characterStore.character.currentHp = Math.floor(characterStore.character.maxHp * 0.3)
    characterStore.saveGame()
  }
}

function useBattleItem() {
  const healItem = characterStore.inventory.find(i => i.type === 'consumable' && i.effect?.type === 'heal_hp')
  if (healItem) {
    characterStore.useItem(healItem.uid)
    game.battleLog.push({ type: 'item', message: `使用了${healItem.name}！` })
  }
}

function doFlee() {
  game.flee()
}
</script>

<style scoped>
.battle-overlay {
  position: fixed;
  z-index: 1000;
  background: rgba(10, 8, 6, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s;
}
.battle-overlay.mini {
  bottom: 20px;
  right: 20px;
  width: 380px;
  height: 320px;
  border-radius: 16px;
  border: 2px solid #5a4a3a;
}
.battle-overlay.full {
  inset: 0;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

.battle-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
  color: #e8dcc8;
}

.battle-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}
.monster-info {
  display: flex;
  align-items: center;
  gap: 10px;
}
.monster-icon { font-size: 36px; }
.monster-name { font-size: 14px; font-weight: 700; color: #e74c3c; }
.monster-hp-bar {
  width: 160px;
  height: 6px;
  background: #1a1510;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 4px;
}
.hp-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s;
}
.hp-fill.monster { background: linear-gradient(90deg, #c0392b, #e74c3c); }
.monster-hp-text { font-size: 11px; color: #8a7a6a; margin-top: 2px; }

.battle-mode-btns {
  display: flex;
  gap: 4px;
}
.battle-mode-btns button {
  background: #2a2520;
  border: 1px solid #3a3530;
  color: #8a7a6a;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 11px;
}
.battle-mode-btns button.active {
  background: #b8860b;
  color: #fff;
  border-color: #b8860b;
}

.battle-log {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  background: #1a1510;
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 13px;
}
.log-entry {
  margin-bottom: 4px;
  padding: 2px 0;
}
.log-entry.start { color: #e74c3c; font-weight: 700; }
.log-entry.attack.player { color: #d4a017; }
.log-entry.attack.monster { color: #e74c3c; }
.log-entry.heal { color: #27ae60; }
.log-entry.dodge { color: #3498db; }
.log-entry.buff { color: #9b59b6; }
.log-entry.victory { color: #f1c40f; font-weight: 700; font-size: 15px; }
.log-entry.defeat { color: #e74c3c; font-weight: 700; }
.log-entry.flee { color: #8a7a6a; }
.log-entry.item { color: #27ae60; }
.log-entry.error { color: #e74c3c; font-style: italic; }

.battle-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.skill-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.extra-actions {
  display: flex;
  gap: 6px;
}
.action-btn {
  flex: 1;
  padding: 8px 12px;
  background: #2a2520;
  border: 1px solid #3a3530;
  color: #e8dcc8;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  white-space: nowrap;
}
.action-btn:hover:not(:disabled) { background: #3a3530; border-color: #b8860b; }
.action-btn:disabled { opacity: 0.4; cursor: default; }
.action-btn.attack { border-color: #e74c3c; }
.action-btn.attack:hover { background: #c0392b; }
.action-btn.skill { border-color: #3498db; }
.action-btn.item { border-color: #27ae60; }
.action-btn.flee { border-color: #8a7a6a; }
.mp-cost { color: #3498db; font-size: 10px; margin-left: 4px; }

.battle-result {
  text-align: center;
  padding: 16px;
}
.result-text {
  font-size: 20px;
  font-weight: 700;
  animation: pulse 0.5s;
}
.result-text.victory { color: #f1c40f; }
.result-text.defeat { color: #e74c3c; }
.result-text.flee { color: #8a7a6a; }
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
</style>
