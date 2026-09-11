---
title: "Julia的性能实测"
date: 2019-08-22
category: "Julia"
summary: "\" Julia is simply inherently fast! “ 对于日常统计和科学计算的需要，运用Juila你不需要太考虑性能和运行速度。例如：在包含一百万个随机变量的简单蒙特卡罗模拟，Julia通常在1至2秒"
---
" Julia is simply inherently fast! “  
对于日常统计和科学计算的需要，运用**Juila**你不需要太考虑性能和运行速度。例如：在包含一百万个随机变量的简单蒙特卡罗模拟，**Julia**通常在1至2秒钟的时间内运行，并且非常容易编写代码。
## 1  Julia代码编辑——在Atom中使用juno

>[**juno**](https://junolab.org/) —— A flexible IDE  for the 21st century。须预先安装[**Julia**](http://julialang.org/downloads/)和安装[**Atom**](https://atom.io/)。

### 1.1 安装juno

1. 在Atom中找到File->settings，再找到Packages 并搜索**ink**，然后就会出现一些相关包，找到ink包，点击安装

   ![1566446651324](/images/blog/1566446651324.png)

   

3. 根据上述方法依次找到并安装以下几个包

   - **julia-client**包
   - **language-julia**包
   - **uber-juno**包。

4. 安装完成后，设置julia路径

   - 找到Packages->julia->settings
   - 设置**julia Path**~~(我的julia是安装在F盘)
   

![1566447101538](/images/blog/1566447101538.png)

### 1.2 测试运行

   - 新建一个test.jl，输入`print("hello word!")`
   - 运行（run）

   ![1566446300088](/images/blog/1566446300088.png)



## 2 两种julia代码的效率

> 《Statistics with Julia》一书中的案例，以展现 **julia** 优秀的性能 。
>  $10^6$ 个随机变量、每个变量都是 500个随机数的平均值。总计需处理5亿个数字。

### 2.1 代码1:slower code 

```julia
using Statistics
#比较两种模式的快慢,@time用于性能检测
#slower
@time begin
     data = Float64[]
        for i in 1:10^6
           group = Float64[]
               for j in 1:5*10^2
                  push!(group,rand())
               end
           push!(data,mean(group))
        end
        println("98% of the means lite in the estimated range:",
                     (quantile(data,0.01),quantile(data,0.99)))
end;
```

输出结果

![1566457733647](/images/blog/1566457733647.png)

* 代码的实际输出给出了一个范围，在本例中大约是0.47到0.53，其中98%的样本均值位于其中。
* 由@time生成的第二行输出表明，代码执行大约需要7.89秒。另外在本例中大约是发生1040万个内存分配，总计8GB 。
* 用这种方法的时候：实际是 Julia在内存中写入一点，然后清空，并多次重复这个过程。不断的读写会减慢处理时间。

### 2.2 代码2:faster code 

```julia
using Statistics
#faster
@time begin
   data = [mean(rand(5*10^2)) for _ in 1:10^6]
   println("98% of the means lite in the estimated range:",
                  (quantile(data,0.01),quantile(data,0.99))  )
end;
```

输出结果：

![1566458492847](/images/blog/1566458492847.png)

* 可以看出，对于包含98%平均值的区间，输出结果给出了相同的估计0.47到0.53。
* 就性能而言，@time的输出表明这段代码明显优于其他代码。花费了大约2秒，相比之前代码要快得多。
* 因为所做的内存分配要少得多，只有3.9GB。
