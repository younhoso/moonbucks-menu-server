const store = {
    setLocalStorage(name, val) {
        typeof(Storage) !== 'undefined' && localStorage.setItem(name, JSON.stringify(val));
    },
    getLocalStorage(name) {
       return JSON.parse(localStorage.getItem(name));
    }
};

export default store;