const logger = {
  info: (message, data) => {
    if (data && Object.keys(data).length > 0) {
      console.log(`[INFO]: ${message}`, data);
    } else {
      console.log(`[INFO]: ${message}`);
    }
  },
  
  error: (message, data) => {
    if (data && Object.keys(data).length > 0) {
      console.error(`[ERROR]: ${message}`, data);
    } else {
      console.error(`[ERROR]: ${message}`);
    }
  },
  
  warn: (message, data) => {
    if (data && Object.keys(data).length > 0) {
      console.warn(`[WARN]: ${message}`, data);
    } else {
      console.warn(`[WARN]: ${message}`);
    }
  },
  
  security: (event, data) => {
    console.warn(`[SECURITY]: ${event}`, data || {});
  }
};

module.exports = logger;
