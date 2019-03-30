var socket = io();
var messageInputBox = $('[name=message]');

function scrollToBottom() {
    var messages = $('#messages');
    var newMessage = messages.children('li:last-child');

    var clientHeight = messages.prop('clientHeight');
    var scrollTop = messages.prop('scrollTop');
    var scrollHeight = messages.prop('scrollHeight');
    var newMessageHeight = newMessage.innerHeight();
    var lastMessageHeight = newMessage.prev().innerHeight();

    if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
        messages.scrollTop(scrollHeight);
    }
}

socket.on('connect', function () {
    var params = $.deparam(window.location.search);
    console.log(params)
    socket.emit('join', params, function(err) {
        if (err) {
            alert(err);
            window.location.href = "/";
        } else {
            console.log('No Errors');
        }
    });
});

socket.on('newMessage', function(message) {
    var formattedTime = moment(message.createdAt).format('h:mm a');
    var messageTemplate = $('#message-template').html();
    var html = Mustache.render(messageTemplate, {
        from: message.from,
        text: message.text,
        createdAt: formattedTime
    });

    $('#messages').append(html);
    scrollToBottom();
    // var li = $('<li></li>');
    // li.text(`${message.from} ${formattedTime}: ${message.text}`);

    // $('#messages').append(li);

});

socket.on('newLocationMessage', function(message) {
    var formattedTime = moment(message.createdAt).format('h:mm a');
    var locationTemplate = $('#location-template').html();
    var html = Mustache.render(locationTemplate, {
        from: message.from,
        url: message.url,
        createdAt: formattedTime
    });

    $('#messages').append(html);
    scrollToBottom();
    // var li = $('<li></li>');
    // var a = $('<a target="_blank">My Current Location</a>');

    // li.text(`${message.from} ${formattedTime}: `);
    // a.attr('href', message.url);
    // li.append(a);

    // $('#messages').append(li);
});


$('#mainForm').on('submit', function(e) {
    e.preventDefault();
    socket.emit('createMessage', {
        text: messageInputBox.val()
    }, function() {
        messageInputBox.val('');
    });
});

var locationButton = $('#send-location');
locationButton.on('click', function() {
    if (!navigator.geolocation) {
        return alert('Geolocation not supported by your browser');
    }

    locationButton.attr('disabled', 'disabled').text('Sending Location....');

    navigator.geolocation.getCurrentPosition(function(position) {
        locationButton.removeAttr('disabled').text('Send Location');
        socket.emit('createLocationMessage', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });
    }, function(err) {
        console.log('Unable to Fetch Location', err);
        locationButton.removeAttr('disabled').text('Send Location');
        alert('Unable to fetch location');
    })
});

socket.on('updateUserList', function(users) {
    var ol = $('<ol></ol>');
    users.forEach(function(user) {
        ol.append($('<li></li>').text(user));
    });

    $('#users').html(ol);
});


socket.on('disconnect', function () {
    console.log('disconnected from server');
});
