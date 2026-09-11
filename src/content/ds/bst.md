---
title: 二叉搜索树
order: 7
summary: 给树定一条规矩，左小右大。于是查找可以每次砍掉一半，平均能到对数级别，而且中序遍历出来天然有序。
gist: 左小右大，查找每次砍掉一半。
complexity:
  - 查找 平均 O(log n)，最坏 O(n)
  - 插入 平均 O(log n)
  - 删除 平均 O(log n)
  - 中序遍历 O(n)
chapter: 第 8 章 树
demo: trees/binarySearchTree.html
source: trees/binarySearchTree.js
---

## 它解决什么问题

前面的结构都是「一排」，找东西只能一个个走。树把数据摆成层级，每往下走一步，就排除掉一整片分支。

二叉搜索树给这个层级加了一条硬规矩：**任何一个节点，左边所有键都比它小，右边所有键都比它大**。

有了这条规矩，查找就能一路做减法：比当前节点小就往左，大就往右，一次砍掉一半。

## 生活里长什么样

猜数字游戏。1 到 100 之间想一个数，每次猜中间值，对方说大了还是小了。不用 100 次，7 次之内一定猜到。

## 一步步写

### 第 1 步 定义节点

和链表一样，先定节点。区别是链表只有一个 `next`，树有两个孩子。

```js
function BinarySearchTree() {
    var Node = function (key) {
        this.key = key;
        this.left = null;
        this.right = null;
    };

    var root = null;
}
```

这份实现里节点只存了 `key`，没存额外的值。想存数据的话，加一个 `value` 字段就行。

### 第 2 步 插入

先处理空树，再交给辅助函数递归。

```js
this.insert = function (key) {
    var newNode = new Node(key);
    if (root === null) {
        root = newNode;
    } else {
        insertNode(root, newNode);
    }
};

var insertNode = function (node, newNode) {
    if (newNode.key < node.key) {
        if (node.left === null) {
            node.left = newNode;
        } else {
            insertNode(node.left, newNode);
        }
    } else {
        if (node.right === null) {
            node.right = newNode;
        } else {
            insertNode(node.right, newNode);
        }
    }
};
```

逻辑就是那条规矩的直译：小就往左，左边空着就放，不空就继续往左走。右边同理。

这份实现没有处理键相等的情况。写 `if (newNode.key < node.key) ... else ...` 意味着相等的键会被塞到右边。如果想支持重复键，通常是在节点上再加一个计数器。

### 第 3 步 查找

插入逻辑的另一半。

```js
this.search = function (key) {
    return searchNode(root, key);
};

var searchNode = function (node, key) {
    if (node === null) {
        return false;
    }
    if (key < node.key) {
        return searchNode(node.left, key);
    } else if (key > node.key) {
        return searchNode(node.right, key);
    } else {
        return true;
    }
};
```

走到 `null` 说明整条路都没找到，返回 `false`。每递归一层就少一半分支，这就是它比数组快的原因。

### 第 4 步 三种遍历

遍历是树的另一半价值。三种顺序用同一套递归模板，区别只在 `callback` 放在哪一行。

```js
// 中序：左 -> 自己 -> 右
var inOrderTraverseNode = function (node, callback) {
    if (node !== null) {
        inOrderTraverseNode(node.left, callback);
        callback(node.key);
        inOrderTraverseNode(node.right, callback);
    }
};
```

```js
// 先序：自己 -> 左 -> 右
var preOrderTraverseNode = function (node, callback) {
    if (node !== null) {
        callback(node.key);
        preOrderTraverseNode(node.left, callback);
        preOrderTraverseNode(node.right, callback);
    }
};
```

```js
// 后序：左 -> 右 -> 自己
var postOrderTraverseNode = function (node, callback) {
    if (node !== null) {
        postOrderTraverseNode(node.left, callback);
        postOrderTraverseNode(node.right, callback);
        callback(node.key);
    }
};
```

