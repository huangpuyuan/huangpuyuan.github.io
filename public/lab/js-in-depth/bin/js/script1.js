console.log('****在上下文中使用函数/ call(),apply()****');
function setFoo(fooInput) {
    this.foo = fooInput;
}
var foo = 5;
console.log('foo at the window level is set to: ' + foo);
var obj = {
    foo: 10
};
console.log('foo inside of obj is set to :' + obj.foo);

setFoo(15);

console.log('foo at the window level is now set to: ' + foo);
// 将函数直接赋值给对象中的方法
obj.setFoo = setFoo;
obj.setFoo(20);


console.log('foo inside of obj is now set to: ' + obj.foo);
console.log(obj);


function changeColor(color) {
    this.style.color = color;
}

// changeColor('white'); 不能正常运行this 指向window对象里面并没有style


var main = document.createElement('div');
changeColor.call(main, 'black');
console.log(main.style.color);

function setBodyColor() {
    changeColor.apply(document.body, arguments);
}

setBodyColor('blue');


console.log('****闭包****');

var myObj = document.getElementById('main');
myObj.style.border = '1px solid red';

setTimeout(function () {
    myObj.style.background = 'yellow';
}, 3000);

function delayedAlert(msg, time) {
    setTimeout(function () {
        console.log(msg);
    }, time)
}
delayedAlert('Welcome!', 2000);

console.log("****使用了闭包技术的函数柯里化****");

function addGenerator(num) {
    return function (toAdd) {
        return num + toAdd;
    }
}

var addFive = addGenerator(5);
console.log(addFive(4));

(function () {
    var msg = 'Thanks for visiting!';
    window.onload = function () {
        console.log("****匿名函数隐藏全局变量****");
        console.log(msg);
    }
})();

var main2 = document.createElement('input');
//var node = document.createTextNode('新input');
var element = document.getElementsByTagName('body')[0];

element.appendChild(main2);
//main2.appendChild(node);
main2.id = 'main2';
main2.setAttribute('placeholder', '按键和click');


// 用闭包来绑定事件
var anotherObj = document.getElementById('main2');
var items = ['click', 'keypress'];

for (var i = 0; i < items.length; i++) {
    (function () {
        var item = items[i];
        anotherObj['on' + item] = function () {
            console.log('Thanks for your ' + item);
        };
    })();
}

console.log("****函数重载与类型检查****");
function sendMessage(msg, obj) {
    if (arguments.length == 2) {
        obj.log(msg);
    } else {
        console.log(msg);
    }
}
sendMessage('hello world');
sendMessage('How are you?', console);


function aFunction(x, y, z) {
    var argsArray = Array.prototype.slice.call(arguments, 0);
    console.log(argsArray);
    console.log('the last argument is: ' + argsArray.pop());
}

aFunction(1, 2, 3);

// 默认消息
function displayError(msg) {
    if (typeof msg === 'undefined') {
        msg = 'An error occurred'
    }
    console.log(msg);
}
displayError();
//es6
function displayError2(msg = 'An error occurred') {

    console.log(msg);
}
displayError2();

var num = '50';
var arr = 'apples,oranges,pears';
if (typeof num === 'string') {
    num = parseInt(num);
}

if (typeof arr == 'string') {
    arr = arr.split(',');
}
console.log(num);
console.log(arr);

console.log("***********instanceof************");
var today = new Date();
var re = /[a-z]+/i;

console.log('typeof today: '+ typeof today);
console.log('typeof re: '+ typeof re);

if (today instanceof Date){
    console.log('today is an instance of a Date');
}

if (re instanceof RegExp){
    console.log('re is an instance of a RegExp');
}











