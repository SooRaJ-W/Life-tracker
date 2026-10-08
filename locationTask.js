// Runs in the background, even when the app is closed.
import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import { load, save } from "./lib";

export const TASK = "life-tracker-location";

TaskManager.defineTask(TASK, async ({ data, error }) => {
  if (error || !data) return;
  const places = await load("places", []);
  for (const l of data.locations) {
    const { latitude: lat, longitude: lng } = l.coords;
    const last = places[0];
    if (!last || Math.hypot(lat - last.lat, lng - last.lng) > 0.0005)
      places.unshift({ id: l.timestamp + "", lat, lng, t: l.timestamp, label: "" });
  }
  await save("places", places.slice(0, 500));
});

export async function startTracking() {
  const fg = await Location.requestForegroundPermissionsAsync();
  if (!fg.granted) throw new Error("Location permission denied.");
  const bg = await Location.requestBackgroundPermissionsAsync();
  if (!bg.granted) throw new Error("Choose 'Allow all the time' in settings for background tracking.");
  await Location.startLocationUpdatesAsync(TASK, {
    accuracy: Location.Accuracy.Balanced, distanceInterval: 100, timeInterval: 60000,
    showsBackgroundLocationIndicator: true,
    foregroundService: { notificationTitle: "Life Tracker", notificationBody: "Saving places you visit." },
  });
}
export async function stopTracking() {
  if (await Location.hasStartedLocationUpdatesAsync(TASK).catch(() => false)) await Location.stopLocationUpdatesAsync(TASK);
}

// ---- Place alerts (geofences) ----
import { alertNow } from "./lib";
export const GEO = "life-tracker-geofence";

TaskManager.defineTask(GEO, async ({ data, error }) => {
  if (error || !data) return;
  const list = await load("alertPlaces", []);
  const p = list.find((x) => x.id === data.region.identifier);
  if (!p) return;
  if (data.eventType === Location.GeofencingEventType.Enter) alertNow(`Reached ${p.name}`, p.note || "You arrived.");
  else alertNow(`Left ${p.name}`, "Keep up your water and meals.");
});

export async function syncGeofences(list) {
  if (await Location.hasStartedGeofencingAsync(GEO).catch(() => false)) await Location.stopGeofencingAsync(GEO);
  if (!list.length) return;
  await Location.startGeofencingAsync(GEO, list.map((p) => ({ identifier: p.id, latitude: p.lat, longitude: p.lng, radius: 150, notifyOnEnter: true, notifyOnExit: true })));
}
