var request = require('request');
var cheerio = require('cheerio');
var countries = require('country-data').countries;
var lookup = require('country-data').lookup;
var fs = require('fs');

var nameLookup = {
  "Venezuela": "Venezuela, Bolivarian Republic Of",
  "Ukraine": "",
  "U.S. Virgin Islands": "Virgin Islands (United States)",
  "British Virgin Islands": "Virgin Islands (British)",
  "DR Congo": "Democratic Republic Of Congo",
  "South Korea": "Korea, Republic Of",
  "North Korea": "Korea, Democratic People's Republic Of",
  "Palestine/Gaza Strip": "Palestinian Territory, Occupied",
  "Palestine/West Bank": "Palestinian Territory, Occupied",
  "Vietnam": "Viet-Nam, Democratic Republic of",
  "Laos": "Lao People's Democratic Republic",
  "Ivory Coast": "Côte d'Ivoire",
}

var medians = {}
request.get('https://en.wikipedia.org/wiki/List_of_countries_by_median_age', function(err, resp, body) {
  var $ = cheerio.load(body);
  var table = $('table');
  table.eq(1).find('tr').each(function() {
    var row = $(this);
    var name = row.find('td').eq(0).text().trim();
    if (!name || name === 'World') return;
    if (nameLookup[name]) name = nameLookup[name];
    var country = lookup.countries({name: name})[0];
    if (!country) {
      country = countries.all.filter(c => c.name.replace("&", "and").indexOf(name) !== -1)[0];
    }
    if (!country) {
      console.log('MISSING', name);
      return;
    }
    var code = country.alpha3;
    var median_age = row.find('td').eq(2).text().trim();
    medians[code] = {median_age: parseInt(median_age)};
  });

  for (var code in medians) {
    if (medians[code].median_age >= 40) {
      medians[code].fillKey = '40+'
    } else if (medians[code].median_age >= 35) {
      medians[code].fillKey = '35-40'
    } else if (medians[code].median_age >= 30) {
      medians[code].fillKey = '30-35'
    } else if (medians[code].median_age >= 25) {
      medians[code].fillKey = '25-30'
    } else if (medians[code].median_age >= 20) {
      medians[code].fillKey = '20-25'
    } else if (medians[code].median_age >= 14) {
      medians[code].fillKey = '14-20'
    }
  }

  fs.writeFileSync('./countries.js', "var medianAges = " + JSON.stringify(medians, null, 2));
})
