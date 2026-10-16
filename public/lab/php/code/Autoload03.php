<?php
function classLoader($class_name){//自定义一个替换__autoload函数的类文件装载函数
	echo "classLoader() load class: ".$class_name."\n";	
	set_include_path("libs/");//装载类
    spl_autoload($class_name);//当我们不用require_once载入类文件的时候，而是想通过系统查找include_path装载类的时候必须显示调用spl_autoload数，参数是类的名称来重启类文件的自动查找（装载）

}
spl_autoload_register('classLoader');//传入定义好的装载类的函数的名称替换__autoload函数
new Test();
