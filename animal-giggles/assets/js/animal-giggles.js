document.addEventListener('DOMContentLoaded', function () {
	const randomGiggleButton = document.getElementById('random-giggle-btn');
	const headSelect = document.getElementById('animal-head');
	const bodySelect = document.getElementById('animal-body');
	const buttSelect = document.getElementById('animal-butt');

	const headLabel = document.getElementById('animal-head-label');
	const bodyLabel = document.getElementById('animal-body-label');
	const buttLabel = document.getElementById('animal-butt-label');
	const generatedAnimalText = document.getElementById('ag-generated-animal-text');

	const giggleButton = document.getElementById('make-me-giggle-btn');
	const giggleImageWrap = document.getElementById('ag-giggle-image-wrap');
	const giggleImage = document.getElementById('ag-giggle-image');
	const skeleton = document.getElementById('ag-giggle-skeleton');
	const giggleCanvas = document.getElementById('ag-giggle-canvas');
	//const downloadBtn = document.getElementById('download-giggle-btn');
	const shareBtn = document.getElementById('share-giggle-btn');
	const shareStatus = document.getElementById('ag-share-status');
	const socialButtons = document.querySelectorAll('.ag-social-btn');

	if (!headSelect || !bodySelect || !buttSelect) {
		return;
	}

	const localizedData = window.agData || {};
	const bodyOptionsMap = localizedData.bodyOptionsMap || {};
	const buttOptionsMap = localizedData.buttOptionsMap || {};
	const imageRows = localizedData.imageRows || [];
	const placeholderText = localizedData.placeholder || '-- Select --';
	const fallbackImage = localizedData.fallbackImage || '';
	const fallbackProductId = localizedData.fallbackProductId || 'not-found';
	const defaultImageRow = localizedData.defaultImageRow || null;
	const requestedProductId = String(localizedData.requestedProductId || '').trim().toLowerCase();
	const desktopMinBreakpoint = localizedData.desktop_breakpoint_min;

	const ratingMeterDesktop = document.getElementById('ag-giggle-meter');
	const ratingMeterModal = document.getElementById('ag-giggle-meter-modal');
	const ratingMeters = [ratingMeterDesktop, ratingMeterModal].filter(Boolean);
	const ratingStatus = document.getElementById('ag-rating-status');
	const ratingStars = Array.from(document.querySelectorAll('.ag-rating-star'));
	const ratingStarsWraps = Array.from(document.querySelectorAll('.ag-rating-stars'));	let currentImageRow = null;

	let currentSelectedRating = null;
	let hasExitedFullscreenMobile = false;
	let randomGigglePendingTracking = false;
	let randomGiggleSelectionKey = '';

	const requestForm = document.getElementById('ag-request-form');
	const requestStatus = document.getElementById('ag-request-status');
	const generatedAnimalRequest = document.getElementById('ag-generated-animal-request');
	const requestorName = document.getElementById('ag-requestor-name');
	const requestorCountry = document.getElementById('ag-requestor-country');

	const imageModal = document.getElementById('ag-image-modal');
	const imageModalImg = document.getElementById('ag-image-modal-img');
	const imageModalClose = document.getElementById('ag-image-modal-close');
	const imageModalCanvas = document.getElementById('ag-image-modal-canvas');
	
	let shouldOpenModal = false;

	if (!fallbackImage) {
		console.warn('Fallback image not defined.');
		return;
	}

	document.querySelectorAll('[maxlength]').forEach(function (input) {
		displayFormFieldCharacterCount(input);
	});

	function displayFormFieldCharacterCount(inputElement) {
		const counter = document.querySelector(`[data-for="${inputElement.id}"]`);
		if (!counter) return;

		inputElement.addEventListener('input', function () {
			counter.textContent = `${inputElement.value.length}/${inputElement.maxLength}`;
		});
	}

	function setSelectValue(selectElement, value) {
		if (!selectElement) {
			return;
		}

		selectElement.value = value || '';
	}	

function initializeDefaultImageAndSelections() {
	shouldOpenModal = false;
	
	if (requestedProductId === 'not-found') {
		updateGeneratedAnimal();
		handleNoImageFound();
		return;
	}

	const requestedRow = findImageRowByProductId(requestedProductId);

	if (requestedProductId) {
		if (requestedRow) {
			loadImageFromRow(requestedRow);
			return;
		}

		handleNoImageFound();
		return;
	}

	if (!defaultImageRow) {
		return;
	}

	loadImageFromRow(defaultImageRow);
}

function getCurrentSelectionKey() {
	return [
		headSelect.value || '',
		bodySelect.value || '',
		buttSelect.value || ''
	].join('|');
}

function resetRandomGiggleStatus() {
	randomGigglePendingTracking = false;
	randomGiggleSelectionKey = '';
}

function selectRandomAnimalCombination() {
	if (!imageRows || !imageRows.length) {
		return;
	}

	const validRows = imageRows.filter(function (row) {
		return (
			row &&
			row.StoragePathDisplay &&
			row.StoragePathDisplay !== agData.fallbackImage
		);
	});

	if (!validRows.length) {
		return;
	}

	const randomRow = getRandomArrayItem(validRows);

	if (!randomRow) {
		return;
	}

	applyRowToSelectors(randomRow);
	updateRequestorInfo(randomRow);
}

function isSameSelectionAsCurrentImage() {
	if (!currentImageRow) {
		return false;
	}

	return (
		currentImageRow.head === headSelect.value &&
		currentImageRow.body === bodySelect.value &&
		currentImageRow.butt === buttSelect.value
	);
}

function hideCurrentImageKeepFrame() {
	if (giggleCanvas) {
		giggleCanvas.hidden = true;

		const ctx = giggleCanvas.getContext('2d');
		if (ctx) {
			ctx.clearRect(0, 0, giggleCanvas.width, giggleCanvas.height);
		}
	}

	if (skeleton) {
		skeleton.hidden = true;
	}

	if (giggleImageWrap) {
		giggleImageWrap.hidden = false;
		giggleImageWrap.classList.add('has-glass-overlay');
	}

	currentImageRow = null;
	updateRequestorInfo(null);
	disableRatingMeter();
	clearSelectedRatingUI();
	updateDownloadAndShareButtonStates();
}

function buildCloudflareImageUrl(storagePathDisplay) {
	const base = (localizedData.cloudflareBaseUrl || '').replace(/\/$/, '');
	const path = (storagePathDisplay || '').replace(/^\//, '');

	console.log('Building image URL with:', { base, path });
	console.log('Final image URL:', `${base}/${path}`);

	return `${base}/${path}`;
}

function getImageUrlFromRow(row) {
	if (!row || !row.StoragePathDisplay) {
		return '';
	}

	return buildCloudflareImageUrl(row.StoragePathDisplay, row.productId);
}

function updateShareUrlForSelection(head, body, butt, productId) {
	if (!head || !body || !butt || !productId) {
		return;
	}

	const path = [
		head,
		body,
		butt,
		productId
	].map(function (part) {
		return encodeURIComponent(String(part || '').toLowerCase());
	}).join('/');

	const newUrl = window.location.origin + '/' + path;

	window.history.replaceState({}, '', newUrl);
}

function updateRequestorInfo(row) {
	if (!generatedAnimalRequest || !requestorName || !requestorCountry) {
		return;
	}

	const name = row && row.requestorName ? String(row.requestorName).trim() : '';
	const country = row && row.requestorCountry ? String(row.requestorCountry).trim() : '';

	if (!name && !country) {
		generatedAnimalRequest.style.visibility = 'hidden';
		requestorName.textContent = '';
		requestorCountry.textContent = '';
		return;
	}

	requestorName.textContent = name;
	requestorCountry.textContent = "(" + country + ")";
	generatedAnimalRequest.style.visibility = 'visible';
}

	function findNextImageRow(currentRowNumber) {
		if (!imageRows.length) {
			return null;
		}

		const sortedRows = [...imageRows].sort(function (a, b) {
			return a.rowNumber - b.rowNumber;
		});

		const currentIndex = sortedRows.findIndex(function (row) {
			return Number(row.rowNumber) === Number(currentRowNumber);
		});

		if (currentIndex === -1) {
			return sortedRows[0];
		}

		const nextIndex = (currentIndex + 1) % sortedRows.length;
		return sortedRows[nextIndex];
	}

	function updateLabel(selectElement, labelElement) {
		if (!selectElement || !labelElement) {
			return;
		}

		const selectedOption = selectElement.options[selectElement.selectedIndex];
		const text = selectedOption && selectedOption.value !== ''
			? selectedOption.textContent
			: 'None';

		labelElement.textContent = text;
	}

	function getSelectedText(selectElement) {
		if (!selectElement) {
			return '';
		}

		const selectedOption = selectElement.options[selectElement.selectedIndex];

		if (!selectedOption || selectedOption.value === '') {
			return '';
		}

		return selectedOption.textContent;
	}

	function hasFullAnimalSelection() {
		return (
			headSelect.value !== '' &&
			bodySelect.value !== '' &&
			buttSelect.value !== ''
		);
	}

	function updateGiggleButtonState() {
		if (!giggleButton) {
			return;
		}

		giggleButton.disabled = !hasFullAnimalSelection();
	}

	function updateGeneratedAnimal() {
		if (!generatedAnimalText) {
			return;
		}

		const headText = getSelectedText(headSelect);
		const bodyText = getSelectedText(bodySelect);
		const buttText = getSelectedText(buttSelect);

		if (!headText && !bodyText && !buttText) {
			generatedAnimalText.textContent = 'No animal generated yet.';
			updateGiggleButtonState();
			return;
		}

		generatedAnimalText.textContent = [
			headText ? headText : 'No Head',
			bodyText ? bodyText : 'No Body',
			buttText ? buttText : 'No Butt'
		].join(' + ');

		updateGiggleButtonState();
	}

	function resetSelect(selectElement, placeholder) {
		selectElement.innerHTML = '';

		const placeholderOption = document.createElement('option');
		placeholderOption.value = '';
		placeholderOption.textContent = placeholder;

		selectElement.appendChild(placeholderOption);
		selectElement.value = '';

		if (selectElement.id === 'animal-body' && bodyLabel) {
			bodyLabel.textContent = 'None';
		}

		if (selectElement.id === 'animal-butt' && buttLabel) {
			buttLabel.textContent = 'None';
		}
	}

	function shouldHideImageOnButtReset(previousValue) {
		return previousValue && previousValue !== '';
	}

	function populateSelect(selectElement, options, placeholder) {
		resetSelect(selectElement, placeholder);

		options.forEach(function (optionData) {
			const option = document.createElement('option');
			option.value = optionData.value;
			option.textContent = optionData.label;
			selectElement.appendChild(option);
		});
	}

	function updateBodyOptions() {
		const selectedHead = headSelect.value;
		const bodyOptions = bodyOptionsMap[selectedHead] || [];

		resetSelect(bodySelect, placeholderText);
		const previousButtValue = buttSelect.value;
		resetSelect(buttSelect, placeholderText);

		if (shouldHideImageOnButtReset(previousButtValue)) {
			hideCurrentImageKeepFrame();
		}

		bodySelect.disabled = true;
		buttSelect.disabled = true;

		updateLabel(bodySelect, bodyLabel);
		updateLabel(buttSelect, buttLabel);

		if (!selectedHead || bodyOptions.length === 0) {
			updateGeneratedAnimal();
			return;
		}

		populateSelect(bodySelect, bodyOptions, placeholderText);
		bodySelect.disabled = false;
		updateGeneratedAnimal();
	}

	function updateButtOptions() {
		const selectedBody = bodySelect.value;
		const buttOptions = buttOptionsMap[selectedBody] || [];

		const previousButtValue = buttSelect.value;

		resetSelect(buttSelect, placeholderText);

		if (shouldHideImageOnButtReset(previousButtValue)) {
			hideCurrentImageKeepFrame();
		}

		buttSelect.disabled = true;

		updateLabel(buttSelect, buttLabel);

		if (!selectedBody || buttOptions.length === 0) {
			updateGeneratedAnimal();
			return;
		}

		populateSelect(buttSelect, buttOptions, placeholderText);
		buttSelect.disabled = false;
		updateGeneratedAnimal();
	}

function getRandomArrayItem(items) {
	if (!items.length) {
		return null;
	}

	const randomIndex = Math.floor(Math.random() * items.length);
	return items[randomIndex];
}

function findMatchingImageRows() {
	const selectedHead = headSelect.value;
	const selectedBody = bodySelect.value;
	const selectedButt = buttSelect.value;

	return imageRows.filter(function (row) {
		return (
			row.head === selectedHead &&
			row.body === selectedBody &&
			row.butt === selectedButt &&
			getImageUrlFromRow(row)
		);
	});
}

function resetGiggleCanvas() {
	if (giggleCanvas) {
		giggleCanvas.hidden = true;

		const ctx = giggleCanvas.getContext('2d');
		if (ctx) {
			ctx.clearRect(0, 0, giggleCanvas.width, giggleCanvas.height);
		}
	}

	if (giggleImage) {
		giggleImage.classList.remove('loaded');
	}
}

function animateGridPixelReveal(imageElement, canvasElement, wrapElement) {
	if (!canvasElement || !wrapElement || !imageElement) {
		if (imageElement) {
			imageElement.classList.add('loaded');
		}
		return;
	}

	const ctx = canvasElement.getContext('2d');

	if (!ctx) {
		imageElement.classList.add('loaded');
		return;
	}

	const imageRect = imageElement.getBoundingClientRect();
	const wrapRect = wrapElement.getBoundingClientRect();
	const naturalWidth = imageElement.naturalWidth;
	const naturalHeight = imageElement.naturalHeight;

	if (!imageRect.width || !imageRect.height || !naturalWidth || !naturalHeight) {
		imageElement.classList.add('loaded');
		return;
	}

	const drawWidth = Math.round(imageRect.width);
	const drawHeight = Math.round(imageRect.height);
	const offsetX = Math.round(imageRect.left - wrapRect.left);
	const offsetY = Math.round(imageRect.top - wrapRect.top);

	canvasElement.width = drawWidth;
	canvasElement.height = drawHeight;
	canvasElement.hidden = false;

	canvasElement.style.width = drawWidth + 'px';
	canvasElement.style.height = drawHeight + 'px';
	canvasElement.style.left = offsetX + 'px';
	canvasElement.style.top = offsetY + 'px';
	canvasElement.style.inset = 'auto';
	canvasElement.style.position = 'absolute';
	canvasElement.style.transform = 'none';

	ctx.clearRect(0, 0, drawWidth, drawHeight);

	const blockSize = Math.max(6, Math.floor(drawWidth / 40));
	const cols = Math.ceil(drawWidth / blockSize);
	const rows = Math.ceil(drawHeight / blockSize);
	const blocks = [];

	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols; col++) {
			blocks.push({ row, col });
		}
	}

	for (let i = blocks.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[blocks[i], blocks[j]] = [blocks[j], blocks[i]];
	}

	let index = 0;
	const blocksPerFrame = 30;

	function drawNextBatch() {
		const end = Math.min(index + blocksPerFrame, blocks.length);

		for (; index < end; index++) {
			const block = blocks[index];

			const dx = block.col * blockSize;
			const dy = block.row * blockSize;
			const dw = Math.min(blockSize, drawWidth - dx);
			const dh = Math.min(blockSize, drawHeight - dy);

			const sx = Math.floor((dx / drawWidth) * naturalWidth);
			const sy = Math.floor((dy / drawHeight) * naturalHeight);
			const sw = Math.max(1, Math.floor((dw / drawWidth) * naturalWidth));
			const sh = Math.max(1, Math.floor((dh / drawHeight) * naturalHeight));

			ctx.drawImage(
				imageElement,
				sx,
				sy,
				sw,
				sh,
				dx,
				dy,
				dw,
				dh
			);
		}

		if (index < blocks.length) {
			requestAnimationFrame(drawNextBatch);
		} else {
			imageElement.classList.add('loaded');

			setTimeout(function () {
				ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
				canvasElement.hidden = true;
				canvasElement.style.display = '';
				canvasElement.style.left = '';
				canvasElement.style.top = '';
				canvasElement.style.width = '';
				canvasElement.style.height = '';
				canvasElement.style.inset = '';
				canvasElement.style.position = '';
				canvasElement.style.transform = '';
			}, 120);
		}
	}

	drawNextBatch();
}

function loadImageSource(imageUrl, imageAlt, onFailure) {
	if (!giggleImage || !giggleImageWrap) {
		return;
	}

	resetGiggleCanvas();

	giggleImageWrap.hidden = false;
	giggleImageWrap.classList.remove('has-glass-overlay');
	giggleImage.alt = imageAlt || 'Generated animal image';

	if (skeleton) {
		skeleton.hidden = false;
	}

	giggleImage.onload = function () {
		if (skeleton) {
			skeleton.hidden = true;
		}

		resetGiggleCanvas();

		// FORCE CANVAS REPAINT BEFORE ANIMATION
		if (giggleCanvas) {
			giggleCanvas.style.display = 'none';
			giggleCanvas.offsetHeight; // force reflow
			giggleCanvas.style.display = 'block';
		}

		animateGridPixelReveal(giggleImage, giggleCanvas, giggleImageWrap);

		if (getViewportWidth() >= desktopMinBreakpoint && shouldOpenModal) {
			openImageModal();
			shouldOpenModal = false;
		}
	};

	giggleImage.onerror = function () {
		resetGiggleCanvas();

		if (typeof onFailure === 'function') {
			onFailure();
			return;
		}

		if (skeleton) {
			skeleton.hidden = true;
		}
	};

	giggleImage.src = imageUrl;
}

function handleNoImageFound() {
	const selectedHead = headSelect.value || '';
	const selectedBody = bodySelect.value || '';
	const selectedButt = buttSelect.value || '';
	const fallbackProductId = 'not-found';

	currentImageRow = {
		imageId: 0,
		productId: fallbackProductId,
		head: selectedHead,
		body: selectedBody,
		butt: selectedButt,
		StoragePathDisplay: ''
	};

	updateShareUrlForSelection(selectedHead, selectedBody, selectedButt, fallbackProductId);
	disableRatingMeter();
	updateRequestorInfo(null);

	if (!fallbackImage) {
		resetGiggleCanvas();

		if (skeleton) {
			skeleton.hidden = true;
		}

		return;
	}

	loadImageSource(
		fallbackImage,
		'Fallback image',
		function () {
			resetGiggleCanvas();

			if (skeleton) {
				skeleton.hidden = true;
			}
		}
	);
}

function applyRowToSelectors(row) {
	if (!row) {
		return;
	}

	setSelectValue(headSelect, row.head);
	updateLabel(headSelect, headLabel);
	updateBodyOptions();

	setSelectValue(bodySelect, row.body);
	updateLabel(bodySelect, bodyLabel);
	updateButtOptions();

	setSelectValue(buttSelect, row.butt);
	updateLabel(buttSelect, buttLabel);

	updateGeneratedAnimal();
	updateGiggleButtonState();
}

function findNextImageRow(currentRowNumber) {
	if (!imageRows.length) {
		return null;
	}

	const sortedRows = [...imageRows].sort(function (a, b) {
		return Number(a.rowNumber) - Number(b.rowNumber);
	});

	const currentIndex = sortedRows.findIndex(function (row) {
		return Number(row.rowNumber) === Number(currentRowNumber);
	});

	if (currentIndex === -1) {
		return sortedRows[0];
	}

	return sortedRows[(currentIndex + 1) % sortedRows.length];
}

function loadImageFromRow(row, triedRowNumbers = []) {
	if (!row) {
		handleNoImageFound();
		return;
	}

	currentImageRow = row;
	updateRequestorInfo(row);
	updateShareUrlForRow(row, 'replace');
	applyRowToSelectors(row);
	enableRatingMeter();
	clearSelectedRatingUI();
	setRatingStatus('');

	const rowNumber = Number(row.rowNumber);

	if (triedRowNumbers.includes(rowNumber)) {
		handleNoImageFound();
		return;
	}

	//const nextTriedRowNumbers = [...triedRowNumbers, rowNumber];

	const imageUrl = getImageUrlFromRow(row);

	if (!imageUrl) {
		console.warn('Missing StoragePathDisplay for direct URL row:', row);
		handleNoImageFound();
		return;
	}

	loadImageSource(
		imageUrl,
		generatedAnimalText ? generatedAnimalText.textContent : 'Generated animal image',
		function () {
			handleNoImageFound();
		}
	);
}

function showRandomMatchingImage() {
	// If same selection + image already loaded → reuse it
	const isSameAnimalRequested = isSameSelectionAsCurrentImage() &&
		giggleImage &&
		giggleImage.src &&
		giggleImage.src !== fallbackImage;

	const deviceIsDesktop = getViewportWidth() >= desktopMinBreakpoint;

	if (isSameAnimalRequested && deviceIsDesktop) {
		openImageModal(); // uses existing src
		return;
	}

	const matches = findMatchingImageRows();

	if (!matches.length) {
		handleNoImageFound();
		return;
	}

	const chosenRow = getRandomArrayItem(matches);

	if (!chosenRow || !chosenRow.StoragePathDisplay) {
		handleNoImageFound();
		return;
	}

	currentImageRow = chosenRow;
	updateRequestorInfo(chosenRow);
	updateShareUrlForRow(chosenRow, 'push');
	applyRowToSelectors(chosenRow);
	enableRatingMeter();
	clearSelectedRatingUI();
	setRatingStatus('');

	const isRandomGeneration =
		randomGigglePendingTracking &&
		randomGiggleSelectionKey === getCurrentSelectionKey();

	trackMakeMeGiggleClick(
		chosenRow.productId,
		window.location.href,
		getUserTimezone(),
		isRandomGeneration ? 1 : 0
	);

	resetRandomGiggleStatus();
	
	const imageUrl = chosenRow.StoragePathDisplay ? buildCloudflareImageUrl(chosenRow.StoragePathDisplay, chosenRow.ProductId) : fallbackImage;
	loadImageSource(
		imageUrl,
		generatedAnimalText ? generatedAnimalText.textContent : 'Generated animal image',
		function () {
			handleNoImageFound();
		}
	);

}

	function enableRatingMeter() {
		ratingMeters.forEach(function (meter) {
			meter.classList.remove('is-disabled');
		});

		ratingStars.forEach(function (star) {
			star.disabled = false;
		});
	}

	function disableRatingMeter() {
		ratingMeters.forEach(function (meter) {
			meter.classList.add('is-disabled');
		});

		ratingStars.forEach(function (star) {
			star.disabled = true;
		});

		clearHoveredRatingUI();
	}

function clearSelectedRatingUI() {
	currentSelectedRating = null;

	ratingStars.forEach(function (star) {
		star.classList.remove('is-selected');
		star.classList.remove('is-hovered');
		star.disabled = false;
	});
}

function setSelectedRatingUI(ratingValue) {
	currentSelectedRating = Number(ratingValue);

	ratingStars.forEach(function (star) {
		const starValue = Number(star.getAttribute('data-rating-value'));
		star.classList.toggle('is-selected', starValue <= currentSelectedRating);
	});
}

function setHoveredRatingUI(ratingValue) {
	const hoveredValue = Number(ratingValue);

	ratingStars.forEach(function (star) {
		const starValue = Number(star.getAttribute('data-rating-value'));
		star.classList.toggle('is-hovered', starValue <= hoveredValue);
	});
}

function setRatingStatus(message) {
	if (ratingStatus) {
		ratingStatus.textContent = message || '';
	}
}

function clearHoveredRatingUI() {
	ratingStars.forEach(function (star) {
		star.classList.remove('is-hovered');
	});
}

async function submitImageRating(imageId, rating) {
	const localizedData = window.agData || {};
	const ajaxUrl = localizedData.ajaxUrl || '';
	const nonce = localizedData.nonce || '';

	if (!ajaxUrl || !nonce) {
		console.error('Missing AJAX config.');
		return null;
	}

	try {
		const response = await fetch(ajaxUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
			},
			body: new URLSearchParams({
				action: 'ag_submit_image_rating',
				nonce: nonce,
				image_id: imageId,
				rating: rating
			})
		});

		const result = await response.json();

		if (!result || !result.success) {
			throw new Error(
				result && result.data && result.data.message
					? result.data.message
					: 'Rating request failed.'
			);
		}

		return result.data;
	} catch (error) {
		console.error('Rating submission failed:', error);
		return null;
	}
}

