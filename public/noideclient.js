(function($) {
    $(function() {
	var docio, doc, cursor, updateDocument;

	doc = {};
	cursor = {line:'',column:0};

	updateDocument = function(lineid) {
	    var documentElement, i, lineclass, originalLine, cursorLine;

	    documentElement = $('#document');
	    if (!lineid) {
		documentElement.empty();

		for (i = 0; i < doc.lines.length; i++) {
		    lineclass = i % 2 == 0 ? 'line' : 'line line_alt';
		    documentElement.append('<span id="' + doc.lines[i].id + '" class="' + lineclass + '">' + doc.lines[i].text + '</span>');
		}
	    }
	    else {
		for (i = 0; i < doc.lines.length; i++) {
		    if (doc.lines[i].id === lineid) {
			break;
		    }
		}
		
		$('#' + lineid).html(doc.lines[i].text);
	    }

	    originalLine = $('#' + cursor.line).html();
	    cursorLine = '';
	    if (cursor.column > 0) {
		cursorLine = originalLine.slice(0, cursor.column);
	    }
	    cursorLine += '<span class="cursor">' + originalLine.slice(cursor.column, cursor.column + 1);
	    cursorLine += '</span>' + originalLine.slice(cursor.column + 1);
	    $('#' + cursor.line).html(cursorLine);
	};
	
	docio = io.connect('http://localhost:8000/noide/doc');
	docio.on('update', function(data) {
	    doc.lines = data;
	    if (cursor.line === '') {
		cursor.line = data[0].id;
	    }

	    updateDocument();
	});

	$('#addLineButton').click(function() {
	    docio.emit('addLine', {text:$('#lineText').val()});
	});

	$(document).keydown(function(eventObject) {
	    var i, line, previousLine, nextLine;
	    /* todo: filter so these are only processed when the document is focused */
	    /*if (eventObject.target !== document) {
		return;
	    }*/

	    if (eventObject.keyCode === 39) {
		/* RIGHT */
		for (i = 0; i < doc.lines.length; i++) {
		    if (doc.lines[i].id == cursor.line) {
			line = doc.lines[i];
			break;
		    }
		}
		if (cursor.column < (line.text.length - 1)) {
		    cursor.column = cursor.column + 1;
		    updateDocument(cursor.line);
		}
	    }
	    else if (eventObject.keyCode === 37) {
		/* LEFT */
		if (cursor.column > 0) {
		    cursor.column = cursor.column - 1;
		    updateDocument(cursor.line);
		}
	    }
	    else if (eventObject.keyCode === 38) {
		/* UP */
		for (i = 0; i < doc.lines.length; i++) {
		    if (doc.lines[i].id === cursor.line) {
			break;
		    }
		    previousLine = doc.lines[i];
		}

		if (previousLine) {
		    cursor.line = previousLine.id;
		    cursor.column = Math.min(cursor.column, (previousLine.text.length - 1));
		    updateDocument();
		}
	    }
	    else if (eventObject.keyCode === 40) {
		/* DOWN */
		for (i = 0; i < doc.lines.length; i++) {
		    if (doc.lines[i].id === cursor.line) {
			nextLine = doc.lines[i + 1];
			break;
		    }
		}

		if (nextLine) {
		    cursor.line = nextLine.id;
		    cursor.column = Math.min(cursor.column, (nextLine.text.length - 1));
		    updateDocument();
		}
	    }
	}).keypress(function(eventObject) {
	    if (eventObject.charCode > 0) {
		for (i = 0; i < doc.lines.length; i++) {
		    if (doc.lines[i].id === cursor.line) {
			line = doc.lines[i];
			break;
		    }
		}
		if (line) {
		    line.text = line.text.slice(0, cursor.column + 1) + String.fromCharCode(eventObject.charCode) + line.text.slice(cursor.column + 2);
		    cursor.column = cursor.column + 1;
		    updateDocument(line.id);
		}
	    }
	    else if (eventObject.keyCode === 8) {
		/* BACKSPACE */
		for (i = 0; i < doc.lines.length; i++) {
		    if (doc.lines[i].id === cursor.line) {
			line = doc.lines[i];
			break;
		    }
		}
		if (line) {
		    line.text = line.text.slice(0, cursor.column) + line.text.slice(cursor.column + 1);
		    cursor.column = cursor.column - 1;
		    updateDocument(line.id);
		}
	    }
	});
    });
}(jQuery));