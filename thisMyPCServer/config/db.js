let db  = {
	//Mongo DB 
	host:"*****", // web site  for  DB
	dbName: "****", //Data base name
	password: "***",
	user: "****",
	mongodbType:"atlas", // atlas , localhost 
	parameter:"?retryWrites=true&w=majority", // parameters 
}

// db connection Url
let url;
if(db.mongodbType=="atlas"){
	url =`mongodb+srv://${db.user}:${db.password}@${db.host}/${db.dbName}${db.parameter}`;
}

if(db.mongodbType=="localhost"){
	url =`mongodb://${db.user}:${db.password}@${db.host}/${db.dbName}`;
}

module.exports = url;