async function trackMakeMeGiggleClick(productId, url, userTimezone = '', randomGeneration = 0) {
	const ajaxUrl = localizedData.ajaxUrl || '';
	const nonce = localizedData.nonce || '';

	if (!ajaxUrl || !nonce || !productId || !url) {
		return;
	}

	try {
		await fetch(ajaxUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
			},
			body: new URLSearchParams({
				action: 'ag_track_make_me_giggle_click',
				nonce: nonce,
				product_id: productId,
				url: url,
				user_timezone: userTimezone,
				random_generation: randomGeneration
			})
		});
	} catch (error) {
		console.error('Make Me Giggle click tracking failed:', error);
	}
}

async function trackShareClick(platform) {
	const ajaxUrl = localizedData.ajaxUrl || '';
	const nonce = localizedData.nonce || '';

	if (!ajaxUrl || !nonce || !currentImageRow || !currentImageRow.productId) {
		return;
	}

	try {
		await fetch(ajaxUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
			},
			body: new URLSearchParams({
				action: 'ag_track_share_click',
				nonce: nonce,
				product_id: currentImageRow.productId,
				platform: platform,
				shared_url: window.location.href
			})
		});
	} catch (error) {
		console.error('Share tracking failed:', error);
	}
}

function getUserTimezone() {
	try {
		return Intl.DateTimeFormat().resolvedOptions().timeZone || '';
	} catch (error) {
		return '';
	}
}

