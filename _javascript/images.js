function getVersion(versions) {
	return versions
		.slice(0, versions.length-1)
		.map((version) =>
			`<a href="#" onclick="activateDropdownItem(event, this);" class="dropdown-item">${version.Version}</a> `)
	    .concat(`<a href="#" onclick="activateDropdownItem(event, this);" class="dropdown-item is-active">${versions[versions.length-1].Version}</a>`);
}

function getNewImage(image) {
	const new_image = `
<div class="column is-one-quarter">
  <div class="card image-card">
    <div class="card-content">
      <p class="title" id="#image-id">${image.Name}</p>
      <hr>
	  <div class="content" onclick="toggleDropdown(event, this);">
  	    <label class="label">UUID</label>
		<span id="image-uuid" class="has-text-dark modal-field">${image.UUID}</span>
		<label class="label">Disk Compression</label>
		<span id="image-disk-compression" class="has-text-dark modal-field">${image.DiskCompressionStrategy}</span>
		<label class="label">Image Filetype</label>
		<span id="image-disk-filetype" class="has-text-dark modal-field">${image.ImageFileType}</span>
		<label class="label">Type</label>
		<span id="image-type" class="has-text-dark modal-field">${image.Type}</span>
		<label class="label">Checksum</label>
		<span id="image-checksum" class="has-text-dark modal-field">${image.Checksum}</span>
        <label class="label ">Versions</label>

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
             <a href="#" class="card-footer-item" onclick="uploadImage(this);">Upload</a>
          </div>
        </div>
      </footer>
	</div>
</div>
	`

	var temp = document.createElement('div');
	temp.innerHTML = new_image;
	return temp.children[0];
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
	if (! input) return;
	
	sendMessageData(`/user/${username}/image`, "POST", image, data => {
		$("#images-list").append(getNewImage(data));
	});
}

function deleteImage() {

}
function getImages() {
	let images = document.getElementById("images-list");
	
	sendMessage(`/user/${username}/images`, "GET", (data) => {
		console.log(data);
		// Delete all the images that are already there
		images.replaceChildren(...data.map(getNewImage));
	});
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
				},
				error: e => console.log("Failed to upload image: " + e.responseText)
			});
		}

		upload.click();
	});
}
