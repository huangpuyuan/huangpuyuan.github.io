<?php

$fruits =array(
	"apple"=>'apple value',
	"orange"=>"orange value",
	"grape"=>"grape value",
	"plum"=>"plum value"
);

print_r($fruits);
echo "********* user fruits directly ******* \n";
foreach($fruits as $key=>$value){
	echo $key.":".$value."\n";
	}
//使用迭代器 这其实是处理数组的机理
echo "********* user ArrayIterator in for******* \n";
$obj =new ArrayObject($fruits);
$it=$obj->getIterator();
foreach($it as $key=>$value){
	echo $key.":".$value."\n";
	} 
echo "********* user ArrayIterator in while******* \n";	
$it->rewind();
while($it->valid()){
	echo $it->key()."=>".$it->current()."\n";
	$it->next();
}
//跳过某些元素进行打印seek跳过;

echo "********* user Seek before while*******\n";
$it->rewind();
if ($it->valid()){
	$it->seek(1);//seek方法来定位元素在positon=1或key=1;
	while($it->valid()){
	echo $it->key().":".$it->current()."\n";
	$it->next();
	}
}
echo "********* user ksort*******\n";
//打印排序;
$it->ksort();//用key进行排序
foreach($it as $key=>$value){
	echo $key.":".$value."\n";
	}
echo "********* user asort*******\n";
$it->asort();//用value进行排序
foreach($it as $key=>$value){
	echo $key.":".$value."\n";
	}	












