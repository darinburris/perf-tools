const pa11y = require('pa11y');
const fs = require('fs');
const chalk = require('chalk');
const pathExists = require('path-exists');
const JSONLint = require( 'json-lint' );
const getDomain = require('./getDomain');
const msToTime = require('./msToTime');
const ampConfig = require('./amp-config.json');
const pa11yOptions = {
	standard : 'WCAG2AA',
	ignore : ['notice','warning'],
	page : {
		settings : {loadImages: false}
	}
};
const pa11yTest = pa11y(pa11yOptions);
const report = {};
const argv = require('yargs').argv;
const task = argv.task;
let domainProvided = argv.domain;
var isFeed;
const request = require('request');

if(
	((domainProvided === true) && (domainProvided.length === undefined))
	||
	((typeof domainProvided === 'undefined') || (domainProvided.length === 0))
){
	console.log(chalk.white.bold.bgRed('ERROR: Please provide a url'));
	return;
}

domain = getDomain(domainProvided);

//set timer
var startTimer = new Date();

console.log(chalk.white.bold.bgGreen(' W3C Accessibility has started '));

let pathToSitemap = './reports/' + domain + '/sitemap/' + domain + '.js';
let pathToReportDirectory = './reports/' + domain + '/a11y-report/';
let pathToReport = pathToReportDirectory + 'a11y-' + domain + '.json';

if(!pathExists.sync(pathToSitemap)){
	console.log(chalk.white.bold.bgRed('ERROR: A sitemap for this domain has not been created.'));
	console.log(chalk.white.bold.bgRed('Generate a sitemap before checking accessibility.'));
	console.log(chalk.white.bold.bgBlue('Run the following command...'));
	console.log(chalk.white.bold.bgBlue('node sitemap.js --domain=' + domainProvided));
	return;
}

if (!pathExists.sync(pathToReportDirectory)){
	fs.mkdirSync(pathToReportDirectory);
}

if (pathExists.sync(pathToReport)) {
	fs.unlink(pathToReport,
		function(err) {
			if(err){
				console.log('There\'s been a problem deleting a previous report.');
			}
		}
	);
}

const urls = require(pathToSitemap);
let urlLength = urls.length;
let cnt = 0;

var wstream = fs.createWriteStream(pathToReport);
wstream.write('[');

//console.log(urls[]);

urls.forEach(

	function(url) {

		// isFeed = false;
		//
		// if(url.indexOf('.xml') !== -1){
		// 	isFeed = true;
		// } else if(url.indexOf('/feed/') !== -1){
		// 	isFeed = true;
		// } else {
		// 	isFeed = false;
		// }

		// console.log('pre if statement and isFeed =',isFeed);

//		if(!isFeed){

			// console.log('just inside if statement and isFeed =',isFeed);

			pa11yTest.run(
				url,
				function(error, results) {

					// if(error){
					// 	console.log(error);
					// }

					report.url = urls[cnt];
					if((typeof results === 'undefined')){
						report.results = 'This is not a html page.';
					} else if((typeof results !== 'undefined') && (results.length === 0)){//(results.length === 0) ||
						report.results = 'No accessibility issues found.';
					} else {
						report.results = results;
					}

					console.log('Validating ',chalk.white.bold.underline(report.url));

					cnt = cnt + 1;

					if(!error){
						if((cnt !== urlLength)){
							wstream.write(JSON.stringify(report));
							wstream.write(',');
						} else if(cnt === urlLength){
							wstream.write(JSON.stringify(report));
							wstream.write(']');
							wstream.end();
							fs.readFile(
								pathToReport,
								'utf8',
								/*
								 * PURPOSE : Autogenerates function contract comments
								 *  PARAMS : err -
								 *           data -
								 * RETURNS : function -
								 *   NOTES :
								 */
								function (err,data) {

									if (err) {
										return console.log(err);
									}

									const lint = JSONLint( data );

									if ( lint.error ) {
										console.log('we got lint errors');
										console.log(lint.error); // Error Message
										console.log(lint.line); // Line number in json file where error was found
										console.log(lint.character); // Character of line in json file where error was found
									}
								}
							);
							var endTimer = new Date() - startTimer;
							console.log('Execution time: ',chalk.black.bold.bgWhite(' ',msToTime(endTimer),' '));
						}
					}

				}

			);

		//}

		// isFeed = false;

	}
);
