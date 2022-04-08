const users = []


/*     add users    */
const addUser = ({ id, username, room }) => {
	// clean the data
	username = username.trim()
	room = room.trim().toLowerCase()
	
	// validate the data
	if(!username || !room) {
		return {
			error: 'Username and room are required!'
		}
	}
	
	// check for existing user
	const existingUser = users.find((user) => {
		return user.username.toLowerCase() === username.toLowerCase() && user.room === room
	})
	
	// validate username
	if(existingUser) {
		return {
			error: 'Username is already in use!'
		}
	}
	
	// add username
	const user = { id, username, room }
	users.push(user)
    return { user }
}

/*		remove user		*/
const removeUser = (id) => {
	const index = users.findIndex((user) => user.id === id)
	
	if(index !== -1) {
		return users.splice(index, 1)[0]
	}
}

/*		get user		*/
const getUser = (id) => {
	
	const user = users.find((user) => {
		return user.id === id
	})
	
	return user
}

/*		get all the users in a room		*/
const getUsersInRoom = (room) => {
	room = room.trim().toLowerCase()
	return users.filter((user) => {
		return user.room === room
	})
}


module.exports = {
	addUser,
	removeUser,
	getUser,
	getUsersInRoom
}