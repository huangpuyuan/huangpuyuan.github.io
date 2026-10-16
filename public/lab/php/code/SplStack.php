<?php
$stack=new SplStack();
$stack->push("a");
$stack->push("b");
$stack->push("c");
print_r($stack);
echo "Bottom:".$stack->bottom()."\n";
echo "top:".$stack->top()."\n";
$stack->offsetSet(0,'C');//堆栈的offset=0 是Top所在 top位置节点靠近bottom位置的相邻节点，以此类推。
print_r($stack);	
$stack->rewind();//双向链表的rewind和堆栈rewind相反，堆栈的rewind使得当前指针指向Top所在的位置，而双向链表调用之后使得当前指针指向bottom所在位置。
echo "Current:".$stack->current()."\n";	
$stack->next();
//双向链表的next操作是指针靠近bottom位置的下一个节点，而双向链表是靠近top的下一个节点
echo "Current:".$stack->current()."\n";	
//遍历堆栈
$stack->rewind();

while($stack->valid()){
	echo $stack->key()."=>".$stack->current()."\n";
	$stack->next();
}
//删除堆栈数据

$popObj=$stack->pop();
echo "Poped object: ".$popObj."\n";
print_r($stack);








