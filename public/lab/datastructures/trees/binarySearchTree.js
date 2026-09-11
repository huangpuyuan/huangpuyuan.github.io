// 创建BST 二叉搜索树

function BinarySearchTree() {
    var Node = function(key) {
        this.key = key;
        this.left = null;
        this.right = null;
    };

    var root = null;

    this.getRoot = function(){
        return root;
    };

    //向树种插入一个新键
    this.insert = function(key) {
        var newNode = new Node(key);
        if (root === null) {
            root = newNode;
        } else {
            insertNode(root, newNode);
        }
    };

    //辅助函数插入节点
    var insertNode = function(node, newNode) {
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

    //中序遍历BST
    this.inOrderTraverse = function(callback) {
        inOrderTraverseNode(root, callback);
    };

    var inOrderTraverseNode = function(node, callback) {
        if (node !== null) {
            inOrderTraverseNode(node.left, callback);
            callback(node.key);
            inOrderTraverseNode(node.right, callback);
        }
    };


    //先序遍历

    this.preOrderTraverse = function(callback) {
        preOrderTraverseNode(root, callback);
    };

    var preOrderTraverseNode = function(node, callback) {
        if (node !== null) {
            callback(node.key);
            preOrderTraverseNode(node.left, callback);
            preOrderTraverseNode(node.right, callback);
        }
    };


    /*
     *后序遍历
     *其中一个应用是计算一个目录和它的子目录中所占空间的大小
     */

    this.postOrderTraverse = function(callback) {
        postOrderTraverseNode(root, callback);
    };

    var postOrderTraverseNode = function(node, callback) {
        if (node !== null) {
            postOrderTraverseNode(node.left, callback);
            postOrderTraverseNode(node.right, callback);
            callback(node.key);
        }
    };


    this.min = function() {
        return minNode(root);
    };

    var minNode = function(node) {
        if (node) {
            while (node && node.left !== null) {
                node = node.left;
            }
            return node.key;
        };
        return null;

    };

    this.max = function() {
        return maxNode(root);
    }

    var maxNode = function(node) {
        if (node) {
            while (node && node.right !== null) {
                node = node.right;
            }
            return node.key;
        };
        return null;
    };

    this.search = function(key) {
        return searchNode(root, key);
    };

    var searchNode = function(node, key) {
        if (node === null) {
            return false;
        };

        if (key < node.key) {
            return searchNode(node.left, key);
        } else if (key > node.key) {
            return searchNode(node.right, key);
        } else {
            return true;
        }
    };

    this.remove = function(key) {

        root = removeNode(root, key);
    };


    var findMinNode = function(node) {
        while (node && node.left !== null) {
            node = node.left;
        }

        return node;
    };

    var removeNode = function(node, key) {

        if (node === null) {
            return null;
        };

        if (key < node.key) {
            node.left = removeNode(node.left, key);
            return node;

        } else if (key > node.key) {
            node.right = removeNode(node.right, key);
            return node;

        } else {//element is equal to node.item

            //handle 3 special conditions
            //1 - a leaf node
            //2 - a node with only 1 child
            //3 - a node with 2 children

            //case 1
            if (node.left === null && node.right === null) {
                node = null;
                return node;
            };

            //case 2
            if (node.left === null) {
                node = node.right;
                return node;
            } else if (node.right === null) {
                node = node.left;
                return node;
            };

            //case 3
            var aux = findMinNode(node.right);
            node.key = aux.key;
            node.right = removeNode(node.right, aux.key);
            return node;
        }
    }

}
