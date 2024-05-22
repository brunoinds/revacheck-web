



export const websocketUrl = (() => {
    if (window.location.protocol == 'https:') {
        return 'wss://' + window.location.host + '/' + window.location.pathname.split('/')[1] + '/';
    }else{
        return 'ws://localhost:3000/';
    }
})();


export const apiEndpoint = (() => {
    if (window.location.protocol == 'https:') {
        return 'https://' + window.location.host + '/' + window.location.pathname.split('/')[1] + '/api';
    }else{
        return 'http://localhost:3000/api';
    }
})();