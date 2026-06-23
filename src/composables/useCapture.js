import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

// Returns { base64, mediaType, previewUrl } or null if cancelled.

function inferMediaType(format) {
  if (!format) return "image/jpeg";
  if (format === "jpg") return "image/jpeg";
  return `image/${format}`;
}

async function getPhoto(source) {
  const photo = await Camera.getPhoto({
    source,
    resultType: CameraResultType.Base64,
    quality: 70,
    correctOrientation: true,
  });
  if (!photo?.base64String) return null;
  const mediaType = inferMediaType(photo.format);
  return {
    base64: photo.base64String,
    mediaType,
    previewUrl: `data:${mediaType};base64,${photo.base64String}`,
  };
}

export function useCapture() {
  // Native camera capture (live photo).
  const takePhoto = () => getPhoto(CameraSource.Camera);

  // Native picker — lets the user choose from the photo gallery.
  const pickFromGallery = () => getPhoto(CameraSource.Photos);

  // File <input> fallback — best for web/PWA and explicit file upload.
  const pickFile = () =>
    new Promise((resolve, reject) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = () => {
        const file = input.files && input.files[0];
        if (!file) return resolve(null);
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = String(reader.result);
          const comma = dataUrl.indexOf(",");
          resolve({
            base64: dataUrl.slice(comma + 1),
            mediaType: file.type || "image/jpeg",
            previewUrl: dataUrl,
          });
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      };
      input.click();
    });

  return { takePhoto, pickFromGallery, pickFile };
}
