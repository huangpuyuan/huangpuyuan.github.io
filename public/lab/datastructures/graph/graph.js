function Graph() {
    var vertices = [];
    var adjList = new Dictionary();

    this.addVertex = function(v) {
        vertices.push(v);
        adjList.set(v, []);
    };

    this.addEdge = function(v, w) {
        adjList.get(v).push(w);
        adjList.get(w).push(v);
    }

    this.toString = function() {
        var s = '';
        for (var i = 0; i < vertices.length; i++) {
            s += vertices[i] + ' -> ';
            var neighbors = adjList.get(vertices[i]);
            for (var j = 0; j < neighbors.length; j++) {
                s += neighbors[j] + ' ';
            }
            s += '\n';
        }
        return s;
    };

    //辅助函数初始化颜色
    var initializeColor = function() {
        var color = [];
        for (var i = 0; i < vertices.length; i++) {
            color[vertices[i]] = 'white';
        }
        return color;
    }

    //广度优先遍历
    this.bfs = function(v, callback) {
        var color = initializeColor(),
            queue = new Queue();
        queue.enqueue(v);

        while (!queue.isEmpty()) {
            var u = queue.dequeue(),
                neighbors = adjList.get(u);

            color[u] = 'grey';
            for (var i = 0; i < neighbors.length; i++) {
                var w = neighbors[i];
                if (color[w] === 'white') {
                    color[w] = 'grey';
                    queue.enqueue(w);
                }
            }

            color[u] = 'black';
            if (callback) {
                callback(u);
            }
        }
    };


    this.BFS = function(v){
    	var color = initializeColor(),
    		queue = new Queue(),
    		d = [],
    		pred = [];
    	queue.enqueue(v);

    	for (var i = 0; i < vertices.length; i++) {
    		d[vertices[i]] = 0;
    		pred[vertices[i]] = null;
    	}

    	while(!queue.isEmpty()){
    		var u = queue.dequeue(),
    			neighbors = adjList.get(u);
    		color[u] = 'grey';
    		for (var i = 0; i < neighbors.length; i++) {
    			var w = neighbors[i];
    			if (color[w] === 'white') {
    				color[w] = 'grey';
    				d[w] = d[u] + 1;
    				pred[w] = u;
    				queue.enqueue(w);
    			}
    		}
    		color[u] = 'black';
    	}

    	return{
    		distances:d,
    		predecessors:pred
    	}
    };


    //深度优先遍历
    //和 bfs 只差一个容器：队列换成栈。栈是后进先出，
    //所以最后压进去的邻居会最先被处理，于是沿着一条路一直往下钻，钻不动了再回头。
    this.dfs = function(v, callback) {
        var color = initializeColor(),
            stack = new Stack();
        stack.push(v);

        while (!stack.isEmpty()) {
            var u = stack.pop();

            //已经在别的路径上处理过了，跳过
            if (color[u] === 'white') {
                color[u] = 'grey';

                //邻居要逆序入栈。
                //栈是后进先出，正序压进去的话，最后一个邻居反而最先出来，
                //遍历顺序和邻接表的书写顺序就反了。
                var neighbors = adjList.get(u);
                for (var i = neighbors.length - 1; i >= 0; i--) {
                    var w = neighbors[i];
                    if (color[w] === 'white') {
                        stack.push(w);
                    }
                }

                color[u] = 'black';
                if (callback) {
                    callback(u);
                }
            }
        }
    };


    //深度优先的完整版：额外记下每个顶点被发现的时刻和离开的时刻
    this.DFS = function(callback) {
        var color = initializeColor(),
            d = [],
            f = [],
            p = [],
            time = { t: 0 };

        //先把所有顶点的记账位清零
        for (var i = 0; i < vertices.length; i++) {
            f[vertices[i]] = 0;
            d[vertices[i]] = 0;
            p[vertices[i]] = null;
        }

        //再从每个还没碰过的顶点出发，走完能走到的所有点。
        //图可能不连通，只从一个起点出发会漏掉孤立的那些点。
        for (var i = 0; i < vertices.length; i++) {
            if (color[vertices[i]] === 'white') {
                DFSVisit(vertices[i], color, d, f, p, time, callback);
            }
        }

        return {
            discovery: d,
            finished: f,
            predecessors: p
        };
    };

    //time 用对象包一层，因为数字是按值传的，递归里 ++ 改不到外面的那个变量
    var DFSVisit = function(u, color, d, f, p, time, callback) {
        color[u] = 'grey';
        d[u] = ++time.t;
        var neighbors = adjList.get(u);

        for (var i = 0; i < neighbors.length; i++) {
            var w = neighbors[i];
            if (color[w] === 'white') {
                p[w] = u;
                DFSVisit(w, color, d, f, p, time, callback);
            }
        }

        color[u] = 'black';
        f[u] = ++time.t;

        if (callback) {
            callback(u);
        }
    };


    //深度优先的迭代版：用栈显式模拟递归，和 DFS 结果完全一致。
    //什么时候需要它：递归每往下钻一层就占一层调用栈，
    //实测节点连成一条长链时，大约五千个点就会 RangeError: Maximum call stack size exceeded。
    //教学演示那九个点用递归更直白，真跑大图就换这个。
    this.DFSIterative = function(callback) {
        var color = initializeColor(),
            d = [],
            f = [],
            p = [],
            time = 0;

        for (var i = 0; i < vertices.length; i++) {
            f[vertices[i]] = 0;
            d[vertices[i]] = 0;
            p[vertices[i]] = null;
        }

        for (var i = 0; i < vertices.length; i++) {
            var start = vertices[i];
            if (color[start] !== 'white') {
                continue;
            }

            //栈里放三样东西：顶点、它下一个要看的邻居下标、以及它是不是刚刚进来。
            //第一次弹出来是"进入"，把子节点压进去；
            //等它再次被弹出来（邻居都看完了）就是"离开"，这时候记离开时间和回调。
            var stack = new Stack();
            stack.push({ vertex: start, index: 0, entering: true });
            color[start] = 'grey';
            d[start] = ++time;

            while (!stack.isEmpty()) {
                var frame = stack.peek();
                var u = frame.vertex;
                var neighbors = adjList.get(u);

                if (frame.entering) {
                    frame.entering = false;
                }

                //找一个还没访问过的邻居，找到就钻进去
                var advanced = false;
                while (frame.index < neighbors.length) {
                    var w = neighbors[frame.index];
                    frame.index++;
                    if (color[w] === 'white') {
                        color[w] = 'grey';
                        p[w] = u;
                        d[w] = ++time;
                        stack.push({ vertex: w, index: 0, entering: true });
                        advanced = true;
                        break;
                    }
                }

                if (advanced) {
                    continue;
                }

                //邻居都处理完了，这个点收工
                stack.pop();
                color[u] = 'black';
                f[u] = ++time;
                if (callback) {
                    callback(u);
                }
            }
        }

        return {
            discovery: d,
            finished: f,
            predecessors: p
        };
    };
}





