<template>
  <div class="char-panel">
    <div class="panel-header">
      <span class="char-icon">{{ char.classIcon }}</span>
      <div class="char-basic">
        <div class="char-name">{{ char.name }}</div>
        <div class="char-class">Lv.{{ char.level }} {{ char.className }}</div>
      </div>
      <button class="toggle-btn" @click="$emit('close')">✕</button>
    </div>

    <div class="panel-section">
      <div class="stat-bars">
        <div class="bar-row">
          <span class="bar-label">HP</span>
          <div class="bar-track hp">
            <div class="bar-fill" :style="{ width: characterStore.hpPercent + '%' }"></div>
          </div>
          <span class="bar-value">{{ char.currentHp }}/{{ char.maxHp }}</span>
        </div>
        <div class="bar-row">
          <span class="bar-label">MP</span>
          <div class="bar-track mp">
            <div class="bar-fill" :style="{ width: characterStore.mpPercent + '%' }"></div>
          </div>
          <span class="bar-value">{{ char.currentMp }}/{{ char.maxMp }}</span>
        </div>
        <div class="bar-row">
          <span class="bar-label">EXP</span>
          <div class="bar-track exp">
            <div class="bar-fill" :style="{ width: characterStore.expPercent + '%' }"></div>
          </div>
          <span class="bar-value">{{ char.exp }}/{{ expNeeded }}</span>
        </div>
      </div>
    </div>

    <div class="panel-section">
      <div class="section-title">属性 <span v-if="char.statPoints > 0" class="points-badge">+{{ char.statPoints }}</span></div>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-name">攻击</span>
          <span class="stat-val">{{ characterStore.totalAttack }}</span>
          <button v-if="char.statPoints > 0" class="add-btn" @click="characterStore.allocateStat('attack')">+</button>
        </div>
        <div class="stat-item">
          <span class="stat-name">防御</span>
          <span class="stat-val">{{ characterStore.totalDefense }}</span>
          <button v-if="char.statPoints > 0" class="add-btn" @click="characterStore.allocateStat('defense')">+</button>
        </div>
        <div class="stat-item">
          <span class="stat-name">速度</span>
          <span class="stat-val">{{ characterStore.totalSpeed }}</span>
          <button v-if="char.statPoints > 0" class="add-btn" @click="characterStore.allocateStat('speed')">+</button>
        </div>
        <div class="stat-item">
          <span class="stat-name">暴击</span>
          <span class="stat-val">{{ (characterStore.totalCritRate * 100).toFixed(0) }}%</span>
        </div>
        <div class="stat-item">
          <span class="stat-name">闪避</span>
          <span class="stat-val">{{ (characterStore.totalDodgeRate * 100).toFixed(0) }}%</span>
        </div>
      </div>
      <div class="stat-points-row" v-if="char.statPoints > 0">
        <button class="add-btn-lg" @click="characterStore.allocateStat('hp')">HP+10</button>
        <button class="add-btn-lg" @click="characterStore.allocateStat('mp')">MP+8</button>
      </div>
    </div>

    <div class="panel-section">
      <div class="section-title">装备</div>
      <div class="equip-slots">
        <div class="equip-slot" v-for="(slot, key) in equipmentSlots" :key="key">
          <span class="slot-label">{{ slot.label }}</span>
          <div class="slot-item" v-if="characterStore.equipment[key]">
            <span>{{ characterStore.equipment[key].icon }} {{ characterStore.equipment[key].name }}</span>
            <button class="unequip-btn" @click="characterStore.unequipItem(key)">卸</button>
          </div>
          <div class="slot-empty" v-else>空</div>
        </div>
      </div>
    </div>

    <div class="panel-section">
      <div class="section-title">技能</div>
      <div class="skills-list">
        <div class="skill-item" v-for="(skill, i) in char.skills" :key="i">
          <span class="skill-name">{{ skill.name }}</span>
          <span class="skill-cost" v-if="skill.mpCost">MP {{ skill.mpCost }}</span>
          <span class="skill-desc">{{ skill.description }}</span>
        </div>
      </div>
    </div>

    <div class="panel-section">
      <div class="section-title">背包</div>
      <Inventory />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCharacterStore } from '../stores/character'
