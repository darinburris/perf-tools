var SitemapGenerator = require('sitemap-generator'),
	ampConfig = require('./amp-config.json'),
	fs = require('fs'),
	fse = require('fs-extra'),
	nodePath = require('path'),
	domain = process.argv.slice(2),
	domain = domain.toString(),
	parse = require('url-parse'),
	url = parse(domain, true),
	host = url.host,
	hostNoSuffixPrefix,
	hostNoSuffixIndx,
	hostNoPrefixIndx,
	output,
	fileName,
	path,
	xml2js = require('xml2js'),
	parser = new xml2js.Parser(),
	moment = require('moment');

//get/set domain name and associated variables
	hostNoSuffixIndx = host.lastIndexOf('.');
	hostNoPrefixIndx = host.indexOf('www.');
	hostNoSuffixPrefix = host.substring(0,hostNoSuffixIndx);
	hostNoSuffixIndx = hostNoSuffixPrefix.lastIndexOf('.');
	hostNoSuffixPrefix = hostNoSuffixPrefix.substring(hostNoSuffixIndx + 1);
	date =  moment().format('YYYY-MM-DD-hmmssa');
	fileName = hostNoSuffixPrefix + '.xml';

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

				}
			);
		}
	);

}

// start the crawler
generator.start();
