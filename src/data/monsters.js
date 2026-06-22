const MONSTER_TEMPLATES = [
  {
    id: 'slime',
    name: '史莱姆',
    icon: '🟢',
    tier: 1,
    baseStats: { hp: 30, attack: 5, defense: 2, speed: 3 },
    expReward: 10,
    goldReward: 5,
    dropTable: [
      { itemId: 'slime_jelly', chance: 0.5 },
      { itemId: 'hp_potion_s', chance: 0.2 }
    ]
  },
  {
    id: 'goblin',
    name: '哥布林',
    icon: '👺',
    tier: 1,
    baseStats: { hp: 40, attack: 8, defense: 3, speed: 6 },
    expReward: 15,
    goldReward: 8,
    dropTable: [
      { itemId: 'goblin_ear', chance: 0.4 },
      { itemId: 'dagger_rusty', chance: 0.1 }
    ]
  },
  {
    id: 'skeleton',
    name: '骷髅兵',
    icon: '💀',
    tier: 2,
    baseStats: { hp: 55, attack: 12, defense: 8, speed: 5 },
    expReward: 25,
    goldReward: 15,
    dropTable: [
      { itemId: 'bone', chance: 0.6 },
      { itemId: 'shield_wooden', chance: 0.08 }
    ]
  },
  {
    id: 'wolf',
    name: '灰狼',
    icon: '🐺',
    tier: 2,
    baseStats: { hp: 50, attack: 14, defense: 5, speed: 12 },
    expReward: 20,
    goldReward: 10,
    dropTable: [
      { itemId: 'wolf_pelt', chance: 0.5 },
      { itemId: 'hp_potion_m', chance: 0.15 }
    ]
  },
  {
    id: 'bandit',
    name: '山贼',
    icon: '🥷',
    tier: 3,
    baseStats: { hp: 80, attack: 16, defense: 10, speed: 10 },
    expReward: 35,
    goldReward: 25,
    dropTable: [
      { itemId: 'coin_pouch', chance: 0.3 },
      { itemId: 'sword_iron', chance: 0.06 }
    ]
  },
  {
    id: 'dark_knight',
    name: '暗黑骑士',
    icon: '🖤',
    tier: 4,
    baseStats: { hp: 150, attack: 25, defense: 20, speed: 8 },
    expReward: 80,
    goldReward: 50,
    dropTable: [
      { itemId: 'dark_shard', chance: 0.4 },
      { itemId: 'armor_dark', chance: 0.05 },
      { itemId: 'hp_potion_l', chance: 0.2 }
    ]
  },
  {
    id: 'dragon_whelp',
    name: '幼龙',
    icon: '🐲',
    tier: 5,
    baseStats: { hp: 250, attack: 35, defense: 25, speed: 15 },
    expReward: 150,
    goldReward: 100,
    dropTable: [
      { itemId: 'dragon_scale', chance: 0.3 },
      { itemId: 'dragon_fang', chance: 0.15 },
      { itemId: 'elixir_power', chance: 0.1 }
    ]
  },
  {
    id: 'demon_lord',
    name: '魔王',
    icon: '😈',
    tier: 6,
    isBoss: true,
    baseStats: { hp: 500, attack: 50, defense: 35, speed: 20 },
    expReward: 500,
    goldReward: 300,
    dropTable: [
      { itemId: 'demon_heart', chance: 0.5 },
      { itemId: 'weapon_demon', chance: 0.1 },
      { itemId: 'elixir_power', chance: 0.3 }
    ]
  }
]

export function generateMonster(tier, playerLevel) {
  const candidates = MONSTER_TEMPLATES.filter(m => m.tier <= tier)
  if (candidates.length === 0) return null
  const template = candidates[Math.floor(Math.random() * candidates.length)]
  const levelBonus = Math.max(0, playerLevel - 1) * 0.15

  return {
    ...template,
    level: Math.max(1, Math.floor(playerLevel * (0.8 + Math.random() * 0.4))),
    currentHp: Math.floor(template.baseStats.hp * (1 + levelBonus)),
    maxHp: Math.floor(template.baseStats.hp * (1 + levelBonus)),
    attack: Math.floor(template.baseStats.attack * (1 + levelBonus)),
    defense: Math.floor(template.baseStats.defense * (1 + levelBonus)),
    speed: Math.floor(template.baseStats.speed * (1 + levelBonus)),
    expReward: Math.floor(template.expReward * (1 + levelBonus)),
    goldReward: Math.floor(template.goldReward * (1 + levelBonus))
  }
}

export function generateBoss(playerLevel) {
  const boss = MONSTER_TEMPLATES.find(m => m.isBoss)
  if (!boss) return null
  const levelBonus = Math.max(0, playerLevel - 1) * 0.2

  return {
    ...boss,
    level: playerLevel + 2,
    currentHp: Math.floor(boss.baseStats.hp * (1 + levelBonus)),
    maxHp: Math.floor(boss.baseStats.hp * (1 + levelBonus)),
    attack: Math.floor(boss.baseStats.attack * (1 + levelBonus)),
    defense: Math.floor(boss.baseStats.defense * (1 + levelBonus)),
    speed: Math.floor(boss.baseStats.speed * (1 + levelBonus)),
    expReward: Math.floor(boss.expReward * (1 + levelBonus)),
    goldReward: Math.floor(boss.goldReward * (1 + levelBonus))
  }
}
