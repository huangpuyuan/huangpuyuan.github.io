<?php
date_default_timezone_set("PRC");
$file=new SplFileInfo("tmp.txt");
echo "File is created at ".date("Y-m-d H:i:s",$file->getcTime())."\n";
$file=new SplFileInfo("tmp.txt");
echo "File is modified at ".date("Y-m-d H:i:s",$file->getMTime())."\n";
echo "File is Size is ".$file->getSize()."bytes\n";

$fileObj=$file->openFile("r");
while($fileObj->valid()){
    echo $fileObj->fgets();//获取文件的一行数据
}
$fileObj=null;
$file=null;
