const NodeCache = require("node-cache");
const myCache = new NodeCache();
require("dotenv").config();
module.exports = {
  setCache: (key, value) => {
    myCache.set(key, value);
  },

  getCache: (key) => {
    return myCache.get(key);
  },
};

