const enemyScores = Object.freeze({normal:1, runner:2, brute:4, charger:5, sentinel:7, screecher:6, leaper:5, spitter:5, mender:6, boss:15});

export function enemyXP(variant) {
  return Object.hasOwn(enemyScores,variant) ? enemyScores[variant] : 1;
}

export function earnedKillXP(claims = {}, scores = {}) {
  // Older claims earned 10 XP before enemy-specific scoring was introduced.
  return Object.keys(claims).reduce((sum,id)=>sum+(id.startsWith('kill.')?(scores[id]??10):0),0);
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
