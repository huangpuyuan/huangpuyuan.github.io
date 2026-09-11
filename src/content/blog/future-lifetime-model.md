---
title: "剩余寿命模型"
date: 2019-07-01
category: "精算"
summary: "剩余寿命模型(The Future Lifetime Model)摘自 孟生旺 《精算学基础》"
---
剩余寿命模型(The Future Lifetime Model)__摘自 [孟生旺](http://blog.sina.com.cn/mengshw) 《精算学基础》

#### 1.剩余寿命
* 剩余寿命：用符号$(x)$来表示一个年龄为$x$岁的个体，用$T$或更具体的$T(x)$来表示该个体的未来剩余寿命。
* 剩余寿命$T(x)$是一个随机变量，其概率分布函数为：
$$
G(t)=Pr(T\leq t),t\geq 0
$$
​		对于给定的t，函数$G(t)$表示个体在$t$年内死亡的概率。
* $G(t)$的概率密度函数为$g(t)=G'(t)$ ，有：
$$
g(t)dt = Pr(t<T<t+dt)
$$

**常用的精算符号和公式：**

1. 个体在$t$年内死亡的概率：$_{t}q_x=G(t)$

2. 个体在$t$年内生存的概率：$_{t}P_x=1-G(t)$

3. $x$岁的个体生存了$s$年，并在之后$t$年内死亡的概率：
$$
_{s|t}q_x =Pr(s<T<s+t)=G(s+t)-G(s)= _{s+t}q_x-_{s}q_x
$$

4. 记$$ _{t}p_{x+s}$$为$x$岁的个体在生存至$x+s$岁之后，又生存了$t$年的条件概率
   $$
   _{t}P_{x+s}=Pr(T>s+t)=\frac{1-G(s+t)}{1-G(s)}\\
   _{t}q_{x+s}=Pr(T>s+t)=\frac{G(s+t)-G(s)}{1-G(s)}\\
   _{s+t}p_x=1-G(s+t)=[1-G(S)]\frac{1-G(s+t)}{1-G(s)}=_{s}p_{x}._tp_{x+s}\\
   $$
