export const CHARACTER_CLASSES = {
  warrior: {
    id: 'warrior',
    name: '战士',
    icon: '⚔️',
    description: '近战物理输出，高生命值和防御力',
    baseStats: {
      hp: 120,
      mp: 30,
      attack: 15,
      defense: 12,
      speed: 8,
      critRate: 0.1,
      dodgeRate: 0.05
    },
    growthStats: {
      hp: 15,
      mp: 3,
      attack: 3,
      defense: 2,
      speed: 1
    },
    skills: [
      { name: '猛击', mpCost: 0, damageMult: 1.5, description: '全力一击' },
      { name: '旋风斩', mpCost: 15, damageMult: 2.0, description: '攻击全体敌人' },
      { name: '战吼', mpCost: 10, effect: 'buff_attack', value: 5, duration: 3, description: '提升攻击力5点，持续3回合' }
    ]
  },
  mage: {
    id: 'mage',
    name: '法师',
    icon: '🔮',
    description: '远程魔法输出，高攻击力和魔法值',
    baseStats: {
      hp: 70,
      mp: 100,
      attack: 20,
      defense: 6,
      speed: 10,
      critRate: 0.15,
      dodgeRate: 0.08
    },
    growthStats: {
      hp: 8,
      mp: 12,
      attack: 4,
      defense: 1,
      speed: 2
    },
    skills: [
      { name: '火球术', mpCost: 10, damageMult: 1.8, description: '发射一枚火球' },
      { name: '冰冻术', mpCost: 20, damageMult: 2.5, description: '冰冻敌人造成大量伤害' },
      { name: '魔法护盾', mpCost: 15, effect: 'buff_defense', value: 8, duration: 3, description: '提升防御力8点，持续3回合' }
    ]
  },
  assassin: {
    id: 'assassin',
    name: '刺客',
    icon: '🗡️',
    description: '高速暴击输出，擅长闪避和暴击',
    baseStats: {
      hp: 85,
      mp: 50,
      attack: 18,
      defense: 7,
      speed: 18,
      critRate: 0.25,
      dodgeRate: 0.2
    },
    growthStats: {
      hp: 10,
      mp: 5,
      attack: 3,
      defense: 1,
      speed: 3
    },
    skills: [
      { name: '暗影突袭', mpCost: 8, damageMult: 2.0, critBonus: 0.3, description: '高暴击率的突袭' },
      { name: '毒刃', mpCost: 12, damageMult: 1.3, dot: { damage: 5, duration: 3 }, description: '附带持续毒素伤害' },
      { name: '闪避步', mpCost: 10, effect: 'buff_dodge', value: 0.3, duration: 2, description: '大幅提升闪避率' }
    ]
  },
  priest: {
    id: 'priest',
    name: '牧师',
    icon: '✨',
    description: '治疗与辅助，拥有恢复生命的能力',
    baseStats: {
      hp: 90,
      mp: 80,
      attack: 10,
      defense: 10,
      speed: 9,
      critRate: 0.05,
      dodgeRate: 0.05
    },
    growthStats: {
      hp: 12,
      mp: 10,
      attack: 2,
      defense: 2,
      speed: 1
    },
    skills: [
      { name: '圣光击', mpCost: 8, damageMult: 1.2, description: '神圣光芒攻击' },
      { name: '治愈术', mpCost: 15, effect: 'heal', value: 40, description: '恢复40点生命值' },
      { name: '神圣护佑', mpCost: 20, effect: 'buff_all', value: 3, duration: 3, description: '全属性提升3点' }
    ]
  }
}

export const CLASS_LIST = Object.values(CHARACTER_CLASSES)
