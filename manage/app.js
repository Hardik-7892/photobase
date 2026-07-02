var API_BASE = 'https://api.github.com';
var owner, repo, branch, token;
var photos = [];
var fileSha = null;
var pendingImage = null;

function connect() {
  owner = document.getElementById('owner').value.trim();
  repo = document.getElementById('repo').value.trim();
  branch = document.getElementById('branch').value.trim();
  token = document.getElementById('token').value.trim();

  if (!owner || !repo || !token) {
    return showStatus('Fill in all required fields.', 'error');
  }

  loadGallery();
}

async function loadGallery() {
  showStatus('Connecting...', 'loading');
  try {
    var result = await getFile('gallery.json');
    fileSha = result.sha;
    photos = result.content.photos || [];
    showDashboard();
    renderPhotos();
    showStatus('Connected', 'success');
  } catch (err) {
    if (err.message.indexOf('404') !== -1 || err.message.indexOf('Not Found') !== -1) {
      fileSha = null;
      photos = [];
      showDashboard();
      renderPhotos();
      showStatus('No gallery.json yet — add your first photo', '');
    } else {
      showStatus('Failed: ' + err.message, 'error');
    }
  }
}

async function getFile(path) {
  var url = API_BASE + '/repos/' + owner + '/' + repo + '/contents/' + encodeURI(path) + '?ref=' + branch;
  var res = await fetch(url, {
    headers: { Authorization: 'token ' + token }
  });
  if (!res.ok) {
    var errBody = await res.json().catch(function() { return {}; });
    throw new Error(errBody.message || 'HTTP ' + res.status);
  }
  var data = await res.json();
  var content = JSON.parse(atob(data.content));
  return { sha: data.sha, content: content };
}

async function putFile(path, content, sha, message) {
  var url = API_BASE + '/repos/' + owner + '/' + repo + '/contents/' + encodeURI(path);
  var body = {
    message: message,
    content: btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2)))),
    branch: branch
  };
  if (sha) body.sha = sha;

  var res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: 'token ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    var errBody = await res.json().catch(function() { return {}; });
    throw new Error(errBody.message || 'HTTP ' + res.status);
  }
  return res.json();
}

async function uploadImage(file) {
  var parts = file.name.split('.');
  var ext = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : 'jpg';
  var filename = Date.now() + '-' + Math.random().toString(36).substring(2, 8) + '.' + ext;
  var path = 'assets/images/' + filename;
  var base64 = await fileToBase64(file);

  var url = API_BASE + '/repos/' + owner + '/' + repo + '/contents/' + encodeURI(path);
  var res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: 'token ' + token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: 'Upload ' + filename,
      content: base64,
      branch: branch
    })
  });
  if (!res.ok) {
    var errBody = await res.json().catch(function() { return {}; });
    throw new Error(errBody.message || 'Upload failed');
  }
  return 'assets/images/' + filename;
}

