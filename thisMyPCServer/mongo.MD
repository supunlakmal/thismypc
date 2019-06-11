# MongoDB Commands Cheatsheet

```db.help()                    help on db methods
db.mycoll.help()             help on collection methods
sh.help()                    sharding helpers
rs.help()                    replica set helpers
help admin                   administrative help
help connect                 connecting to a db help
help keys                    key shortcuts
help misc                    misc things to know
help mr                      mapreduce

show dbs                     show database names
show collections             show collections in current database
show users                   show users in current database
show profile                 show most recent system.profile entries with time >= 1ms
show logs                    show the accessible logger names
show log [name]              prints out the last segment of log in memory, 'global' is default
use <db_name>                set current database
db.foo.find()                list objects in collection foo
db.foo.find( { a : 1 } )     list objects in foo where a == 1
it                           result of the last line evaluated; use to further iterate
DBQuery.shellBatchSize = x   set default number of items to display on shell
exit                         quit the mongo shell```

```db.adminCommand(nameOrDocument) - switches to 'admin' db, and runs command [ just calls db.runCommand(...) ]
db.auth(username, password)
db.cloneDatabase(fromhost)
db.commandHelp(name) returns the help for the command
db.copyDatabase(fromdb, todb, fromhost)
db.createCollection(name, { size : ..., capped : ..., max : ... } )
db.createUser(userDocument)
db.currentOp() displays currently executing operations in the db
db.dropDatabase()
db.eval() - deprecated
db.fsyncLock() flush data to disk and lock server for backups
db.fsyncUnlock() unlocks server following a db.fsyncLock()
db.getCollection(cname) same as db['cname'] or db.cname
db.getCollectionInfos([filter]) - returns a list that contains the names and options of the db's collections
db.getCollectionNames()
db.getLastError() - just returns the err msg string
db.getLastErrorObj() - return full status object
db.getLogComponents()
db.getMongo() get the server connection object
db.getMongo().setSlaveOk() allow queries on a replication slave server
db.getName()
db.getPrevError()
db.getProfilingLevel() - deprecated
db.getProfilingStatus() - returns if profiling is on and slow threshold
db.getReplicationInfo()
db.getSiblingDB(name) get the db at the same server as this one
db.getWriteConcern() - returns the write concern used for any operations on this db, inherited from server object if set
db.hostInfo() get details about the server's host
db.isMaster() check replica primary status
db.killOp(opid) kills the current operation in the db
db.listCommands() lists all the db commands
db.loadServerScripts() loads all the scripts in db.system.js
db.logout()
db.printCollectionStats()
db.printReplicationInfo()
db.printShardingStatus()
db.printSlaveReplicationInfo()
db.dropUser(username)
db.repairDatabase()
db.resetError()
db.runCommand(cmdObj) run a database command.  if cmdObj is a string, turns it into { cmdObj : 1 }
db.serverStatus()
db.setLogLevel(level,<component>)
db.setProfilingLevel(level,<slowms>) 0=off 1=slow 2=all
db.setWriteConcern( <write concern doc> ) - sets the write concern for writes to the db
db.unsetWriteConcern( <write concern doc> ) - unsets the write concern for writes to the db
db.setVerboseShell(flag) display extra information in shell output
db.shutdownServer()
db.stats()
db.version() current version of the server```

