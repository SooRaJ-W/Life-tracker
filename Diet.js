import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { FOODS } from "./foods";
import { Btn, C, Card, st } from "./ui";

const hm = (t) => new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const r = (n) => Math.round(Number(n) || 0);

export default function Diet({ meals, add, del }) {
  const [q, setQ] = useState(""), [qty, setQty] = useState("1"), [type, setType] = useState("Lunch");
  const [pick, setPick] = useState(null), [online, setOnline] = useState([]), [busy, setBusy] = useState(false);
  const [cal, setCal] = useState(""), [note, setNote] = useState("");
  const local = q.length > 1 ? FOODS.filter((f) => f.n.toLowerCase().includes(q.toLowerCase())).slice(0, 6) : [];

  const searchOnline = async () => {
    setBusy(true); setNote("");
    try {
      const u = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=6&fields=product_name,nutriments`;
      const j = await (await fetch(u)).json();
      const list = (j.products || []).filter((p) => p.product_name && p.nutriments?.["energy-kcal_100g"] != null).map((p) => ({
        n: `${p.product_name} (100 g)`, cal: r(p.nutriments["energy-kcal_100g"]), p: r(p.nutriments.proteins_100g), c: r(p.nutriments.carbohydrates_100g), f: r(p.nutriments.fat_100g) }));
      setOnline(list); if (!list.length) setNote("Nothing found online. Enter calories yourself below.");
    } catch { setNote("No internet. Use the built-in list or enter calories yourself."); }
    setBusy(false);
  };
  const reset = () => { setPick(null); setQ(""); setQty("1"); setOnline([]); setCal(""); setNote(""); };
  const addPick = () => { const k = Number(qty) || 1;
    add({ name: pick.n + (k !== 1 ? ` x${k}` : ""), cal: r(pick.cal * k), p: r(pick.p * k), c: r(pick.c * k), f: r(pick.f * k), type }); reset(); };
  const addManual = () => { if (q && cal) { add({ name: q, cal: Number(cal), p: 0, c: 0, f: 0, type }); reset(); } };

  return <>
    <Card title="Add food">
      <TextInput style={st.input} placeholder="Search food (roti, dal, pizza...)" value={q} onChangeText={(v) => { setQ(v); setPick(null); setOnline([]); }} />
      {!pick && [...local, ...online].map((f, i) => <TouchableOpacity key={i} onPress={() => setPick(f)} style={st.item}>
        <Text style={{ flex: 1, color: C.ink }}>{f.n}</Text><Text style={st.small}>{f.cal} kcal · P{f.p} C{f.c} F{f.f}</Text></TouchableOpacity>)}
      {pick && <>
        <Text style={st.p}>{pick.n}: {pick.cal} kcal, P{pick.p} C{pick.c} F{pick.f}</Text>
        <Text style={st.small}>How many servings?</Text>
        <TextInput style={st.input} keyboardType="decimal-pad" value={qty} onChangeText={setQty} />
      </>}
      <View style={st.row}>{["Breakfast", "Lunch", "Snack", "Dinner"].map((x) => <TouchableOpacity key={x} onPress={() => setType(x)} style={[st.chip, type === x && st.tabOn]}><Text style={{ color: type === x ? "#fff" : C.ink, fontSize: 12 }}>{x}</Text></TouchableOpacity>)}</View>
      {pick ? <Btn t="Add this food" on={addPick} /> : <>
        {q.length > 1 && <Btn ghost t={busy ? "Searching..." : "Search packaged food online"} on={searchOnline} />}
        {!!note && <Text style={st.small}>{note}</Text>}
        <TextInput style={st.input} placeholder="Or enter calories yourself" keyboardType="numeric" value={cal} onChangeText={setCal} />
        <Btn t="Save with my calories" on={addManual} /></>}
      <Text style={st.small}>Built-in values are approximate averages.</Text>
    </Card>
    {!meals.length && <Text style={st.empty}>Nothing logged today. Search a food above.</Text>}
    {meals.map((m) => <View key={m.id} style={st.item}><View style={{ flex: 1 }}><Text style={{ fontWeight: "700", color: C.ink }}>{m.name}</Text>
      <Text style={st.small}>{m.type} · {hm(m.t)}{m.p ? ` · P${m.p} C${m.c} F${m.f}` : ""}</Text></View><Text style={st.p}>{m.cal} kcal  </Text><Text onPress={() => del(m.id)} style={st.link}>✕</Text></View>)}
  </>;
}
