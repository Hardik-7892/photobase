const MAX_FILE_SIZE = 4 * 1024 * 1024;

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'];

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'webm', 'mov'];

const MAGIC_BYTES = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46, null, null, null, null, 0x57, 0x45, 0x42, 0x50]],
  'image/gif': [[0x47, 0x49, 0x46, 0x38]],
  'video/mp4': [[0x00, 0x00, 0x00, 0x00, 0x66, 0x74, 0x79, 0x70], [0x00, 0x00, 0x00, 0x00, 0x6D, 0x6F, 0x6F, 0x76]],
  'video/webm': [[0x1A, 0x45, 0xDF, 0xA3]],
  'video/quicktime': [[0x00, 0x00, 0x00, 0x00, 0x66, 0x74, 0x79, 0x70]]
};

function getExtension(filename) {
  var parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

function validateMagicBytes(buffer, mimeType) {
  var signatures = MAGIC_BYTES[mimeType];
  if (!signatures) return false;

  var bytes = new Uint8Array(buffer.slice(0, 12));
  for (var i = 0; i < signatures.length; i++) {
    var sig = signatures[i];
    var match = true;
    for (var j = 0; j < sig.length; j++) {
      if (sig[j] !== null && bytes[j] !== sig[j]) {
        match = false;
        break;
      }
    }
    if (match) return true;
  }
  return false;
}

function validateFile(buffer, mimeType, filename) {
  if (buffer.length > MAX_FILE_SIZE) {
    return { valid: false, error: 'File too large. Maximum size is ' + (MAX_FILE_SIZE / 1024 / 1024) + 'MB.' };
  }

  var ext = getExtension(filename);
  if (ALLOWED_EXTENSIONS.indexOf(ext) === -1) {
    return { valid: false, error: 'File extension not allowed.' };
  }

  if (ALLOWED_MIME_TYPES.indexOf(mimeType) === -1) {
    return { valid: false, error: 'File type not allowed.' };
  }

  if (!validateMagicBytes(buffer, mimeType)) {
    return { valid: false, error: 'File content does not match its type.' };
  }

  return { valid: true };
}

module.exports = { validateFile: validateFile, MAX_FILE_SIZE: MAX_FILE_SIZE, ALLOWED_EXTENSIONS: ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPES: ALLOWED_MIME_TYPES };