function showShareStatus(message) {
	if (!shareStatus) {
		return;
	}

	shareStatus.classList.remove('is-visible'); // reset

	// Force reflow so animation restarts
	void shareStatus.offsetWidth;

	shareStatus.textContent = message;
	shareStatus.classList.add('is-visible');

	setTimeout(function () {
		shareStatus.classList.remove('is-visible');
	}, 1500);
}

function clearRequestStatus() {
	if (!requestStatus) {
		return;
	}

	requestStatus.classList.add('is-hidden');

	setTimeout(function () {
		requestStatus.textContent = '';
		requestStatus.classList.remove('success', 'error', 'is-hidden');
	}, 200);
}

function updateDownloadAndShareButtonStates() {
	const hasSrc = giggleImage.src && giggleImage.src.trim() !== '';
	const visible = giggleImageWrap && giggleImageWrap.hidden === false;
	// if (hasSrc && visible) {
	// 	downloadBtn.hidden = false;
	// 	downloadBtn.disabled = false;
	// } else {
	// 	downloadBtn.hidden = true;
	// 	downloadBtn.disabled = true;
	// }

	socialButtons.forEach(function (btn) {
		if (hasSrc && visible) {
			btn.hidden = false;
			btn.disabled = false;
		} else {
			btn.hidden = true;
			btn.disabled = true;
		}
	});
}

    // If image element gets a new src (e.g. via existing code), enable button after load
    giggleImage.addEventListener('load', function () {
        updateDownloadAndShareButtonStates();
    });

    // Also observe wrapper visibility changes in case code toggles hidden attribute
    var observer = null;
    if (giggleImageWrap && window.MutationObserver) {
        observer = new MutationObserver(function () {
            updateDownloadAndShareButtonStates();
        });
        observer.observe(giggleImageWrap, { attributes: true, attributeFilter: ['hidden', 'style'] });
    }

    // Click handler: prefer canvas data if drawn, otherwise use image src
	// if (downloadBtn) {
	// 	downloadBtn.addEventListener('click', function () {
	// 		var href = '';
	// 		try {
	// 			if (giggleCanvas && !giggleCanvas.hidden) {
	// 				href = giggleCanvas.toDataURL('image/jpg');
	// 			}
	// 		} catch (e) {
	// 			href = '';
	// 		}

	// 		if (!href) {
	// 			href = giggleImage.src;
	// 		}

	// 		if (!href) {
	// 			return;
	// 		}

	// 		var filename = 'animal-giggle.jpg';
	// 		var a = document.createElement('a');
	// 		a.href = href;
	// 		a.download = filename;
	// 		// For data URLs this works; for same-origin image URLs it will download the file directly.
	// 		document.body.appendChild(a);
	// 		a.click();
	// 		document.body.removeChild(a);
	// 	});
	// }

	if (shareBtn) {
		shareBtn.addEventListener('click', async function () {
			const shareUrl = window.location.href;

			if (!shareUrl) {
				return;
			}

			try {
				if (navigator.share) {
					await navigator.share({
						title: 'Animal Giggles',
						text: 'Check out this fun Animal Giggles animal I created!',
						url: shareUrl
					});

					await trackShareClick('native');
					return;
				}

				if (navigator.clipboard && window.isSecureContext) {
					await navigator.clipboard.writeText(shareUrl);
					showShareStatus('Link copied ✓');
					await trackShareClick('copy');
					return;
				}

				const tempInput = document.createElement('input');
				tempInput.value = shareUrl;
				document.body.appendChild(tempInput);
				tempInput.select();
				document.execCommand('copy');
				document.body.removeChild(tempInput);

				showShareStatus('Link copied ✓');
				await trackShareClick('copy');
			} catch (error) {
				console.error('Share failed:', error);
			}
		});
	}

	if (socialButtons) {
		socialButtons.forEach(function (btn) {
			btn.addEventListener('click', function () {
				const platform = btn.getAttribute('data-platform');
				const url = encodeURIComponent(window.location.href);
				const text = encodeURIComponent('Check out this Animal Giggles image');

				let shareUrl = '';

				if (platform === 'facebook') {
					shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
				}

				if (platform === 'x') {
					shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
				}

				if (platform === 'pinterest') {
					const image = encodeURIComponent(giggleImage.src || '');
					shareUrl = `https://pinterest.com/pin/create/button/?url=${url}&media=${image}&description=${text}`;
				}

				if (shareUrl) {
					trackShareClick(platform);
					window.open(shareUrl, '_blank', 'width=600,height=500');
				}
			});
		});
	}

    // Initial state
    updateDownloadAndShareButtonStates();

	headSelect.addEventListener('change', function () {
		resetRandomGiggleStatus();

		updateLabel(headSelect, headLabel);
		updateBodyOptions();
		updateGeneratedAnimal();
	});

	bodySelect.addEventListener('change', function () {
		resetRandomGiggleStatus();
		
		updateLabel(bodySelect, bodyLabel);
		updateButtOptions();
		updateGeneratedAnimal();
	});

	buttSelect.addEventListener('change', function () {
		resetRandomGiggleStatus();

		hideCurrentImageKeepFrame();
		updateLabel(buttSelect, buttLabel);
		updateGeneratedAnimal();
	});

	window.addEventListener('popstate', function (event) {
		const state = event.state;

		if (!state || !state.productId) {
			return;
		}

		const row = findImageRowByProductId(state.productId);

		if (row) {
			currentImageRow = row;
			applyRowToSelectors(row);
			enableRatingMeter();
			clearSelectedRatingUI();
			setRatingStatus('');

			const imageUrl = getImageUrlFromRow(row);

			if (!imageUrl) {
				handleNoImageFound();
				return;
			}

			loadImageSource(
				imageUrl,
				generatedAnimalText ? generatedAnimalText.textContent : 'Generated animal image',
				function () {
					handleNoImageFound();
				}
			);

			return;
		}

		if (state.productId === 'not-found') {
			handleNoImageFound();
		}
	});

