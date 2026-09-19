# -*- coding: utf-8 -*-
"""
Created on Fri Dec 21 11:33:14 2018

@author: Kaitai
"""

import pandas as pd
import numpy as np
import scipy.stats as stats

adult = pd.read_csv("adult.csv",header=None)
names = ["age","workclass","fnlwgt","education","education_nnum","maritral_status",
         "occupation","relationship","race","sex","capital_gain","capital_loss",
         "hours_per_week","native_location","income"]
adult.columns=names
adult.head()

adult.describe()
workclass=adult.groupby("workclass")
print(len(workclass))

pd.crosstab(adult.income,adult.race)

x=adult.age
print('mean,std,skewness,kurtosis:\n',
      x.mean(),x.var(),x.std(),stats.skew(x),stats.kurtosis(x))
print(stats.describe(x))


import matplotlib.pyplot as plt 
#%matplotlib inline
ct=np.array(pd.crosstab(adult.race,adult.maritral_status))
ct.shape
mname=['Divorced','Married-AF-spouse','Married-civ-spouse','Married-spouse-absent',
       'Never-married','Separated','Widowed']
rname=['Amer-Indian-Eskimo','Aisa-Pac-Islander','Black','Other','White']
fig=plt.figure(figsize=(10,4.5))
plt.subplot(1,2,1)
plt.pie(ct.sum(0),labels=mname,autopct='%1.2f%%')
plt.title('maritral status')
plt.subplot(1,2,2)
plt.pie(ct.sum(1),labels=rname,autopct='%1.1f%%')
plt.title('race')

fig = plt.figure(figsize=(10,4.5))
plt.hist(adult.age,normed=True)
density = stats.gaussian_kde(adult.age)
x=np.sort(adult.age)
plt.plot(x,density(x),'k-')
plt.title('age histogram and density estimation')





