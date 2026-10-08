import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
export const C = { bg: "#f2f5ef", ink: "#1d2b24", card: "#ffffff", acc: "#2f7d5b", line: "#d5ddd3", warn: "#c2410c" };
export const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg, paddingTop: 30 }, h1: { fontSize: 26, fontWeight: "800", color: C.ink, paddingHorizontal: 14, paddingBottom: 8 },
  nav: { flexDirection: "row", paddingHorizontal: 10, gap: 4 }, tab: { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: C.line, alignItems: "center" },
  tabOn: { backgroundColor: C.acc, borderColor: C.acc }, tabT: { fontSize: 10, color: C.ink, textTransform: "capitalize" },
  card: { backgroundColor: C.card, borderColor: C.line, borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 12 },
  h3: { fontSize: 15, fontWeight: "700", color: C.ink, marginBottom: 6 }, big: { fontSize: 30, fontWeight: "800", color: C.ink },
  small: { fontSize: 12, color: "#5b6b62" }, tiny: { fontSize: 10, color: "#5b6b62" }, p: { color: C.ink, marginBottom: 6 },
  bar: { height: 10, backgroundColor: C.line, borderRadius: 6, overflow: "hidden", marginTop: 8 },
  row: { flexDirection: "row", gap: 8, marginBottom: 12, flexWrap: "wrap" },
  btn: { backgroundColor: C.acc, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, alignItems: "center", marginTop: 4 },
  btnGhost: { backgroundColor: "transparent", borderWidth: 1, borderColor: C.line },
  input: { borderWidth: 1, borderColor: C.line, borderRadius: 8, padding: 9, marginVertical: 4, color: C.ink, backgroundColor: C.bg },
  chip: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 14, borderWidth: 1, borderColor: C.line },
  item: { flexDirection: "row", alignItems: "center", backgroundColor: C.card, borderColor: C.line, borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 8 },
  inl: { fontWeight: "700", color: C.ink, borderBottomWidth: 1, borderBottomColor: C.line, paddingVertical: 2 },
  link: { color: C.acc, fontWeight: "700" }, empty: { color: "#5b6b62", padding: 8 },
  chart: { flexDirection: "row", height: 120, alignItems: "flex-end", gap: 6 }, col: { flex: 1, height: "100%", justifyContent: "flex-end", alignItems: "center", gap: 2 },
});

export const Btn = ({ t, on, ghost }) => <TouchableOpacity onPress={on} style={[st.btn, ghost && st.btnGhost]}><Text style={{ color: ghost ? C.ink : "#fff", fontWeight: "600" }}>{t}</Text></TouchableOpacity>;
export const Card = ({ title, children }) => <View style={st.card}><Text style={st.h3}>{title}</Text>{children}</View>;
