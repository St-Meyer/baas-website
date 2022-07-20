/// Functions to open and close a modal
var username = "";

function openModal($el) {
    $el.classList.add('is-active');
}

function closeModal($el) {
    $el.classList.remove('is-active');
}

function closeAllModals() {
    (document.querySelectorAll('.modal') || []).forEach(($modal) => {
		closeModal($modal);
    });
}

// Add a click event on buttons to open a specific modal
(document.querySelectorAll('.add-new-image-modal-trigger') || []).forEach(($trigger) => {
	console.log("test");
    const modal = $trigger.dataset.target;
    const $target = document.getElementById(modal);

    $trigger.addEventListener('click', () => {
		openModal($target);
    });
});

// Add a click event on various child elements to close the parent modal
(document.querySelectorAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button') || []).forEach(($close) => {
    const $target = $close.closest('.modal');

    $close.addEventListener('click', () => {
		closeModal($target);
    });
});

// Add a keyboard event to close all modals
document.addEventListener('keydown', (event) => {
    const e = event || window.event;

    if (e.keyCode === 27) { // Escape key
		closeAllModals();
    }
});

document.addEventListener('click', function(e) {
    closeDropdowns();
});

/*
 * Close dropdowns by removing `is-active` class.
 */
function closeDropdowns() {
	const dropdowns = document.querySelectorAll('.dropdown:not(.is-hoverable)');

	dropdowns.forEach(function(el) {
		el.classList.remove('is-active');
	});
}

// Close dropdowns if ESC pressed
document.addEventListener('keydown', function (event) {
  let e = event || window.event;
  if (e.key === 'Esc' || e.key === 'Escape') {
    closeDropdowns();
  }
});

function sendMessageData(uri, type, data, callback) {
	console.log(JSON.stringify(data));
	$.ajax({
		url: "http://localhost:4848" + uri,
		dataType: 'json',
		data: JSON.stringify(data),
		type: type,
		xhrFields: {
			withCredentials: true
		},
		crossDomain: true,
		success: callback,
		error: (xhr, type) => { console.log(xhr.response); }
	});
}

function sendMessage(uri, type, callback) {
	sendMessageData(uri, type, "", callback);
}

function getUserInfo() {
	sendMessage("/user/me", "GET", (data) => {
		username = data.Username;
		
		$("#user-name").text(data.Username + " (" + data.Name + ")");
		$("#user-email").text(data.Email);
		$("#user-role").text(data.Role);
	});
}

function getVersion(versions) {
	return versions
		.slice(0, versions.length-1)
		.map((version) =>
			`<a href="#" onclick="activateDropdownItem(event, this);" class="dropdown-item">${version.Version}</a> `)
	    .concat(`<a href="#" onclick="activateDropdownItem(event, this);" class="dropdown-item is-active">${versions[versions.length-1].Version}</a>`);
}

function getNewImage(image) {
	const new_image = `
<div class="column is-one-third">
  <div class="card image-card">
    <div class="card-content">
      <p class="title" id="#image-id">${image.Name}</p>
	  <div class="content" onclick="toggleDropdown(event, this);">
  	    <label class="label">UUID</label>
		<span id="image-uuid" class="has-text-dark">${image.UUID}</span>
		<label class="label">Disk Compression</label>
		<span id="image-disk-compression" class="has-text-dark">${image.DiskCompressionStrategy}</span>
		<label class="label">Image Filetype</label>
		<span id="image-disk-filetype" class="has-text-dark">${image.ImageFileType}</span>
		<label class="label">Type</label>
		<span id="image-type" class="has-text-dark">${image.Type}</span>
		<label class="label">Checksum</label>
		<span id="image-checksum" class="has-text-dark">${image.Checksum}</span>
        <label class="label">Versions</label>

        <div class="dropdown" onclick="toggleDropdown(event, this);">
          <div class="dropdown-trigger">
            <button class="button" aria-haspopup="true" aria-controls="dropdown-menu">
              <span class="image-name">${image.Versions[image.Versions.length-1].Version}</span>
              <span class="icon is-small">
                <i class="fas fa-angle-down" aria-hidden="true"></i>
              </span>
            </button>
          </div>
          <div class="dropdown-menu" id="dropdown-menu" role="menu">
            <div class="dropdown-content">
              ${getVersion(image.Versions).join("")}
			</div>
		  </div>
		</div>
	  </div>
      <footer class="card-footer">
        <div class="columns is-multiline">
          <div class="column">
             <a href="#" class="card-footer-item" onclick="downloadImage(this);">Download</a>
          </div>
          <div class="column">
		     <a href="#" class="card-footer-item" onclick="deleteImage(this);">Delete</a>
          </div>
          <div class="column">
             <a href="#" class="card-footer-item" onclick="launchImage(this);">Launch</a>
          </div>
          <div class="column">
             <a href="#" class="card-footer-item" onclick="uploadImage(this);">Upload</a>
          </div>
        </div>
      </footer>
	</div>
</div>
	`
	return new_image;
}

