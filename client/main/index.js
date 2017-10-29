'use strict';

App.setWSListeners = function(socket, gameController) {
    const self = this;

    gameController.prototype.send = function(data) {
        socket.send(JSON.stringify({type: 'ADD_POINT', data}));
    }

    socket.onopen = () => {
        console.log('Соединение установлено');
    };
      
    socket.onclose = event => {
        console.log(`Код: ${event.code} причина: ${event.reason}`);
    };
      
    socket.onmessage = (message) => { 
        const {type, data} = JSON.parse(message.data);
      
        switch(type) {
            case 'INITIALIZE':
                const {user, settings, state} = data;
                self.game = new gameController(user, settings);
                self.game.init();
            break;
            case 'UPDATE_STATE':
                self.game.setState(data);    
            break;
        }
    };
      
    socket.onerror = error => {
        console.log(`Ошибка ${error.message}`);
    };
}

App.onToken = function(token) {
    this.token = token;
    this.socket = new WebSocket(`ws://localhost:8080/?token=${this.token}`);
    this.setWSListeners(this.socket, LifeGame);
} 