if (ratingStarsWraps) {
	ratingStarsWraps.forEach(function (wrap) {
		wrap.addEventListener('mouseleave', function () {
			clearHoveredRatingUI();
		});
	});
}

ratingStars.forEach(function (star) {
	star.addEventListener('mouseenter', function () {
		const hoveredValue = Number(star.getAttribute('data-rating-value'));
		setHoveredRatingUI(hoveredValue);
	});

	star.addEventListener('click', async function () {
		if (!currentImageRow || !currentImageRow.imageId) {
			setRatingStatus('No image is available to rate.');
			return;
		}

		const ratingValue = Number(star.getAttribute('data-rating-value'));

		if (!ratingValue || ratingValue < 1 || ratingValue > 5) {
			return;
		}

		ratingStars.forEach(function (item) {
			item.disabled = true;
		});

		setSelectedRatingUI(ratingValue);
		setRatingStatus('Saving your rating...');

		const result = await submitImageRating(currentImageRow.imageId, ratingValue);

		if (!result) {
			ratingStars.forEach(function (item) {
				item.disabled = false;
			});

			setRatingStatus('Unable to save rating right now.');
			return;
		}

		clearHoveredRatingUI();
		setSelectedRatingUI(ratingValue);
		disableRatingMeter();

		const average = result.ratings && result.ratings.average_rating
			? Number(result.ratings.average_rating).toFixed(2)
			: '0.00';

		const totalRatings = result.ratings && result.ratings.total_ratings
			? result.ratings.total_ratings
			: 0;

		setRatingStatus('Thanks! Average rating: ' + average + ' (' + totalRatings + ' ratings)');
	});
});

