const Core = require("core_functions");

module.exports = class AIBuild {
    static process() {
        for(let name in Game.rooms) {
            let room = Game.rooms[name];
            this.buildStructures(room);
            this.buildRoomRoads(room);
        }
    }

    /** Build constructions
     * @param {Room} room **/
    static buildStructures(room) {
        // Checking if this room is our
        let controllers = room.find(FIND_MY_STRUCTURES, 
                                {filter: function(object) {
                                    return object.structureType == STRUCTURE_CONTROLLER;
                                }
                            });
        if(controllers.length) {
            let controllerLevel = controllers[0].level;
            let buildLevel = 0;
            // If there is no building settings
            if(!("build" in room.memory)) {
                let buildTemplate = this.defineBuildTemplate(room);
                if(buildTemplate) {                    
                    room.memory.build = buildTemplate;
                    buildLevel = room.memory.build.level;
                } else {
                    Core.showLog("Can't define template for room: " + room.name);
                    return false;
                }
            } else 
                buildLevel = room.memory.build.level;

            // If there is still something to build
            if(buildLevel < controllerLevel) {
                let buildResult = this.buildByTemplate(room);
                switch(buildResult) {
                    case ERR_RCL_NOT_ENOUGH:
                    case OK:
                        room.memory.build.level = controllerLevel;
                        break;
                    case ERR_NOT_OWNER:
                        delete room.memory.build;
                        break;
                }
            }
        } else if ("build" in room.memory)
            delete room.memory.build;

        return true;
    }

    static buildByTemplate(room) {
        let ret = null;
        let template = require('ai_building_template_' + room.memory.build.template);
        if(template) {
            let centerX = room.memory.build.center[0];
            let centerY = room.memory.build.center[1];
            for(let construction in template.BLUEPRINT) {
                template.BLUEPRINT[construction].forEach(
                    structXY => {
                        ret = room.createConstructionSite( centerX + structXY[0], centerY + structXY[1], construction);
                        if(!([OK, ERR_RCL_NOT_ENOUGH].includes(ret))) {
                            Core.showLog(room.name + '. Build error: ' + ret + '. Structure: ' + construction + '. Position: ' + (centerX + Number(structXY[0])) + ', ' + (centerY + structXY[1]));
                            return ret;
                        }
                    }
                )
            }
        }

        return ret;
    }

    static defineBuildTemplate(room) {
        return {level: 1, template: 'tutorial', center: [22, 25]};
    }

    /** Build roads to all sources
     * @param {Room} room **/
    static buildRoomRoads(room) {
        let lineBuilded = false;
        let spawns = room.find(FIND_MY_SPAWNS);
        if(spawns.length) {
            for(let sourceID in room.memory.sources) {
                let source = room.memory.sources[sourceID];
                if(!source.roadBuilded) {
                    source.spots.forEach(spot => {
                        if(!lineBuilded) {
                            let spotPos = new RoomPosition(spot.x, spot.y, room.name);
                            let path = spawns[0].pos.findPathTo(spotPos, 
                                        {ignoreCreeps: true,
                                        plainCost: 2,
                                        swampCost: 10,
                                        costCallback: function(roomName, costMatrix) 
                                            {
                                                room.find(FIND_STRUCTURES).forEach(function(struct) {
                                                  if (struct.structureType === STRUCTURE_ROAD) {
                                                    // Favor roads over plain tiles
                                                    costMatrix.set(struct.pos.x, struct.pos.y, 1);
                                                  }
                                                });
                                                room.find(FIND_CONSTRUCTION_SITES).forEach(function(struct) {
                                                  if (struct.structureType === STRUCTURE_ROAD) {
                                                    // Favor costructing roads over plain tiles
                                                    costMatrix.set(struct.pos.x, struct.pos.y, 1);
                                                  }
                                                });
                                            }
                                        });
                            path.forEach(pathSpot => {
                                lineBuilded = room.createConstructionSite( pathSpot.x, pathSpot.y, STRUCTURE_ROAD) == 0 || lineBuilded;
                            });
                            source.pathTo = Room.serializePath(path);
                            source.pathFrom = Room.serializePath(path.reverse());
                        }
                    });
                }
                
            }
        }
        
        return lineBuilded;
    }
};