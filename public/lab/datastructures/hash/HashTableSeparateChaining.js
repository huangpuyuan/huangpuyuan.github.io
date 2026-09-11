function HashTableSeparateChaining() {

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

    var ValuePair = function(key, value) {
        this.key = key;
        this.value = value;

        this.toString = function() {
            return '[' + this.key + ' - ' + this.value + ']';
        }
    }

    this.put = function(key, value) {
        var position = loseloseHashCode(key);

        if (table[position] == undefined) {
            table[position] = new LinkedList();
        }

        table[position].append(new ValuePair(key, value));
    }

    this.get = function(key) {
        var position = loseloseHashCode(key);

        if (table[position] !== undefined) {
            var current = table[position].getHead();

            while (current.next) {
                if (current.element.key === key) {
                    return current.element.value;
                }
                current = current.next;
            }

            //第一个或最后一个节点的情况	
            if (current.element.key === key) {
                return current.element.value;
            }

        }

        return undefined;
    }
    this.remove = function(key) {

        var position = loseloseHashCode(key);

        if (table[position] !== undefined) {
            var current = table[position].getHead();
            //用do while方法代替while节省代码量	
            do {
                if (current.element.key === key) {
                    table[position].remove(current.element);
                    if (table[position].isEmpty()) {
                        table[position] = undefined;
                    }
                    return true;
                }
                current = current.next;
            } while (current);

        }

    }


    this.print = function() {
        for (var i = 0; i < table.length; ++i) {
            if (table[i] !== undefined) {
                console.log(i + ":" + table[i]);
            }
        }
    }

}
