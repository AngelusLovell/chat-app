const generateMessage = (text, owner) => {
	return {
		owner,
		text,
		createdAt: new Date().getTime()
	}
}

module.exports = {
	generateMessage
}