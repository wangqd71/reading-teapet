import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { generateMonster, generateBoss } from '../data/monsters'
import { processTurn, rollDrops } from '../utils/combat'

export const useGameStore = defineStore('game', () => {
  const inBattle = ref(false)
  const currentMonster = ref(null)
  const battleLog = ref([])
  const battleResult = ref(null)
  const encounterCooldown = ref(0)
  const totalKills = ref(0)
  const totalBattles = ref(0)
  const battleMode = ref('mini')
  const selectedSkill = ref(null)

  const ENCOUNTER_BASE_CHANCE = 0.08
  const COOLDOWN_PAGES = 3

  function checkEncounter(pagesRead, playerLevel) {
    if (inBattle.value) return false
    if (encounterCooldown.value > 0) {
      encounterCooldown.value--
      return false
    }

    const chance = ENCOUNTER_BASE_CHANCE + Math.min(0.15, pagesRead * 0.002)
    if (Math.random() < chance) {
      const tier = Math.min(6, Math.ceil(playerLevel / 3))
      const monster = generateMonster(tier, playerLevel)
      if (monster) {
        startBattle(monster)
        return true
      }
    }
    return false
  }

  function checkBossEncounter(playerLevel) {
    if (inBattle.value) return false
    const boss = generateBoss(playerLevel)
    if (boss) {
      startBattle(boss)
      return true
    }
    return false
  }

  function startBattle(monster) {
    inBattle.value = true
    currentMonster.value = { ...monster }
    battleLog.value = [{
      type: 'start',
      message: `⚔️ 遭遇了 ${monster.name}（Lv.${monster.level}）！`
    }]
    battleResult.value = null
    selectedSkill.value = null
    totalBattles.value++
  }

  function executeTurn(playerStats, skill = null) {
    if (!inBattle.value || !currentMonster.value) return null

    const player = {
      currentHp: playerStats.currentHp,
      maxHp: playerStats.maxHp,
      currentMp: playerStats.currentMp,
      maxMp: playerStats.maxMp,
      attack: playerStats.attack,
      defense: playerStats.defense,
      speed: playerStats.speed,
      critRate: playerStats.critRate,
      dodgeRate: playerStats.dodgeRate
    }

    if (skill && skill.mpCost && player.currentMp < skill.mpCost) {
      battleLog.value.push({ type: 'error', message: '魔法值不足！' })
      return null
    }

    if (skill && skill.mpCost) {
      player.currentMp -= skill.mpCost
    }

    const result = processTurn(player, currentMonster.value, skill)

    for (const entry of result.log) {
      battleLog.value.push(entry)
    }

    return {
      playerHp: player.currentHp,
      playerMp: player.currentMp,
      monsterHp: currentMonster.value.currentHp,
      monsterDead: result.monsterDead,
      playerDead: result.playerDead,
      expReward: result.monsterDead ? currentMonster.value.expReward : 0,
      goldReward: result.monsterDead ? currentMonster.value.goldReward : 0,
      drops: result.monsterDead ? rollDrops(currentMonster.value.dropTable) : []
    }
  }

  function endBattle(result) {
    if (result === 'victory') {
      battleResult.value = 'victory'
      totalKills.value++
      encounterCooldown.value = COOLDOWN_PAGES
      battleLog.value.push({
        type: 'victory',
        message: `🎉 胜利！击败了${currentMonster.value.name}！`
      })
    } else if (result === 'defeat') {
      battleResult.value = 'defeat'
      battleLog.value.push({
        type: 'defeat',
        message: `💀 你被${currentMonster.value.name}击败了...`
      })
    } else if (result === 'flee') {
      battleResult.value = 'flee'
      encounterCooldown.value = COOLDOWN_PAGES + 2
      battleLog.value.push({
        type: 'flee',
        message: '🏃 你逃跑了！'
      })
    }

    setTimeout(() => {
      inBattle.value = false
      currentMonster.value = null
      battleLog.value = []
      battleResult.value = null
      selectedSkill.value = null
    }, 2500)
  }

  function flee() {
    if (!inBattle.value) return false
    const chance = 0.5 + (currentMonster.value.isBoss ? -0.3 : 0)
    if (Math.random() < chance) {
      endBattle('flee')
      return true
    }
    battleLog.value.push({ type: 'flee_fail', message: '逃跑失败！' })
    return false
  }

  return {
    inBattle, currentMonster, battleLog, battleResult,
    encounterCooldown, totalKills, totalBattles, battleMode, selectedSkill,
    checkEncounter, checkBossEncounter, startBattle,
    executeTurn, endBattle, flee
  }
})
