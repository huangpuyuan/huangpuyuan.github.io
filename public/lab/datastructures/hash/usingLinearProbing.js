// 线性探查演示脚本
// 这套散列函数会把 "Jonathan" 和 "Jamie" 都算到位置 5，
// 打印的时候能直接看到谁往后退了几格。

var linearProbingHashTable = new HashTableLinearProbing();

linearProbingHashTable.put('Gandalf', 'gandalf@email.com');
linearProbingHashTable.put('John', 'johnsnow@email.com');
linearProbingHashTable.put('Tyrion', 'tyrion@email.com');
linearProbingHashTable.put('Aaron', 'aaron@email.com');
linearProbingHashTable.put('Donnie', 'donnie@email.com');
linearProbingHashTable.put('Ana', 'ana@email.com');
linearProbingHashTable.put('Jonathan', 'jonathan@email.com');
linearProbingHashTable.put('Jamie', 'jamie@email.com');
linearProbingHashTable.put('Sue', 'sue@email.com');
linearProbingHashTable.put('Mindy', 'mindy@email.com');
linearProbingHashTable.put('Paul', 'paul@email.com');
linearProbingHashTable.put('Nathan', 'nathan@email.com');

console.log('**** 打印散列表 ****');

linearProbingHashTable.print();

console.log('**** 取值 ****');

console.log(linearProbingHashTable.get('Jamie'));
console.log(linearProbingHashTable.get('Sue'));
console.log(linearProbingHashTable.get('Jonathan'));
console.log(linearProbingHashTable.get('Loiane'));

console.log('**** 删除 ****');

console.log(linearProbingHashTable.remove('Gandalf'));
console.log(linearProbingHashTable.get('Gandalf'));
linearProbingHashTable.print();

console.log(linearProbingHashTable.remove('Sue'));
linearProbingHashTable.print();

console.log(linearProbingHashTable.remove('Jamie'));
linearProbingHashTable.print();

console.log(linearProbingHashTable.remove('Donnie'));
linearProbingHashTable.print();
