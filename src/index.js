const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/message')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app) // !imp - Right after the express()
const io = socketio(server)

const port = process.env.PORT
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
	
	socket.on('join', (options, callback) => {
		const { error, user } = addUser({ id: socket.id, ...options })
		
		if(error) {
			return callback(error)
		}
		
		socket.join(user.room)
		
		// when a new user joins
		socket.emit('message', generateMessage('Welcome to the chat-app', 'Admin'))
		socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`, 'Admin'))
		io.to(user.room).emit('roomData', {
			room : user.room,
			users : getUsersInRoom(user.room)
		})
		
		callback()
	})
	
	
	// when a user leaves
	socket.on('disconnect', () => {
		const user = removeUser(socket.id)
		
		if(user) {
			io.to(user.room).emit('message', generateMessage(`${user.username} has left!`, 'Admin'))
			io.to(user.room).emit('roomData', {
				room : user.room,
				users : getUsersInRoom(user.room)
			})
		}
	})
	
	// Normal message
	socket.on('sendMsg', (message, callback) => {
		const user = getUser(socket.id)
		
		
		const filter = new Filter()
		if(filter.isProfane(message)) {
			return callback('Profanity is not allowed!')
		}
		
		io.to(user.room).emit('message', generateMessage(message, user.username))
		callback()
	})
	
	// Share location
	socket.on('sendLocation', (location, callback) => {
		const user = getUser(socket.id)
		const url = `https://google.com/maps?q=${location.latitude},${location.longitude}`
		
		io.to(user.room).emit('location',  generateLocationMessage(url, user.username))
		callback()
	})
})

server.listen(port, () => {
	console.log(`Server is up on port ${port}!`)
})