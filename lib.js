import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export const DEF = { calGoal: 2000, waterGoal: 8, waterEvery: 90, sleepGoal: 8, exerciseGoal: 30, tracking: false,
  wake: "07:00", bedtime: "23:00", breakfast: "09:00", lunch: "13:30", dinner: "20:00", exerciseTime: "18:00" };

export const load = async (k, d) => { try { const v = await AsyncStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
export const save = (k, v) => AsyncStorage.setItem(k, JSON.stringify(v)).catch(() => {});
export const dkey = (d = new Date()) => new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowAlert: true, shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }) });

export async function askNotifPermission() {
  if (Platform.OS === "android") await Notifications.setNotificationChannelAsync("default", { name: "Reminders", importance: Notifications.AndroidImportance.HIGH });
  const r = await Notifications.requestPermissionsAsync();
  return r.granted;
}
export const alertNow = (title, body) => Notifications.scheduleNotificationAsync({ content: { title, body }, trigger: null });

const hm = (t) => { const [h, m] = (t || "").split(":").map(Number); return isNaN(h) || isNaN(m) ? null : { h, m }; };
const daily = (title, body, t, kind) => {
  const x = hm(t); if (!x) return;
  return Notifications.scheduleNotificationAsync({ content: { title, body, data: { kind } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: x.h, minute: x.m } });
};
export async function cancelWater() {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(all.filter((n) => n.content.data?.kind === "water").map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)));
}
// Every reminder is scheduled on the phone itself, so no server is needed.
export async function scheduleAll(s) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  daily("Breakfast", "Log what you ate.", s.breakfast, "meal");
  daily("Lunch", "Log what you ate.", s.lunch, "meal");
  daily("Dinner", "Log what you ate.", s.dinner, "meal");
  daily("Move", `Get your ${s.exerciseGoal} min of exercise in.`, s.exerciseTime, "ex");
  daily("Bedtime", "Time to wind down. Log your sleep tomorrow.", s.bedtime, "bed");
  const a = hm(s.wake), b = hm(s.bedtime);
  if (a && b && s.waterEvery >= 15) {
    const start = a.h * 60 + a.m + s.waterEvery, end = b.h * 60 + b.m;
    for (let t = start; t < end; t += s.waterEvery)
      daily("Drink water", "Have a glass of water.", `${Math.floor(t / 60)}:${t % 60}`, "water");
  }
}
