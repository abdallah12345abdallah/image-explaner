<template>
  <ion-page>
    <ion-content :fullscreen="true" :dir="dir" class="login" scroll-y="false">
      <div class="screen">
        <!-- ─────────────  colored hero (persistent)  ───────────── -->
        <div class="hero">
          <div class="hero-decor" aria-hidden="true">
            <span class="o o1"></span>
            <span class="o o2"></span>
            <span class="o o3"></span>
            <span class="hp hp1"></span>
            <span class="hp hp2"></span>
            <span class="hp hp3"></span>
            <span class="hp hp4"></span>
            <span class="hero-sheen"></span>
          </div>

          <div class="topbar">
            <button v-if="canBack" class="iconbtn" :aria-label="t('common.back')" @click="back">
              <ion-icon :icon="backIcon" />
            </button>
            <span v-else class="iconbtn-ghost"></span>

            <div class="lang" aria-label="language">
              <button
                v-for="l in languages"
                :key="l.code"
                class="lang-opt"
                :class="{ on: locale === l.code }"
                @click="setLocale(l.code)"
              >
                {{ short(l.code) }}
              </button>
            </div>
          </div>

          <div class="hero-brand">
            <span class="wordmark">{{ t("brand") }}</span>
          </div>
        </div>

        <!-- ─────────────  form panel (persistent)  ───────────── -->
        <div class="panel">
          <!-- login / sign-up switch — hidden on the forgot-password view -->
          <div v-if="mode !== 'forgot'" class="switcher reveal" style="--d: 200ms">
            <button type="button" class="sw" :class="{ on: mode === 'login' }" @click="setMode('login')">
              {{ t("auth.loginTitle") }}
            </button>
            <button type="button" class="sw" :class="{ on: mode === 'signup' }" @click="setMode('signup')">
              {{ t("auth.signupTitle") }}
            </button>
          </div>

          <!-- only this part swaps when the view changes -->
          <div class="panel-body">
            <transition name="swap" mode="out-in">
              <div class="swap" :key="mode">
                <header class="head">
                  <h1>{{ headTitle }}</h1>
                  <p v-if="mode === 'forgot'">{{ t("auth.forgotSubtitle") }}</p>
                </header>

                <form :class="{ shake }" @submit.prevent="submit">
                  <transition name="msg">
                    <p v-if="error" class="msg">
                      <ion-icon :icon="alertCircleOutline" />
                      <span>{{ error }}</span>
                    </p>
                  </transition>

                  <p v-if="notice" class="msg ok">{{ notice }}</p>

                  <template v-if="!notice">
                    <!-- ───── sign-up only fields ───── -->
                    <template v-if="mode === 'signup'">
                      <div class="field" :class="{ focus: focused === 'name' }">
                        <label for="name">{{ t("auth.name") }}</label>
                        <div class="control">
                          <input
                            id="name"
                            v-model="name"
                            type="text"
                            autocomplete="name"
                            @focus="focused = 'name'"
                            @blur="focused = ''"
                          />
                        </div>
                      </div>

                      <div class="field" :class="{ focus: focused === 'nat' }">
                        <label for="nat">{{ t("auth.nationality") }}</label>
                        <div class="control">
                          <input
                            id="nat"
                            v-model="nationality"
                            type="text"
                            @focus="focused = 'nat'"
                            @blur="focused = ''"
                          />
                        </div>
                      </div>

                      <div class="field" :class="{ focus: focused === 'phone' }">
                        <label for="phone">{{ t("auth.phone") }}</label>
                        <div class="control">
                          <input
                            id="phone"
                            v-model="phone"
                            type="tel"
                            inputmode="tel"
                            autocomplete="tel"
                            dir="ltr"
                            placeholder="+966 5x xxx xxxx"
                            @focus="focused = 'phone'"
                            @blur="focused = ''"
                          />
                        </div>
                      </div>
                    </template>

                    <!-- ───── email (all modes) ───── -->
                    <div class="field" :class="{ focus: focused === 'email' }">
                      <label for="email">{{ t("auth.email") }}</label>
                      <div class="control">
                        <input
                          id="email"
                          v-model="email"
                          type="email"
                          inputmode="email"
                          autocomplete="email"
                          dir="ltr"
                          placeholder="name@example.com"
                          @focus="focused = 'email'"
                          @blur="focused = ''"
                        />
                      </div>
                    </div>

                    <!-- ───── password (login + signup) ───── -->
                    <div v-if="mode !== 'forgot'" class="field" :class="{ focus: focused === 'password' }">
                      <label for="password">{{ t("auth.password") }}</label>
                      <div class="control">
                        <input
                          id="password"
                          v-model="password"
                          :type="showPw ? 'text' : 'password'"
                          :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
                          dir="ltr"
                          placeholder="••••••••"
                          @focus="focused = 'password'"
                          @blur="focused = ''"
                        />
                        <button
                          type="button"
                          class="eye"
                          :aria-label="showPw ? 'hide' : 'show'"
                          @click="showPw = !showPw"
                        >
                          <ion-icon :icon="showPw ? eyeOffOutline : eyeOutline" />
                        </button>
                      </div>
                    </div>

                    <!-- ───── login only: forgot link ───── -->
                    <div v-if="mode === 'login'" class="forgot-row">
                      <button type="button" class="link" @click="setMode('forgot')">
                        {{ t("auth.forgotLink") }}
                      </button>
                    </div>

                    <!-- ───── sign-up only: privacy ───── -->
                    <label v-if="mode === 'signup'" class="check">
                      <input v-model="accepted" type="checkbox" />
                      <span>
                        {{ t("auth.acceptPre") }}
                        <a @click.prevent="go('/privacy')">{{ t("auth.privacyPolicy") }}</a>
                      </span>
                    </label>

                    <button class="submit" type="submit" :disabled="loading">
                      <span class="shine"></span>
                      <span v-if="!loading">{{ submitLabel }}</span>
                      <span v-else class="spinner"></span>
                    </button>
                  </template>

                  <!-- ───── forgot: back to login (also after success) ───── -->
                  <div v-if="mode === 'forgot'" class="back-row">
                    <button type="button" class="link" @click="setMode('login')">
                      {{ t("auth.backToLogin") }}
                    </button>
                  </div>
                </form>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { IonPage, IonContent, IonIcon, useIonRouter } from "@ionic/vue";
