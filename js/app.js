window.CONNECTION_STATUSES = {
    DISCONNECTED: 0,
    CONNECTED: 1,
    CANCELLED: 2,
    FAILED: 3,
    PENDING: 4,
};
window.app = {
    bluetooth: {
        connectionStatus: CONNECTION_STATUSES.DISCONNECTED,
        connectedDevice: {
            device: null,
            service: null,
            characteristic: null
        },
    }
};
