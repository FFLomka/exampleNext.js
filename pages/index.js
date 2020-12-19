import React, { useEffect, useState } from 'react'
import io from 'socket.io-client'

// const socket = io()
export default function Index({ resultText, randText }) { //

	const [value, setValue] = useState(randText)
	const [result, setResult] = useState(resultText)
	const [socket, setSocket] = useState()
	// const [socket, setSocket] = useState(io())
	if (socket) {
		socket.on('connect', () => { socket.send('DRAWQQ!') })
		socket.on('message', (data) => { console.log(data) })
		socket.on('result', (data) => { setResult(data.data) })
		socket.on('err', (data) => { setResult(data.data) })
	}
	function requry(e) {
		e.preventDefault();
		if (value.trim()) {
			if (socket) {
				socket.emit('query', value.trim())
			}
		}
	}

	useEffect(() => {
		setSocket(io())
	}, [])


	return (
		<>
			<div>
				<h3>Запрос da-data</h3>
				<form onSubmit={requry}>
					<input
						onChange={(e) => { setValue(e.target.value) }}
						value= {value}
					/>
					<button style={{marginLeft: '5px'}}>
						Запрос
					</button>
				</form>
				<div>
					<pre>{JSON.stringify(JSON.parse(result), null, 4)}</pre>
				</div>
			</div>
		</>
	)
}

Index.componentDidMount = async () => {
	
}

Index.getInitialProps = async (req) => {
	const rand = await fetch(`${process.env.API_URL}/api/random`)
	const randText = await rand.text()

	const response = await fetch(process.env.DADATA_URL, {
		method: "POST",
		mode: "cors",
		headers: {
			"Content-Type": "application/json",
			"Authorization": "Token " + process.env.TOKEN,
			"X-Secret": process.env.SECRET
		},
		body: JSON.stringify([randText])
	})
	const resultText = await response.text()

	return {resultText, randText}

}