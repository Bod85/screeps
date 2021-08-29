
var RoleHarvester = require('creep_role_worker_harvester');
var RoleUpgrader = require('creep_role_worker_upgrader');
var RoleBuilder = require('creep_role_worker_builder');
const RoleTank = require('creep_role_defender_tank');
const RoleMelee = require('creep_role_defender_melee');
const RoleRanged = require('creep_role_defender_ranged');
const RoleHealer = require('creep_role_defender_healer');

module.exports = class AIControlUnit {
    static process() {
        this.controlTowers();
        this.controlWorkers();
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
                case 'healer':
                    RoleHealer.run(creep);                    
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