# -*- coding: utf-8 -*-
"""
Created on Mon Sep 17 11:20:27 2018

@author: Kaitai
"""

def Age():
    x1=120.
    x0=0
    x=x1/2
    for i in range(6):
        y=input("Is your age greater than %s? Input 'Y' or 'N':" %x)
        if y=='Y' or y=='y':
            x0=x
            x=x0+(x1-x0)/2
        else:
            x1=x
            x=x0+(x1-x0)/2
    print ('Your age is about {} year old'.format(x))
    
Age()
