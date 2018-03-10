var request = require('request');
var _ = require('underscore');
var fetch = require('node-fetch');
var fs = require('fs');

if (process.argv.length < 5) {
	console.log('node indiemusic-import.js --input=[input json] --login=[user:password] --action=[nodes|relationships]');

	return;
}

var argv = require('minimist')(process.argv.slice(2));

var cypherUrl = 'http://'+argv.login+'@localhost:7474/db/data/cypher';

if (argv.action == 'nodes') {
	fs.readFile(argv.input, 'utf8', function (err, fileData) {
		if (err) throw err;

		var output = [];

		var data = JSON.parse(fileData);

		var index = 0;

		_.each(data, function(item) {
			var person = item.name;
			var group = item.related;

			var createPersonQuery = {
				query: 'CREATE (p:Person {name: "'+person+'"})',
			};

			fetch(cypherUrl, {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify(createPersonQuery)
			}).then(function(response) {
				console.log('Import person: '+person);
			});

			var createGroupQuery = {
				query: 'CREATE (g:Group {name: "'+group+'"}) ',
			};

			fetch(cypherUrl, {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify(createGroupQuery)
			}).then(function(response) {
				console.log('Import group: '+group);
			});
		});
	});
}

if (argv.action == 'relationships') {
	fs.readFile(argv.input, 'utf8', function (err, fileData) {
		if (err) throw err;

		var output = [];

		var data = JSON.parse(fileData);

		var index = 0;

		_.each(data, function(item) {
			var person = item.name;
			var group = item.related;

			var createRelationQuery = {
				query: 'MATCH (p:Person {name: "'+person+'"}), (g:Group {name: "'+group+'"}) MERGE (p)-[r:ASSOCIATED_WITH]->(g) RETURN r',
			};

			fetch(cypherUrl, {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify(createRelationQuery)
			}).then(function(response) {
				console.log(createRelationQuery.query);
			});
		});
	});
}
