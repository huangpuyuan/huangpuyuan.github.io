# -*- coding: utf-8 -*-
"""
Created on Tue Dec 18 11:38:31 2018

@author: Kaitai
"""

import random
random.seed(1010)
print(random.randint(1,100))
print(random.choice([1,2.0,4,'word']))
print(random.sample(range(100),5))
print(random.sample([1,2.0,4,'word'],2))
print(random.random())
print(random.uniform(2,5)) #产生一个2,5之间的均匀分布随机数
print(random.gauss(3,5)) #产生一个均值为3，标准差为5的正态分布随机数

