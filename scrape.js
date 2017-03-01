const scavenger = require('scavenger');
const cheerio = require('cheerio');
const fs = require('fs');
const vnu = require('validator-nu');
const JSONLint = require( 'json-lint' );
const chalk = require('chalk');
const report = {};
const argv = require('yargs').argv;
let domain = argv.domain;
const msToTime = require('./msToTime');

//set timer
var startTimer = new Date();

console.log(chalk.white.bold.bgGreen(' W3C Validation has started '));

const getDomain = require('./getDomain');
domain = getDomain(domain);

let pathToSitemap = './reports/' + domain + '/sitemap/' + domain;
let pathToReportDirectory = './reports/' + domain + '/w3c-report/';
let pathToReport = pathToReportDirectory + 'w3c-' + domain + '.json';

if (!fs.existsSync(pathToReportDirectory)){
    fs.mkdirSync(pathToReportDirectory);
}

const urls = require(pathToSitemap);
let urlLength = urls.length;
let cnt = 0;

if (fs.existsSync(pathToReport)) {
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

scavenger.scrape(
	urls,
/*
 * PURPOSE : Autogenerates function contract comments
 *  PARAMS : html -
 * RETURNS : 	function(html) -
 *   NOTES :
 */
	function(html){

		vnu.validate(
			html,
			undefined,
			undefined,
			'./node_modules/vnu-jar/build/dist/vnu.jar'
		).then(
			/*
			 * PURPOSE : Autogenerates function contract comments
			 *  PARAMS : result -
			 * RETURNS : function -
			 *   NOTES :
			 */
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
		).catch(
			/*
			 * PURPOSE : Autogenerates function contract comments
			 *  PARAMS : e -
			 * RETURNS : function -
			 *   NOTES :
			 */
			function (e) {
				console.log('Ooops, there\'s been a problem, ', e);
			}
		);
	}
).then(
	(report) => {}
);
