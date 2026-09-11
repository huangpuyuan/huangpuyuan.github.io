---
title: 链表
order: 3
summary: 元素散落在内存各处，靠一根根的指针串起来。插入和删除不用挪动别人，代价是只能从头一个个找。
gist: 靠指针串起来的线，增删快，查找慢。
complexity:
  - 头部插入/删除 O(1)
  - 按位置插入/删除 O(n)
  - 查找 O(n)
chapter: 第 5 章 链表
source: hash/LinkedList.js
---

## 它解决什么问题

数组有两个天生的毛病：

1. 在开头或中间插入、删除元素，后面所有元素都得跟着挪位置
2. 大小固定，扩容要整块搬走

链表把这两个问题都绕开了。它不要求元素挨着放，每个元素自己记住「下一个是谁」。插入只要改两根指针，跟元素总数没关系。

代价也很明确：数组能按下标一步跳到第 n 个，链表不行，只能从第一个开始一个个走。

## 生活里长什么样

寻宝游戏的线索。第一条线索写着第二个线索藏哪，第二条写着第三条。想找第五条，只能按顺序一条条找过去。但只要手里拿着第四条，改一下它指向谁，就能凭空插进一条新线索，别的地方一概不用动。

## 一步步写

### 第 1 步 定义「一节车厢」

链表里的每个元素叫节点，节点只需要两个字段：装什么、下一个是谁。

```js
function LinkedList() {

    let Node = function (element) {
        this.element = element;
        this.next = null;
    };

    let length = 0;
    let head = null;
}
```

`head` 指向第一个节点，是整条链的入口。`length` 单独记着，不然算长度又得走一遍。

### 第 2 步 往末尾加一个节点

两种情况：链还空着，新节点直接当 head；已经有节点，就走到最后一个，把它的 `next` 指过来。

```js
this.append = function (element) {

    let node = new Node(element),
        current;

    if (head === null) {
        head = node;
    } else {

        current = head;

        // 一直走到最后一个节点
        while (current.next) {
            current = current.next;
        }

        // 让最后一个节点的 next 指向新节点
        current.next = node;
    }

    length++;
};
```

`while (current.next)` 的写法说明一下：只要当前节点还有下一个，就继续往前走。停下来的时候，`current` 就是最后一个，因为它的 `next` 是 `null`。

### 第 3 步 在指定位置插入

这一步要同时处理三根指针，是最容易写错的地方。画个图会清楚很多。

```js
this.insert = function (position, element) {

    if (position >= 0 && position <= length) {

        let node = new Node(element),
            current = head,
            previous,
            index = 0;

        if (position === 0) {

            // 插在最前面：新节点指向原来的 head，head 换人
            node.next = current;
            head = node;

        } else {
            while (index++ < position) {
                previous = current;
                current = current.next;
            }
            node.next = current;
            previous.next = node;
        }

        length++;

        return true;

    } else {
        return false;
    }
};
```

`while (index++ < position)` 这一句一次走两步：`previous` 和 `current` 一起往后挪，停下来的时候 `previous` 停在要插入位置的前一个，`current` 停在后一个。

指针的改动顺序有讲究，中间那两根不能反过来写：

```js
node.next = current;
previous.next = node;
```

得先让新节点接上后面，再让前面接上新节点。反过来的话，`previous.next` 一改，后面那半条链就再也找不到了。

### 第 4 步 删除指定位置

跟插入是镜像操作：把前一个直接连到后一个，被跳过的节点没人引用，会被回收掉。

```js
this.removeAt = function (position) {

    if (position > -1 && position < length) {

        let current = head,
            previous,
            index = 0;

        if (position === 0) {
            // 删第一个：head 往后挪一格
            head = current.next;
        } else {
            while (index++ < position) {
                previous = current;
                current = current.next;
            }
            // 前一个直接连到后一个，中间那个就被跳过了
            previous.next = current.next;
        }

        length--;

        return current.element;

    } else {
        return null;
    }
};
```

### 第 5 步 按值查找和删除

前端用链表时，更多是按值操作，所以再包两个方法。

```js
this.indexOf = function (element) {

    let current = head,
        index = 0;

    while (current) {
        if (element === current.element) {
            return index;
        }
        index++;
        current = current.next;
    }

    return -1;
};

this.remove = function (element) {
    let index = this.indexOf(element);
    return this.removeAt(index);
};
```

`indexOf` 找不到返回 `-1`，而 `removeAt` 收到 `-1` 会走越界分支返回 `null`。两层保护，不用额外判断。

### 第 6 步 收尾

```js
this.isEmpty = function () {
    return length === 0;
};

this.size = function () {
    return length;
};

this.getHead = function () {
    return head;
};
```

`getHead` 后面很有用。散列表用链表解决冲突时，要拿到链头才能往下遍历。

## 复杂度

| 操作 | 复杂度 | 说明 |
|---|---|---|
| 头部插入 / 删除 | O(1) | 只改一两根指针 |
| 按位置插入 / 删除 | O(n) | 找位置本身就要走一遍 |
| 查找 | O(n) | 只能从头依次走 |
| 按下标随机访问 | 不支持 | 这是它和数组最大的区别 |

一句话记住：**链表快在改结构，慢在找位置**。

## 什么时候会用到

- 频繁在中间增删的场景，比如编辑器的操作记录
- 散列表的冲突处理。分离链接那一篇就用了这个链表
- 栈和队列的底层实现，改进版可以把出队也压到 O(1)

## 容易踩的坑

- 插入时指针改动顺序写反，后半条链直接断掉
- 忘了维护 `length`，`isEmpty` 和 `size` 就开始说谎
- 删掉节点后以为内存立刻回收。只要没有别的引用，垃圾回收会管，但自己别再拿着旧引用用
- 把头节点的特殊情况和中间情况合并处理。`position === 0` 那一段通常要单独写，合并只会更难读

源码在 `hash/LinkedList.js`。它当年是给散列表当零件用的，所以放在了那个目录下。
