<?php
$it =new FileSystemIterator('.');
foreach($it as $finfo){
	printf("%s\t%s\t%8s\t%s\n",
		date("Y/m/d H:i",$finfo->getMTime()),
		$finfo->isDir()?"<DIR>":"",
		number_format($finfo->getSize()),
		$finfo->getFilename()
	);
	 
}