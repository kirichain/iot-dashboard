var index;
var timestamp = '';

var object = {};
var arr = [];

function addIndex(data) {
    index = 1;
    for (let i = 0; i < data.length; i++) {
        data[i].index = index;
        ++index;
    }
}

function addTimestamp(data) {
    for (let i = 0; i < data.length; i++) {
        timestamp = data[i].DAY.toString() + '/' + data[i].MON.toString() + '/' + data[i].YEAR.toString() + '-' + data[i].HOUR.toString() + ':' + data[i].MIN.toString() + ':' + data[i].SEC.toString();
        data[i].timestamp = timestamp;
    }
}

function filterUndefined(data) {
    Object.keys(data).forEach(key => {
        //console.log(data[key]);
        if (data[key] === undefined) {
            console.log('found');
            delete data[key];
        }
    });
}

$(document).ready(function () {
    console.log('loaded');

    $.get('https://1b86-203-113-151-208.ap.ngrok.io/data/device', function display(res, status) {
        if (res !== undefined) {
            //console.log(res);
            addIndex(res);
        }
        $('#deviceTable').DataTable({
            data: res,
            columns: [
                { data: 'index' },
                { data: 'IOT_MAC' },
                { data: 'STS' },
                { data: 'timestamp' }
            ]
        });

        $('#generalMachineTable').DataTable({
            data: res,
            columns: [
                { data: 'index' },
                { data: 'IOT_MAC' },
                { data: 'timestamp' }
            ]
        });

        $('#comSewMachineTable').DataTable({
            data: res,
            columns: [
                { data: 'index' },
                { data: 'IOT_MAC' },
                { data: 'timestamp' }
            ]
        });
    });

    $.get('https://1b86-203-113-151-208.ap.ngrok.io/data/general-machine-daily', function display(res, status) {
        if ((res !== undefined) && (res.length > 0)) {
            for (let i = 0; i < res.length; i++) {
                filterUndefined(res[i]);
            }
            addIndex(res);
            addTimestamp(res);

            $('#generalMachineDailyTable').DataTable({
                data: res,
                columns: [
                    { data: 'index' },
                    { data: 'MAC' },
                    { data: 'TYPE' },
                    { data: 'DATA' },
                    { data: 'timestamp' },
                    { data: 'DATA' },
                    { data: 'DATA' },
                    { data: 'timestamp' }
                ]
            });
        }
    })

    $.get('https://1b86-203-113-151-208.ap.ngrok.io/data/com-sew-machine-daily', function display(res, status) {
        if ((res !== undefined) && (res.length > 0)) {
            console.log(res);

            for (let i = 0; i < res.length; i++) {
                filterUndefined(res[i]);
            }
            addIndex(res);
            addTimestamp(res);

            $('#comSewMachineDailyTable').DataTable({
                data: res,
                columns: [
                    { data: 'index' },
                    { data: 'MAC' },
                    { data: 'TYPE' },
                    { data: 'DATA' },
                    { data: 'DATA' },
                    { data: 'DATA' },
                    { data: 'timestamp' }
                ]
            });
        }
    })

    $.get('https://1b86-203-113-151-208.ap.ngrok.io/data/worker-uid', function display(res, status) {
        if ((res !== undefined) && (res.length > 0)) {
            for (let i = 0; i < res.length; i++) {
                object.index = i + 1;
                object.uid = res[i];
                arr.push(object);
                object = {};
            }

            $('#workerTable').DataTable({
                data: arr,
                columns: [
                    { data: 'index' },
                    { data: 'uid' }
                ]
            });

            arr = [];
        }
    })
})
