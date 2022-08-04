const icons = {
	"system": "fa-desktop",
	"temporary": "fa-hourglass",
	"temporal": "fa-archive",
	"user": "fa-circle-user",
	"base": "fa-atom",
};

function getImageInfo(image) {
	return  `
<tr>
  <td>${image.Image.Name}</td><td>${image.Image.Type}</td> <td>${image.UUIDImage}</td>
  <td>${image.VersionNumber}</td><td>${image.Update}</td>
</tr>`;
}

function getImageTable(images) {
	return `
<div class="table-container image-box-table" hidden="true">
  <table class="table is-small">
	<thead>
		<tr>
			<th>Name</th>
			<th>Type</th>
			<th>UUID</th>
			<th>Version</th>
			<th>Update</th>
		</tr>
	</thead>
	<tbody>
       ${images.map(getImageInfo).join("")}
	</tbody>
 </table>
</div> `;
}

function getImageEntry(image) {
	return `
<li>
    <span class="fa-li"><i class="fa-solid ${icons[image.Type.toLowerCase()]}"></i></span>
    ${image.Name}
</li>`;
}

function getNameTable(images) {
	return `
<ul class="name-list fa-ul" style="list-style: none;">
    ${images.map(x => getImageEntry(x.Image)).join("")}
</ul> `;
}

function getImageBlock(images) {
	if (images === null || images === undefined || images.length === 0)
		return "";
	
	return `
<div class="image-block">
    <label class="label">Images
        <span class="icon" onclick="expandImages(this)">
            <i class="fas fa-chevron-up mu-3"></i>
        </span>        
    </label>

    <div class="setup-image-box">
        <div class="tabs setup-image-box-select">
		    <li class="is-active"><a onclick="switchImageBox(this);">Simple</a></li>
		    <li><a onclick="switchImageBox(this);">Detailed</a></li>
	    </div>
							
	    ${getImageTable(images)}
        ${getNameTable(images)}
    </div>
</div> `;
	
}

function getImageSetup (imageSetup) {
	if (imageSetup === undefined) return "";
	const htmlText = `
<div class="column is-one-quarter">
	<div class="card">
		<div class="card-content">
			<div class="title image-setup-name" autocorrect=off autocomplete=off
				 contentEditable=true>${imageSetup.Name}</div>
			<hr>
			<div class="content">
				<label class="label">UUID</label>
				<span id="image-setup-uuid" class="has-text-dark modal-field">${imageSetup.UUID}</span>
                <label class="label">User</label>
				<span id="image-setup-username" class="has-text-dark modal-field">${imageSetup.Username}</span>
                      ${getImageBlock(imageSetup.Images)}
			</div>
			<footer class="card-footer">
				<div class="columns is-multiline">
                    <div class="column">
                        <a class="card-footer-item" onclick="launchAddImageModal(this)">Add Image</a>
                    </div>
                    <div class="column">
                        <a class="card-footer-item" onclick="launchImageSetup(this)">Launch</a>
                    </div>
					<div class="column">
						<a class="card-footer-item" onclick="deleteImageSetup(this)>Delete</a>
					</div>
					<div class="column">
						<a class="card-footer-item" onclick="updateImageSetup(this)">Update</a>
					</div>
				</div>
			</footer>
		</div>
	</div>
</div>`;
	return convertText(htmlText);
}

function getImageSetups() {
	let imageSetups = document.getElementById("image-setup-list");
	
	sendMessage(`/user/${username}/image_setups`, "GET", data => {
		imageSetups.replaceChildren(...data.map(getImageSetup));
	});
}

function expandImages(event) {
	let table = recurseChild(findParent(event, "content"), "setup-image-box");
	toggleChevron(findChild(event, "fas"));
	table.hidden = !table.hidden;
}

function switchImageBox(event) {
	if (event.classList.contains("is-active")) {
		return;
	}

	let tabs = findParent(event, "tabs");
	Array.from(tabs.children).forEach(x => x.classList.remove("is-active"));
	event.parentElement.classList.toggle("is-active");

	let imageBox = findParent(event, "setup-image-box");
	let table = findChild(imageBox, "table-container");
	table.hidden = event.textContent !== "Detailed";

	let name = findChild(imageBox, "name-list");
	name.hidden = event.textContent !== "Simple";
}

function addImageSetup() {
	let imageSetup = {
		"Name": prompt("Name of setup"),
	};

	sendMessageData(`/user/${username}/image_setup`, "POST", imageSetup, data => {
		let imageSetup = getImageSetup(data);
		document.getElementById("image-setup-list").appendChild(imageSetup);
	});
}

