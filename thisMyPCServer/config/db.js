let db = {
  //Mongo DB
  host: process.env.MONGO_DB_HOST, // web site  for  DB
  dbName: process.env.MONGO_DB_NAME, //Data base name
  password: process.env.MONGO_DB_PASSWORD,
  user: process.env.MONGO_DB_USER,
  mongodbType: process.env.MONGO_DB_TYPE, // atlas , localhost
  parameter: "?retryWrites=true&w=majority", // parameters
};

// db connection Url
let url;
if (db.mongodbType == "atlas") {
  url = `mongodb+srv://${db.user}:${db.password}@${db.host}/${db.dbName}${db.parameter}`;
}

if (db.mongodbType == "localhost") {
  url = `mongodb://${db.user}:${db.password}@${db.host}/${db.dbName}`;
}

module.exports = url;
