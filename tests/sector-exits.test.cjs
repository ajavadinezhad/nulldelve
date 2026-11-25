const assert = require('node:assert/strict');
const fs = require('node:fs');
const {test} = require('node:test');
const vm = require('node:vm');
const {
  CAMPAIGN_OPERATIONS, campaignOperationComplete, campaignOperationExit, deployCampaignOperation,
} = require('../src/campaign-operations.js');
const {createProgression} = require('../src/progression.js');
const {beginCrateGrab, createPressurePuzzle} = require('../src/pressure-puzzle.js');

const source = fs.readFileSync(new URL('../src/main.js', `file://${__filename}`), 'utf8');
const interaction = source.slice(source.indexOf('function beginInteraction('), source.indexOf('function actor('));

for (const {id, name} of CAMPAIGN_OPERATIONS) {
  test(`${name} leaves through the shared desktop and touch interaction handler`, () => {
    const doors = Array.from({length: 44}, () => ({}));
    const player = {};
    const progression = createProgression({doors, enemies: [], spawnEnemy: () => null});
    const puzzle = createPressurePuzzle();
    assert.ok(deployCampaignOperation(id, {doors, player, progression, puzzle}));

    const exit = campaignOperationExit(id);
    Object.assign(player, exit);
    assert.equal(campaignOperationComplete(id, {player, progression}), false);
    if (id === 'breach') assert.equal(progression.settingsPanel(player).id, 'wire-8');

    for (const zone of progression.state.zones) zone.status = 'cleared';
    for (const [key, value] of Object.entries(progression.state.operationTasks)) {
      if (typeof value === 'boolean') progression.state.operationTasks[key] = true;
    }
    progression.state.power.solved = true;
    progression.state.valves.solved = true;
    progression.state.operationTasks.nestRelay.decoded = true;
    progression.state.artifacts = ['artifact-archive', 'artifact-generator', 'artifact-containment'];
    player.intel = true;
    assert.ok(campaignOperationComplete(id, {player, progression}));

    const events = [];
    const context = vm.createContext({
      player, progression, puzzle, beginCrateGrab, campaignOperationComplete,
      runConfig: {operation: id},
      solid: () => false,
      puzzleSettings: {open: () => events.push('puzzle')},
      liftTransfer: {nearby: () => events.push('lift')},
      collectSalvage: () => events.push('salvage'),
      queueCheckpoint: reason => events.push(reason),
      commitCheckpoint: () => events.push('saved'),
      end: won => events.push(won),
    });
    vm.runInContext(interaction + '\nbeginInteraction()', context);
    assert.deepEqual(events, ['Sector departed', 'saved', true]);
  });
}
