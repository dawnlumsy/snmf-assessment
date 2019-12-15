module.exports = [
    {
        context: ['/api'],
        //context: ['**'],        
        target: 'http://localhost:3000',
        secure: false,
        logLevel: 'debug'
    }
]