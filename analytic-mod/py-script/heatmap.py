# Heatmap for sample maze game
# Depends on Python 2.7 along with matplotlib
#       python -m pip install -U pip setuptools
#       python -m pip install matplotlib

import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.axes_grid1.axes_divider import HBoxDivider
import mpl_toolkits.axes_grid1.axes_size as Size
from matplotlib import colors

from cycler import cycler

import os
import csv

import Tkinter as tk
import tkFileDialog as fd

if __name__ == "__main__":
    
    # open file path
    root = tk.Tk()
    root.withdraw()
    file_path = fd.askopenfilename()

    simple_path = os.path.split(file_path)[1]
    
    content = []
    
    with open(file_path, 'rb') as csvfile:
           reader = csv.reader(csvfile)
           next(reader, None) #skip the header
           for row in reader:
            content.append(int(row[3]))

    arr1 = np.reshape(content, (23, 23))  # Make the data readable


    fig, (ax1) = plt.subplots()

    cmap = colors.ListedColormap(['black','#00267F','#33CB64','#CFFA04', '#FFBE00', '#CC4632'])
    bounds=[-1.5,-0.5, 0.5, 1.5, 2.5, 3.5, 4.5]
    norm = colors.BoundaryNorm(bounds, cmap.N)
    cax = ax1.imshow(arr1, interpolation="nearest", cmap=cmap, norm=norm)
    cbar = fig.colorbar(cax, cmap=cmap, norm=norm, boundaries=bounds, ticks=[-1, 0, 1, 2, 3, 4])  # color bar

    for ax in [ax1]:
        ax.locator_params(nbins=4)

    plt.title(simple_path)
    plt.show()