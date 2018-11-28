const hapi = require('hapi');
const mongoose = require('mongoose');
const routes = require('./routes/index')
/* swagger section */
const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');
const Pack = require('./package');

mongoose.connect('mongodb://test:test123@ds159263.mlab.com:59263/db196',{ useNewUrlParser: true });

mongoose.connection.once('open',() =>{
    // console.log('connected to database');
});

const server = hapi.server({
    port: 6007,
});

const init = async () => {

    await server.register([
		Inert,
		Vision,
		{
			plugin: HapiSwagger,
			options: {
				// host:'pda-chain.huntor.cn:10084',
				// schemes: ['https'],
				info: {
					title: 'Paintings API Documentation',
					version: Pack.version
				}
			}
		}
    ]);
    
    server.route(routes);
    await server.start();
    // console.log('Server running at: ' + server.info.uri);
};

init();




var Web3 = require('web3');
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider("http://127.0.0.1:8545"));
 
var version = web3.version.node;
console.log(version);
 