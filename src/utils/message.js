const generateMessage = (text, owner) => {
	return {
		owner,
		text,
		createdAt: new Date().getTime()
	}
}

const generateLocationMessage = (url, owner) => {
	return {
		owner,
		url,
		createdAt: new Date().getTime()
	}
}

module.exports = {
	generateMessage,
	generateLocationMessage
}