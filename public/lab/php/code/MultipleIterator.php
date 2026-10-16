<?php
$idIter =new arrayIterator(array('01','02','03'));
$nameIter =new arrayIterator(array('kobe','james','jordan'));
$ageIter =new arrayIterator(array('22','12','32'));

$mit=new MultipleIterator(MultipleIterator::MIT_KEYS_ASSOC);//MIT_KEYS_ASSOC以key作为关联
$mit->attachIterator($idIter,'ID');
$mit->attachIterator($nameIter,'NAME');
$mit->attachIterator($ageIter,'AGE');
foreach($mit as $value){
	print_r($value);
}