function findImageRowByProductId(productId) {
	if (!productId) {
		return null;
	}

	const normalizedProductId = String(productId).trim().toLowerCase();

	return imageRows.find(function (row) {
		return String(row.productId || '').trim().toLowerCase() === normalizedProductId;
	}) || null;
}

function updateShareUrlForRow(row, mode = 'push') {
	if (!row || !row.productId) {
		return;
	}

	const path = [
		row.head,
		row.body,
		row.butt,
		row.productId
	].map(function (part) {
		return encodeURIComponent(String(part || '').toLowerCase());
	}).join('/');

	const newUrl = window.location.origin + '/' + path;
	const state = {
		ag: true,
		productId: row.productId
	};

	if (mode === 'replace') {
		window.history.replaceState(state, '', newUrl);
	} else {
		window.history.pushState(state, '', newUrl);
	}
}

function openImageModal() {
	const isDesktop = window.innerWidth >= desktopMinBreakpoint;

	if (!isDesktop || !imageModal || !imageModalImg || !giggleImage) {
		return;
	}

	if (!giggleImage.src) {
		return;
	}

	const isSameImage = imageModalImg.src === giggleImage.src;

	imageModalImg.classList.remove('loaded');
	imageModal.hidden = false;
	document.body.classList.add('ag-modal-open');

	if (currentSelectedRating) {
		setSelectedRatingUI(currentSelectedRating);
		disableRatingMeter();
	} else {
		clearSelectedRatingUI();
		enableRatingMeter();
	}

	imageModalImg.alt = giggleImage.alt || 'Generated animal image';

	// reuse existing image (no reload)
	if (isSameImage) {
		imageModalImg.onload = null; // prevent waiting for load

		requestAnimationFrame(function () {
			const modalMedia = imageModal.querySelector('.ag-image-modal__media');
			animateGridPixelReveal(imageModalImg, imageModalCanvas, modalMedia);
		});

		return;
	}

	// Normal load path
	imageModalImg.onload = function () {
		if (imageModalCanvas) {
			imageModalCanvas.hidden = false;
			imageModalCanvas.style.display = 'none';
			imageModalCanvas.offsetHeight;
			imageModalCanvas.style.display = 'block';
		}

		requestAnimationFrame(function () {
			const modalMedia = imageModal.querySelector('.ag-image-modal__media');
			animateGridPixelReveal(imageModalImg, imageModalCanvas, modalMedia);
		});
	};

	imageModalImg.src = giggleImage.src;
}

