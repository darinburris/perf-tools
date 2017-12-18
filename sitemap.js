var SitemapGenerator = require('sitemap-generator'),
	yargs = require('yargs').argv,
	ampConfig = require('./amp-config.json'),
	fs = require('fs'),
	chalk = require('chalk'),
	fse = require('fs-extra'),
	request = require('request'),
	cheerio = require('cheerio'),
	nodePath = require('path'),
	htmllint = require('htmllint'),
	domain = yargs.domain,
	parse = require('url-parse'),
	hostNoSuffixPrefix,
	hostNoSuffixIndx,
	hostNoPrefixIndx,
	output,
	fileName,
	path,
	xml2js = require('xml2js'),
	parser = new xml2js.Parser(),
	moment = require('moment'),
	vnu = new require("validator-nu"),
	report = [],
	reportJSON = {},
	currUrl;

	console.log('domain = ' + domain);
	console.log('typeof domain = ' + typeof domain);

	if((typeof domain !== 'undefined') && (typeof domain !== undefined)) {

		console.log('there is a domain');
		domain = domain.toString();
		var	url = parse(domain, true),
			host = url.host;

		console.log(chalk.white.bgRed.bold(domain));

		//get/set domain name and associated variables
		var hostNoSuffixIndx = host.lastIndexOf('.');
		var hostNoPrefixIndx = host.indexOf('www.');
		var hostNoSuffixPrefix = host.substring(0,hostNoSuffixIndx);

		hostNoSuffixIndx = hostNoSuffixPrefix.lastIndexOf('.');
		hostNoSuffixPrefix = hostNoSuffixPrefix.substring(hostNoSuffixIndx + 1);

		var fileName = hostNoSuffixPrefix + '.xml';

	} else {
		
		console.log(chalk.white.bgRed.bold(`  Please provide a domain  `));
		return;
	}

	var date =  moment().format('YYYY-MM-DD-hmmssa');

function siteMap(args){

	// create generator
	var generator = new SitemapGenerator(domain);

	// register event listeners
	generator.on('done',

		function (sitemap) {

			path = ampConfig.quality.reportsDir + '/' + hostNoSuffixPrefix + '/' + date + '/';

			fse.ensureDir(path,
				function (err) {

					fileName = path + '/' + fileName;
					fs.writeFileSync(fileName, sitemap);
					convertXML(fileName);

				}
			)

		}

	);

	generator.on(
		'fetch',
		function (status, url) {
			if(status === 'OK'){
				console.log('fetching: ',url, ' - status: ',chalk.white.bold.bgGreen(' ',status,' '));
			} else {
				console.log('fetching: ',url, ' - status: ',chalk.white.bold.bgRed(' ',status,' '));
			}
		}
	);

	function convertXML(fileName){

		var currPath = nodePath.dirname(fileName);

		fs.readFile(fileName,

			function(err, data) {

				parser.parseString(data,

					function (err, result) {

						var output = JSON.stringify(result);
						fs.writeFileSync(currPath + '/' + hostNoSuffixPrefix + '.json', output);
						fs.unlinkSync(fileName);
						console.log('Done writing file');

						if(yargs.process === 'htmllint'){
							console.log('do html lint now');
							console.log(currPath + hostNoSuffixPrefix + '.json');
							htmlLint('./' + currPath + hostNoSuffixPrefix + '.json');
						}

					}
				);
			}
		);

	}

	// start the crawler
	generator.start();

}

function htmlLint(report){

	var links = require(report),
		iLength = links.urlset.url.length,
		i;

	for (i = 0; i < iLength; i++){

		currUrl = links.urlset.url[i].loc[0];
		console.log('pre-request for ' + currUrl);
		requestPage(currUrl,i,iLength-1);




	}

//fs.writeFileSync('validation.json', JSON.stringify(report));

}

function requestPage(url,i,iLength){

	console.log('inside requestPage for ', url);

	request(url,
		function(error, response, body) {

			// console.log(body);

			// console.log('html dom loaded for ' + currUrl);

			if(error) {
				console.log('Error: ' + error);
			}

			// var $ = cheerio.load(body),
			// 	html =  $.html();

			//console.log('pre vnu validate');

			validate(body,url,i,iLength);


		}

	);

}

function validate(body,url,i,iLength){

	console.log('inside validate');

	vnu.validate(
		body,
		undefined,
		undefined,
		'./node_modules/vnu-jar/build/dist/vnu.jar'
	).then(
		function (result) {
			reportJSON.page = url;
			reportJSON.results = result;
			report.push(reportJSON);
			buildValidation(report,i,iLength);
		}
	).catch(
		function (e) {
			console.log(e);
		}
	);


}

function buildValidation(report,i,iLength){

	console.log('inside buildValidation');

	if(i === iLength){
		//console.log(report);
		fs.writeFileSync('validation.json', JSON.stringify(report));
	}
}

switch (yargs.process) {
	case 'sitemap':
		siteMap();
		break;
	case 'htmllint':
		siteMap();
		break;
	default:
		return;
	break;
}
