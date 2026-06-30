const crypto = require('crypto');

function decryptUrl(encryptedUrl) {
  try {
    const key = Buffer.from('38346591', 'utf8');
    const decipher = crypto.createDecipheriv('des-ecb', key, Buffer.alloc(0));
    let decrypted = decipher.update(encryptedUrl, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (e) {
    return e.message;
  }
}

// from our earlier test output
const encrypted = "ID2ieOjCrwdjlkMElYlzWCptgNdUpWD8/JxYLGZgOwGflHqCL7qGeHDIIsVVLndaKFE/gmD7kpQvj2S2d4hayY92mytrdt3FDnQW0nglPS4=";
console.log(decryptUrl(encrypted));
