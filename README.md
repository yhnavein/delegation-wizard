Delegation Wizard
=====================

It's an application which helps prepare a document with Delegation Summary, which is quite useful
if you are having many abroad business trips over year and you are a employee registered in Poland.

Calculations made by this application are based on polish law, but please always double check amounts
and proper law regulations, as law may change in future.

Live version can be found here: [Delegations](http://delegations.puredev.eu)

## Features

* Automatically choosing proper daily diem amount basing on destination country
* Calculating amount of whole diem basing on time spent abroad, meals provided by employer, etc
* Determining exchange rate from NBP (Narodowy Bank Polski)

## Requirements

What you need to run this app succesfully

* **[node.js](http://nodejs.org)** - as it's an [Express](http://expressjs.com/) application
* **[python-2.*](www.python.org/download/)** - is needed by one of dependent libraries
* **[bower](http://bower.io/)** - for managing front-end packages
* **[pm2](https://github.com/Unitech/pm2)** - not necessary for development, but essential if you want to use this site on Live server

## Starting and initial configuration

I am assuming Linux as a standard environment, but with proper modifications, application is working also on Windows without problems

```
git clone https://bitbucket.org/puredev/delegation-wizard.git
cd delegations
npm install -d
cd public/ && bower install -d && cd ../
node app
```

After that open http://localhost:3001/ using your favourite browser.


## Licence

Released under the [MIT License](http://opensource.org/licenses/mit-license.php)