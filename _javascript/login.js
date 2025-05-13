function getLoginToken() {
	 //$.get("http://localhost:4848/user/login/github", (data, status, xhr) => {
	//	if (status != "success") {
	//		console.error("Failed to get the login token")
	//		return
	//	}

	//	console.log("Redirecting to Github OAuth:", data)
	//	window.location.href = data.trim()
	//})
	window.location.href = "http://localhost:4848/user/login/github";
}
