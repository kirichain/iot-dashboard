var topicName = ['sysCtrl', 'event-cnt', 'event-com-sew-cnt', 'event-nfc-uid', 'event-mchn-time'];

function displayData(element, data) {
    $("#" + element).html('<p>' + JSON.stringify(data) + '</p><br>');
}

function getData(topicName) {
    console.log('now');
    $.get('https://1b86-203-113-151-208.ap.ngrok.io/topics/' + topicName.toLowerCase(), function (res, status) {
        console.log(status);
        if ((res !== undefined) && (res.length > 0) && (res != null)) {
            console.log(res);
            console.log('success');
            switch (topicName) {
                case 'sysCtrl': displayData('sysCtrl', res);
                    break;
                case 'event-cnt': displayData('eventCnt', res);
                    break;
                case 'event-com-sew-cnt': displayData('eventComSewCnt', res);
                    break;
                case 'event-mchn-time': displayData('eventMchn_time', res);
                    break;
                case 'event-nfc-uid': displayData('eventNfcUid', res);
                    break;
            }
        }
    });
}

$(document).ready(function () {
    console.log('loaded');

    for (let i = 0; i < 5; i++) {
        setInterval(getData, 5000, topicName[i]);
    }
})