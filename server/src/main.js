'use strict';

const url = require('url');
const WebSocket = require('ws');
const LifeGameVirtualDom = require('../lib/LifeGameVirtualDom');

const wss = new WebSocket.Server({ port: 8080 });

LifeGameVirtualDom.prototype.sendUpdates = function(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'UPDATE_STATE',
                data: data
            }));
        }
    });  
};

const LifeGame = new LifeGameVirtualDom();

wss.on('connection', (ws, req) => {
    const {token} = url.parse(req.url, true).query;

    ws.on('message', message => {
        const {type, data} = JSON.parse(message);
        switch(type) {
            case 'ADD_POINT':
                LifeGame.applyUpdates(data);
            break;
        }
    });

    ws.onerror = error => {
        console.log(`Ошибка ${error.message}`);
    };
    
    ws.send(JSON.stringify({
        type: 'INITIALIZE',
        data: {
            state: LifeGame.state,
            settings: LifeGame.settings,
            user: {
                token: token, 
                color: '#'+(Math.random()*0xFFFFFF<<0).toString(16)
            }
        }
    }));
});