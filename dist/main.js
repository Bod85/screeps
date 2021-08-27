'use strict';
global.GRUNT_PACKAGE=true
var AI = require('ai_process');
var roomTask = require('processor_room');
var memoryTask = require('processor_memory');
var Core = require('core_functions');

//TODO make module(library) for hostile target desc

module.exports.loop = function () {
    //Initialize all new rooms (if there are any)
    roomTask.initializeAll();
    roomTask.updateHostileTargets();
    Core.timer(60, function () {
        memoryTask.clearMemory(); 
        roomTask.updateAll();
    });
    
    AI.process();
    
    //Game.spawns['Spawn1'].room.createConstructionSite( 23, 22, STRUCTURE_TOWER );
    //Game.spawns['Spawn1'].room.createConstructionSite( 23, 22, STRUCTURE_EXTENSION);
    //room.getEventLog([raw])
}