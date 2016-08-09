var request = require('request');
var cheerio = require('cheerio');
var lookup = require('country-data').lookup;
var fs = require('fs');

var medians = {}
request.get('https://en.wikipedia.org/wiki/List_of_countries_by_median_age', function(err, resp, body) {
  var $ = cheerio.load(body);
  var table = $('table');
  table.eq(1).find('tr').each(function() {
    var row = $(this);
    var name = row.find('td').eq(0).text().trim();
    if (name.charAt(0) === "'" && name.charAt(name.length - 1) === "'") {
      name = name.substring(0, name.length - 1);
    }
    var country = lookup.countries({name: name})[0];
    console.log('gc', name, country)
    var code = country.code;
    medians[code] = row.find('td').eq(2).text().trim();
    medians[code] = parseInt(medians[code]);
    console.log(code, name, medians[code])
    console.log(name.charAt(0), name.charAt(name.length - 1))
  });
  fs.writeFileSync('./countries.js', "var medianAges = " + JSON.stringify(medians, null, 2));
})
