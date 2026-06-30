// Global "talking to the server" indicator.
//
// The data stores (appointments / history / settings) bump this counter around
// every real network read or write, so the UI can show a single, shared
// "syncing…" hint while anything is in flight — without each page wiring up its
// own loading flags.
//
//   import { isSyncing } from "@/stores/sync";
//   <div v-if="isSyncing"> … </div>
//
//   // inside a store, around server I/O:
//   return withSync(async () => { … network call … });
import { reactive, computed } from "vue";

export const syncStore = reactive({ active: 0 });

// True while one or more server operations are running.
export const isSyncing = computed(() => syncStore.active > 0);

export function syncBegin() {
  syncStore.active += 1;
}

export function syncEnd() {
  syncStore.active = Math.max(0, syncStore.active - 1);
}

// Run an async server operation while keeping the indicator on; always clears
// even if the operation throws.
export async function withSync(fn) {
  syncBegin();
  try {
    return await fn();
  } finally {
    syncEnd();
  }
}
