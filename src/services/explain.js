import axiosClient from "./axiosClient";

// Sends a base64 image to the backend proxy and returns the Arabic explanation.
export function explainImage({ base64, mediaType }) {
  return axiosClient
    .post("/api/explain", { image: base64, mediaType })
    .then((res) => res.data);
}
