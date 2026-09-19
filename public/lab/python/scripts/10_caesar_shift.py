# -*- coding: utf-8 -*-
"""
Created on Fri Nov 16 10:56:19 2018
加密算法一：移位

@author: Kaitai
"""

alpha = "abcdefghijklmnopqrstuvwxyz".upper()
punct = ",.?:;'\n "


from functools import partial

def shift(l,s=2):
    l = l.upper()
    return alpha[(alpha.index(l)+s) % 26]
def caesar_shift_encrypt(m,s=2):
    m = m.upper()
    c = "".join(map(partial(shift,s=s),m))
    return c
def caesar_shift_decrypt(c,s=-2):
    c = c.upper()
    m = "".join(map(partial(shift,s=s),c))
    return m

print("Original Message: HIAB")
print("Ciphertext:",caesar_shift_encrypt("hiab"))

m = """To be, or not to be, that is the question:
Whether 'tis Nobler in the mind to suffer
The Slings and Arrows of outrageous Fortune,
Or to take Arms against a Sea of troubles,
And by opposing end them."""

m = "".join([l for l in m if not l in punct])
print("Original Message:")
print(m)
print() 
print("Ciphertext:")
tobe_ciphertext = caesar_shift_encrypt(m)
print(tobe_ciphertext)
print() 
print("Decrypted second message:")
print(caesar_shift_decrypt(tobe_ciphertext))