```db.User.find().help() - show DBCursor help
db.User.bulkWrite( operations, <optional params> ) - bulk execute write operations, optional parameters are: w, wtimeout, j
db.User.count( query = {}, <optional params> ) - count the number of documents that matches the query, optional parameters are: limit, skip, hint, maxTimeMS
db.User.copyTo(newColl) - duplicates collection by copying all documents to newColl; no indexes are copied.
db.User.convertToCapped(maxBytes) - calls {convertToCapped:'User', size:maxBytes}} command
db.User.createIndex(keypattern[,options])
db.User.createIndexes([keypatterns], <options>)
db.User.dataSize()
db.User.deleteOne( filter, <optional params> ) - delete first matching document, optional parameters are: w, wtimeout, j
db.User.deleteMany( filter, <optional params> ) - delete all matching documents, optional parameters are: w, wtimeout, j
db.User.distinct( key, query, <optional params> ) - e.g. db.User.distinct( 'x' ), optional parameters are: maxTimeMS
db.User.drop() drop the collection
db.User.dropIndex(index) - e.g. db.User.dropIndex( "indexName" ) or db.User.dropIndex( { "indexKey" : 1 } )
db.User.dropIndexes()
db.User.ensureIndex(keypattern[,options]) - DEPRECATED, use createIndex() instead
db.User.explain().help() - show explain help
db.User.reIndex()
db.User.find([query],[fields]) - query is an optional query filter. fields is optional set of fields to return.
					      e.g. db.User.find( {x:77} , {name:1, x:1} )
db.User.find(...).count()
db.User.find(...).limit(n)
db.User.find(...).skip(n)
db.User.find(...).sort(...)
db.User.findOne([query], [fields], [options], [readConcern])
db.User.findOneAndDelete( filter, <optional params> ) - delete first matching document, optional parameters are: projection, sort, maxTimeMS
db.User.findOneAndReplace( filter, replacement, <optional params> ) - replace first matching document, optional parameters are: projection, sort, maxTimeMS, upsert, returnNewDocument
db.User.findOneAndUpdate( filter, update, <optional params> ) - update first matching document, optional parameters are: projection, sort, maxTimeMS, upsert, returnNewDocument
db.User.getDB() get DB object associated with collection
db.User.getPlanCache() get query plan cache associated with collection
db.User.getIndexes()
db.User.group( { key : ..., initial: ..., reduce : ...[, cond: ...] } )
db.User.insert(obj)
db.User.insertOne( obj, <optional params> ) - insert a document, optional parameters are: w, wtimeout, j
db.User.insertMany( [objects], <optional params> ) - insert multiple documents, optional parameters are: w, wtimeout, j
db.User.mapReduce( mapFunction , reduceFunction , <optional params> )
db.User.aggregate( [pipeline], <optional params> ) - performs an aggregation on a collection; returns a cursor
db.User.remove(query)
db.User.replaceOne( filter, replacement, <optional params> ) - replace the first matching document, optional parameters are: upsert, w, wtimeout, j
db.User.renameCollection( newName , <dropTarget> ) renames the collection.
db.User.runCommand( name , <options> ) runs a db command with the given name where the first param is the collection name
db.User.save(obj)
db.User.stats({scale: N, indexDetails: true/false, indexDetailsKey: <index key>, indexDetailsName: <index name>})
db.User.storageSize() - includes free space allocated to this collection
db.User.totalIndexSize() - size in bytes of all the indexes
db.User.totalSize() - storage allocated for all data and indexes
db.User.update( query, object[, upsert_bool, multi_bool] ) - instead of two flags, you can pass an object with fields: upsert, multi
db.User.updateOne( filter, update, <optional params> ) - update the first matching document, optional parameters are: upsert, w, wtimeout, j
db.User.updateMany( filter, update, <optional params> ) - update all matching documents, optional parameters are: upsert, w, wtimeout, j
db.User.validate( <full> ) - SLOW
db.User.getShardVersion() - only for use with sharding
db.User.getShardDistribution() - prints statistics about data distribution in the cluster
db.User.getSplitKeysForChunks( <maxChunkSize> ) - calculates split points over all chunks and returns splitter function
db.User.getWriteConcern() - returns the write concern used for any operations on this collection, inherited from server/db if set
db.User.setWriteConcern( <write concern doc> ) - sets the write concern for writes to the collection
db.User.unsetWriteConcern( <write concern doc> ) - unsets the write concern for writes to the collection
```
