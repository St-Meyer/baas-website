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
		$(".navbar-burger").removeClass("is-active");
		$(".navbar-menu").removeClass("is-active");
	
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

function getOption(id) {
	return $(id)[0].selectedOptions[0].value;
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

function toggleNavBar() {
	// Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
    $(".navbar-burger").toggleClass("is-active");
    $(".navbar-menu").toggleClass("is-active");
}


function closeWindows() {
	$(".window").forEach(x => x.hidden = true);
}
document.addEventListener('DOMContentLoaded', () => {
	// Check for click events on the navbar burger icon
	$(".navbar-burger").click(toggleNavBar);
	
	$(".navbar-item").click(item => {
		toggleNavBar();
		closeWindows();
		let target = document.getElementById(item.target.dataset.target);
		if (target === undefined || target === null)
			return;
		
		target.hidden = false

		// The only reason that this is okay is because JS itself is an
		// arbitrary code execution exploit
		if (target.dataset.onshow!== undefined)
			eval(target.dataset.onshow);
	});
	
	getUserInfo();
});
