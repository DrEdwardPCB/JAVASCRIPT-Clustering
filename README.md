# JAVASCRIPT-Clustering

## link

https://dredwardpcb.github.io/JAVASCRIPT-Clustering/index.html

### Description

this is a general purpose K-mean clusterer that takes a string of data and clustering algorithm . 
Currently this repo implements 2 clustering algorithm

- [K-mean clustering](https://en.wikipedia.org/wiki/K-means_clustering)
- [mean shift clustering](https://en.wikipedia.org/wiki/Mean_shift)

### motivation

This is created as my Mphil project requires analysis on the changes in fluorescent intensity of Calcium-sensitive-fluorescent dye injected artificial liposome with different ion-channels reconstitude on the liposome. 

the way I used to analyze the image is to draw a line across the liposome on the image and get the count of the pixels on the line then subtract the average background intensity from the average liposome fluorescent intensity. Since the data is just the count of the pixel, clustering algorithm is required to give annotation to each point for grouping it into liposome, intermediate or background for calculating the average background intensity and average liposome intensity. This is then made to help me to do the annotation

### Usage

#### DataSeries

enter the data in this field, the format is like
```
#1D
[x1];[x2];[x3];
#2D or above
[x1,y1];[x2,y2];[x3,y3];
#I am sure you guys can extrapolate the example from the above given example :)

```
### kmean-clustering

#### Number of Iteration

It must be a positive integer

#### Dimension

in theory, this can be expand to infinite dimension, just remember that it has to be a positive integer and has to match your with your data series dimensions

#### number of center

it will be how many number of cluster you want to get from the provided data. As k-mean clustering is an algorithm that garentee the number returned cluster. User can adjust it for their use case, just remember that it also needs to be a positive integer. for my case, I typically use 2 center or 3 center

#### submit button

once all field are fill, use can press the submit button and the analyze result will show below when the calculation are done

#### parse button

this is build for easy formating the data. when copying selected range from MS excel, user can press parse button after pasting the selected range to the dataSeries to convert the data in to the required format.

#### result display

the result will display below in the form of table with n number of row where n = number of data and 2 column including the data column for the entered coordinate and cluster column display an arbitary index of its belong cluster.

#### step display

##### table

display the clustering in the form of table

##### graph

display the clustering in the form of graph powered by plotly. Although plotly support 3D graph, 3D plotting will be hard to control and hard to be publish on a printed paper. Therefore only 2D is supported. for 1D data, all the data point will lie on the x axis, for multidimensional data, only the first 2 dimension are used in plotting the graph. (1D data can be presented by 2D while 3D will require other library such as three.js or babylon.js graph plotting are barely supported in current 3D library. 4D or above, the rendering library is not freely available, build a multidimension rendering engine will be totally out of the scope of this project and if I can do so, I would be able to get a PhD degree in computer science)

##### control panel
the panel consist of a slide bar, 2 button and a number to display the step. the maximum number of step will be number of iteration +1. this is because it also load the random generated cluster index and random generated center coordinate as the first step. to navigate across different step, simply click the 2 arrow button which will move 1 step on the slide bar, or directly move the slide bar

### mean shift clustering

#### Number of Iteration

It must be a positive integer, it confines how many iteration you want the clustering algorithm to perform

#### search range

this range has to be a positive number, which defines search range of the center. as the algorithm requires the center to search the in range point for calculation of the mean coordinate of in range point for the next shift

#### Dimension

in theory, this can be expand to infinite dimension, just remember that it has to be a positive integer and has to match your with your data series dimensions

#### point distance

this has to be a positive number, which define the distance between each center in a dimension when having initialization. For example if it is 10, then each center will be exactly 10 unit away from each center. The system will automatically initialize sufficient number of center to fulfill the range of datapoints. Elimination will be carry out if that center is not the nearest to at least 1 datapoint to simplify and facilitate calculation.

#### submit button

once all field are fill, use can press the submit button and the analyze result will show below when the calculation are done

#### parse button

this is build for easy formating the data. when copying selected range from MS excel, user can press parse button after pasting the selected range to the dataSeries to convert the data in to the required format.

#### result display

the result will display below in the form of table with n number of row where n = number of data and o number of column where o = number of dimension+1 the last column will display the index of cluster of that point belongs to

#### step display

##### table

display the clustering in the form of table

##### graph

display the clustering in the form of graph powered by plotly. Although plotly support 3D graph, 3D plotting will be hard to control and hard to be publish on a printed paper. Therefore only 2D is supported. for 1D data, all the data point will lie on the x axis, for multidimensional data, only the first 2 dimension are used in plotting the graph. (1D data can be presented by 2D while 3D will require other library such as three.js or babylon.js graph plotting are barely supported in current 3D library. 4D or above, the rendering library is not freely available, build a multidimension rendering engine will be totally out of the scope of this project and if I can do so, I would be able to get a PhD degree in computer science)

##### control panel
the panel consist of a slide bar, 2 button and a number to display the step. the maximum number of step will be number of iteration +1. this is because it also load the random generated cluster index and random generated center coordinate as the first step. to navigate across different step, simply click the 2 arrow button which will move 1 step on the slide bar, or directly move the slide bar

### future update

- add autoplay function
- allow download of the plotted graph
- import csv file
- export csv file
- implementation of more clustering algorithm