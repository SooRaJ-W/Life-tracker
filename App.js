import { useEffect, useRef, useState } from "react";
import { AppState, Linking, SafeAreaView, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View, StyleSheet } from "react-native";
import * as Location from "expo-location";
import { DEF, load, save, dkey, askNotifPermission, alertNow, scheduleAll, cancelWater } from "./lib";
import { startTracking, stopTracking } from "./locationTask";
import { C, Btn, Card, st } from "./ui";
import Diet from "./Diet";
import AlertPlaces from "./AlertPlaces";

const hm = (t) => new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const last7 = () => Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 6 + i); return dkey(d); });

export default function App() {
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState("today");
  const [s, setS] = useState(DEF);
  const [meals, setMeals] = useState([]);
  const [water, setWater] = useState({});
  const [sleep, setSleep] = useState({});
  const [exercise, setExercise] = useState([]);
  const [places, setPlaces] = useState([]);
  const [msg, setMsg] = useState("");
  const today = dkey();

  useEffect(() => {
    (async () => {
      setS({ ...DEF, ...(await load("settings", {})) }); setMeals(await load("meals", [])); setWater(await load("water", {}));
      setSleep(await load("sleep", {})); setExercise(await load("exercise", [])); setPlaces(await load("places", []));
      setReady(true);
    })();
    // background task writes places, so re-read them when the app comes back
    const sub = AppState.addEventListener("change", async (st) => { if (st === "active") setPlaces(await load("places", [])); });
    return () => sub.remove();
  }, []);
  useEffect(() => { if (ready) { save("meals", meals); save("water", water); save("sleep", sleep); save("exercise", exercise); } }, [meals, water, sleep, exercise, ready]);
  useEffect(() => { if (ready) save("places", places); }, [places, ready]);
  useEffect(() => { if (ready) { save("settings", s); askNotifPermission().then((ok) => ok && scheduleAll(s)); } }, [s, ready]);

  const dayMeals = meals.filter((m) => m.date === today);
  const cal = dayMeals.reduce((a, m) => a + m.cal, 0);
  const glasses = water[today] || 0;
  const mac = dayMeals.reduce((t, m) => ({ p: t.p + (m.p || 0), c: t.c + (m.c || 0), f: t.f + (m.f || 0) }), { p: 0, c: 0, f: 0 });
  const exMin = exercise.filter((e) => e.date === today).reduce((a, e) => a + e.min, 0);

  const warned = useRef(false);
  useEffect(() => {
    if (!ready) return;
    if (cal > s.calGoal && !warned.current) { warned.current = true; alertNow("Calorie goal crossed", `${cal}/${s.calGoal} kcal today.`); }
    if (cal <= s.calGoal) warned.current = false;
  }, [cal, s.calGoal, ready]);
  useEffect(() => { if (ready && glasses >= s.waterGoal) cancelWater(); }, [glasses, ready]); // goal done: stop today's water reminders

  // name unnamed places
  const tried = useRef(new Set());
  useEffect(() => {
    const p = places.find((x) => !x.label && !tried.current.has(x.id)); if (!p) return;
    tried.current.add(p.id);
    Location.reverseGeocodeAsync({ latitude: p.lat, longitude: p.lng }).then((r) => {
      const a = r[0]; const n = a && (a.name || a.street || a.city); if (n) setPlaces((l) => l.map((x) => x.id === p.id && !x.label ? { ...x, label: n } : x));
    }).catch(() => {});
  }, [places]);

  const toggleTracking = async () => {
    try { if (s.tracking) await stopTracking(); else await startTracking(); setS({ ...s, tracking: !s.tracking }); setMsg(""); }
    catch (e) { setMsg(e.message); }
  };
  if (!ready) return null;
  const tabs = ["today", "diet", "body", "places", "alerts", "week", "settings"];

  return (
    <SafeAreaView style={st.root}>
      <StatusBar barStyle="dark-content" />
      <Text style={st.h1}>Life Tracker</Text>
      <View style={st.nav}>{tabs.map((t) => <TouchableOpacity key={t} style={[st.tab, tab === t && st.tabOn]} onPress={() => setTab(t)}><Text style={[st.tabT, tab === t && { color: "#fff" }]}>{t}</Text></TouchableOpacity>)}</View>
      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        {tab === "today" && <>
          <Meter label="Calories" v={cal} goal={s.calGoal} unit="kcal" warn />
          <Meter label="Water" v={glasses} goal={s.waterGoal} unit="glasses" />
          <Meter label="Sleep" v={sleep[today] || 0} goal={s.sleepGoal} unit="h" />
          <Meter label="Exercise" v={exMin} goal={s.exerciseGoal} unit="min" />
          <Card title="Macros today"><Text style={st.p}>Protein {mac.p} g   Carbs {mac.c} g   Fat {mac.f} g</Text></Card>
          <View style={st.row}><Btn t="+ Glass of water" on={() => setWater({ ...water, [today]: glasses + 1 })} /><Btn ghost t="Undo" on={() => setWater({ ...water, [today]: Math.max(0, glasses - 1) })} /></View>
          <Card title="Location tracking">
            <Text style={st.p}>{s.tracking ? "On. Saving places even when the app is closed." : "Off."}{places[0] ? `\nLast: ${places[0].label || "unnamed place"} at ${hm(places[0].t)}` : ""}</Text>
            <Btn t={s.tracking ? "Stop tracking" : "Start tracking"} on={toggleTracking} />{!!msg && <Text style={[st.p, { color: C.warn }]}>{msg}</Text>}
          </Card>
        </>}
        {tab === "diet" && <Diet meals={dayMeals} add={(m) => setMeals([{ ...m, id: Date.now(), date: today, t: Date.now() }, ...meals])} del={(id) => setMeals(meals.filter((m) => m.id !== id))} />}
        {tab === "body" && <Body hours={sleep[today]} setHours={(h) => setSleep({ ...sleep, [today]: h })} list={exercise.filter((e) => e.date === today)}
          add={(e) => setExercise([{ ...e, id: Date.now(), date: today }, ...exercise])} del={(id) => setExercise(exercise.filter((e) => e.id !== id))} />}
        {tab === "places" && (places.length ? <>
          <Btn ghost t="Clear history" on={() => setPlaces([])} />
          {places.map((p) => <View key={p.id} style={st.item}><View style={{ flex: 1 }}>
            <TextInput style={st.inl} placeholder="Name this place" value={p.label} onChangeText={(v) => setPlaces(places.map((x) => x.id === p.id ? { ...x, label: v } : x))} />
            <Text style={st.small}>{new Date(p.t).toLocaleString()}</Text></View>
            <Text style={st.link} onPress={() => Linking.openURL(`https://www.google.com/maps?q=${p.lat},${p.lng}`)}>Map</Text></View>)}
        </> : <Text style={st.empty}>No places saved. Start tracking from the Today tab.</Text>)}
        {tab === "alerts" && <AlertPlaces />}
        {tab === "week" && <Week meals={meals} water={water} sleep={sleep} exercise={exercise} />}
        {tab === "settings" && <Settings s={s} setS={setS} />}
      </ScrollView>
    </SafeAreaView>
  );
}

