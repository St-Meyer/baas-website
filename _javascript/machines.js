function getNewMachine(machine) {
	const newMachine = `
		<div class="column is-one-third">
			<div class="card">
				<div class="card-content">
					<div class="title" autocorrect=off autocomplete=off contentEditable=true id="#machine-id">${machine.Name}</div>
					<hr>
					<div class="content">
						<label class="label">Architecture</label>
						<span id="machine-architecture" class="has-text-dark modal-field">${machine.Architecture}</span>
						<label class="label">Managed</label>
						<label class="checkbox">
							<input type="checkbox" class="machine-checkbox" id="machine-managed"
                                   ${machine.Managed ? "checked" : ""}>
						</label>
						<label class="label">MacAddress</label>
						<span id="machine-mac-address" class="has-text-dark modal-field">${machine.MacAddress.Address}</span>
					</div>
					<footer class="card-footer">
						<div class="columns is-multiline">
							<div class="column">
								<a href="#" class="card-footer-item">Delete</a>
							</div>
							<div class="column">
								<a class="card-footer-item" onclick="updateMachine(this)">Update</a>
							</div>
                            <div class="column">
                                <a class="card-footer-item" onclick="downloadMachineImage(this)">Download</a>
                            </div>
						</div>
					</footer>
				</div>
			</div>
		</div>
`

	let temp = document.createElement('div');
	temp.innerHTML = newMachine;
	return temp.children[0];
}

function getMachines() {
	let machines = document.getElementById("machine-list");

	sendMessage(`/machines`, "GET", data => {
		machines.replaceChildren(...data.map(getNewMachine));
	})
}

function updateMachine(element) {
	let cardContent = findParent(element, "card-content")
	let elementList = findChild(cardContent, "content");

	let machine = {
		"Name": findChild(cardContent, "title").textContent,
		"Architecture": findChild(elementList, "machine-architecture").textContent,
		"Managed": findChild(findChild(elementList, "checkbox"), "machine-managed").checked,
		"MacAddress": {
			"Address": findChild(elementList, "machine-mac-address").textContent
		}
	};

	sendMessageData(`/machine`, "PUT", machine, x => x);
}

function addMachine(element) {
	let machine = {
		"Name": $("#machine-name-select").val(),
		"Architecture": getOption("#machine-architecture-select"),
		"Managed": $("#machine-managed-select")[0].checked,
		"MacAddress": {
			"Address": $("#machine-mac-select").val(),
		}
	};

	let input = confirm("Are you sure?");
	if (! input) return;

	sendMessageData(`/machine`, "POST", machine, data => {
		$("#machine-list").append(getNewMachine(machine));
		console.log(getNewMachine(machine));
	});
}

function downloadMachineImage(element) {
	let MAC = $("#machine-mac-select").val().trim();
	let link = document.createElement("a");

	link.download = `${MAC}.img`;
	link.href = `http://localhost:4848/user/ValentijnvdBeek/image/${MAC}`
	link.target = "_self"
	document.body.appendChild(link);
	link.click();
	link.remove();
}
