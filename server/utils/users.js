class Users {
    constructor() {
        this.users = [];
    }

    addUser(id, name, roomName) {
        const user = {id, name, roomName};
        this.users.push(user);
        return user;
    }

    removeUser(id) {
        const user = this.getUser(id);

        if (user) {
            this.users = this.users.filter(user => user.id !== id);
        }

        return user;
    }

    getUser(id) {
        return this.users.find(user => user.id === id);
    }

    getUserList(roomName) {
        const users = this.users.filter(user => user.roomName === roomName);
         const usersNameArray = users.map(user => {
            return user.name;
         });

         return usersNameArray;
    }
}

module.exports = Users;