function closeImageModal() {
	if (!imageModal || !imageModalImg) {
		return;
	}

	imageModal.hidden = true;
	imageModalImg.src = '';
	imageModalImg.alt = '';
	document.body.classList.remove('ag-modal-open');

	if (imageModalCanvas) {
		const ctx = imageModalCanvas.getContext('2d');
		if (ctx) {
			ctx.clearRect(0, 0, imageModalCanvas.width, imageModalCanvas.height);
		}
		imageModalCanvas.hidden = true;
		imageModalCanvas.style.display = '';
	}
}

function showImageFullscreenOnMobile() {
	const isMobile = window.innerWidth < desktopMinBreakpoint;

	if (!isMobile || !giggleImageWrap) {
		return;
	}

	// Enter fullscreen
	giggleImageWrap.hidden = false;
	giggleImageWrap.display = "none";

	giggleImageWrap.classList.add('is-fullscreen');
	giggleImageWrap.classList.remove('is-mobile-view');
	giggleImageWrap.display = "flex";

	// Lock background scroll
	document.body.classList.add('ag-no-scroll');
}

function getViewportWidth() {
	return Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
}

/* Event Handlers */

if (randomGiggleButton) {
	randomGiggleButton.addEventListener('click', function () {
		selectRandomAnimalCombination();

		if (!hasFullAnimalSelection()) {
			return;
		}

		randomGigglePendingTracking = true;
		randomGiggleSelectionKey = getCurrentSelectionKey();

		hasExitedFullscreenMobile = false;
		shouldOpenModal = true;

		showImageFullscreenOnMobile();
		showRandomMatchingImage();
	});
}

