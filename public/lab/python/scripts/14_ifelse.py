# -*- coding: utf-8 -*-
"""
Created on Tue Dec 18 11:31:48 2018

@author: Kaitai
"""
x = eval(input('Enter a number'))
if x<0:
    x=x**2
    w='x is negative and change to'
elif x==0:
    x=x+1
    w='x=0 and change to'
else:
    x=x**3
    w='x>0 and change to'
print(w,x)