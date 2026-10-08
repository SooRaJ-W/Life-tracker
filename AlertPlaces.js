import { useEffect, useState } from "react";
import { Text, TextInput, View } from "react-native";
import * as Location from "expo-location";
import { load, save } from "./lib";
import { syncGeofences } from "./locationTask";
import { Btn, C, Card, st } from "./ui";

export default function AlertPlaces() {
  const [list, setList] = useState([]), [name, setName] = useState(""), [note, setNote] = useState(""), [msg, setMsg] = useState("");
  useEffect(() => { load("alertPlaces", []).then(setList); }, []);
  const commit = async (l) => { setList(l); await save("alertPlaces", l); await syncGeofences(l); };
  const addHere = async () => {
    try {
      if (!name) throw new Error("Give this place a name.");
      const fg = await Location.requestForegroundPermissionsAsync();
      const bg = await Location.requestBackgroundPermissionsAsync();
      if (!fg.granted || !bg.granted) throw new Error("Allow location 'all the time' first.");
      const p = await Location.getCurrentPositionAsync({});
      await commit([...list, { id: Date.now() + "", name, note, lat: p.coords.latitude, lng: p.coords.longitude }]);
      setName(""); setNote(""); setMsg("");
    } catch (e) { setMsg(e.message); }
  };
  return <>
    <Card title="Alert me at a place">
      <Text style={st.small}>Stand at the place (gym, office, home), name it and add a message. You get an alert when you arrive and when you leave.</Text>
      <TextInput style={st.input} placeholder="Place name (Gym)" value={name} onChangeText={setName} />
      <TextInput style={st.input} placeholder="Message on arrival (Log your workout)" value={note} onChangeText={setNote} />
      <Btn t="Add alert at my current location" on={addHere} />
      {!!msg && <Text style={[st.p, { color: C.warn }]}>{msg}</Text>}
    </Card>
    {!list.length && <Text style={st.empty}>No place alerts yet.</Text>}
    {list.map((p) => <View key={p.id} style={st.item}><View style={{ flex: 1 }}><Text style={{ fontWeight: "700", color: C.ink }}>{p.name}</Text>
      <Text style={st.small}>{p.note || "No message"} · 150 m radius</Text></View>
      <Text style={st.link} onPress={() => commit(list.filter((x) => x.id !== p.id))}>Remove</Text></View>)}
  </>;
}