中序有个特别好用的性质：**在一棵二叉搜索树上做中序遍历，出来的结果天然从小到大排好序**。相当于白送一个排序。

先序适合复制整棵树，因为父节点先出来，重建时可以直接插。后序适合释放节点，因为要先把孩子处理完才能处理自己。

### 第 5 步 最小值和最大值

由「左小右大」这条规矩直接推出来：最小值就是一路往左走到头，最大值就是一路往右走到头。

```js
this.min = function () {
    return minNode(root);
};

var minNode = function (node) {
    if (node) {
        while (node && node.left !== null) {
            node = node.left;
        }
        return node.key;
    }
    return null;
};
```

最大值同理，把 `left` 换成 `right`。这里用 `while` 而不是递归，因为不用回溯，一路走到底就行。

### 第 6 步 删除

删除是整个结构里最麻烦的一步，要分三种情况。

```js
this.remove = function (key) {
    root = removeNode(root, key);
};
```

注意这里要把返回值重新赋给 `root`。递归删除时，父节点指向孩子的指针必须跟着换，靠返回值一路往上传是最省事的写法。

三种情况分别看：

**情况一，删的是叶子节点。** 直接扔掉。

```js
if (node.left === null && node.right === null) {
    node = null;
    return node;
}
```

**情况二，只有一个孩子。** 让孩子顶替自己的位置。

```js
if (node.left === null) {
    node = node.right;
    return node;
} else if (node.right === null) {
    node = node.left;
    return node;
}
```

**情况三，两个孩子都在。** 这是最难的一种。

```js
var aux = findMinNode(node.right);
node.key = aux.key;
node.right = removeNode(node.right, aux.key);
return node;
```

做法是：找出**右子树里最小的那个节点**，把它的键抄到当前节点上，然后再去右子树里把那个节点删掉。

为什么选右子树最小的？因为按规矩，右子树所有键都比当前节点大，其中最小的那个刚好排在当前节点后面一位。让这个键顶上来，左边依然全比它小，右边依然全比它大，规矩不破。

```js
var findMinNode = function (node) {
    if (node === null) {
        return null;
    }
    while (node && node.left !== null) {
        node = node.left;
    }
    return node;
};
```

这一步直接删节点是不行的，得换成「先替换键，再递归删除原来的位置」。

## 复杂度

| 操作 | 平均 | 最坏 | 说明 |
|---|---|---|---|
| 查找 | O(log n) | O(n) | 树退化成一条链时就是 O(n) |
| 插入 | O(log n) | O(n) | 同上 |
| 删除 | O(log n) | O(n) | 同上 |
| 三种遍历 | O(n) | O(n) | 每个节点都要访问一次 |
| 最小 / 最大 | O(log n) | O(n) | 一路走到头 |

平均是 O(log n)，因为每层能砍掉一半，n 个节点大约有 log₂n 层。

但有个前提：**树得是平衡的**。如果从小到大依次插入 1 到 100，每个新节点都往右挂，最后得到的就是一条链，查找退化成 O(n)。

这就是为什么后来有了 AVL 树和红黑树，它们会在插入删除时自动调整结构，保证高度差不超过一定范围。当年的笔记里也提到了这两种，链接在 `trees/readme.md` 里。

## 什么时候会用到

- 需要「既快又随时有序」的数据集合
- 范围查询：找出 10 到 20 之间的所有键
- 数据库索引（真实实现多用 B 树，思路一致）
- 文件系统的目录结构

## 容易踩的坑

- 按顺序插入有序数据，树退化成一个链表。要么打乱插入顺序，要么上平衡树
- 删除时忘了更新父节点的指针。靠 `root = removeNode(root, key)` 这种写法和返回值，能少踩一半的坑
- 递归写得太深。节点特别多的时候，递归层数等于树高，可能撞上调用栈上限，改成循环更稳
