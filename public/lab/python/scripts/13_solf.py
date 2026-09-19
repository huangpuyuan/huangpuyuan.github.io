# -*- coding: utf-8 -*-
"""
Created on Mon Sep 17 11:35:27 2018

@author: Kaitai
"""

def f(x): return 2*x**3-4*x**2+5*x-20
def solf(f=f):
    x1=3.
    x0=2.
    x=x1/2.
    e=10**(-18)
    while abs(f(x))>e:
        if f(x)<0:
            x0=x
            x=x0+(x1-x0)/2
        else:
            x1=x
            x=x0+(x1-x0)/2
    return x

print(solf(f))
