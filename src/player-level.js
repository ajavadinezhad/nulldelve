const XP_PER_KILL = 10;

export function earnedKillXP(claims = {}) {
  return Object.keys(claims).filter(id => id.startsWith('kill.')).length * XP_PER_KILL;
}

export function playerLevel(totalXP = 0) {
  let xp = Number.isSafeInteger(totalXP) ? Math.max(0, totalXP) : 0;
  let level = 1;
  let next = 150;
  while (xp >= next) {
    xp -= next;
    level++;
    next += 50;
  }
  return {level, xp, next, points: level - 1};
}