const Meter = ({ label, v, goal, unit, warn }) => <Card title={label}>
  <Text style={st.big}>{v}<Text style={st.small}> / {goal} {unit}</Text></Text>
  <View style={st.bar}><View style={{ height: 10, width: `${Math.min(100, (v / goal) * 100 || 0)}%`, backgroundColor: warn && v > goal ? C.warn : C.acc }} /></View></Card>;

function Body({ hours, setHours, list, add, del }) {
  const [type, setType] = useState(""), [min, setMin] = useState("");
  return <>
    <Card title="Sleep last night"><TextInput style={st.input} placeholder="Hours slept" keyboardType="decimal-pad" value={hours ? String(hours) : ""} onChangeText={(v) => setHours(Number(v) || 0)} /></Card>
    <Card title="Add exercise">
      <TextInput style={st.input} placeholder="Walk, gym, yoga..." value={type} onChangeText={setType} />
      <TextInput style={st.input} placeholder="Minutes" keyboardType="numeric" value={min} onChangeText={setMin} />
      <Btn t="Save exercise" on={() => { if (type && min) { add({ type, min: Number(min) }); setType(""); setMin(""); } }} />
    </Card>
    {!list.length && <Text style={st.empty}>No exercise today.</Text>}
    {list.map((x) => <View key={x.id} style={st.item}><Text style={{ flex: 1, fontWeight: "700", color: C.ink }}>{x.type}</Text><Text style={st.p}>{x.min} min  </Text><Text onPress={() => del(x.id)} style={st.link}>✕</Text></View>)}
  </>;
}

function Week({ meals, water, sleep, exercise }) {
  const days = last7();
  const rows = [["Calories (kcal)", days.map((d) => meals.filter((m) => m.date === d).reduce((a, m) => a + m.cal, 0))],
    ["Water (glasses)", days.map((d) => water[d] || 0)], ["Sleep (hours)", days.map((d) => sleep[d] || 0)],
    ["Exercise (min)", days.map((d) => exercise.filter((e) => e.date === d).reduce((a, e) => a + e.min, 0))]];
  return rows.map(([title, vals]) => { const max = Math.max(...vals, 1);
    return <Card key={title} title={title}><View style={st.chart}>{vals.map((v, i) => <View key={i} style={st.col}>
      <Text style={st.tiny}>{v || ""}</Text><View style={{ width: "100%", height: Math.max(2, (v / max) * 80), backgroundColor: C.acc, borderTopLeftRadius: 4, borderTopRightRadius: 4 }} />
      <Text style={st.tiny}>{days[i].slice(8)}</Text></View>)}</View></Card>; });
}

function Settings({ s, setS }) {
  const num = (k, label) => <Field key={k} label={label} v={String(s[k])} set={(v) => setS({ ...s, [k]: Number(v) || 0 })} numeric />;
  const txt = (k, label) => <Field key={k} label={label} v={s[k]} set={(v) => setS({ ...s, [k]: v })} />;
  return <>
    <Card title="Goals">{[num("calGoal", "Calorie goal (kcal)"), num("waterGoal", "Water goal (glasses)"), num("sleepGoal", "Sleep goal (hours)"), num("exerciseGoal", "Exercise goal (min)")]}</Card>
    <Card title="Reminders (24h format, HH:MM)">{[num("waterEvery", "Water every (min, 15 or more)"), txt("wake", "Wake up"), txt("bedtime", "Bedtime"), txt("breakfast", "Breakfast"), txt("lunch", "Lunch"), txt("dinner", "Dinner"), txt("exerciseTime", "Exercise")]}
      <Text style={st.small}>Reminders are saved on your phone and arrive even when the app is closed. Water reminders run between wake up and bedtime.</Text></Card>
  </>;
}
const Field = ({ label, v, set, numeric }) => <View style={{ marginBottom: 8 }}><Text style={st.small}>{label}</Text><TextInput style={st.input} value={v} onChangeText={set} keyboardType={numeric ? "numeric" : "default"} /></View>;

