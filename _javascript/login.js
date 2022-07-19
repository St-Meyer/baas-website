function getLoginToken() {
	$.get("http://localhost:4848/user/login/github", (data, status, xhr) => {
		if (status != "success") {
			console.error("Failed to get the login token")
		}
		
		console.log(status)
		let uri = data.slice(25)
		window.location.href = uri
	})
}
