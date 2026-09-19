# -*- coding: utf-8 -*-
"""
Created on Fri Dec 21 09:52:19 2018

@author: Kaitai
"""

x=99;y=x;print(x,y,id(x)==id(y))
y=10;print(x,y,id(x)==id(y))
x=[1,2,3];y=x;y[0]=10;print(x,y,id(x)==id(y))
x=[1,2];y=x[:]
print(x,y,id(x)==id(y),id(x[0])==id(y[0]),id(x[1])==id(y[1]))
print(id(x),id(y),id(x[0]),id(y[0]),id(x[1]),id(y[1]))