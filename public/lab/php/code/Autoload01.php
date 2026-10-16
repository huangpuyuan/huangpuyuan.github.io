<?php
spl_autoload_extensions('.class.php,.php');
//设置autoload 寻找php定义的类文件的扩展名，多个扩展名用逗号分隔，前面的扩展名优先被匹配
set_include_path(get_include_path().PATH_SEPARATOR."libs/");//设置autoLoad寻找php定义的类文件的目录多个目录用PATH_SEPARATOR进行分隔
spl_autoload_register();//提示php使用autoLoad机制查找类定义
new Test();