function selectMachineModelItem(setupUuid, machine) {
	const newItem = `
<div class="machine-modal-item">
    <div class="block is-fullwidth" onclick="callbackSelectMachine(this)">
         <span class="image-list-label"
               data-setup=${setupUuid} data-machine=${machine.MacAddress.Address}>
             ${machine.Name}
         </span>
         <hr>
    </div>
</div>
`;
	return convertText(newItem);
}

function callbackSelectMachine(event) {
	let label = findChild(event, "image-list-label");
	let mac = label.dataset.machine;
	let setup = label.dataset.setup;

	sendMessageData(`/machine/${mac}/boot`, "POST", {"SetupUUID": setup}, data => {
		closeAllModals();
	});
}

function launchImageSetup(event) {
	let cardContent = findParent(event, "card-content");
	let imageSetupUuid = findChild(findChild(cardContent, "content"), "image-setup-uuid").textContent;

	sendMessage(`/machines`, "GET", data => {
		let machineList = document.getElementById("select-machine-list");
		machineList.replaceChildren(...data.map(machine => selectMachineModelItem(imageSetupUuid, machine)));
		findChild(machineList.lastChild, "block").children[1].remove();
		openModal(document.getElementById("select-machine-modal"));
	});
}

function getImageAddItem(image) {
	const newImageItem = `
<div class="image-add-item">
	<div class="block is-fullwidth image-add-list-block" >
		<span class="image-list-label" data-uuid=${image.UUID}>${image.Name}</span>
		<span onclick="addImageToSetup(this)" class="icon image-list-icon"><i class="fas fa-plus"></i></span>
	</div>
	<hr>
</div> `;
	return convertText(newImageItem);
}

function addImageToSetup(event) {
	let imageSetupUuid = document.getElementById('add-new-image-setup-modal')
		.dataset.target;	
	let imageUuid = findChild(findParent(event, "image-add-list-block"), "image-list-label")
		.dataset.uuid;
	let imageSetup = {
		"Uuid": imageUuid,
		"Version": 1
	};

	sendMessageData(`/user/${username}/image_setup/${imageSetupUuid}/images`, "POST", imageSetup, data => {
		// Create a new imageBlock, find the old one and replace it
		let image = Array.from(document.getElementsByClassName("image-setup-name"))
			.filter(item => item.textContent === data.Name)[0];
		let content = findChild(findParent(image, "card-content"), "content");
		let imageBlock = findChild(content, "image-block");
		let newImageBlock = convertText(getImageBlock(data.Images));

		// Either add a new block or replace the old one
		if (imageBlock === undefined || imageBlock === null) {
			content.appendChild(newImageBlock);
		} else {
			content.replaceChild(newImageBlock, findChild(content, "image-block"));
		}

		closeAllModals();
	});
}

function launchAddImageModal(event) {
	// Find the stored UUID so we don't have to do more lookup JS magic.
	let modal = document.getElementById('add-new-image-setup-modal');
	let cardContent = findParent(event, "card-content");
	modal.dataset.target = findChild(findChild(cardContent, "content"), "image-setup-uuid").textContent;

	// Find all the images that are part of this setup
	let nameList = findChild(recurseChild(cardContent, "setup-image-box"), "name-list");
	let names = [];
	if (nameList !== undefined && nameList !== null) {
		names = Array.from(nameList.children).map(image => image.textContent.trim());
	} 

	// Clear all the image list of the modal to avoid duplicates
	$(".image-add-items").children().remove();
	
	sendMessage(`/user/${username}/images`, "GET", (data) => {
		// Remove all the images that are already a part of this seutp
		data.filter(image => !(names.find(name => name === image.Name)))
			.forEach(image => $("#" + image.Type.toLowerCase() + "-image-list")
					 .append(getImageAddItem(image)));
		
		openModal(modal);
	});
	
}

function switchTab(event) {
	// Disable active tabs and set the current one
	Array.from($("#image-list-tabs").children()[0].children).
		forEach(label => label.classList.remove("is-active"));

	event.classList.toggle("is-active");

	// Hide all lists, but show the selected one.
	$(".image-add-items").forEach(list => list.hidden = true);
	$("#" + event.dataset.type + "-image-list")[0].hidden = false;
}

function deleteImageSetup(event) {
	let imageSetupUuid = document.getElementById('add-new-image-setup-modal')
		.dataset.target;	
	let imageUuid = findChild(findParent(event, "image-add-list-block"), "image-list-label")
		.dataset.uuid;
	

	sendMessage(`/user/${username}/image_setup/${imageSetupUuid}`, "DELETE",d, data => {
	});
}