import { useRoute } from "vue-router";
import {
  eyeOutline,
  eyeOffOutline,
  alertCircleOutline,
  chevronBackOutline,
  chevronForwardOutline,
} from "ionicons/icons";
import { t, dir, locale, setLocale, LANGUAGES } from "@/i18n";
import { signIn, signUp, sendPasswordReset } from "@/stores/auth";

const ionRouter = useIonRouter();
const route = useRoute();
const languages = LANGUAGES;

// 'login' | 'signup' | 'forgot' — initial view from the route, then local.
const initialMode =
  route.name === "Signup" ? "signup" : route.name === "ForgotPassword" ? "forgot" : "login";
const mode = ref(initialMode);

const name = ref("");
const nationality = ref("");
const phone = ref("");
const email = ref("");
const password = ref("");
const accepted = ref(false);
const focused = ref("");
const showPw = ref(false);
const loading = ref(false);
const error = ref("");
const notice = ref(""); // success message (signup confirm / reset sent)
const shake = ref(false);

const SHORT = { ar: "ع", en: "EN", uk: "UK" };
const short = (code) => SHORT[code] || code.toUpperCase();

const headTitle = computed(() => {
  if (mode.value === "signup") return t("auth.signupSubtitle");
  if (mode.value === "forgot") return t("auth.forgotTitle");
  return t("auth.loginSubtitle");
});
const submitLabel = computed(() => {
  if (mode.value === "signup") return t("auth.signupBtn");
  if (mode.value === "forgot") return t("auth.sendReset");
  return t("auth.loginBtn");
});

const canBack = ref(false);
onMounted(() => (canBack.value = ionRouter.canGoBack()));
const backIcon = computed(() => (dir.value === "rtl" ? chevronForwardOutline : chevronBackOutline));
function back() {
  ionRouter.back();
}

function go(path) {
  ionRouter.push(path, "forward");
}

