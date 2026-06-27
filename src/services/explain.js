import axiosClient from "./axiosClient";

// Sends a base64 image to the backend proxy and returns the explanation.
// `language` (e.g. "ar" | "en" | "uk") asks the backend to reply in that
// language. The backend must honour it; if omitted it defaults to Arabic.
export function explainImage({ base64, mediaType }, language = "ar") {
  return axiosClient
    .post("/api/explain", { image: base64, mediaType, language })
    .then((res) => res.data);
}
