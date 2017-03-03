const scavenger = require('scavenger');
const ampConfig = require('./amp-config.json');
const cheerio = require('cheerio');
const fs = require('fs');
const pathExists = require('path-exists');
const vnu = require('validator-nu');
const JSONLint = require( 'json-lint' );
const chalk = require('chalk');
const report = {};
const argv = require('yargs').argv;
const task = argv.task;
let domainProvided = argv.domain;
const msToTime = require('./msToTime');
const request = require('request');

//set timer
var startTimer = new Date();

console.log(chalk.white.bold.bgGreen(' W3C Validation has started '));

const getDomain = require('./getDomain');
domain = getDomain(domainProvided);

let pathToSitemap = './reports/' + domain + '/sitemap/' + domain + '.js';
let pathToReportDirectory = './reports/' + domain + '/w3c-report/';
let pathToReport = pathToReportDirectory + 'w3c-' + domain + '.json';

if(!pathExists.sync(pathToSitemap)){
	console.log(chalk.white.bold.bgRed('ERROR: A sitemap for this domain has not been created.'));
	console.log(chalk.white.bold.bgRed('Generate a sitemap before running validation.'));
	console.log(chalk.white.bold.bgBlue('Run the following command...'));
	console.log(chalk.white.bold.bgBlue('node sitemap.js --domain=' + domainProvided));
	return;
}

if (!pathExists.sync(pathToReportDirectory)){
    fs.mkdirSync(pathToReportDirectory);
}

const urls = require(pathToSitemap);
let urlLength = urls.length;
let cnt = 0;

if (pathExists.sync(pathToReport)) {
	fs.unlink(pathToReport,
		function(err) {
			if(err){
				console.log('There\'s been a problem deleting a previous report.');
			}
		}
	);
}

var wstream = fs.createWriteStream(pathToReport);
wstream.write('[');

urls.forEach(

	function(url) {

		request(
			url,
			function (error, response, body) {
				console.log('Fetching',url);
				var contentType = response.headers['content-type'];

				if ((!error) && (contentType.indexOf('xml') === -1)) {

						vnu.validate(
							body,
							undefined,
							undefined,
							'./node_modules/vnu-jar/build/dist/vnu.jar'
						).then(
							function (result) {

								report.url = urls[cnt];
								report.results = result;
								console.log('Validating ',chalk.white.bold.underline(report.url));

								wstream.write(JSON.stringify(report));
								cnt = cnt + 1;
								if(cnt !== urlLength){
									wstream.write(',');
								} else {
									wstream.write(']');
									wstream.end();
									fs.readFile(
										pathToReport,
										'utf8',
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
								}
							}
						).catch(
							function (e) {
								console.log('Ooops, there\'s been a problem, ', e);
							}
						);

				}
			}
		)

	}
)

var endTimer = new Date() - startTimer;
console.log('Execution time: ',chalk.black.bold.bgWhite(' ',msToTime(endTimer),' '));
console.log('done validatingh');
















//
// var wstream = fs.createWriteStream(pathToReport);
// wstream.write('[');
//
// scavenger.scrape(
// 	urls,
// 	function(html){
//
// 		vnu.validate(
// 			html,
// 			undefined,
// 			undefined,
// 			'./node_modules/vnu-jar/build/dist/vnu.jar'
// 		).then(
// 			function (result) {
//
// 				report.url = urls[cnt];
// 				report.results = result;
// 				console.log('Validating ',chalk.white.bold.underline(report.url));
//
// 				wstream.write(JSON.stringify(report));
// 				cnt = cnt + 1;
// 				if(cnt !== urlLength){
// 					wstream.write(',');
// 				} else {
// 					wstream.write(']');
// 					wstream.end();
// 					fs.readFile(
// 						pathToReport,
// 						'utf8',
// 						function (err,data) {
//
// 							if (err) {
// 								return console.log(err);
// 							}
//
// 							const lint = JSONLint( data );
//
// 							if ( lint.error ) {
// 								console.log('we got lint errors');
// 								console.log(lint.error); // Error Message
// 								console.log(lint.line); // Line number in json file where error was found
// 								console.log(lint.character); // Character of line in json file where error was found
// 							}
// 						}
// 					);
// 				}
// 			}
// 		).catch(
// 			function (e) {
// 				console.log('Ooops, there\'s been a problem, ', e);
// 			}
// 		);
//
// 	}
//
// ).then(
// 	(report) => {
// 		//wstream.end();
// 		var endTimer = new Date() - startTimer;
// 		console.log('Execution time: ',chalk.black.bold.bgWhite(' ',msToTime(endTimer),' '));
// 		console.log('done validatingh');
// 	}
// );
