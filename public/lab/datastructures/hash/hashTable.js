function HashTable(){

    var table = [];

    var loseloseHashCode = function(key) {
        var hash = 0;
        for (var i = 0; i < key.length; i++) {
            //获取ASCII码值
            hash += key.charCodeAt(i);
        }
        //哈希值和一个任意的书做除法Mod
        return hash % 37;
    }

    this.put = function(key, value) {
        var position = loseloseHashCode(key);
        console.log(position + ' - ' + key);
        table[position] = value;
    }

    this.get = function(key) {
        return table[loseloseHashCode(key)];
    }

    //在哈希类来说，我们不需要像ArrayList类一样从table数组中的将位置也移除。
    //由于元素分布的与整个数组范围内，一些位置会没有任何元素占据并默认为undefined值。
    this.remove = function(key){
    	table[loseloseHashCode(key)] = undefined;
    }

    this.print = function(){
    	for (var i = 0; i < table.length; ++i) {
    		if(table[i]!==undefined){
    			console.log(i +":"+table[i]);
    		}
    	}
    }
}
