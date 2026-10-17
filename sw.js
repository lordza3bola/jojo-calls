/* Offline cache: the whole game is saved on the phone after the first launch.
   Change VERSION whenever you upload new files so phones pick up the update. */
const VERSION = 'jojo-calls-v2';
const FILES = ["./", "assets/audio/voice/jojo_clip_01.mp3", "assets/audio/voice/jojo_clip_02.mp3", "assets/audio/voice/jojo_clip_03.mp3", "assets/audio/voice/jojo_clip_04.mp3", "assets/audio/voice/jojo_clip_05.mp3", "assets/characters/couple/call_salute.png", "assets/characters/couple/kiss.png", "assets/characters/jojo/face_angry.png", "assets/characters/jojo/face_blow_kiss.png", "assets/characters/jojo/face_bored.png", "assets/characters/jojo/face_calling.png", "assets/characters/jojo/face_gift_excited.png", "assets/characters/jojo/face_hungry.png", "assets/characters/jojo/face_in_love.png", "assets/characters/jojo/face_laughing.png", "assets/characters/jojo/face_sad.png", "assets/characters/jojo/face_sick.png", "assets/characters/jojo/face_surprised.png", "assets/characters/jojo/face_wink_thumbs_up.png", "assets/characters/jojo/pose_bored_sofa.png", "assets/characters/jojo/pose_jump_joy.png", "assets/characters/jojo/pose_sick_bed.png", "assets/characters/jojo/pose_stand.png", "assets/characters/mohamed/face_answer_call.png", "assets/characters/mohamed/face_confused.png", "assets/characters/mohamed/face_crying.png", "assets/characters/mohamed/face_dizzy.png", "assets/characters/mohamed/face_done_wink.png", "assets/characters/mohamed/face_furious.png", "assets/characters/mohamed/face_gloomy.png", "assets/characters/mohamed/face_grumpy.png", "assets/characters/mohamed/face_in_love.png", "assets/characters/mohamed/face_kissed_blush.png", "assets/characters/mohamed/face_panic.png", "assets/characters/mohamed/face_running_face.png", "assets/characters/mohamed/face_sorry.png", "assets/characters/mohamed/pose_carry_food.png", "assets/characters/mohamed/pose_carry_gift.png", "assets/characters/mohamed/pose_carry_medicine.png", "assets/characters/mohamed/pose_celebrate.png", "assets/characters/mohamed/pose_run.png", "assets/characters/mohamed/pose_stand.png", "assets/characters/mohamed/pose_trip.png", "assets/manifest.json", "icons/apple-touch-icon.png", "icons/icon-1024.png", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png", "index.html", "js/art.js", "js/audio.js", "js/config.js", "js/engine.js", "js/main.js", "js/missions.js", "manifest.webmanifest"];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // fonts load from Google when online
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || fetch(e.request).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
