---
title: 图
order: 8
summary: 点和线的集合。前面那些结构都是「一排」或者「一层」，只有图能表达任意两个东西之间的关系，比如谁连着谁。
gist: 顶点加边，用邻接表存关系。
complexity:
  - 添加顶点 / 边 O(1)
  - 广度优先遍历 O(V + E)
  - 最短路径（无权图）O(V + E)
chapter: 第 9 章 图
demo: graph/usinggraph.html
source: graph/graph.js
---

## 它解决什么问题

前面所有结构都在描述「元素之间是什么顺序」。但有些关系没有顺序，只有连接：

- 这几个城市之间通不通航
- 这堆人里谁认识谁
- 这几个服务谁调用谁

这类关系用图描述最自然。图由两部分组成：**顶点**（点）和**边**（线）。用数学式子写就是 G = (V, E)，V 是顶点集合，E 是边的集合。

## 先认几个词

这几个术语第一次看容易糊，对着图就清楚了。

| 术语 | 意思 |
|---|---|
| 相邻顶点 | 有一条边直接连着的两个点 |
| 度 | 一个顶点连出去几条边 |
| 路径 | 从一个点到另一个点走过的顶点序列 |
| 连通 | 两个点之间至少存在一条路径 |
| 无环 | 不存在「绕一圈回到自己」的路径 |
| 有向 / 无向 | 边有没有方向。朋友圈是无向的，微博关注是有向的 |

这份实现做的是**无向图**，`addEdge(v, w)` 会往两边各加一条。

## 用什么存关系

三种常见表示法，书里都讲了：

| 表示法 | 怎么存 | 什么时候用 |
|---|---|---|
| 邻接矩阵 | 二维数组，`matrix[i][j]` 表示 i 和 j 有没有边 | 顶点少、边密集 |
| 邻接表 | 每个顶点配一份邻居名单 | 顶点多、边稀疏，最常用 |
| 关联矩阵 | 行是顶点，列是边 | 特殊场景，少见 |

这份实现用的是邻接表，因为它省空间，遍历邻居也快。

## 一步步写

### 第 1 步 两个容器

```js
function Graph() {
    var vertices = [];
    var adjList = new Dictionary();
}
```

分工要分清：

- `vertices` 记住现在有哪几个顶点，遍历时用它来当外层的循环起点
- `adjList` 是这个图的邻接表，键是顶点，值是这个顶点连着的一串顶点

`adjList` 直接复用了上一篇写的字典，这就是为什么字典值得先写。

### 第 2 步 加顶点

```js
this.addVertex = function (v) {
    vertices.push(v);
    adjList.set(v, []);
};
```

两个容器都要动：名单里加一笔，邻接表里给它开一个空数组。空数组表示「暂时还没连任何人」，后面加边就往里塞。

### 第 3 步 加边

```js
this.addEdge = function (v, w) {
    adjList.get(v).push(w);
    adjList.get(w).push(v);
};
```

两行，方向相反。这就是无向图和有向图的区别所在：无向图两边都记，有向图只记一边。

顺带说一个容易忽略的点：**必须先加顶点，再加边**。直接对一个不存在的顶点调 `addEdge`，`adjList.get(v)` 返回 `undefined`，再 `.push` 就报错了。这是当年踩过的坑，邻接表只在 `addVertex` 里初始化。

### 第 4 步 看看图长什么样

```js
this.toString = function () {
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
```

输出长这样，一眼能看出每个点连了谁：

```
A -> B C D
B -> A E F
C -> A D
```

### 第 5 步 给顶点上色

遍历图最容易出错的地方是**绕回来重复访问**。解决办法是给每个顶点打标记。

```js
var initializeColor = function () {
    var color = [];
    for (var i = 0; i < vertices.length; i++) {
        color[vertices[i]] = 'white';
    }
    return color;
};
```

三种颜色，含义很直白：

- `white` 还没碰到过
- `grey` 见过了，但它后面的路还没走完
- `black` 这个点和它的邻居都处理完了

用颜色而不是布尔值，是因为最后要区分「正在走」和「走完了」两种状态。

### 第 6 步 广度优先遍历

一层一层往外扩。靠的是前面写的队列。

```js
this.bfs = function (v, callback) {
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
```

几个点值得单独说：

- 起点先入队，然后进入循环
- 每次从队首取出一个点，看它的邻居
- 邻居是白的就染灰并入队。**染灰的时机放在入队前**，不能等到出队再染，否则同一个点会被重复入队
- 这个点处理完，染黑
- `callback` 让外部决定拿到点之后干什么，遍历本身不关心

为什么用队列？因为队列是先进先出。先入队的是近的邻居，后入队的是远的邻居。所以遍历顺序天然就是「先近后远」，一层推一层。

### 第 7 步 顺手求出最短路径

广度优先的这个「一层一层」特性，可以直接拿来算无权图的最短路径。

```js
this.BFS = function (v) {
    var color = initializeColor(),
        queue = new Queue(),
        d = [],
        pred = [];
    queue.enqueue(v);

    for (var i = 0; i < vertices.length; i++) {
        d[vertices[i]] = 0;
        pred[vertices[i]] = null;
    }

    while (!queue.isEmpty()) {
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

    return {
        distances: d,
        predecessors: pred
    };
};
```

比 `bfs` 多了两个数组：

- `d` 记录起点到每个点的距离
- `pred` 记录每个点是从谁那儿过来的

关键在于 `d[w] = d[u] + 1`。邻居的距离等于当前点的距离加一，因为邻居比当前点远一层。第一次给某个点赋距离的时候，拿到的就是最短的，后面再碰到也不会更近。

有了 `pred` 就能倒推出整条路径：从终点一路往前找，直到起点，再反过来读。

## 关于深度优先

这份仓库里只写了广度优先，深度优先没有实现。它和广度优先的区别只在一处：**把队列换成栈**。

用栈的话，最后入栈的邻居会最先被处理，于是会沿着一条路一直往下钻，钻不动了再回头。这就是深度的意思。

书里第 9 章两种都讲了。想自己补的话，把上面 `bfs` 里的 `Queue` 换成第一篇写的 `Stack`，其余代码几乎不用动。这就是前面几个结构值得先写一遍的原因：它们是图遍历的零件。

## 复杂度

| 操作 | 复杂度 | 说明 |
|---|---|---|
| 添加顶点 | O(1) | 入数组、开一个空邻居列表 |
| 添加边 | O(1) | 两次 push |
| 广度优先遍历 | O(V + E) | 每个顶点看一次，每条边查一次 |
| 最短路径 | O(V + E) | 和遍历同一趟 |

用邻接表存的话，遍历的代价和「顶点数加边数」成正比。用邻接矩阵的话就变成 O(V²)，因为不管有没有边，矩阵的每一格都要扫。顶点多边少的时候，差距很大。

## 什么时候会用到

- 社交网络的好友关系、推荐里的「你可能认识」
- 地图导航。带上边的权重之后就是 Dijkstra 那一类算法
- 任务依赖：哪个任务得等哪个任务先做完
- 依赖分析、循环引用检测
- 网络拓扑、路由

## 容易踩的坑

- 忘了标记已访问，遍历直接死循环
- 标记的时机放在出队之后而不是入队之前，同一个点会被反复入队
- 没加顶点就加边，`adjList.get(v)` 是 `undefined`
- 把有向图当无向图处理。`addEdge` 只写一行的话，边的方向就被吃掉了