// Switch view in place — no page navigation, just swap the form.
function setMode(m) {
  if (mode.value === m) return;
  mode.value = m;
  error.value = "";
  notice.value = "";
  focused.value = "";
  showPw.value = false;
}

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

function fail(msg) {
  error.value = msg;
  shake.value = false;
  requestAnimationFrame(() => {
    shake.value = true;
    setTimeout(() => (shake.value = false), 500);
  });
}

async function submit() {
  error.value = "";
  loading.value = true;
  try {
    if (mode.value === "login") await doLogin();
    else if (mode.value === "signup") await doSignup();
    else await doForgot();
  } finally {
    loading.value = false;
  }
}

async function doLogin() {
  if (!email.value.trim() || !password.value) return fail(t("auth.errRequired"));
  try {
    await signIn(email.value, password.value);
    ionRouter.push("/tabs/home", "root", "replace");
  } catch (e) {
    fail(
      e?.status === 400 || /invalid login/i.test(e?.message || "")
        ? t("auth.errCredentials")
        : t("auth.errGeneric")
    );
  }
}

async function doSignup() {
  if (!name.value.trim() || !email.value.trim() || !password.value) return fail(t("auth.errRequired"));
  if (!emailOk(email.value.trim())) return fail(t("auth.errEmail"));
  if (password.value.length < 6) return fail(t("auth.errPassword"));
  if (!accepted.value) return fail(t("auth.errPrivacy"));
  try {
    const { needsConfirmation } = await signUp({
      name: name.value,
      nationality: nationality.value,
      phone: phone.value,
      email: email.value,
      password: password.value,
      acceptedPrivacy: accepted.value,
    });
    if (needsConfirmation) notice.value = t("auth.signupDone");
    else ionRouter.push("/tabs/home", "root", "replace");
  } catch {
    fail(t("auth.errGeneric"));
  }
}

async function doForgot() {
  if (!emailOk(email.value.trim())) return fail(t("auth.errEmail"));
  try {
    await sendPasswordReset(email.value);
  } catch {
    /* don't reveal whether the email exists */
  }
  notice.value = t("auth.resetSent");
}
</script>

<style scoped>
.login {
  --background: #ffffff;
}
.screen {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: "Cairo", sans-serif;
}

/* ─────────────  hero  ───────────── */
.hero {
  position: relative;
  overflow: hidden;
  padding: calc(env(safe-area-inset-top) + 12px) 20px 40px;
  background: linear-gradient(135deg, #0d9488 0%, #14b8a6 42%, #2dd4bf 70%, #14b8a6 100%);
  background-size: 200% 200%;
  color: #fff;
  animation: heroIn 0.6s ease both, heroFlow 14s ease-in-out infinite;
}
.hero-decor { position: absolute; inset: 0; pointer-events: none; }
.o { position: absolute; border-radius: 50%; background: rgba(255, 255, 255, 0.12); }
.o1 { width: 180px; height: 180px; top: -60px; inset-inline-end: -40px; animation: floatA 9s ease-in-out infinite; }
.o2 { width: 120px; height: 120px; bottom: -30px; inset-inline-start: 30px; background: rgba(255, 255, 255, 0.08); animation: floatB 11s ease-in-out infinite; }
.o3 { width: 90px; height: 90px; top: 44px; inset-inline-start: 36%; background: rgba(255, 255, 255, 0.07); animation: floatA 13s ease-in-out infinite reverse; }

.hp {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.75);
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.6);
}
.hp1 { width: 6px; height: 6px; inset-inline-start: 20%; bottom: 12%; animation: heroFloat 7s ease-in infinite; }
.hp2 { width: 4px; height: 4px; inset-inline-start: 68%; top: 34%; animation: heroFloat 9s ease-in infinite 1.4s; }
.hp3 { width: 5px; height: 5px; inset-inline-start: 84%; bottom: 24%; animation: heroFloat 8s ease-in infinite 2.6s; }
.hp4 { width: 3px; height: 3px; inset-inline-start: 42%; top: 22%; animation: heroFloat 10s ease-in infinite 3.6s; }

.hero-sheen {
  position: absolute;
  top: -25%;
  inset-inline-start: -40%;
  width: 38%;
  height: 170%;
  background: linear-gradient(110deg, transparent, rgba(255, 255, 255, 0.16), transparent);
  transform: skewX(-18deg);
  animation: heroSheen 6.5s ease-in-out infinite;
}

