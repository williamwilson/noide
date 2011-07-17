(function() {
    var socket;

    alert('initializing socket');

    socket = io.connect('http://localhost:8000');

    socket.on('message', function(data) {
	alert('received: ' + data);
	var doc, i, text;
	doc = document.getElementById('document');
	text = '';
	for (i = 0; i < data.length; i++) {
	    text += data[i] + '\n';
	}
	doc.value = text;
    });

    socket.connect();
}());