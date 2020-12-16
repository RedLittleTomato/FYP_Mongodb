const config = {
  production: {
    SECRET: process.env.SECRET_KEY,
    DATABASE: process.env.MONGODB_URI
  },
  default: {
    SECRET: 'mysecretkey',
    // DATABASE: 'mongodb://localhost:27017/fyp_project' // ==> local
    DATABASE: 'mongodb+srv://dbUser:dbUser@cluster.disne.mongodb.net/dbUser?retryWrites=true&w=majority', // ==> cloud (altis) - singapore
    // DATABASE: 'mongodb+srv://dbUser:dbUser@cluster.7qiyo.mongodb.net/dbUser?retryWrites=true&w=majority'// ==> cloud (altis) - us, virginia
  }
}

exports.get = function get(env) {
  return config[env] || config.default
}