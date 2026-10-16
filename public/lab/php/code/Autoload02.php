<?php
function __autoload($class_name){//定义__autoload函数，可以在不调用spl_autoload_register函数的情况下完成类的装载

	echo "__autoload class: ".$class_name."\n";	
	require_once("libs/".$class_name.'.php');//装载类
}

function classLoader($class_name){//定义一个替换__autoload函数的类文件装载函数
	echo "classLoader() load class: ".$class_name."\n";	
	require_once("libs/".$class_name.'.php');//装载类

}
spl_autoload_register('classLoader');//传入定义好的装载类的函数的名称替换__autoload函数
new Test();

	