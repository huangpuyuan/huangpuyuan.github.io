# -*- coding: utf-8 -*-
"""
Created on Fri Dec 21 09:46:18 2018

@author: Kaitai
"""

print(set.difference(set(['a',2,'5']),set(['a',7]))) #差集
print(set.union(set(['a',2,'5']),set(['a','a',7]))) #并集
print(set.intersection(set(['a',2,'5']),set(['a','a',7])))#交集
x=set(['I','you','he','I','they'])
x.remove('I');print(x,list(x))