var Core = require('core_functions');
const Const = require('core_const');

// {"move":50,"work":100,"attack":80,"carry":50,"heal":250,"ranged_attack":150,"tough":10,"claim":600}
    // ATTACK_POWER: 30,
    // UPGRADE_CONTROLLER_POWER: 1,
    // RANGED_ATTACK_POWER: 10,
    // HEAL_POWER: 12,
    // RANGED_HEAL_POWER: 4,

module.exports = class AISpawn {
    // Role => Level => Body / Max
    static worker_roles = {"harvester": { 
                                    1: {"body": [WORK, CARRY, MOVE], "minCount": 2, "redunant": true}, // 300
                                    2: {"body": [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE], "minCount": 2, "redunant": true}, // 550
                                    3: {"body": [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], "minCount": 2, "redunant": true}, // 800
                                 },
                    "upgrader":  { 
                                    1: {"body": [WORK, CARRY, MOVE], "minCount": 2},
                                    2: {"body": [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE], "minCount": 2},
                                    3: {"body": [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], "minCount": 2},
                                 },
                    "builder":   { 
                                    1: {"body": [WORK, CARRY, MOVE], "minCount": 2},
                                    2: {"body": [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE], "minCount": 2},
                                    3: {"body": [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], "minCount": 2},
                                 }
                    };
                    
                    
    // // {"move":50,"work":100,"attack":80,"carry":50,"heal":250,"ranged_attack":150,"tough":10,"claim":600}
    static defender_roles = {
                        "ranged": { 
                            1: {"body": [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, RANGED_ATTACK]}, // 10 : 800
                            2: {"body": [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK]}, // 20
                            3: {"body": [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK]}, // 30
                                },
                        "melee": { 
                            1: {"body": [TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, ATTACK, ATTACK]}, // 60
                            2: {"body": [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK]}, // 120
                                },
                         "healer": { 
                            1: {"body": [MOVE, HEAL]}, // 12
                            2: {"body": [MOVE, HEAL, HEAL]}, // 24
                            3: {"body": [MOVE, HEAL, HEAL, HEAL]}, // 36
                                },
                        "tank": { 
                            1: {"body": [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE]}, // 0 : 2200
                            2: {"body": [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, RANGED_ATTACK]}, // 2900
                            3: {"body": [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK]},
                                },
                            };
  
    static process() {
        for(var spawnName in Game.spawns) {
            if(!Game.spawns[spawnName].spawning) {
                let roomMemory = Game.spawns[spawnName].room.memory;
                let deployDefence = roomMemory.hostileTargets && Object.keys(roomMemory.hostileTargets).length > 0 
                                        && roomMemory.productionLevel >= Const.MIN_PRODUCTION_DEFENCE_LEVEL;
                // Spawn workers (harverster, builder, updater)
                let spawning = this.spawnWorkers(Game.spawns[spawnName], !deployDefence);
                // Spawn defenger for detected targets
                if(!spawning && deployDefence)
                    this.spawnDefence(Game.spawns[spawnName]);
            }
        }
    }
    
    /** @param {Spawn} spawn **/
    static spawnDefence(spawn) {
        let defenders = {};
        let roomLevel = spawn.room.memory.productionLevel;
        
        this.calcTargetsCounter(spawn);
        
        let defendersNeed = {};
        // Calculating how much creeps do we need
        for(let hostileID in spawn.room.memory.hostileTargets) {
            let hostileDesc = spawn.room.memory.hostileTargets[hostileID];
            if(Const.HOSTILE_DEFENDERS_KEY in hostileDesc) {
                for(let role in hostileDesc[Const.HOSTILE_DEFENDERS_KEY]) {
                    if(!(role in defendersNeed))
                        defendersNeed[role] = 0;
                    defendersNeed[role] += hostileDesc[Const.HOSTILE_DEFENDERS_KEY][role];
                }
            }
        }

        // Calculating defenders of each role in the room and remove all which numbers are exceeding what we need
        for(let role in this.defender_roles) {
            if(role in defendersNeed) {
                let creepCnt = _.filter(Game.creeps, (creep) => creep.room.id == spawn.room.id && creep.memory.role == role).length;
                if(creepCnt < defendersNeed[role])
                    defenders[role] = creepCnt;
            }
        }
        
        if(Object.keys(defenders).length > 0) {
            let minRoleCount = Math.min(...Object.values(defenders));
            let spawnRole = Object.keys(defenders).filter(key => defenders[key] === minRoleCount)[0];
            //console.log(this.bodyCost(this.defender_roles[spawnRole][roomLevel]["body"]));
            if(this.bodyCost(this.defender_roles[spawnRole][roomLevel]["body"]) <= spawn.room.energyAvailable) {
                    let newName = spawnRole[0].toUpperCase() + spawnRole.slice(1) + Game.time;
                    this.spawnCreep(spawn, newName, spawnRole, this.defender_roles[spawnRole][roomLevel]["body"]);
            }
        }
    }
  
    /** @param {Spawn} spawn **/
    static spawnWorkers(spawn, spawnRedunant = true) {
        let spawning = false;
        
        let roomLevel = spawn.room.memory.productionLevel;
        let redundantRole = null;
        for(let role in this.worker_roles) {
            let units = _.filter(Game.creeps, (creep) => creep.memory.role == role && creep.room.id == spawn.room.id);
            if(units.length < spawn.room.memory.creepLimit[role] 
                && this.bodyCost(this.worker_roles[role][roomLevel]["body"]) <= spawn.room.energyAvailable) {
                if(units.length < this.worker_roles[role][roomLevel]["minCount"]) {
                    let newName = role[0].toUpperCase() + role.slice(1) + Game.time;
                    this.spawnCreep(spawn, newName, role, this.worker_roles[role][roomLevel]["body"]);
                    redundantRole = null;
                    break;
                } else if (this.worker_roles[role][roomLevel]["redunant"]) {
                    redundantRole = role;
                }
            }
        }
        
        // If all minimum requirement are finished - then optional spawning
        if(redundantRole && spawnRedunant) {
            let units = _.filter(Game.creeps, (creep) => creep.memory.role == redundantRole && creep.room.id == spawn.room.id);
            if(units.length < spawn.room.memory.creepLimit[redundantRole] 
                && this.bodyCost(this.worker_roles[redundantRole][roomLevel]["body"]) <= spawn.room.energyAvailable) {
                let newName = redundantRole[0].toUpperCase() + redundantRole.slice(1) + Game.time;
                this.spawnCreep(spawn, newName,redundantRole, this.worker_roles[redundantRole][roomLevel]["body"]);
            }
            
        }
        
        return spawning;
    };

    // Make creep with chosen role
    /** @param {Spawn} spawn **/
    static spawnCreep(spawn, name, role, tasks) {
        if(!spawn.spawning && this.bodyCost(tasks) <= spawn.room.energyAvailable) {
            console.log(spawn.room.name + '. Spawning new creep: ' + name);
            spawn.spawnCreep(tasks, name, {memory: {role: role}});    
            //var spawningCreep = Game.creeps[Game.spawns[spawnName].spawning.name];
            spawn.room.visual.text(
                '🛠️'+ role,
                spawn.pos.x + 1,
                spawn.pos.y,
                {align: 'left', opacity: 0.8});
        }
    };
    
    static bodyCost(body) {
        let sum = 0;
        for (let i in body)
            sum += BODYPART_COST[body[i]];
        return sum;
    };
    
    static countBodyParts(body, part) {
        let sum = 0;
        for (let i in body) {
            if(body[i] == part)
                sum++;
        }
        return sum;
    }
    
    // Calculating minimum necessary defence against targets
    /** @param {Spawn} spawn **/
    static calcTargetsCounter(spawn) {
        let roomLevel = spawn.room.memory.productionLevel;

        for(let hostileID in spawn.room.memory.hostileTargets) {
            let hostileDesc = spawn.room.memory.hostileTargets[hostileID];
            // If we didn't assign defenders against the target yet
            if (!(Const.HOSTILE_DEFENDERS_KEY in hostileDesc)) {
                // Define target weak spot
                let attackerRole, targetAttack, attackerDPT, attackerHits;
                if(hostileDesc.stats[RANGED_ATTACK] < hostileDesc.stats[ATTACK]) {
                    targetAttack = hostileDesc.stats[RANGED_ATTACK];
                    attackerRole = "ranged";
                    attackerDPT = this.countBodyParts(this.defender_roles[attackerRole][roomLevel]["body"], RANGED_ATTACK) * RANGED_ATTACK_POWER;
                } else {
                    targetAttack = hostileDesc.stats[ATTACK];
                    attackerRole = "melee";
                    attackerDPT = this.countBodyParts(this.defender_roles[attackerRole][roomLevel]["body"], RANGED_ATTACK) * ATTACK_POWER;
                }
                attackerHits = this.defender_roles[attackerRole][roomLevel]["body"].length * REPAIR_POWER;
                let attackerCount = Math.ceil(hostileDesc.stats["hits"] * targetAttack / (attackerDPT * attackerHits));
                // If we need too many attackers... then lets start raid
                let tankCount = (attackerCount > 3) ? 1 : 0;
                let healerCount = (attackerCount > 3) ? 1 : 0;
                let defendersDesc = { "tank": tankCount, "healer": healerCount};
                // If hostile is too strong - then we are going to handle him
                defendersDesc[attackerRole] = ((attackerCount > 8) ? 8 : attackerCount);
                    
                spawn.room.memory.hostileTargets[hostileID][Const.HOSTILE_DEFENDERS_KEY] = defendersDesc;
            }
        }
    };
};