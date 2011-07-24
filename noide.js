module.exports = (function() {
    var fs = require('fs');

    var noide = {};

    /* private */
    var clients = [];
    var doc;
    var docio;

    var updateAllClients = function() {
	docio.emit('update', doc.lines);
    };

    /* public */
    noide.initialize = function(io) {
	doc = new Document();
	doc.on('lineAdded', function(data) {
	    updateAllClients();
	});
	doc.on('lineUpdated', function(data) {
	    updateAllClients();
	});

	/* todo: supply the namespace as a parameter */
	docio = io.of('/noide/doc').on('connection', function(client) {
	    clients.push(client);
	    client.on('addLine', function(data) {
		doc.addLine(null, data.text);
	    });
	    client.on('updateLine', function(data) {
		doc.updateLine(data.id, data.text);
	    });
	    client.emit('update', doc.lines);
	});
	/* todo: initialize chat on the specified io */
    };

    return noide;
}());

var Document = function() {
    this.events = {};
    this.lines = [];
    this.linesById = {};

    this.addLine(null, 'This is a new, empty document.');
};

Document.prototype.addLine = function(afterid, text) {
    /* locate the line after which the new line is to be inserted */
    var i, afterIndex;
    if (afterid) {
	for (i = 0; i < this.lines.length; i++) {
	    if (this.lines[i].id === afterid) {
		afterIndex = i;
		break;
	    }
	}
    }

    var line = {id: Document.generateLineId(), text: text};
    if (afterIndex) {
	/* note: splice inserts the new element at the specified index */
	this.lines.splice(afterIndex + 1, 0, line);
    }
    else {
	this.lines.push(line);
    }
    this.linesById[line.id] = line;
    this.emit('lineAdded', {id: line.id});
};

Document.prototype.emit = function(event, data) {
    var handlers, i;
    if (this.events.hasOwnProperty(event)) {
	handlers = this.events[event];
	for (i = 0; i < handlers.length; i++) {
	    handlers[i](data);
	}
    }
};

Document.generateLineId = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	var r = Math.random() * 16|0, v = c == 'x' ? r : (r&0x3|0x8);
	return v.toString(16);
    });
};

Document.prototype.on = function(event, handler) {
    var handlers;
    if (!this.events.hasOwnProperty(event)) {
	handlers = [];
	this.events[event] = handlers;
    }
    handlers.push(handler);
};

Document.prototype.updateLine = function(id, text) {
    var line;
    if (this.linesById.hasOwnProperty(id)) {
	line = this.linesById[id];
	line.text = text;
	this.emit('lineUpdated', {id:id});
    }
};