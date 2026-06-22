export const ITEM_TYPES = {
  CONSUMABLE: 'consumable',
  EQUIPMENT: 'equipment',
  MATERIAL: 'material'
}

export const EQUIPMENT_SLOTS = {
  WEAPON: 'weapon',
  ARMOR: 'armor',
  ACCESSORY: 'accessory'
}

export const ITEMS = {
  hp_potion_s: {
    id: 'hp_potion_s',
    name: '小生命药水',
    icon: '🧪',
    type: ITEM_TYPES.CONSUMABLE,
    description: '恢复30点生命值',
    effect: { type: 'heal_hp', value: 30 },
    sellPrice: 3
  },
  hp_potion_m: {
    id: 'hp_potion_m',
    name: '中生命药水',
    icon: '🧪',
    type: ITEM_TYPES.CONSUMABLE,
    description: '恢复80点生命值',
    effect: { type: 'heal_hp', value: 80 },
    sellPrice: 10
  },
  hp_potion_l: {
    id: 'hp_potion_l',
    name: '大生命药水',
    icon: '🧪',
    type: ITEM_TYPES.CONSUMABLE,
    description: '恢复200点生命值',
    effect: { type: 'heal_hp', value: 200 },
    sellPrice: 30
  },
  mp_potion_s: {
    id: 'mp_potion_s',
    name: '小魔法药水',
    icon: '💧',
    type: ITEM_TYPES.CONSUMABLE,
    description: '恢复20点魔法值',
    effect: { type: 'heal_mp', value: 20 },
    sellPrice: 5
  },
  elixir_power: {
    id: 'elixir_power',
    name: '力量药剂',
    icon: '⚗️',
    type: ITEM_TYPES.CONSUMABLE,
    description: '永久提升2点攻击力',
    effect: { type: 'buff_attack_perm', value: 2 },
    sellPrice: 100
  },
  slime_jelly: {
    id: 'slime_jelly',
    name: '史莱姆凝胶',
    icon: '🟩',
    type: ITEM_TYPES.MATERIAL,
    description: '史莱姆掉落的材料，可用于合成',
    sellPrice: 2
  },
  goblin_ear: {
    id: 'goblin_ear',
    name: '哥布林耳朵',
    icon: '👂',
    type: ITEM_TYPES.MATERIAL,
    description: '哥布林掉落的材料',
    sellPrice: 3
  },
  bone: {
    id: 'bone',
    name: '骨头',
    icon: '🦴',
    type: ITEM_TYPES.MATERIAL,
    description: '骷髅兵掉落的骨头',
    sellPrice: 4
  },
  wolf_pelt: {
    id: 'wolf_pelt',
    name: '狼皮',
    icon: '🐾',
    type: ITEM_TYPES.MATERIAL,
    description: '灰狼的皮毛',
    sellPrice: 6
  },
  coin_pouch: {
    id: 'coin_pouch',
    name: '钱袋',
    icon: '💰',
    type: ITEM_TYPES.MATERIAL,
    description: '山贼藏匿的钱袋',
    sellPrice: 20
  },
  dark_shard: {
    id: 'dark_shard',
    name: '暗黑碎片',
    icon: '🔮',
    type: ITEM_TYPES.MATERIAL,
    description: '蕴含暗黑力量的碎片',
    sellPrice: 30
  },
  dragon_scale: {
    id: 'dragon_scale',
    name: '龙鳞',
    icon: '🐉',
    type: ITEM_TYPES.MATERIAL,
    description: '幼龙的鳞片，极为坚硬',
    sellPrice: 50
  },
  dragon_fang: {
    id: 'dragon_fang',
    name: '龙牙',
    icon: '🦷',
    type: ITEM_TYPES.MATERIAL,
    description: '幼龙的獠牙',
    sellPrice: 80
  },
  demon_heart: {
    id: 'demon_heart',
    name: '魔王之心',
    icon: '❤️‍🔥',
    type: ITEM_TYPES.MATERIAL,
    description: '魔王掉落的邪恶心脏',
    sellPrice: 200
  },
  dagger_rusty: {
    id: 'dagger_rusty',
    name: '生锈匕首',
    icon: '🗡️',
    type: ITEM_TYPES.EQUIPMENT,
    slot: EQUIPMENT_SLOTS.WEAPON,
    description: '一把生锈的匕首',
    stats: { attack: 3 },
    sellPrice: 8
  },
  sword_iron: {
    id: 'sword_iron',
    name: '铁剑',
    icon: '⚔️',
    type: ITEM_TYPES.EQUIPMENT,
    slot: EQUIPMENT_SLOTS.WEAPON,
    description: '坚固的铁剑',
    stats: { attack: 8 },
    sellPrice: 25
  },
  weapon_demon: {
    id: 'weapon_demon',
    name: '魔剑',
    icon: '🗡️',
    type: ITEM_TYPES.EQUIPMENT,
    slot: EQUIPMENT_SLOTS.WEAPON,
    description: '魔王使用的邪恶之剑',
    stats: { attack: 25, critRate: 0.1 },
    sellPrice: 500
  },
  shield_wooden: {
    id: 'shield_wooden',
    name: '木盾',
    icon: '🛡️',
    type: ITEM_TYPES.EQUIPMENT,
    slot: EQUIPMENT_SLOTS.ARMOR,
    description: '简易的木盾',
    stats: { defense: 5 },
    sellPrice: 12
  },
  armor_dark: {
    id: 'armor_dark',
    name: '暗黑铠甲',
    icon: '🦺',
    type: ITEM_TYPES.EQUIPMENT,
    slot: EQUIPMENT_SLOTS.ARMOR,
    description: '暗黑骑士的铠甲',
    stats: { defense: 18, hp: 30 },
    sellPrice: 200
  }
}

export function getItem(itemId) {
  return ITEMS[itemId] || null
}

export function createItemInstance(itemId) {
  const template = getItem(itemId)
  if (!template) return null
  return {
    ...template,
    uid: `${itemId}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
  }
}
