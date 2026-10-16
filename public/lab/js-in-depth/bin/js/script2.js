// var obj = new  Object();
// obj.val = 5;
// obj.click = function () {
//     console.log('hello')
// };
{
    let obj = {
        value: 5,
        click: function () {
            console.log('hello')
        }
    };

}
{
    let obj = {};
    let obj2 = Object.preventExtensions(obj);

    // function makeTypeError() {
    //     // "use strict";
    //     Object.defineProperty(obj2, 'greeting', {value: 'hello world'});
    // }

    // makeTypeError();
}


var mathObj = {
    constants: {},
    areaOfCircle: function (radius) {
        return this.constants.pi * radius * radius;
    }
};
Object.defineProperty(mathObj.constants, "pi", {
    value: 3.14,
    writable: false
});
mathObj.constants.pi = 'asdasdas';

console.log(mathObj.constants.pi);


{
    let obj = {};
    obj.greeting = 'Welcome';
    Object.seal(obj);
    console.log(obj);
}

// 创建可重用的代码 OOP 原型对象的继承

var Person = {
    firstName: 'John',
    lastName: 'Connolly',
    birthDate: new Date('1964-09-05'),
    gender: 'male',
    getAge: function () {
        var today = new Date();
        var diff = today.getTime() - this.birthDate.getTime();
        var year = 1000 * 60 * 60 * 24 * 365.25;
        return Math.floor(diff / year);
    },
    toString: function () {
        return `${this.firstName} ${this.lastName} is a ${this.getAge()} year-old ${this.gender}`;
    }

};

var John = Object.create(Person);
console.log(John.toString());

var kaitai = Object.create(Person);
kaitai.firstName = 'huang';
kaitai.lastName = 'kaitai';
kaitai.birthDate = new Date('1991-06-16');
console.log(kaitai.toString());

console.log('*******使用工厂方法调用对象*******')
// 工厂方法
var Person2 = {
    firstName: 'John',
    lastName: 'Connolly',
    birthDate: new Date('1964-09-05'),
    gender: 'male',
    getAge: function () {
        var today = new Date();
        var diff = today.getTime() - this.birthDate.getTime();
        var year = 1000 * 60 * 60 * 24 * 365.25;
        return Math.floor(diff / year);
    },
    toString: function () {
        return `${this.firstName} ${this.lastName} is a ${this.getAge()} year-old ${this.gender}`;
    },
    // 将Object.create()封装在函数extend方法中
    extend: function (config) {
        var tmp = Object.create(this);
        for (var key in config) {
            if (config.hasOwnProperty(key)) {
                tmp[key] = config[key];
            }
        }
        return tmp;
    }
};

var bob = Person2.extend({
    firstName: 'Bob',
    lastName: 'Sabatelli',
    birthDate:new Date('1969-06-07')
});

console.log( bob.toString());















