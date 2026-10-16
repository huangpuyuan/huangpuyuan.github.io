<?php

$obj =new SplDoublyLinkedlist();
$obj->push(1);
$obj->push(2);
$obj->unshift(10);
print_r($obj);
$obj->rewind();
echo 'current: ' .$obj->current()."\n";
$obj->next();
echo 'next:' .$obj->current()."\n";
$obj->next();
echo 'next:' .$obj->current()."\n";
$obj->next();
if($obj->current()){
	echo "current node valid\n";
}else{
	echo "Current node invalid\n";
	}
if($obj->valid()){
	echo "valid list\n";
}else{
	echo "invaild list\n";
	}
	



