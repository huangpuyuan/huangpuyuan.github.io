---
title: "使用 Julia 语言学习统计学"
date: 2019-08-21
category: "Julia"
summary: "Julia 是一个面向科学计算的高性能动态高级程序设计语言。其语法与其他科学计算语言相似。在许多情况下拥有能与编译型语言相媲美的性能。"
---
**Julia** 是一个面向科学计算的高性能动态高级程序设计语言。其语法与其他科学计算语言相似。在许多情况下拥有能与编译型语言相媲美的性能。

**Julia**兼具动态语言的开发便利性和编译的静态类型语言的性能，部分归功于基于LLVM的JIT编译器生成本机机器代码，部分是通过多个专业化实现类型稳定性的设计，这使得代码编译更高效。

**Julia** 是由 MIT 主导开发的 ，它将 C 的速度、Ruby 的灵活性 Matlab 的数学表征、Python 的通用编程结合在一起，集众家之所长，近年来成为全球火热程度上升最快的编程语言之一，受到包括 Google、Facebook 在内的世界知名互联网公司开发者们的广泛欢迎。

> 免费英文电子书，大学本科的统计学入门教材，其中的示例使用简单的 Julia 语言。[《使用 Julia 语言学习统计学》](https://people.smp.uq.edu.au/YoniNazarathy/julia-stats/StatisticsWithJulia.pdf)
## **Introducing Julia**

Programming goes hand in hand with mathematics, statistics, data science and many other fields. Scientists, engineers, data scientists and statisticians often need to automate computation that would otherwise take too long or be infeasible to carry out. This is for the purpose of prediction, planning, analysis, design, control, visualization or as an aid for theoretical research. Often, general programming languages such as Fortran, C/C++, Java, Swift, C#, Go, JavaScript or Python are used. In other cases, more mathematical/statistical programming languages such as Mathematica, Matlab/Octave, R, or Maple are employed. The process typically involves analyzing the problem at hand, writing code, analyzing behavior and output, re-factoring, iterating and improving the model. At the end of the day, a critical component is speed, specififically, the speed it takes to reach a solution - whatever it may be.

...

The *Julia language and framework* developed in the last several years makes use of a variety of advances in compilation, computer languages, scientifific computation and performance optimization. It is a language designed with a view of improving on the previous Pareto-optimal frontier depicted in Figure 1.1. With syntax and style somewhat similar to R, Python and Matlab/Octave, and with performance comparable to that of C/C++ and Fortran, Julia attempts to break the so called *two* *language problem*. That is, it is postulated that practitioners may quickly create code in Julia, which also runs quickly. Further, re-factoring, improving, iterating and optimizing code can be done in Julia, and does not require the code to be ported to C/C++ or Fortran, since the Julia standard libraries, and almost all of Julia base are written in Julia.

![1566355025068](/images/blog/1566355025068.png)

...

> 本书代码库 地址：
>
> [https://github.com/h-Klok/StatsWithJuliaBook](https://github.com/h-Klok/StatsWithJuliaBook)




Julia is first and foremost a *scientific programming language*. It is perfectly suited for statistics, machine learning, data science and for heavy (as well as light weight) numerical computations. It can also be integrated in user-level applications, however one would not typically use it for front-end interfaces, or game creation. It is an open-source language and platform, visit [https://julialang.org/](https://julialang.org/) for more details. The Julia community brings together contributors from both the scientific computing world and the statistics and data-science world. This puts the Julia language and package system in a good place for combining mainstream statistical methods with methods and trends of the scientific computing world. Coupled with programmatic simplicity similar to Python, and with speed similar to C, Julia is taking an active part of the data-science revolution. In fact, some believe it will become the primary language of data-science in the future.

(at the moment, most people believe that Python holds this title). 

...

## **演示**

#####  Julia的运行
1. [**Julia’s REPL interface**](https://julialang.org/downloads/)
![1566358084728](/images/blog/1566358084728.png)
2. [**JuliaBox**](https://juliabox.com/):一个无需下载安装任何东西，使用浏览器即可在 **Jupyter Notebook** 中直接运行 **Julia** 代码的平台。


#####  Julia代码上手

```julia
1 println("There is more than one way to say hello:") 
2
3 #This is an array consisting of three strings 
4 helloArray = ["Hello","G’day","Shalom"] 
5
6 for i in 1:3 
7 println("\t", helloArray[i], " World!") 
8 end 
9 
10 println("\nThese squares are just perfect:") 
11 
12 #This construct is called a ‘comprehension’ (or ’list comprehension’) 
13 squares = [i^2 for i in 0:10] 
14 
15 #You can loop on elements of arrays without having to use indexing 
16 for s in squares 
17 print(" ",s) 
18 end
19 
20 #The last line of every code snippet is also evaluated as output (in addition to 
21 # any figures and printing output generated previously). 
22 sqrt.(squares) 
```
##### 输出结果  

```md
There is more than one way to say hello:  
	Hello World!  
	G’day World!  
	Shalom World!  
These squares are just perfect:   
0  1  4  9  16  25  36 49  64  81  100  
11-element Array{Float64,1}:  
0.0  
1.0  
2.0  
3.0  
4.0  
5.0  
6.0  
7.0  
8.0  
9.0  
10.0  
```

> 文档：[Julia官方语言的文档](https://docs.julialang.org) 、[Julia中文文档](https://julia-zh-cn.readthedocs.io/zh_CN/latest/)



## **《Statistics with Julia》内容提要**

- 第 1 章是对 Julia 的介绍，包括它的设置、包管理器和本书中使用的主要包。为了说明一些语言的特性，通过代码示例介绍一些基本语法和程序结构。

- 第 2 章探讨基本概率，重点关注事件、结果、独立性和条件概率概念。我们提出了几个典型的概率示例以及探索性的仿真代码。

- 第 3 章探讨了随机变量和概率分布，重点介绍 Julia 分布包的使用。将离散、连续、单变量和多变量概率分布作为一个教学任务加以介绍和探讨。这是通过仿真和显式分析以及绘制分布的相关函数图来完成的，如 PMF、PDF、CDF 等。

- 第 4 章暂时不谈概率概念，重点介绍了数据处理、数据汇总和数据可视化。引入 DataFrame 的概念作为存储可能丢失值的异构数据类型的机制。数据帧在 Julia 中是数据科学和统计的重要组成部分，就像在 R 和 Python 中一样。本章还介绍了经典描述统计学及其在 Julia 中的应用。此外，还引入了核密度估计和经验累积分布函数等概念。本章最后将介绍使用文件的一些基本功能。

- 第 5 章介绍了一般的统计推断思想。通过仿真和分析实例给出了样本均值和样本方差的抽样分布，说明了中心极限定理和相关结果。然后探讨统计估计的一般概念，包括矩量法和最大似然估计方法的基本例子，然后是简单的置信区间。本章还介绍了统计假设检验的基本概念，以及贝叶斯统计的基本概念。

- 第 6 章介绍了一个和两个样本的各种实际置信区间。本章从均值的标准置信区间开始，然后发展到更现代的 bootstrap 方法和预测区间。本章还是研究模型假设对推理影响的切入点。

- 第 7 章侧重于假设检验。本章从总均值的标准 t 检验开始，然后介绍两种均值比较的假设检验。然后，进行方差分析（ANOVA），以及检查独立性和拟合优度的假设检验。接下来向读者介绍功率曲线。本章最后介绍了一个很少涉及到的性质，即 p 值的分布。

- 第 8 章介绍了最小二乘和统计线性回归模型。它首先介绍最小二乘法，然后进入线性回归统计模型，包括假设检验和置信带。还探讨了其他回归概念。包括假设检查、模型选择、交互等。

- 第 9 章概述了几种更先进的机器学习概念。首先，介绍了研究数据的机器学习范例。包括训练、验证和测试。然后介绍了机器学习中偏差和方差的概念。这与将正则化思想应用于线性模型是相辅相成的。然后本章继续讨论了逻辑回归和广义线性模型。然后介绍了进一步的监督学习方法，包括线性分类、随机森林、支持向量机和深度神经网络。然后介绍了一些无监督的方法，包括 k 均值和主成分分析（PCA）。本章最后简要介绍了马尔可夫决策过程和强化学习。

- 第 10 章讨论了应用概率的随机模型，让读者了解随机建模和蒙特卡罗模拟的优点。本章侧重于动态系统，探讨了马尔可夫链、离散事件模拟和可靠性分析，以及处理随机数生成的几个方面。