function getOption(id) {
	return $(id)[0].selectedOptions[0].value;
}

function addImage() {
	let image = {
		Name: $("#image-name-select").val(),
		DiskCompressionStrategy: getOption("#image-compression-select"),
		ImageFileType: getOption("#image-filetype-select"),
		Type: getOption("#image-type-select"),
		CheckSum: "",
		Versions: []
	};

	let input = confirm("Are you sure?");
	if (! input)
		return;
	sendMessageData(`/user/${username}/image`, "POST", image, data => {
		$("#images-list").append(getNewImage(data));
	});
}

function deleteImage() {

}
function getImages() {
	let images = $("#images-list");

	console.log(username);
	sendMessage(`/user/${username}/images`, "GET", (data) => {
		data.forEach((image) => {
			images.append(getNewImage(image));
		});
	});
}


function findChild(parent, className) {
	return Array.from(parent.children).find(x => x.classList.contains(className));
}

function findParent(object, target) {
	let parent = object;
	while (!parent.classList.contains(target)) {
		parent = parent.parentElement;
	}
	return parent;
}
function activateDropdownItem(event, item) {
	event.stopPropagation();

	// Remove the activation from the currently selected item
	let parent = item.parentElement;
	Array.from(parent.children).forEach(item => {
		if (item.classList.contains('is-active'))
			item.classList.remove('is-active');
	});

	// Activate this item
	item.classList.toggle('is-active');

	// Close the dropdown menu
	parent = findParent(parent, "is-active");
	parent.classList.remove('is-active');

	// Set the current version as the button text
	let trigger = findChild(parent, 'dropdown-trigger');
	let button = findChild(trigger, 'button');
	let name = findChild(button, 'image-name');
	name.textContent = item.textContent;
}

function toggleDropdown(event, menu) {
	event.stopPropagation();
	closeDropdowns();
	menu.classList.toggle('is-active');
}

function getImageAndVersion(imageCard) {
	let card = findParent(imageCard, "card-content")
	let content = findChild(card, "content");
	let uuid = Array.from(content.children).find(x => x.id == "image-uuid").textContent;

	var version = content;
	["dropdown", "dropdown-trigger", "button", "image-name"].forEach(x =>
		version = findChild(version, x)
	);
	
	return {UUID: uuid, Version: version.textContent};
}

function downloadImage(imageCard) {
	let image = getImageAndVersion(imageCard);
	let link = document.createElement("a");
	
    link.download = `${image.UUID}-${image.Version}.img`;
    link.href = `http://localhost:4848/${username}/image/${image.UUID}/${image.Version}`;
	link.target = "_self";
	document.body.appendChild(link);
    link.click();
	link.remove();
}

function uploadImage(imageCard) {
	let image = getImageAndVersion(imageCard);
	
	return new Promise(resolve => {
		let upload = document.createElement("input");
		upload.type="file";
		
		upload.onchange = () => {
			const formData = new FormData();

			// Why????
			formData.append("newVersion", "true");
			formData.append("file", upload.files[0]);

			$.ajax({
				type: "POST",
				enctype: 'multipart/form-data',
				url: `http://localhost:4848/${username}/image/${image.UUID}`,
				data: formData,
				processData: false,
				contentType: false,
				cache: false,
				xhrFields: {
					withCredentials: true
				},
				crossDomain: true,
				timeout: -1,
				success: x => {
					// Get the version from the human-readable string
					let version = x.slice(29);
					let content = findParent(imageCard, "card-content");
					var dropdown = content;

					// Find the right elements in DOM
					["content", "dropdown"].forEach(x => dropdown = findChild(dropdown, x));
					var imageName = dropdown;
					["dropdown-trigger", "button", "image-name"].forEach(x => imageName = findChild(imageName, x));
					imageName.textContent = version;
					let dContent = dropdown;
					["dropdown-menu", "dropdown-content"].forEach(x => dContent = findChild(dContent, x));

					// Delete the active bit from the last element
					Array.from(dContent.children).at(-1).classList.remove("is-active");
					
					// Create a new version element
					let versionElement = document.createElement("a")
					versionElement.onclick = "activateDropdownItem(event, this)";
					versionElement.classList.add("dropdown-item");
					versionElement.classList.add("is-active");
					versionElement.textContent = version;
					versionElement.href = "#";

					// Add to the list of versions
					dContent.append(versionElement);
					
					console.log(dContent);
				},
				error: e => console.log("Failed to upload image: " + e.responseText)
			});
		}

		upload.click();
	});
	console.log(image);
}

document.addEventListener('DOMContentLoaded', () => {
	getUserInfo();
});
