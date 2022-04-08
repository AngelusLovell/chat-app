const socket = io()

// elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location-btn')
const $messages = document.querySelector('#message-window')


// templates
const messageTemplate = document.querySelector("#message-template").innerHTML
const locationTemplate = document.querySelector("#location-message-template").innerHTML
const roomInfoTemplate = document.querySelector("#room-info-template").innerHTML

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

socket.on('location', (location) => {
	const html = Mustache.render(locationTemplate, { 
		owner: location.owner,
		url: location.url,
		createdAt: moment(location.createdAt).format('h:mm a')
	})
	$messages.insertAdjacentHTML('beforeend', html)
})

socket.on('roomData', ({ room, users }) => {
	const html = Mustache.render(roomInfoTemplate, {
		room,
		users
	})
	
	document.querySelector('.room-info').innerHTML = html
})


// normal message
$messageForm.addEventListener('submit', (e) => {
	e.preventDefault()
	
	$messageFormButton.setAttribute('disabled', 'disabled')
	
	const message = $messageFormInput.value
	socket.emit('sendMsg', message, (error) => {
		$messageFormInput.value = ''
		$messageFormButton.removeAttribute('disabled')
		$messageFormInput.focus()
		
		if(error) {
			return console.log(error)
		}
		
		console.log('Message delivered!')
	})
})


// sharing location
$sendLocationButton.addEventListener('click', (e) => {
	if(!navigator.geolocation) {
		return alert('Geolocation is not supported in your browser!')
	}
	
	$sendLocationButton.setAttribute('disabled', 'disabled')
	navigator.geolocation.getCurrentPosition(({coords}) => {
		socket.emit('sendLocation', {
			latitude : coords.latitude,
			longitude : coords.longitude 
		}, () => {
			$sendLocationButton.removeAttribute('disabled')
			console.log('Location shared')
		})
	})
})

socket.emit('join', { username, room }, (error) => {
	if(error) {
		alert(error)
		location.href = '/'
	}
})