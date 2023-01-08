const SERVICE_ID = '13012f00-f8c3-4f4a-a8f4-15cd926da146';
const CHARACTERISTIC_ID = '13012f01-f8c3-4f4a-a8f4-15cd926da146';

function q(selector) {
    return document.querySelector(selector);
}

function qAll(selector) {
    return document.querySelectorAll(selector);
}

function hide(selector) {
    q(selector).setAttribute('hidden', 'true');
}

function hideAll(selector) {
    qAll(selector).forEach(el => el.setAttribute('hidden', 'true'));
}

function show(selector) {
    q(selector).removeAttribute('hidden');
}

async function loadHTML(html) {
    return await fetch(html).then(value => value.text());
}

const promiseTimeout = function (ms, promise) {

    // Create a promise that rejects in <ms> milliseconds
    let timeout = new Promise((resolve, reject) => {
        let id = setTimeout(() => {
            clearTimeout(id);
            reject('Timed out in ' + ms + 'ms.');
        }, ms);
    });

    // Returns a race between our timeout and the passed in promise
    return Promise.race([
        promise,
        timeout
    ]);
};

async function loadPages() {
    const loadScreen = q('.loading');
    const names = [
        'dashboard',
        'bluetooth',
        'painting'
    ];
    for (const name of names) {
        const page = await loadHTML(`pages/${name}.html`);
        q(`.container .${name}`).innerHTML = page;
        setTimeout(() => {
        }, 3000);
    }
    loadScreen.remove();
}

await loadPages();

function setBtStatusClass(status) {
    q('.bluetooth').classList.remove(
        'disconnected', 'canceled', 'connected', 'failed', 'connecting');
    q('.bluetooth').classList.add(status);
}

function btCharacteristicValueChanged(event) {
    const val = event.target.value.getUint8(0);
}

function onDisconnectBoard() {

    app.bluetooth.connectedDevice.device = null;
    app.bluetooth.connectedDevice.service = null;
    app.bluetooth.connectedDevice.characteristic = null;

    app.bluetooth.connectionStatus = CONNECTION_STATUSES.DISCONNECTED;

    setBtStatusClass('disconnected');
}

async function connectBoard() {
    setBtStatusClass('connecting');

    app.bluetooth.connectionStatus = CONNECTION_STATUSES.PENDING;

    let device;

    try {
        app.bluetooth.connectedDevice.device = null;
        app.bluetooth.connectedDevice.service = null;
        app.bluetooth.connectedDevice.characteristic = null;

        const getDevice = new Promise((resolve, reject) => {
            const res = navigator.bluetooth.requestDevice({
                filters: [{name: 'Arduino'}],
                optionalServices: [SERVICE_ID]
            });
            resolve(res);
        });
        // stop looking for device after 30s
        device = await promiseTimeout(10000, getDevice);

        const connectedDevice = await device.gatt.connect();

        if (device && connectedDevice) {
            app.bluetooth.connectionStatus = CONNECTION_STATUSES.CONNECTED;
            app.bluetooth.connectedDevice.device = connectedDevice;

            device.addEventListener('gattserverdisconnected', onDisconnectBoard);

            setBtStatusClass('connected');

            const service = await connectedDevice.getPrimaryService(SERVICE_ID);
            const characteristic = await service.getCharacteristic(CHARACTERISTIC_ID);

            app.bluetooth.connectedDevice.service = service;
            app.bluetooth.connectedDevice.characteristic = characteristic;

            characteristic.addEventListener('characteristicvaluechanged', btCharacteristicValueChanged);
        }
    } catch (e) {
        console.log({e});
        if (typeof device !== 'undefined') {
            app.bluetooth.connectionStatus = CONNECTION_STATUSES.FAILED;
            setBtStatusClass('failed');
        } else {
            app.bluetooth.connectionStatus = CONNECTION_STATUSES.CANCELLED;
            setBtStatusClass('cancelled');
        }
    }
    console.log(app);
}

q('.sync').addEventListener('click', connectBoard);

function onMenuItemClick(event) {
    event.stopPropagation();
    event.preventDefault();
    const target = event.target.tagName.toLowerCase() === 'li'
        ? event.target
        : event.target.closest('li');

    const id = target.dataset.id;

    hideAll('.container section');
    show(`.container section.${id}`);

    qAll('nav li').forEach(el => el.classList.remove('active'));
    q(`nav li[data-id="${id}"]`).classList.add('active');
}

qAll('nav li').forEach(el => el.addEventListener('click', onMenuItemClick));
window.electronAPI.bluetoothPairingRequest((event, details) => {
    const response = {};

    switch (details.pairingKind) {
        case 'confirm': {
            response.confirmed = confirm(`Do you want to connect to device ${details.deviceId}?`);
            break;
        }
        case 'confirmPin': {
            response.confirmed = confirm(`Does the pin ${details.pin} match the pin displayed on device ${details.deviceId}?`);
            break;
        }
        case 'providePin': {
            const pin = prompt(`Please provide a pin for ${details.deviceId}.`);
            if (pin) {
                response.pin = pin;
                response.confirmed = true;
            } else {
                response.confirmed = false;
            }
        }
    }

    window.electronAPI.bluetoothPairingResponse(response);
});
