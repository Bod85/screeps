var AISpawn = require('ai_spawn');
var AIBuild = require('ai_build');
var Core = require('core_functions');
var AIControlUnit = require('ai_control_unit');

var AI = {
    process: function() {
        AISpawn.process();
        AIControlUnit.process();
        
        Core.timer(60, function () {
            AIBuild.process();
        });
    },

    
    
};

module.exports = AI;