if (giggleImageWrap) {
	giggleImageWrap.addEventListener('touchstart', function () {
		if (hasExitedFullscreenMobile) {
			return;
		}

		hasExitedFullscreenMobile = true;

		// Exit fullscreen
		giggleImageWrap.classList.remove('is-fullscreen');
		giggleImageWrap.classList.add('is-mobile-view');

		// Re-enable scrolling
		document.body.classList.remove('ag-no-scroll');
	});
}

	if (giggleButton) {
		giggleButton.addEventListener('click', function () {
			if (!hasFullAnimalSelection()) {
				return;
			}

			hasExitedFullscreenMobile = false;
			shouldOpenModal = true;

			showImageFullscreenOnMobile();
			showRandomMatchingImage();
		});
	}

	if (imageModalClose) {
		imageModalClose.addEventListener('click', closeImageModal);
	}

	if (imageModal) {
		imageModal.addEventListener('click', function (event) {
			if (
				event.target.classList.contains('ag-image-modal') ||
				event.target.classList.contains('ag-image-modal__backdrop')
			) {
				closeImageModal();
			}
		});
	}

	if (requestForm) {	
		requestForm.addEventListener('submit', async function (event) {
			event.preventDefault();

			const formData = new FormData(requestForm);

			formData.append('action', 'ag_submit_animal_request');
			formData.append('nonce', localizedData.nonce || '');

			try {
				const response = await fetch(localizedData.ajaxUrl || '', {
					method: 'POST',
					body: formData
				});	

				const result = await response.json();

				if (!result || !result.success) {
					throw new Error(result?.data?.message || 'Request failed.');
				}

				requestForm.reset();

				if (requestStatus) {
					requestStatus.classList.remove('error');
					requestStatus.classList.add('success');
					requestStatus.textContent = result.data.message;
				}
			} catch (error) {
				if (requestStatus) {
					requestStatus.classList.remove('success');
					requestStatus.classList.add('error');
					requestStatus.textContent = error.message;
				}
			}
		});

		const fields = requestForm.querySelectorAll('input, select, textarea');

		fields.forEach(function (field) {
			field.addEventListener('input', clearRequestStatus);
			field.addEventListener('change', clearRequestStatus);
		});
	}

	document.addEventListener('keydown', function (event) {
		if (event.key === 'Escape') {
			closeImageModal();
		}
	});

	resetSelect(bodySelect, placeholderText);
	resetSelect(buttSelect, placeholderText);
	bodySelect.disabled = true;
	buttSelect.disabled = true;

	updateLabel(headSelect, headLabel);
	updateLabel(bodySelect, bodyLabel);
	updateLabel(buttSelect, buttLabel);
	updateGeneratedAnimal();
	updateGiggleButtonState();

	initializeDefaultImageAndSelections();
});