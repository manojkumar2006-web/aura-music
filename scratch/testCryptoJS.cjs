const CryptoJS = require('crypto-js');

function decryptSaavnUrl(encryptedUrl) {
  try {
    const key = CryptoJS.enc.Utf8.parse('38346591');
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(encryptedUrl) },
      key,
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    );
    const url = decrypted.toString(CryptoJS.enc.Utf8);
    // Replace the default 96kbps url with 320kbps
    return url.replace(/_96\.mp4/, '_320.mp4');
  } catch (e) {
    return null;
  }
}

const encrypted = "ID2ieOjCrwdjlkMElYlzWCptgNdUpWD8/JxYLGZgOwGflHqCL7qGeHDIIsVVLndaKFE/gmD7kpQvj2S2d4hayY92mytrdt3FDnQW0nglPS4=";
console.log("Decrypted URL:", decryptSaavnUrl(encrypted));
