
module.exports = class AIBuild {
    static process() {
        for(let name in Game.rooms) {
            let room = Game.rooms[name];
            this.buildRoomRoads(room);
        }
    }


    //Build road to all sources
    /** @param {Room} room **/
    static buildRoomRoads(room) {
        let spawn = room.find(FIND_MY_SPAWNS)[0];
        let lineBuilded = false;
        for(let sourceID in room.memory.sources) {
            let source = room.memory.sources[sourceID];
            if(!source.roadBuilded) {
                source.spots.forEach(spot => {
                    if(!lineBuilded) {
                        let spotPos = new RoomPosition(spot.x, spot.y, room.name);
                        let path = spawn.pos.findPathTo(spotPos, 
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
        
        return lineBuilded;
    }
};