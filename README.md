![](src/mizar_gui/css/images/mizar.png)

# MIZAR

## 1 - Description
MIZAR is a 3D application in a browser for discovering and visualizing geospatial data for sky and planets. It supports natively some protocols coming from OGC and IVOA :

| OGC           | IVOA          | Remarks about the support in MIZAR                          |
| ------------- |:-------------:| ----------------------------------------------------------- |
| WMS           | HIPS          | Do not read the WMS capabilities and the HIPS property file |
|               | MOC           | Supported                                                   |
| GeoJSON       | VOTable       | GeoJSON is only supported. A profile has been extended to define other keywords (see wiki). About VOTable, a service is needed to convert it in a GeoJSON format|
| WCS           |               | Elevation is supported                                      |
| OpenSearch    | SIAP / SSAP   | Need a service to convert the Healpix request and the response as GeoJSON |
|               | SAMP          | Supported but need a service to convert the VOTable to GeoJSON |
| WPS           | UWS           | WPS is not supported. UWS is partially supported and under some conditions |

Many name resolver / reverse name resolver can be plugged easily. In the current version, we have interface with the name resolver from CDS and this one from IMCCE by wrapping them into our API

In addition, MIZAR supports drag n drop of file : GeoJSON and FITS File (Read the first IMAGE extension ; can only represent the data when WCS keywords exist)

## 2 - Architecture

TODO

## 3 - Installation

It exists different ways to install MIZAR

### 3.1 - MIZAR

#### Getting the sources

	$ git clone https://github.com/SITools2/MIZAR.git mizar
  
#### Getting the submodule [GlobWeb](https://github.com/TPZF/GlobWeb)
  	
	$ cd mizar
  	$ git submodule init
  	$ git submodule update

#### Getting the last version

To get the last version of MIZAR checkout the branch dev-refactoring and update the submodules

	$ git checkout dev-refactoring
	$ git submodule update
  	
#### Apache configuration

Configure a new alias in your apache configuration. 

	Alias /mizar/ "<DEPLOY_PATH>/mizar/"
    <Directory "<DEPLOY_PATH>/mizar/>
		Options MultiViews FollowSymLinks
		AllowOverride None
        Require all granted
    </Directory>


#### Copy the directory mizar in your web server
  	$ cp -R <INSTALL_PATH>/mizar <DEPLOY_PATH>

#### Run the application
  Go to 

* http://...../mizar/src/mizar_lite/index.html (classic version)
* http://...../mizar/src/mizar_lite/index-prod.html (optimised version)

In this mode, you will use a SITools2 server, installed somewhere,  that wraps the response coming from pre-defined sources (See wiki)

### 3.2 -MIZAR-lite
No installation, just import the javaScript (see Wiki) in your own web page

### 3.3 - MIZAR as module
SITools2 is a data access layer server. It provides services and user interface to handle data published through SITools2. In this mode, MIZAR is added as an application in the SITools2 user interface. 

See [Readme](contrib/SITools2V3_Module/README-Modules-Sitools2-V3.md)

### 3.4 - Optimization
To build a minify version, [NodeJS](http://nodejs.org/download/) must be installed

##### Install nodejs on Ubuntu run :

	// Install nodejs and npm
	sudo apt-get install nodejs npm
	// Add 2 symbolic links
	sudo ln -s /usr/bin/nodejs /usr/local/bin/node
	sudo ln -s /usr/bin/npm /usr/local/bin/npm

##### Minify the sources

* For windows: 

		$ build/build.bat 

* For Linux:

		$ cd build
		$ node r.js -o buildMizar.js

 
The script will then create a minify file **MizarWidget.min.js**" in **src/mizar_lite** directory.

##### Minify the css files
To build a minify CSS file, use the following command:

	$ node r.js -o cssIn=../src/mizar_gui/css/style.css out=../src/mizar_gui/css/style.min.css

##### Run the application in optimized mode
  Go to http://...../mizar/mizar_lite/index-prod.html

[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/SITools2/mizar/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

