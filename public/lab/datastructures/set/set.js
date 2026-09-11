//ESMAScript类似的Set类

function Set() {
    var items = {};

    //in 操作符 验证给定的值是否是items对象的属性。
    // this.has = function(value) {
    //     return value in items;
    // }

    this.getItems = function() {
        return items;
    };

    this.has = function(value) {
        return items.hasOwnProperty(value);
    }

    this.add = function(value) {
        if (!this.has(value)) {
            items[value] = value;
            return true;
        }
        return false;
    }

    this.remove = function(value) {
        if (this.has(value)) {
            delete items[value];
            return true;
        }

        return false;
    }

    this.clear = function() {
        items = {};
    }


    //ECMAScript5以上版本	
    this.size = function() {
        return Object.keys(items).length;
    }

    this.sizeLegacy = function() {
        var count = 0;
        for (var prop in items) {
            if (items.hasOwnProperty(prop))
                count++;
        }

        return count;
    }

    this.values = function() {
        return Object.keys(items);
    }

    this.valuesLegacy = function() {
        var keys = [];
        for (var key in items) {
            if (items.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        return keys;
    }



    this.union = function(otherSet) {
        var unionSet = new Set();
        var values = this.values();
        for (var i = 0; i < values.length; i++) {
            unionSet.add(values[i]);
        }

        values = otherSet.values();
        for (var i = 0; i < values.length; i++) {
            unionSet.add(values[i]);
        }

        return unionSet;
    }

    this.intersection = function(otherSet) {
        var intersectionSet = new Set();
        var values = this.values();
        for (var i = 0; i < values.length; i++) {
            if (otherSet.has(values[i])) {
                intersectionSet.add(values[i]);
            }
        }
        return intersectionSet;
    }

    this.difference = function(otherSet) {
        var differenceSet = new Set();
        var values = this.values();
        for (var i = 0; i < values.length; i++) {
            if (!otherSet.has(values[i])) {
                differenceSet.add(values[i]);
            }
        }
        return differenceSet;
    }

    this.subset = function(otherSet){
    	if (this.size() > otherSet.size()){
    		return false;
    	}else{
    		var values = this.values();
    		for (var i = 0; i < values.length; i++) {
    			if(!otherSet.has(values[i])){
    				return false;
    			}
    		}
    		return true;
    	}
    }
}
