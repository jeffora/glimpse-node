function createApplication () {
    console.log('Creating application');
    return {
        localMethod: function () { console.log('local method on app'); }
    }
}

createApplication.extraMethod = function () {
    console.log('Extra method');
}

module.exports = createApplication;