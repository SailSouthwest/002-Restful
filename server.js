///
/// Simple demonstration node.js server using express.
///
'use strict';
var SqlConfiguration = { user:'your-username', password:'your-password', server:'199.103.60.77', database:'your-database' }
var Express = require('express'); 	// Express is a minimalist web framework for Node.js.
var Sql = require('mssql'); 			// MSSQL is a Microsoft SQL Server client for Node.js.
var App = Express();

///
/// Start server and listen on http://localhost:8888/
///
var WebServer = App.listen(8888, function () {
	let Host = WebServer.address().address
	let Port = WebServer.address().port
	console.log("Your express web server is listening at http://%s:%s.", Host, Port)
});

///
/// Create a new MSSQL connection using the configuration above.
///
const Connection = new Sql.ConnectionPool(SqlConfiguration)

/// 
/// Implement a route handler promise.
///
App.get('/students', function (Request, Response) {

	// Strike the connection to the database server, using a promise that resolves with a connection pool instance.
	// Then carry out an async SQL query and return the result as JSON.
	Connection.connect().then(pool => {

		let SqlStatement = 'SELECT * FROM TStudents';
		return pool.request().query(SqlStatement);

	}).then(result => {

		let Rows = result.recordset;
		Response.setHeader('Access-Control-Allow-Origin', '*');
		Response.status(200).json(Rows);

	}).catch(err => {

		console.error(err);
		Response.status(500).send({ message: "${err}" })

	}).then(() => {

		Connection.close();

	});

});

///
/// Implement a parameterized route handler promise.
///
App.get('/student/:StudentId/', function (Request, Response) {

	// Strike the connection to the database server, using a promise that resolves with a connection pool instance.
	// Then carry out an async SQL query and return the result as JSON.
	Connection.connect()

		.then(function () {

			const SqlRequest = new Sql.Request(Connection); 				// Create a Sql request.
			SqlRequest.input("StudentId", Request.params.StudentId);		// Set up the request parameters.
			SqlRequest.execute("PGetStudent")									// Identify the stored procedure.

				.then(result => {
					let rows = result.recordset
					Response.setHeader('Access-Control-Allow-Origin', '*')
					Response.status(200).json(rows);

				}).catch(err => {
					console.log(err);
					Response.status(500).send({ message: "${err}" })

				}).then(() => {

					Connection.close();

				});

		})

});