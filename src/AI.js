var AISpawn = require('AI.spawn');
var AIBuild = require('AI.build');
var Core = require('core');
var AIControlUnit = require('AI.control_unit');

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