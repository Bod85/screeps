var Core = require('core_functions');
const Const = require('core_const');

const HARVESTER_WORK_PERIOD = 25;
const HARVESTER_COUNT_CORRECTION = 2;
const HOSTILE_FORBIDDEN_RADIUS = 5;
const GATHER_POINT_SUFFIX = "_RP";
const GATHER_POINT_COLOR = COLOR_GREEN;

module.exports = {
    // Собираем базовую информацию о наших комнатах
    initializeAll: function() {
        let rooms = _.filter(Game.rooms, room => room.controller.my && !room.memory.initialized);
        rooms.forEach(room => {
            this.updateRoomInfo(room);
        });
            
    },
    
    updateAll: function() {
        for(let name in Game.rooms) {
            let room = Game.rooms[name];
            this.updateRoomInfo(room);
        }
    },
    
    updateHostileTargets: function() {
        for(let name in Game.rooms) {
            let room = Game.rooms[name];
            
            if(!room.memory.hostileTargets)
                room.memory.hostileTargets = {};
            
            let actualTargetList = [];
            // Check hostile targets in all our rooms
            let hostileList = room.find(FIND_HOSTILE_CREEPS);
            _.forEach(hostileList, function(hostileCreep) {
                if(Object.keys(room.memory.hostileTargets).indexOf(hostileCreep.id) == -1) {
                    let stats = {};
                    let aggressive = false;
                    stats[RANGED_ATTACK] = 0;
                    stats[ATTACK] = 0;
                    stats[HEAL] = 0;
                    stats["hits"] = hostileCreep.body.length * REPAIR_POWER;
                    _.forEach(hostileCreep.body, function(body) { 
                        if(body.hits > 0) {
                            switch(body.type) {
                                case RANGED_ATTACK:
                                    stats[RANGED_ATTACK] += RANGED_ATTACK_POWER;
                                    aggressive = true;
                                    break;
                                case ATTACK:
                                    stats[ATTACK] += ATTACK_POWER;
                                    aggressive = true;
                                    break;
                                case HEAL:
                                    stats[HEAL] += HEAL_POWER;
                                    aggressive = true;
                                    break;
                            }
                        }
                    })
                    aggressive = aggressive && hostileCreep.owner.username !== 'Source Keeper';
                    room.memory.hostileTargets[hostileCreep.id] = {"stats": stats, "action": Const.ACTION_AVOID, "aggressive" : aggressive};
                }
                actualTargetList.push(hostileCreep.id);
            });
            
            // Clear info about missing targets
            for(let creepID in room.memory.hostileTargets) {
                if(actualTargetList.indexOf(creepID) == -1)
                    delete room.memory.hostileTargets[creepID];
            }
        }
    },
    
    // Save info about my room
    /** @param {Room} room **/
    updateRoomInfo: function (room) {
        let roomSources = {};
        let sources = room.find(FIND_SOURCES);
        let spawn = room.find(FIND_MY_SPAWNS)[0];
        let harvestersCount = 0;
        
        // Go through all room resources
        sources.forEach(source => {
            let accessableSpots = [];
            let sourceHarvestersLimit = 0;
            let pathCost = 0;
            var roadBuilded = true;
            
            // If there is hostile near the source - stop harvesting
            let nearHostiles = room.find(FIND_HOSTILE_CREEPS, {filter: function(hostile) {
                    return Math.abs(hostile.pos.x - source.pos.x) <=HOSTILE_FORBIDDEN_RADIUS && Math.abs(hostile.pos.y - source.pos.y) <=HOSTILE_FORBIDDEN_RADIUS
                }});
            
            // Check how many accesable points are available for current source and is there road builded to it
            for(let i = source.pos.x - 1; i <= source.pos.x + 1; i++) {
                for(let j = source.pos.y - 1; j <= source.pos.y + 1; j++) {
                    let objects = room.lookAt(i, j);
                    if(_.filter(objects, 
                                    object => object.type == LOOK_TERRAIN && object.terrain != 'wall' || object.type == LOOK_STRUCTURES && object.structure.structureType == STRUCTURE_ROAD
                                    ).length > 0
                        ) {
                        accessableSpots.push({x: i, y: j});
                        
                        roadBuilded = roadBuilded && _.filter(objects, object =>
                                        object.type == LOOK_STRUCTURES && object.structure.structureType == STRUCTURE_ROAD 
                                        || object.type == LOOK_CONSTRUCTION_SITES && object.constructionSite.structureType == STRUCTURE_ROAD
                                        ).length > 0;
                    }
                }
            }
            
            // If there are no hostile units near the source, we should calculate how many harvesters we need to fill it.
            if(!nearHostiles.length) {
                let pathRet = PathFinder.search(source.pos, spawn.pos,
                {
                  plainCost: 2,
                  swampCost: 10,
            
                  roomCallback: function(roomName) {
                    let room = Game.rooms[roomName];
                 
                    if (!room) return;
                    let costs = new PathFinder.CostMatrix;
            
                    room.find(FIND_STRUCTURES).forEach(function(struct) {
                      if (struct.structureType === STRUCTURE_ROAD) {
                        // Favor roads over plain tiles
                        costs.set(struct.pos.x, struct.pos.y, 1);
                      } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                                 (struct.structureType !== STRUCTURE_RAMPART ||
                                  !struct.my)) {
                        // Can't walk through non-walkable buildings
                        costs.set(struct.pos.x, struct.pos.y, 0xff);
                      }
                    });

                    return costs;
                  },
                });
                
                pathCost = pathRet.cost;
                sourceHarvestersLimit = Math.floor(pathCost * 2.0 * accessableSpots.length / HARVESTER_WORK_PERIOD / HARVESTER_COUNT_CORRECTION) + accessableSpots.length;
            }
            
            harvestersCount += sourceHarvestersLimit; 
            roomSources[source.id] = {spots: accessableSpots, harvestersLimit: sourceHarvestersLimit, pathCost: pathCost, roadBuilded: roadBuilded};
        });
        
        room.memory.productionLevel = this.defineProductionLevel(room);
        room.memory.sources = roomSources;
        room.memory.creepLimit = {"upgrader": 2, "builder": 2, "harvester": harvestersCount - 4};
        room.memory.initialized = true;
        if(_.filter(Game.flags, flag => flag.room.name == room.name && flag.name == flag.room.name.concat(GATHER_POINT_SUFFIX)).length == 0) {
            let flag = room.createFlag(10, 25, room.name.concat(GATHER_POINT_SUFFIX), GATHER_POINT_COLOR);
            if(flag != null)
                room.memory.gatherPoint = flag;
        }
    },
    
    /** @param {Room} room **/
    defineProductionLevel(room) {
        let prodLevel = 1;
        let roomCreeps = room.find(FIND_MY_CREEPS, {filter: (creep) => creep.memory.role == 'harvester'}).length;
        // If there is creeps that could harvest something
        if(roomCreeps > 0) {
            // Define production level by active buildings
            let spawnCount = room.find(FIND_MY_SPAWNS).length;
            let extensionCount = room.find(FIND_MY_STRUCTURES, {filter: {structureType : STRUCTURE_EXTENSION}}).length;
            extensionCount = extensionCount - extensionCount % (extensionCount < 10 ? 5 : 10);
            let extensionLevel = Core.getKeyByValue(CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION], extensionCount);
            let spawnLevel = Core.getKeyByValue(CONTROLLER_STRUCTURES[STRUCTURE_SPAWN], spawnCount);    
            prodLevel = Math.min(extensionLevel, spawnLevel);
        }
        
        return prodLevel;
    }
};