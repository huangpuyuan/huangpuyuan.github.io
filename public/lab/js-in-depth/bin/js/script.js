var person = new Object();
person.name = "kaitai";
person.age = 28;

function displayInfo(args) {
    var output = "";
    if (typeof args.name == "string") {
        output = "Name：" + args.name + "\n";
    }
    if (typeof args.age == "number") {

    }
    console.log(output);
}

displayInfo({
    name: "kaitai",
    age: 27
});

displayInfo({
    name: "Greg"
});

console.log(person['name']);

var propertyName = "name";
console.log(person[propertyName]);


var colors = ['red', 'blue', 'green'];
console.log(colors.toString());
console.log(colors.valueOf());
console.log(colors);

var person1 = {
    toLocaleString: function () {
        return "kaitai";
    },
    toString: function () {
        return "Kaitai"
    }

};

var person2 = {
    toLocaleString: function () {
        return "grigorios";
    },
    toString: function () {
        return "Greg"
    }
};

var people = [person1, person2];
console.log(people);
console.log(people.toString());
console.log(people.toLocaleString());

function callSomeFunction(someFounction, someArgument) {
    return someFounction(someArgument);
}
function add10(num) {
    return num + 10;
}
var result1 = callSomeFunction(add10, 10);
console.log(result1);
function getGreeting(name) {
    return "Hello," + name;
}
var result2 = callSomeFunction(getGreeting, 'kaitai');
console.log(result2);


// 排序 函数中返回另一个函数
function createComparisonFunction(propertyName) {
    return function (obj1, obj2) {
        var v1 = obj1[propertyName];
        var v2 = obj2[propertyName];

        if (v1 < v2) {
            return -1;
        } else if (v1 > v2) {
            return 1;
        } else {
            return 0;
        }
    }
}

var data = [
    {
        name: 'Zachary',
        age: 28
    }, {
        name: 'Nicholas',
        age: 29
    }
];

data.sort(createComparisonFunction('name'));
console.log(data[0]);
data.sort(createComparisonFunction('age'));
console.log(data[0]);

console.log("引用和值");

console.log("********指向同一个对象的多个变量*********");
var obj = {};
var refToObj = obj;
obj.oneProperty = true;
console.log(obj.oneProperty === refToObj.oneProperty);
refToObj.anotherProperty = 1;
console.log(obj.anotherProperty === refToObj.anotherProperty);
console.log(obj)

console.log("********自修改对象*********");
var items = ['one', 'two', 'three'];
var itemsRef = items;
items.push('four');

console.log(items.length === itemsRef.length);

console.log("********在维护完整性的同时更改对象的引用*********");

var items2 = ['one', 'two', 'three'];
var itemsRef2 = items2;
items2 = ['new', 'array'];

console.log(items2 !== itemsRef2);
console.log(items2);
console.log(itemsRef2);

console.log("********修改对象生成一个全新对象，而非自修改对象 *********");
console.log("--字符串并非引用--")
var item3 = 'test';
var itemRef3 = item3;
item3 += 'ing';
console.log(item3 != itemRef3);
console.log(itemRef3);
console.log(item3);


console.log('****作用域*****');
var foo = 'test';
if (true) {
    var foo = 'new test';
}
console.log(foo === 'new test');
function test() {
    var foo = 'old test';
}
test();
console.log(foo);

console.log('****隐式全局变量声明****');


function test() {
    foo = 'test';
}
test();
console.log(foo);















































