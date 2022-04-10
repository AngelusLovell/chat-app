const rooms = []

/*		add rooms		*/
const createRoom = (roomName) => {
	rooms.push(roomName)
	return { roomName }
}

const getRoom = (roomName) => {
	const isAvailable = rooms.indexOf(roomName)
	if(isAvailable != -1) {
		return roomName
	}
}

/*		get rooms		*/
const getAllRooms = () => {
	return rooms;
}

const deleteRoom = (roomName) => {
	const roomIndex = rooms.indexOf(roomName)
	if(roomIndex != -1) {
		return rooms.splice(roomIndex, 1)[0]
	}
}

module.exports = {
	createRoom,
	getAllRooms,
	getRoom,
	deleteRoom
}