import { calculateExpForLevel } from '../utils/combat'
import { EQUIPMENT_SLOTS } from '../data/items'
import Inventory from './Inventory.vue'

defineEmits(['close'])
const characterStore = useCharacterStore()
const char = computed(() => characterStore.character)
const expNeeded = computed(() => calculateExpForLevel(char.value?.level || 1))

const equipmentSlots = {
  [EQUIPMENT_SLOTS.WEAPON]: { label: '武器' },
  [EQUIPMENT_SLOTS.ARMOR]: { label: '防具' },
  [EQUIPMENT_SLOTS.ACCESSORY]: { label: '饰品' }
}
</script>

<style scoped>
.char-panel {
  width: 280px;
  height: 100%;
  overflow-y: auto;
  background: #2a2520;
  color: #e8dcc8;
  padding: 12px;
  font-size: 13px;
}
.panel-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}
.char-icon { font-size: 32px; }
.char-basic { flex: 1; }
.char-name { font-size: 16px; font-weight: 700; color: #f5e6c8; }
.char-class { font-size: 12px; color: #b8a080; }
.toggle-btn {
  background: none;
  border: none;
  color: #8a7a6a;
  cursor: pointer;
  font-size: 18px;
}
.toggle-btn:hover { color: #e8dcc8; }

.panel-section {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #3a3530;
}
.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #d4a017;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.points-badge {
  background: #b8860b;
  color: #fff;
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 10px;
}

.stat-bars { display: flex; flex-direction: column; gap: 6px; }
.bar-row { display: flex; align-items: center; gap: 6px; }
.bar-label { width: 28px; font-size: 11px; color: #8a7a6a; }
.bar-track {
  flex: 1;
  height: 8px;
  background: #1a1510;
  border-radius: 4px;
  overflow: hidden;
}
.bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}
.bar-track.hp .bar-fill { background: linear-gradient(90deg, #c0392b, #e74c3c); }
.bar-track.mp .bar-fill { background: linear-gradient(90deg, #2980b9, #3498db); }
.bar-track.exp .bar-fill { background: linear-gradient(90deg, #b8860b, #d4a017); }
.bar-value { width: 70px; font-size: 11px; text-align: right; color: #8a7a6a; }

.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 6px;
  background: #1a1510;
  border-radius: 4px;
}
.stat-name { color: #8a7a6a; font-size: 11px; flex: 1; }
.stat-val { color: #f5e6c8; font-size: 13px; font-weight: 600; }
.add-btn {
  width: 20px;
  height: 20px;
  background: #b8860b;
  color: #fff;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.add-btn:hover { background: #d4a017; }
.stat-points-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
.add-btn-lg {
  flex: 1;
  padding: 6px;
  background: #3a3530;
  color: #d4a017;
  border: 1px solid #4a4540;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
}
.add-btn-lg:hover { background: #4a4540; }

.equip-slots { display: flex; flex-direction: column; gap: 6px; }
.equip-slot {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: #1a1510;
  border-radius: 6px;
}
.slot-label { color: #8a7a6a; font-size: 11px; width: 36px; }
.slot-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #f5e6c8;
  font-size: 12px;
}
.slot-empty { flex: 1; color: #5a4a3a; font-size: 11px; }
.unequip-btn {
  background: #3a3530;
  border: none;
  color: #8a7a6a;
  cursor: pointer;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
}
.unequip-btn:hover { background: #4a4540; color: #e8dcc8; }

.skills-list { display: flex; flex-direction: column; gap: 4px; }
.skill-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: #1a1510;
  border-radius: 4px;
}
.skill-name { color: #f5e6c8; font-size: 12px; font-weight: 600; }
.skill-cost { color: #3498db; font-size: 10px; }
.skill-desc { color: #8a7a6a; font-size: 10px; flex: 1; text-align: right; }
</style>
