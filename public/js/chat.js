const socket = io()
const userDeviceWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width


// elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $messages = document.querySelector('#message-window')


// templates
const messageTemplate = document.querySelector("#message-template").innerHTML
const roomDataTemplate = document.querySelector("#room-data-template").innerHTML

// options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

// function
const autoScroll = () => {
	const $newMessage = $messages.lastElementChild
	const newMessageStyles = getComputedStyle($newMessage)
	const newMessageMargin = parseInt(newMessageStyles.marginTop) + parseInt(newMessageStyles.marginBottom)
	const visibleHeight = $messages.offsetHeight
	const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
	const containerHeight = $messages.scrollHeight
	const scrollOffset = $messages.scrollTop + visibleHeight
	
	if(containerHeight - newMessageHeight <= scrollOffset) {
		$messages.scrollTop = containerHeight
		console.log('autoscroll called!')
	}
}


// chat 
socket.on('message', (message) => {
	const html = Mustache.render(messageTemplate, { 
		owner: message.owner,
		message: message.text,
		createdAt: moment(message.createdAt).format('h:mm a')
	})
	
	$messages.insertAdjacentHTML('beforeend', html)
	autoScroll()
})


socket.on('roomData', ({ room, users }) => {
	if(users.length > 4) {
		users.length = 4
	}
	
	const html = Mustache.render(roomDataTemplate, {
		room,
		users
	})
	
	document.querySelector('.room-data-conatiner').innerHTML = html
})


// normal message
$messageForm.addEventListener('submit', (e) => {
	e.preventDefault()
	
	$messageFormButton.setAttribute('disabled', 'disabled')
	
	const message = $messageFormInput.value
	socket.emit('sendMsg', message, (error) => {
		$messageFormInput.value = ''
		$messageFormButton.removeAttribute('disabled')
		if(userDeviceWidth > 600 ) {
			$messageFormInput.focus()
		}
		
		if(error) {
			return console.log(error)
		}
		
		console.log('Message delivered!')
	})
})



socket.emit('join', { username, room }, (error) => {
	if(error) {
		alert(error)
		location.href = '/'
	}
})