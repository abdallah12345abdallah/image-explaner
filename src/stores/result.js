import { reactive } from "vue";

// Minimal shared state to hand the explanation + preview to the result page.
export const resultStore = reactive({
  data: null, // the parsed Arabic explanation object
  previewUrl: null, // data: URL of the analysed image
});

export function setResult(data, previewUrl) {
  resultStore.data = data;
  resultStore.previewUrl = previewUrl;
}