.topbar {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.iconbtn,
.iconbtn-ghost { width: 38px; height: 38px; flex: 0 0 auto; }
.iconbtn {
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
  font-size: 1.2rem;
  cursor: pointer;
  transition: background 0.16s ease, transform 0.16s ease;
}
.iconbtn:active { background: rgba(255, 255, 255, 0.28); transform: scale(0.94); }

.lang {
  display: flex;
  gap: 3px;
  padding: 4px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.22);
}
.lang-opt {
  min-width: 38px;
  padding: 8px 12px;
  border: none;
  border-radius: 9px;
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
  font-family: "Cairo", sans-serif;
  font-size: 0.9rem;
  font-weight: 800;
  cursor: pointer;
}
.lang-opt.on { background: #fff; color: #0d9488; }

.hero-brand {
  position: relative;
  z-index: 1;
  margin-top: 16px;
}
.wordmark {
  display: inline-block;
  font-family: "Gulzar", "Aref Ruqaa", serif;
  font-size: 2.7rem;
  line-height: 1.35;
  color: #fff;
  text-shadow: 0 3px 18px rgba(0, 0, 0, 0.22);
  transform-origin: center;
  animation: brandIn 0.75s cubic-bezier(0.2, 1.25, 0.4, 1) 0.15s both,
    brandGlow 3.4s ease-in-out 1.1s infinite;
}

/* ─────────────  white form panel  ───────────── */
.panel {
  position: relative;
  z-index: 2;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-top: -24px;
  padding: 22px 20px 0;
  background: #fff;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -10px 30px rgba(13, 70, 65, 0.1);
  animation: panelUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.08s both;
}

/* tabs */
.switcher {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  padding: 4px;
  margin-bottom: 28px;
  border-radius: 13px;
  background: #f1f1f6;
}
.sw {
  border: none;
  background: transparent;
  border-radius: 10px;
  padding: 10px 0;
  font-family: "Cairo", sans-serif;
  font-weight: 800;
  font-size: 0.88rem;
  color: #8a8a99;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}
.sw.on {
  background: #fff;
  color: #14121f;
  box-shadow: 0 3px 10px rgba(20, 18, 31, 0.1);
}

/* swapping body — the only scrollable region */
.panel-body {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  margin: 0 -20px;
  padding: 0 20px calc(env(safe-area-inset-bottom) + 22px);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.panel-body::-webkit-scrollbar { display: none; }
.swap { margin: auto 0; width: 100%; }

/* heading */
.head { margin-bottom: 26px; }
.head h1 {
  margin: 0;
  font-size: 1.55rem;
  font-weight: 800;
  color: #14121f;
  letter-spacing: -0.02em;
  line-height: 1.2;
}
.head p { margin: 8px 0 0; font-size: 0.9rem; color: #8a8a99; line-height: 1.5; }

/* messages */
.msg {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 0 0 18px;
  padding: 12px 14px;
  border-radius: 14px;
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
  font-size: 0.86rem;
  font-weight: 600;
}
.msg.ok { background: #f0fdf4; color: #15803d; border-color: #bbf7d0; }
.msg ion-icon { font-size: 1.2rem; flex: 0 0 auto; }
.msg-enter-active { transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); }
.msg-enter-from { opacity: 0; transform: translateY(-8px); }

/* fields */
.field { margin-bottom: 13px; }
.field label {
  display: block;
  margin: 0 0 6px 2px;
  font-size: 0.8rem;
  font-weight: 700;
  color: #43414f;
}
.control {
  display: flex;
  align-items: center;
  height: 50px;
  padding: 0 14px;
  border-radius: 13px;
  background: #f5f6f8;
  border: 1.5px solid transparent;
  transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}
.field.focus .control {
  background: #fff;
  border-color: #0d9488;
  box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.14);
}
.control input {
  flex: 1 1 auto;
  min-width: 0;
  height: 100%;
  border: none;
  background: transparent;
  outline: none;
  font-family: "Cairo", sans-serif;
  font-size: 0.95rem;
  color: #14121f;
}
.control input::placeholder { color: #aab2b9; }
.eye {
  flex: 0 0 auto;
  width: 34px; height: 34px;
  display: grid; place-items: center;
  border: none;
  background: transparent;
  color: #9aa0ad;
  font-size: 1.15rem;
  cursor: pointer;
  border-radius: 9px;
  margin-inline-start: 4px;
}
.eye:active { background: #ebeef1; }

/* forgot link row */
.forgot-row { text-align: end; margin: 0 2px 18px; }
.back-row { text-align: center; margin-top: 20px; }
.link {
  background: none;
  border: none;
  padding: 0;
  font-family: "Cairo", sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  color: #0d9488;
  cursor: pointer;
}

/* privacy */
.check {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 6px 2px 18px;
  font-size: 0.82rem;
  color: #5b5b6b;
  line-height: 1.5;
}
.check input { width: 19px; height: 19px; margin-top: 1px; accent-color: #0d9488; flex: 0 0 auto; }
.check a { color: #0d9488; font-weight: 700; text-decoration: underline; cursor: pointer; }

/* submit */
.submit {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 50px;
  border: none;
  border-radius: 13px;
  background: linear-gradient(110deg, #15bdac 0%, #0d9488 100%);
  color: #fff;
  font-family: "Cairo", sans-serif;
  font-weight: 800;
  font-size: 0.98rem;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(13, 148, 136, 0.32);
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
}
.submit:active { transform: translateY(1px) scale(0.99); box-shadow: 0 9px 20px rgba(13, 148, 136, 0.3); }
.submit:disabled { opacity: 0.92; cursor: default; }
.submit span { position: relative; z-index: 1; }
.shine {
  position: absolute;
  top: 0;
  left: -60%;
  width: 45%;
  height: 100%;
  background: linear-gradient(110deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transform: skewX(-20deg);
  animation: shine 3.4s ease-in-out infinite;
}
.spinner {
  display: inline-block;
  width: 23px; height: 23px;
  border: 2.6px solid rgba(255, 255, 255, 0.45);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

/* tab-content swap transition */
.swap-enter-active { transition: opacity 0.28s ease, transform 0.28s ease; }
.swap-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.swap-enter-from { opacity: 0; transform: translateY(12px); }
.swap-leave-to { opacity: 0; transform: translateY(-10px); }

/* one-time entrance */
.reveal {
  animation: reveal 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--d);
}
@keyframes reveal {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes heroIn {
  from { opacity: 0; transform: translateY(-16px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes heroFlow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
@keyframes floatA {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-14px, 12px) scale(1.08); }
}
@keyframes floatB {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(16px, -10px) scale(1.1); }
}
@keyframes heroFloat {
  0% { transform: translateY(10px); opacity: 0; }
  20% { opacity: 0.85; }
  80% { opacity: 0.55; }
  100% { transform: translateY(-26px); opacity: 0; }
}
@keyframes heroSheen {
  0% { inset-inline-start: -40%; }
  55%, 100% { inset-inline-start: 135%; }
}
@keyframes panelUp {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes brandIn {
  0% { opacity: 0; transform: translateY(14px) scale(0.7); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes brandGlow {
  0%, 100% { text-shadow: 0 3px 18px rgba(0, 0, 0, 0.22); }
  50% { text-shadow: 0 0 22px rgba(255, 255, 255, 0.55), 0 3px 18px rgba(0, 0, 0, 0.22); }
}
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes shine { 0% { left: -60%; } 60%, 100% { left: 130%; } }
form.shake { animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97); }
@keyframes shake {
  10%, 90% { transform: translateX(-1px); }
  20%, 80% { transform: translateX(2px); }
  30%, 50%, 70% { transform: translateX(-5px); }
  40%, 60% { transform: translateX(5px); }
}

@media (prefers-reduced-motion: reduce) {
  .shine, .spinner, .wordmark,
  .o, .hp, .hero-sheen { animation: none !important; }
  .hp, .hero-sheen { opacity: 0; }
  .reveal, .hero, .panel { animation: none; opacity: 1; transform: none; }
  .swap-enter-active, .swap-leave-active { transition: none; }
}
</style>
