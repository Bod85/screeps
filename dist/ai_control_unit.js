
var RoleHarvester = require('creep_role_harvester');
var RoleUpgrader = require('creep_role_upgrader');
var RoleBuilder = require('creep_role_builder');
const RoleTank = require('creep_role_tank');
const RoleMelee = require('creep_role_melee');
const RoleRanged = require('creep_role_ranged');

// {"move":50,"work":100,"attack":80,"carry":50,"heal":250,"ranged_attack":150,"tough":10,"claim":600}
    // ATTACK_POWER: 30,
    // UPGRADE_CONTROLLER_POWER: 1,
    // RANGED_ATTACK_POWER: 10,
    // HEAL_POWER: 12,
    // RANGED_HEAL_POWER: 4,

module.exports = class AIControlUnit {
    static process() {
        this.controlWorkers();
        this.controlTowers();
        this.controlDefenders();
    }
    
    static controlDefenders() {
        for(var name in Game.creeps) {
            var creep = Game.creeps[name];
            switch(creep.memory.role) {
                case 'tank':
                    RoleTank.run(creep);
                    break;
                case 'melee':
                    RoleMelee.run(creep);                    
                    break;
                case 'ranged':
                    RoleRanged.run(creep);                    
                    break;
                case 'heal':
                    //RoleMelee.run(creep);                    
                    break;
            }
        }        
    }

    static controlWorkers() { 
        for(var name in Game.creeps) {
            var creep = Game.creeps[name];
            if(creep.memory.role == 'harvester') {
                // Harvest source
                if(!RoleHarvester.run(creep))
                    // Build structure
                    if(!RoleBuilder.run(creep, true))
                        // if can't then upgrade controller
                        RoleUpgrader.run(creep);
            }
            if(creep.memory.role == 'upgrader') {
                RoleUpgrader.run(creep);
            }
            if(creep.memory.role == 'builder') {
                // Build/repair structure
                if(!RoleBuilder.run(creep))
                // if can't then upgrade controller
                    RoleUpgrader.run(creep);
            }
        }
    };
    
    static controlTowers() {
        let towers = _.filter(Game.structures, (structure) => structure.structureType == STRUCTURE_TOWER);
        towers.forEach(tower => {
            var closestDamagedStructure = tower.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                filter: (structure) => structure.hits < structure.hitsMax
            });
            if(closestDamagedStructure) {
                tower.repair(closestDamagedStructure);
            }
    
            var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if(closestHostile) {
                tower.attack(closestHostile);
            }
        });
    };
};