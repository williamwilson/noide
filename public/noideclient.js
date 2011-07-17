(function($) {
    $(function() {
	var docio;

	docio = io.connect('http://localhost:8000/noide/doc');
	docio.on('update', function(data) {
	    var doc, i, text;
	    doc = document.getElementById('document');
	    text = '';
	    for (i = 0; i < data.length; i++) {
		text += data[i].text + '\n';
	    }
	    doc.value = text;
	});

	$('#addLineButton').click(function() {
	    docio.emit('addLine', {text:$('#lineText').val()});
	});
    });
}(jQuery));