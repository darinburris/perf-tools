const parse = require('url-parse');

/*
 * PURPOSE : Returns the site name from the url provided, minus the pefix and suffix
 *  PARAMS : domain -
 * RETURNS : module.exports -
 *   NOTES :
 */
module.exports = function(domain){

	domain = domain.toString();
	let url = parse(domain, true);
	let host = url.host;
	let hostNoSuffixPrefix,
	hostNoSuffixIndx,
	hostNoPrefixIndx;

	//get/set domain name and associated variables
	hostNoSuffixIndx = host.lastIndexOf('.');
	hostNoPrefixIndx = host.indexOf('www.');
	hostNoSuffixPrefix = host.substring(0,hostNoSuffixIndx);
	hostNoSuffixIndx = hostNoSuffixPrefix.lastIndexOf('.');
	hostNoSuffixPrefix = hostNoSuffixPrefix.substring(hostNoSuffixIndx + 1);

	return hostNoSuffixPrefix;

}
