export function calculateDamage(attacker, defender, skill = null) {
  let baseDamage = attacker.attack
  let damageMult = 1
  let critBonus = 0

  if (skill) {
    damageMult = skill.damageMult || 1
    critBonus = skill.critBonus || 0
  }

  const isCrit = Math.random() < (attacker.critRate || 0.1) + critBonus
  if (isCrit) {
    damageMult *= 1.5
  }

  const defense = defender.defense || 0
  const rawDamage = baseDamage * damageMult
  const finalDamage = Math.max(1, Math.floor(rawDamage - defense * 0.5))

  const variance = 0.9 + Math.random() * 0.2
  const damage = Math.max(1, Math.floor(finalDamage * variance))

  return { damage, isCrit }
}

export function checkDodge(defender) {
  return Math.random() < (defender.dodgeRate || 0)
}

export function calculateExpForLevel(level) {
  return Math.floor(50 * Math.pow(level, 1.5))
}

export function processTurn(player, monster, playerSkill = null) {
  const log = []

  const playerSpeed = player.speed || 10
  const monsterSpeed = monster.speed || 5
  const playerFirst = playerSpeed >= monsterSpeed

  if (playerFirst) {
    const pResult = playerAttack(player, monster, playerSkill)
    log.push(...pResult.log)
    if (monster.currentHp <= 0) {
      return { log, monsterDead: true, playerDead: false }
    }

    const mResult = monsterAttack(monster, player)
    log.push(...mResult.log)
    if (player.currentHp <= 0) {
      return { log, monsterDead: false, playerDead: true }
    }
  } else {
    const mResult = monsterAttack(monster, player)
    log.push(...mResult.log)
    if (player.currentHp <= 0) {
      return { log, monsterDead: false, playerDead: true }
    }

    const pResult = playerAttack(player, monster, playerSkill)
    log.push(...pResult.log)
    if (monster.currentHp <= 0) {
      return { log, monsterDead: true, playerDead: false }
    }
  }

  return { log, monsterDead: false, playerDead: false }
}

function playerAttack(player, monster, skill) {
  const log = []

  if (skill && skill.effect === 'heal') {
    const healAmount = skill.value
    player.currentHp = Math.min(player.maxHp, player.currentHp + healAmount)
    log.push({ type: 'heal', actor: 'player', amount: healAmount, message: `你使用了${skill.name}，恢复了${healAmount}点生命！` })
    return { log }
  }

  if (skill && skill.effect && skill.effect.startsWith('buff')) {
    log.push({ type: 'buff', actor: 'player', message: `你使用了${skill.name}！` })
    return { log }
  }

  if (checkDodge(monster)) {
    log.push({ type: 'dodge', actor: 'monster', message: `${monster.name}闪避了你的攻击！` })
    return { log }
  }

  const { damage, isCrit } = calculateDamage(player, monster, skill)
  monster.currentHp = Math.max(0, monster.currentHp - damage)

  const skillName = skill ? skill.name : '普通攻击'
  const critText = isCrit ? '【暴击！】' : ''
  log.push({
    type: 'attack',
    actor: 'player',
    damage,
    isCrit,
    message: `你使用${skillName}${critText}，对${monster.name}造成了${damage}点伤害！`
  })

  if (skill && skill.dot) {
    log.push({ type: 'dot', actor: 'monster', message: `${monster.name}中毒了，每回合将受到${skill.dot.damage}点伤害！` })
  }

  return { log }
}

function monsterAttack(monster, player) {
  const log = []

  if (checkDodge(player)) {
    log.push({ type: 'dodge', actor: 'player', message: `你闪避了${monster.name}的攻击！` })
    return { log }
  }

  const { damage, isCrit } = calculateDamage(monster, player)
  player.currentHp = Math.max(0, player.currentHp - damage)

  const critText = isCrit ? '【暴击！】' : ''
  log.push({
    type: 'attack',
    actor: 'monster',
    damage,
    isCrit,
    message: `${monster.name}攻击了你${critText}，造成了${damage}点伤害！`
  })

  return { log }
}

export function rollDrops(dropTable) {
  const drops = []
  for (const entry of dropTable) {
    if (Math.random() < entry.chance) {
      drops.push(entry.itemId)
    }
  }
  return drops
}
