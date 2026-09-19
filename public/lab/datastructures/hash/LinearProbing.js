// 线性探查
// 和直接寻址的区别：位置被占了不覆盖，往后一格一格找，找到第一个空位放进去。

function HashTableLinearProbing() {

    var table = [];

    //删除留下的墓碑标记。
    //不能直接置 undefined：那会把探测链切断，
    //排在这条链后面的元素明明还在，get 走到这个洞就停了，永远找不到。
    var REMOVED = { key: undefined, value: undefined };

    var loseloseHashCode = function(key) {
        var hash = 0;
        for (var i = 0; i < key.length; i++) {
            //获取ASCII码值
            hash += key.charCodeAt(i);
        }
        //哈希值和一个任意的书做除法Mod
        return hash % 37;
    }

    //存进去的不只是值，还要带上键。
    //原因是探查之后位置和键的对应关系被打乱了，
    //取值时必须靠键来判断"这一格到底是不是我找的那个人"。
    var ValuePair = function(key, value) {
        this.key = key;
        this.value = value;

        this.toString = function() {
            return '[' + this.key + ' - ' + this.value + ']';
        }
    }

    this.put = function(key, value) {
        var position = loseloseHashCode(key);

        var index = position;
        //空位和墓碑都能放，所以两种情况一起找
        while (table[index] !== undefined && table[index] !== REMOVED) {
            //键已经存在就覆盖，语义和 Map 一致
            if (table[index].key === key) {
                table[index].value = value;
                return;
            }
            index++;
        }

        if (index !== position) {
            console.log(key + ' 想坐 ' + position + '，被占了，挪到 ' + index);
        }
        table[index] = new ValuePair(key, value);
    }

    this.get = function(key) {
        var position = loseloseHashCode(key);

        //从算出来的位置开始，沿着探测链往后找
        var index = position;
        //墓碑不能停，得继续往后走才是
        while (table[index] !== undefined) {
            if (table[index] !== REMOVED && table[index].key === key) {
                return table[index].value;
            }
            index++;
        }

        //撞到真正的空位，说明后面不可能有了
        return undefined;
    }

    this.remove = function(key) {
        var position = loseloseHashCode(key);

        var index = position;
        while (table[index] !== undefined) {
            if (table[index] !== REMOVED && table[index].key === key) {
                //留下墓碑，保住后面元素的探测链
                table[index] = REMOVED;
                return true;
            }
            index++;
        }

        //本来就没有，删了个寂寞
        return false;
    }

    this.print = function(){
    	for (var i = 0; i < table.length; ++i) {
    		if(table[i]!==undefined && table[i]!==REMOVED){
    			console.log(i +":"+table[i]);
    		}
    	}
    }
}
