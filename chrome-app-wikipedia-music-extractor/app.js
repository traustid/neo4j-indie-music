console.log('extension background page');

String.prototype.replaceArray = function(find, replace) {
	var replaceString = this;
	for (var i = 0; i < find.length; i++) {
		replaceString = replaceString.replace(find[i], replace[i]);
	}
	return replaceString;
};

$(document).ready(function() {
	var storageName = 'wikipedia_music_data';

	var storageItemExists = function(item) {
		if (!window.localStorage.getItem(storageName)) {
			return false;
		}
		else {
			var items = JSON.parse(window.localStorage.getItem(storageName));

			for (var i = 0; i<items.length; i++) {
				if (items[i].name == item.name && items[i].related == item.related) {
					return true;

					break;
				}
			}
		}

		return false;
	};

	var addStorageItem = function(item) {
		if (storageItemExists(item)) {
			console.log('already listed :(')
			return;
		}
		var items = [];

		if (window.localStorage.getItem(storageName)) {
			items = JSON.parse(window.localStorage.getItem(storageName));
		}

		items.push(item);

		window.localStorage.setItem(storageName, JSON.stringify(items));
	}

	var entityName = $('#firstHeading').text();

	var itemId = entityName;

	var tableHeaders = jQuery('table.infobox th');

	var members = [];
	tableHeaders.each(function(i, th) {
		if ($(th).text() == 'Members') {
			var membersStr = $(th).parent().find('td').text();
			members = members.concat(membersStr.indexOf(', ') > -1 ? membersStr.split(', ') : membersStr.split('\n'));
		}
	})

	var associated = [];
	tableHeaders.each(function(i, th) {
		if ($(th).text().indexOf('Associated') > -1) {
			var associatedStr = $(th).parent().find('td').text();
			associated = associated.concat(associatedStr.indexOf(', ') > -1 ? associatedStr.split(', ') : associatedStr.split('\n'));
		}
	})

	if (members.length > 0 && associated.length > 0) {
		console.log('This is a band I think.')

		console.log('Members:');
		console.log(members);

//		console.log('Associated acts:');
//		console.log(associated);	

		for (var i = 0; i<members.length; i++) {
			if (members[i] != '') {
				var dataItem = {
					name: members[i],
					related: entityName
				};

				addStorageItem(dataItem);
			}
		}
	}
	else if (members.length == 0 && associated.length > 0) {
		console.log('This is a musician I think.')

		console.log('Associated acts:');
		console.log(associated);
	
		for (var i = 0; i<associated.length; i++) {
			if (associated[i] != '') {
				var dataItem = {
					name: entityName,
					related: associated[i]
				};

				addStorageItem(dataItem);
			}
		}
	}


	/*
	if (!storageItemExists(entityName)) {

		console.log('Added '+entityName+' ('+itemId+')');
	}
	else {
		console.log(entityName+' ('+itemId+') already listed.')
	}
	*/
});