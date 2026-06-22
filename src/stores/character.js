import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { CHARACTER_CLASSES } from '../data/classes'
import { ITEMS, EQUIPMENT_SLOTS } from '../data/items'
import { calculateExpForLevel } from '../utils/combat'

export const useCharacterStore = defineStore('character', () => {
  const character = ref(null)
  const inventory = ref([])
  const gold = ref(0)
  const equipment = ref({
    [EQUIPMENT_SLOTS.WEAPON]: null,
    [EQUIPMENT_SLOTS.ARMOR]: null,
    [EQUIPMENT_SLOTS.ACCESSORY]: null
  })
  const savedCharacters = ref([])

  const isAlive = computed(() => character.value && character.value.currentHp > 0)
  const hpPercent = computed(() => {
    if (!character.value) return 0
    return Math.max(0, Math.min(100, (character.value.currentHp / character.value.maxHp) * 100))
  })
  const mpPercent = computed(() => {
    if (!character.value) return 0
    return Math.max(0, Math.min(100, (character.value.currentMp / character.value.maxMp) * 100))
  })
  const expPercent = computed(() => {
    if (!character.value) return 0
    const needed = calculateExpForLevel(character.value.level)
    return Math.min(100, (character.value.exp / needed) * 100)
  })

  const totalAttack = computed(() => {
    if (!character.value) return 0
    let atk = character.value.attack
    for (const slot of Object.values(equipment.value)) {
      if (slot && slot.stats && slot.stats.attack) atk += slot.stats.attack
    }
    return atk
  })
  const totalDefense = computed(() => {
    if (!character.value) return 0
    let def = character.value.defense
    for (const slot of Object.values(equipment.value)) {
      if (slot && slot.stats && slot.stats.defense) def += slot.stats.defense
    }
    return def
  })
  const totalSpeed = computed(() => {
    if (!character.value) return 0
    let spd = character.value.speed
    for (const slot of Object.values(equipment.value)) {
      if (slot && slot.stats && slot.stats.speed) spd += slot.stats.speed
    }
    return spd
  })
  const totalCritRate = computed(() => {
    if (!character.value) return 0
    let crit = character.value.critRate
    for (const slot of Object.values(equipment.value)) {
      if (slot && slot.stats && slot.stats.critRate) crit += slot.stats.critRate
    }
    return Math.min(1, crit)
  })
  const totalDodgeRate = computed(() => {
    if (!character.value) return 0
    let dodge = character.value.dodgeRate
    for (const slot of Object.values(equipment.value)) {
      if (slot && slot.stats && slot.stats.dodgeRate) dodge += slot.stats.dodgeRate
    }
    return Math.min(1, dodge)
  })

  function createCharacter(name, classId) {
    const cls = CHARACTER_CLASSES[classId]
    if (!cls) return

    character.value = {
      name,
      classId,
      className: cls.name,
      classIcon: cls.icon,
      level: 1,
      exp: 0,
      currentHp: cls.baseStats.hp,
      maxHp: cls.baseStats.hp,
      currentMp: cls.baseStats.mp,
      maxMp: cls.baseStats.mp,
      attack: cls.baseStats.attack,
      defense: cls.baseStats.defense,
      speed: cls.baseStats.speed,
      critRate: cls.baseStats.critRate,
      dodgeRate: cls.baseStats.dodgeRate,
      skills: cls.skills,
      statPoints: 0,
      buffs: [],
      createdAt: Date.now()
    }

    inventory.value = [
      { ...ITEMS.hp_potion_s, uid: 'hp_s_init_1', quantity: 3 },
      { ...ITEMS.mp_potion_s, uid: 'mp_s_init_1', quantity: 2 }
    ]
    gold.value = 50
    equipment.value = {
      [EQUIPMENT_SLOTS.WEAPON]: null,
      [EQUIPMENT_SLOTS.ARMOR]: null,
      [EQUIPMENT_SLOTS.ACCESSORY]: null
    }

    saveGame()
    return character.value
  }

  function gainExp(amount) {
    if (!character.value) return []
    const levelUps = []
    character.value.exp += amount

    while (character.value.exp >= calculateExpForLevel(character.value.level)) {
      character.value.exp -= calculateExpForLevel(character.value.level)
      character.value.level++
      character.value.statPoints += 3

      const cls = CHARACTER_CLASSES[character.value.classId]
      if (cls) {
        character.value.maxHp += cls.growthStats.hp
        character.value.currentHp = character.value.maxHp
        character.value.maxMp += cls.growthStats.mp
        character.value.currentMp = character.value.maxMp
        character.value.attack += cls.growthStats.attack
        character.value.defense += cls.growthStats.defense
        character.value.speed += cls.growthStats.speed
      }

      levelUps.push(character.value.level)
    }

    saveGame()
    return levelUps
  }

  function allocateStat(stat) {
    if (!character.value || character.value.statPoints <= 0) return false
    character.value.statPoints--

    switch (stat) {
      case 'hp':
        character.value.maxHp += 10
        character.value.currentHp += 10
        break
      case 'mp':
        character.value.maxMp += 8
        character.value.currentMp += 8
        break
      case 'attack':
        character.value.attack += 2
        break
      case 'defense':
        character.value.defense += 2
        break
      case 'speed':
        character.value.speed += 1
        break
    }

    saveGame()
    return true
  }

  function healHp(amount) {
    if (!character.value) return
    character.value.currentHp = Math.min(character.value.maxHp, character.value.currentHp + amount)
    saveGame()
  }

  function healMp(amount) {
    if (!character.value) return
    character.value.currentMp = Math.min(character.value.maxMp, character.value.currentMp + amount)
    saveGame()
  }

  function addItem(itemId) {
    const template = ITEMS[itemId]
    if (!template) return

    const existing = inventory.value.find(i => i.id === itemId && i.type === 'consumable')
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1
    } else {
      inventory.value.push({
        ...template,
        uid: `${itemId}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        quantity: 1
      })
    }
    saveGame()
  }

  function useItem(uid) {
    const index = inventory.value.findIndex(i => i.uid === uid)
    if (index === -1) return false

    const item = inventory.value[index]
    if (item.type !== 'consumable') return false
    if (!item.effect) return false

    switch (item.effect.type) {
      case 'heal_hp':
        healHp(item.effect.value)
        break
      case 'heal_mp':
        healMp(item.effect.value)
        break
      case 'buff_attack_perm':
        if (character.value) character.value.attack += item.effect.value
        break
    }

    if (item.quantity > 1) {
      item.quantity--
    } else {
      inventory.value.splice(index, 1)
    }

    saveGame()
    return true
  }

  function equipItem(uid) {
    const index = inventory.value.findIndex(i => i.uid === uid)
    if (index === -1) return false

    const item = inventory.value[index]
    if (item.type !== 'equipment' || !item.slot) return false

    const currentEquipped = equipment.value[item.slot]
    equipment.value[item.slot] = { ...item }
    inventory.value.splice(index, 1)

    if (currentEquipped) {
      inventory.value.push(currentEquipped)
    }

    saveGame()
    return true
  }

  function unequipItem(slot) {
    const item = equipment.value[slot]
    if (!item) return false

    inventory.value.push({ ...item })
    equipment.value[slot] = null
    saveGame()
    return true
  }

  function addGold(amount) {
    gold.value += amount
    saveGame()
  }

  function saveGame() {
    const saveData = {
      character: character.value,
      inventory: inventory.value,
      gold: gold.value,
      equipment: equipment.value,
      savedAt: Date.now()
    }
    localStorage.setItem('reading_teapet_save', JSON.stringify(saveData))

    const charIndex = savedCharacters.value.findIndex(c =>
      c.name === character.value?.name && c.classId === character.value?.classId
    )
    if (charIndex >= 0) {
      savedCharacters.value[charIndex] = { ...character.value, savedAt: Date.now() }
    } else if (character.value) {
      savedCharacters.value.push({ ...character.value, savedAt: Date.now() })
    }
    localStorage.setItem('reading_teapet_characters', JSON.stringify(savedCharacters.value))
  }

  function loadGame() {
    try {
      const data = JSON.parse(localStorage.getItem('reading_teapet_save'))
      if (data && data.character) {
        character.value = data.character
        inventory.value = data.inventory || []
        gold.value = data.gold || 0
        equipment.value = data.equipment || {
          [EQUIPMENT_SLOTS.WEAPON]: null,
          [EQUIPMENT_SLOTS.ARMOR]: null,
          [EQUIPMENT_SLOTS.ACCESSORY]: null
        }
        return true
      }
    } catch (e) {
      console.error('Load failed:', e)
    }
    return false
  }

  function loadSavedCharacters() {
    try {
      const data = JSON.parse(localStorage.getItem('reading_teapet_characters'))
      if (Array.isArray(data)) {
        savedCharacters.value = data
      }
    } catch (e) {
      console.error('Load characters failed:', e)
    }
  }

  function getCombatStats() {
    if (!character.value) return null
    return {
      currentHp: character.value.currentHp,
      maxHp: character.value.maxHp,
      currentMp: character.value.currentMp,
      maxMp: character.value.maxMp,
      attack: totalAttack.value,
      defense: totalDefense.value,
      speed: totalSpeed.value,
      critRate: totalCritRate.value,
      dodgeRate: totalDodgeRate.value,
      skills: character.value.skills
    }
  }

  return {
    character, inventory, gold, equipment, savedCharacters,
    isAlive, hpPercent, mpPercent, expPercent,
    totalAttack, totalDefense, totalSpeed, totalCritRate, totalDodgeRate,
    createCharacter, gainExp, allocateStat, healHp, healMp,
    addItem, useItem, equipItem, unequipItem, addGold,
    saveGame, loadGame, loadSavedCharacters, getCombatStats
  }
})
