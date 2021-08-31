module.exports = {
    getKeyByValue: function(object, value) { 
        let list = Object.keys(object).filter(key => object[key] === value); 
        return list.length ? Math.max.apply(null, list) : null;
    },
    
    timer: function(period, fun) {
        //Timer work
        if(Game.time % period == 0) {
            fun();
        }
    },

    showLog: function(text) {
        console.log(text);
    }
};