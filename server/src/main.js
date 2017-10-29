'use strict';

const url = require('url');
const WebSocket = require('ws');
const LifeGameVirtualDom = require('../lib/LifeGameVirtualDom');

const wss = new WebSocket.Server({ 
    port: 8080,
    verifyClient({req}, done) {
        const {token} = url.parse(req.url, true).query;
        if (token) {
            return done(token);
        }
        done(false);
    } 
});

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
   
    ws.on('message', message => {
        const {type, data} = JSON.parse(message);
        switch(type) {
            case 'ADD_POINT':
                LifeGame.applyUpdates(data);
            break;
            default:
                console.log(`Unexpected message type: ${type}`)
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
                token: url.parse(req.url, true).query.token, 
                color: '#'+(Math.random()*0xFFFFFF<<0).toString(16)
            }
        }
    }));
});
