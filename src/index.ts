//import { Server } from "./server";
const config = require('./restapi/config');
const logger = require('./restapi/logger');
const ExpressServer = require('./restapi/expressServer');
//const server = new Server(8008);
//server.StartServerAsync();


const launchRestAPIServer = async () => {
  try {
    let expressServer = new ExpressServer(config.URL_PORT, config.OPENAPI_YAML);
    expressServer.launch();
    logger.info('Express server running');
  } catch (error) {
    logger.error('Express Server failure', error);
    await close();
  }
};

launchRestAPIServer().catch(e => logger.error(e));
