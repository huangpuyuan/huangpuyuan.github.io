## Typescript 入门
>  JS,ES6的超集

### 环境搭建
* 线上
* 本地
`npm install -g typescrpt` 



### 字符串新特性

* 多行字符串
* 字符串模板
* 自动拆分字符串

```typescript
//自动拆分字符串
function test(template,name,age) {

	console.log(template);
	console.log(name);
	console.log(age);
}	

var myname = "kaitai";

var getAge = function(){
	return 18;
}

test`hello my name is  ${myname},I'm ${getAge()}`;
```
### 参数新特性

* 参数类型：在参数名称后面使用冒号来指定参数的类型
* 默认参数：在参数声明后面用等号来指定参数的默认值
* 可选参数：在方法的参数声明后面用问号来标明此参数为可选参数

```typescript
function test1(a:string,b?:string,c:string ='jojo') {
	console.log(a);
	//可选参数和默认参数不能声明在必选参数之前
	console.log(b);
	console.log(c);
}


test1("xxx","yyy",'zzz');
test1("xxx","yyy");
test1("xxx");

```

### 函数新特性

* TypeScript-Rest and Spread 操作符 用来声明任意数量的方法参数
* generator 函数:控制函数的执行过程，手动暂停和恢复代码运行
	* ES6 规范的新特性 
	* Babel 在线编辑器
	```es6
	function* doSomething(){
	
	console.log("start");
	  
	yield;
	  
	console.log("finish");
	  
	}

	var func1 =  doSomething();

	func1.next();//start

	func1.next();//finish
	
    function* getStockPrice(stock){
	  while(true){
	    yield Math.random()*100;
	  }
	}

	var priceGenerator = getStockPrice("IBM");

	var limitPrice = 15;
	var price =100;
	while( price > limitPrice){
	  price = priceGenerator.next().value;
	  console.log(`the generator return ${price}`);
	}

	console.log(`buying at ${price}`);
	```
* 析构表达式

	```typescript
	
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

	//把它作为函数的参数
	function doSomething([number1,number2,...others]){
		console.log(number1);
		console.log(number2);
		console.log(others);
	}

	doSomething(array1);
	
	```