var AISpawn = require('ai_spawn');
var AIBuild = require('ai_build');
var Core = require('core_functions');
var AIControlUnit = require('ai_control_unit');
var AITactics = require('ai_tactics');

var AI = {
    process: function() {
        AISpawn.process();
        AIControlUnit.process();
        
        Core.timer(60, function () {
            AIBuild.process();
        });
        Core.timer(30, function () {
            AITactics.updateTargetAction();
        });
    },

    
    
};

module.exports = AI;