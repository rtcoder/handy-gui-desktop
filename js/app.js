window.CONNECTION_STATUSES = {
    DISCONNECTED: 0,
    CONNECTED: 1,
    CANCELLED: 2,
    FAILED: 3,
    PENDING: 4,
};
window.app = {
    version: '0.1',
    bluetooth: {
        connectionStatus: CONNECTION_STATUSES.DISCONNECTED,
        connectedDevice: {
            device: null,
            service: null,
            characteristic: null
        },
    }
};
