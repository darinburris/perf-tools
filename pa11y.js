const pa11y = require('pa11y');
const fs = require('fs');
const chalk = require('chalk');
const JSONLint = require( 'json-lint' );
const pa11yOptions = {
	standard : 'WCAG2AA',
	ignore : ['notice','warning'],
	page : {
		settings : {loadImages: false}
	},
	log: {
		debug: console.log.bind(console),
		error: console.error.bind(console),
		info: console.log.bind(console)
	}
};
const pa11yTest = pa11y(pa11yOptions);
const report = {};
const argv = require('yargs').argv;
const task = argv.task;
let domain = argv.domain;
let isFeed = false;

if(
	((domain === true) && (domain.length === undefined))
	||
	((typeof domain === 'undefined') || (domain.length === 0))
){
	console.log(chalk.white.bold.bgRed('ERROR: Please provide a url'));
	return;
}




const getDomain = require('./getDomain');
domain = getDomain(domain);
const msToTime = require('./msToTime');

//set timer
var startTimer = new Date();

console.log(chalk.white.bold.bgGreen(' W3C Accessibility has started '));

let pathToSitemap = './reports/' + domain + '/sitemap/' + domain;
let pathToReportDirectory = './reports/' + domain + '/a11y-report/';
let pathToReport = pathToReportDirectory + 'a11y-' + domain + '.json';

if (!fs.existsSync(pathToReportDirectory)){
    fs.mkdirSync(pathToReportDirectory);
}

if (fs.existsSync(pathToReport)) {
	fs.unlink(pathToReport,
		function(err) {
			if(err){
				console.log('There\'s been a problem deleting a previous report.');
			}
		}
	);
}



//const urls = ['http://darinburris.com/2009/02/27/well-this-is-where-it-all-begins/'];
const urls = require(pathToSitemap);
let urlLength = urls.length;
let cnt = 0;

var wstream = fs.createWriteStream(pathToReport);
wstream.write('[');

//console.log(urls[]);

urls.forEach(

	function(url) {

		isFeed = ((url.indexOf('.xml')) && (url.indexOf('/feed/'))) !== -1 ? true : false;


		if(!isFeed){

			pa11yTest.run(
				url,
				function(error, results) {
					if(error){
						console.log(error);
					}

					report.url = urls[cnt];
					report.results = results;
					console.log('Validating ',chalk.white.bold.underline(report.url));

					cnt = cnt + 1;
					if((cnt !== urlLength) && (results.length > 0)){
						wstream.write(JSON.stringify(report));
						wstream.write(',');
					} else if((cnt === urlLength) && (results.length > 0)){
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

			);

		}

	}
);
