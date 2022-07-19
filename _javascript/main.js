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
		<a href="#" class="card-footer-item" onclick="launchImage(this);">Launch</a>
		<a href="#" class="card-footer-item" onclick="editImage(this);">Edit</a>
		<a href="#" class="card-footer-item" onclick="deleteImage(this);">Delete</a>
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
	while (!parent.classList.contains('is-active')) {
		parent = parent.parentElement;
	}
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


document.addEventListener('DOMContentLoaded', () => {
	getUserInfo();
});
