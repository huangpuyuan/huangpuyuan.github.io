export class Hello{
	
}

function test(template,name,age) {
	// body...

	console.log(template);
	console.log(name);
	console.log(age);
}	

var myname:string = "kaitai";

var alias:any = "xixi";

var age : number = 13;

var man :boolean = true;

function tst(name:string) : string{
	return '';
}

tst('1');


class Person{
	name :string;
	age : number;
};

var zhangsan:Person = new Person();
zhangsan.age = 18;
zhangsan.name = "zhangsan";


var getAge = function(){
	return 18;
}

test`hello my name is  ${myname},I'm ${getAge()}`;

var myname1:string = "kt";



function test1(a:string,b?:string,c:string ='jojo') {
	console.log(a);
	//可选参数和默认参数不能声明在必选参数之前
	console.log(b);
	console.log(c);
}


test1("xxx","yyy",'zzz');
test1("xxx","yyy");
test1("xxx");

function func1(...args){
	args.forEach(function(arg){
		console.log(arg);
	})
}

function func2(a,b,c){
	console.log(a);
	console.log(b);
	console.log(c);
}

var args = [1,2];

func2(...args);

var args2 = [7,8,9,10,11];

func2(...args);

//es6

// function* getStockPrice(stock){
//   while(true){
//     yield Math.random()*100;
//   }
// }

// var priceGenerator = getStockPrice("IBM");

// var limitPrice = 15;
// var price =100;
// while( price > limitPrice){
//   price = priceGenerator.next().value;
//   console.log(`the generator return ${price}`);
// }

// console.log(`buying at ${price}`);

//析构表达式
function getStock(){
	return{
		code:'IBM',
		price:{
			price1:200,
			price2:400
		},
		aaa:'xixi',
		bbb:'haha'
	}
}

//javascript语法
// var stock = getStock();
// var code = stock.code;
// var price = stock.price;

//ts语法

var {code:codex,price:{price2}} = getStock();//codex 是code的别名,price2是嵌套对象的某个属性

console.log(codex);
console.log(price2);

//针对数组的析构表达式
var array1 = [1,2,3,4];
var [number1,,,number4] = array1;
console.log(number1);
console.log(number4);

// var [number1,number2,...others] = array1;
// console.log(number1);
// console.log(number2);
// console.log(others);

//把他作为函数的参数
function doSomething([number1,number2,...others]){
	console.log(number1);
	console.log(number2);
	console.log(others);
}

doSomething(array1);











