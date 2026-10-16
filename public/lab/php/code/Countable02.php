<?php

class CountMe implements Countable{
	protected $_myCount=3;
	public function count(){
		return $this->_myCount;
		}	
}

$obj= new CountMe();
echo count($obj);