function fileToBase64(file) {
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.onload = function() {
      resolve(reader.result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function showDashboard() {
  document.getElementById('connect-form').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';
  document.getElementById('repo-badge').textContent = owner + '/' + repo + ' (' + branch + ')';
}

function disconnect() {
  owner = repo = branch = token = '';
  photos = [];
  fileSha = null;
  pendingImage = null;
  document.getElementById('connect-form').style.display = 'block';
  document.getElementById('dashboard').style.display = 'none';
  document.getElementById('save-status').textContent = '';
  document.getElementById('save-status').className = 'save-status';
}

function renderPhotos() {
  var grid = document.getElementById('photo-grid');
  grid.innerHTML = '';

  if (photos.length === 0) {
    grid.innerHTML = '<div class="empty-state"><h2>No photos</h2><p>Click "Add Photo" to get started.</p></div>';
    return;
  }

  photos.sort(function(a, b) { return (a.order || 0) - (b.order || 0); });

  photos.forEach(function(photo, index) {
    var card = document.createElement('div');
    card.className = 'admin-card';
    card.draggable = true;
    card.dataset.index = index;

    var title = escapeHtml(photo.title || 'Untitled');
    var cat = escapeHtml(photo.category || 'Uncategorized');
    var imgSrc = photo.image || '';

    card.innerHTML =
      '<div class="drag-handle">⠿</div>' +
      '<img src="' + imgSrc + '" alt="' + title + '" loading="lazy" onerror="this.parentElement.classList.add(\'img-error\');this.src=\'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22%3E%3Crect fill=%22%23eee%22 width=%22400%22 height=%22300%22/%3E%3Ctext fill=%22%23999%22 x=%22200%22 y=%22150%22 text-anchor=%22middle%22 font-family=%22sans-serif%22 font-size=%2220%22%3ENo image%3C/text%3E%3C/svg%3E\'" />' +
      '<div class="card-body">' +
        '<h4>' + title + '</h4>' +
        '<span class="category-tag">' + cat + '</span>' +
      '</div>' +
      '<div class="card-actions">' +
        '<button class="btn btn-outline" onclick="editPhoto(' + index + ')">Edit</button>' +
        '<button class="btn btn-danger" onclick="deletePhoto(' + index + ')">Delete</button>' +
      '</div>';

    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragenter', handleDragEnter);
    card.addEventListener('dragover', handleDragOver);
    card.addEventListener('dragleave', handleDragLeave);
    card.addEventListener('drop', handleDrop);
    card.addEventListener('dragend', handleDragEnd);

    grid.appendChild(card);
  });
}

var dragSrcIndex = null;

function handleDragStart(e) {
  dragSrcIndex = parseInt(this.dataset.index);
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', this.dataset.index);
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
  e.preventDefault();
  this.classList.add('drag-over');
}

function handleDragLeave() {
  this.classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  this.classList.remove('drag-over');
  var targetIndex = parseInt(this.dataset.index);
  if (dragSrcIndex !== null && dragSrcIndex !== targetIndex) {
    var moved = photos.splice(dragSrcIndex, 1)[0];
    photos.splice(targetIndex, 0, moved);
    photos.forEach(function(p, i) { p.order = i + 1; });
    renderPhotos();
    showStatus('Reordered — click Save to commit', '');
  }
  dragSrcIndex = null;
}

function handleDragEnd() {
  this.classList.remove('dragging');
  var overs = document.querySelectorAll('.drag-over');
  for (var i = 0; i < overs.length; i++) { overs[i].classList.remove('drag-over'); }
}

function openAddModal() {
  document.getElementById('modal-title').textContent = 'Add Photo';
  document.getElementById('edit-id').value = '';
  document.getElementById('edit-index').value = '';
  document.getElementById('photo-title').value = '';
  document.getElementById('photo-category').value = '';
  document.getElementById('photo-description').value = '';
  document.getElementById('preview-container').style.display = 'none';
  document.getElementById('save-photo-btn').textContent = 'Add Photo';
  pendingImage = null;
  document.getElementById('modal').style.display = 'flex';
  document.getElementById('photo-title').focus();
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
  pendingImage = null;
}

function editPhoto(index) {
  var photo = photos[index];
  document.getElementById('modal-title').textContent = 'Edit Photo';
  document.getElementById('edit-id').value = photo.id || '';
  document.getElementById('edit-index').value = index;
  document.getElementById('photo-title').value = photo.title || '';
  document.getElementById('photo-category').value = photo.category || '';
  document.getElementById('photo-description').value = photo.description || '';
  document.getElementById('save-photo-btn').textContent = 'Save Changes';
  pendingImage = null;

  if (photo.image) {
    document.getElementById('preview-img').src = photo.image;
    document.getElementById('preview-container').style.display = 'block';
  } else {
    document.getElementById('preview-container').style.display = 'none';
  }

  document.getElementById('modal').style.display = 'flex';
  document.getElementById('photo-title').focus();
}

function deletePhoto(index) {
  var photo = photos[index];
  if (!confirm('Delete "' + (photo.title || 'Untitled') + '"?')) return;
  photos.splice(index, 1);
  photos.forEach(function(p, i) { p.order = i + 1; });
  renderPhotos();
  showStatus('Photo removed — click Save to commit', '');
}

async function savePhoto() {
  var title = document.getElementById('photo-title').value.trim();
  var category = document.getElementById('photo-category').value.trim();
  var description = document.getElementById('photo-description').value.trim();
  var editId = document.getElementById('edit-id').value;
  var editIndex = document.getElementById('edit-index').value;
  var isEdit = editIndex !== '';

  if (!title) return alert('Please enter a title.');
  if (!category) return alert('Please enter a category.');

  var imagePath = null;

  if (pendingImage) {
    var btn = document.getElementById('save-photo-btn');
    btn.disabled = true;
    btn.textContent = 'Uploading image...';
    try {
      imagePath = await uploadImage(pendingImage);
    } catch (err) {
      alert('Image upload failed: ' + err.message);
      btn.disabled = false;
      btn.textContent = isEdit ? 'Save Changes' : 'Add Photo';
      return;
    }
    btn.disabled = false;
  }

  if (isEdit) {
    var idx = parseInt(editIndex);
    photos[idx].title = title;
    photos[idx].category = category;
    photos[idx].description = description;
    if (imagePath) photos[idx].image = imagePath;
  } else {
    if (!imagePath) return alert('Please select an image.');
    photos.push({
      id: generateId(title),
      title: title,
      image: imagePath,
      category: category,
      description: description,
      order: photos.length + 1
    });
  }

  renderPhotos();
  closeModal();
  showStatus('Changes pending — click Save to commit', '');
}

function removeImage() {
  pendingImage = null;
  document.getElementById('preview-container').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', function() {
  var uploadZone = document.getElementById('upload-zone');
  var fileInput = document.getElementById('file-input');

  uploadZone.addEventListener('click', function() {
    fileInput.click();
  });

  uploadZone.addEventListener('dragover', function(e) {
    e.preventDefault();
    uploadZone.classList.add('drag-over');
  });

  uploadZone.addEventListener('dragleave', function() {
    uploadZone.classList.remove('drag-over');
  });

  uploadZone.addEventListener('drop', function(e) {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    var file = e.dataTransfer.files[0];
    if (file && file.type.indexOf('image/') === 0) {
      handleImageFile(file);
    }
  });

  fileInput.addEventListener('change', function() {
    if (fileInput.files[0]) {
      handleImageFile(fileInput.files[0]);
      fileInput.value = '';
    }
  });
});

function handleImageFile(file) {
  pendingImage = file;
  var reader = new FileReader();
  reader.onload = function(e) {
    document.getElementById('preview-img').src = e.target.result;
    document.getElementById('preview-container').style.display = 'block';
  };
  reader.readAsDataURL(file);
}

async function saveChanges() {
  var btn = document.getElementById('save-btn');
  btn.disabled = true;
  showStatus('Saving...', 'loading');

  try {
    photos.forEach(function(p, i) { p.order = i + 1; });

    var cleanPhotos = photos.map(function(p) {
      var cp = {};
      for (var key in p) {
        if (p.hasOwnProperty(key) && p[key] !== undefined && p[key] !== null && p[key] !== '') {
          cp[key] = p[key];
        }
      }
      return cp;
    });

    var result = await putFile('gallery.json', { photos: cleanPhotos }, fileSha, 'Update gallery');
    fileSha = result.content.sha;
    showStatus('Saved successfully!', 'success');
    setTimeout(function() { showStatus('', ''); }, 3000);
  } catch (err) {
    showStatus('Save failed: ' + err.message, 'error');
  }

  btn.disabled = false;
}

function showStatus(msg, type) {
  var el = document.getElementById('save-status');
  el.textContent = msg;
  el.className = 'save-status' + (type ? ' ' + type : '');
}

function generateId(title) {
  return title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 40) || 'photo-' + Date.now();
}

function escapeHtml(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
