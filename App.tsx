// App.tsx
import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  Alert,
  Animated,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator, StackScreenProps } from "@react-navigation/stack";
import { Picker } from "@react-native-picker/picker";

// ===== Types =====
type Course = "Starter" | "Main" | "Dessert";

type Dish = {
  id: string;
  name: string;
  description: string;
  course: Course;
  price: number;
};

type RootStackParamList = {
  Home: undefined;
  DishDetails: { dish: Dish };
};

const COURSES: Course[] = ["Starter", "Main", "Dessert"];

// ===== Home Screen (form + list + total) =====
type HomeProps = StackScreenProps<RootStackParamList, "Home">;

function HomeScreen({ navigation }: HomeProps) {
  // form state (TypeScript variables to store data)
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [course, setCourse] = useState<Course>("Starter");
  const [price, setPrice] = useState<string>("");

  // dishes list (no hardcoded items)
  const [dishes, setDishes] = useState<Dish[]>([]);

  // small animation when item is added
  const fade = useState(new Animated.Value(0))[0];

  const showAdded = () => {
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 250, useNativeDriver: true }).start(() =>
      Animated.timing(fade, { toValue: 0, duration: 400, delay: 300, useNativeDriver: true }).start()
    );
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setCourse("Starter");
    setPrice("");
  };

  const addDish = () => {
    // Handle button press + validation
    const numeric = Number(price);
    if (!name.trim()) return Alert.alert("Validation", "Dish name is required.");
    if (!price.trim() || Number.isNaN(numeric) || numeric <= 0)
      return Alert.alert("Validation", "Enter a valid price greater than 0.");

    const newDish: Dish = {
      id: Math.random().toString(36).slice(2),
      name: name.trim(),
      description: description.trim(),
      course,
      price: parseFloat(numeric.toFixed(2)),
    };

    setDishes((prev) => [newDish, ...prev]);
    showAdded();
    resetForm();
  };

  const renderItem = ({ item }: { item: Dish }) => (
    <Pressable
      style={styles.row}
      onPress={() => navigation.navigate("DishDetails", { dish: item })}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{item.name}</Text>
        <Text style={styles.rowSub}>
          {item.course} • R{item.price.toFixed(2)}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.h1}>Christoffel’s Menu</Text>

      {/* Add Dish Form (on homepage as required) */}
      <View style={styles.card}>
        <Text style={styles.h2}>Add Menu Item</Text>

        <Text style={styles.label}>Dish Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Truffle Risotto"
          style={styles.input}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Short description"
          style={[styles.input, { height: 80 }]}
          multiline
        />

        <Text style={styles.label}>Course</Text>
        <View style={styles.pickerWrap}>
          <Picker selectedValue={course} onValueChange={(v) => setCourse(v as Course)}>
            {COURSES.map((c) => (
              <Picker.Item key={c} label={c} value={c} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Price (R)</Text>
        <TextInput
          value={price}
          onChangeText={setPrice}
          placeholder="e.g. 180"
          keyboardType="numeric"
          style={styles.input}
        />

        <Pressable onPress={addDish} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>Add Dish</Text>
        </Pressable>

        <Animated.View style={{ opacity: fade, marginTop: 8 }}>
          <Text style={styles.success}>Dish added ✔</Text>
        </Animated.View>
      </View>

      {/* Total + List */}
      <Text style={styles.h2}>Menu Items ({dishes.length} total)</Text>
      <FlatList
        data={dishes}
        keyExtractor={(d) => d.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>No items yet — add your first dish above.</Text>
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </SafeAreaView>
  );
}

// ===== Dish Details Screen =====
type DetailsProps = StackScreenProps<RootStackParamList, "DishDetails">;

function DishDetailsScreen({ route }: DetailsProps) {
  const { dish } = route.params;
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.h1}>{dish.name}</Text>
      <View style={styles.card}>
        <Text style={styles.detailLine}>
          <Text style={styles.detailLabel}>Course: </Text>
          {dish.course}
        </Text>
        <Text style={styles.detailLine}>
          <Text style={styles.detailLabel}>Price: </Text>R{dish.price.toFixed(2)}
        </Text>
        <Text style={[styles.detailLine, { marginTop: 8 }]}>
          <Text style={styles.detailLabel}>Description: </Text>
          {dish.description || "—"}
        </Text>
      </View>
    </SafeAreaView>
  );
}

// ===== App (Navigation) =====
const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Menu" }} />
        <Stack.Screen
          name="DishDetails"
          component={DishDetailsScreen}
          options={{ title: "Dish Details" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ===== Styles (simple, clean) =====
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  h1: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  h2: { fontSize: 16, fontWeight: "600", marginBottom: 8, marginTop: 4 },
  label: { fontSize: 12, opacity: 0.8, marginTop: 8, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  primaryBtn: {
    backgroundColor: "#1e88e5",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 12,
    alignItems: "center",
  },
  primaryBtnText: { color: "white", fontWeight: "700" },
  success: { color: "#2e7d32", fontWeight: "600" },
  card: {
    backgroundColor: "#f8f9fb",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#eef0f3",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#e6e8eb",
  },
  rowTitle: { fontSize: 15, fontWeight: "600" },
  rowSub: { fontSize: 12, color: "#555", marginTop: 2 },
  chevron: { fontSize: 24, color: "#999", paddingHorizontal: 8 },
  empty: { color: "#777", paddingVertical: 20, textAlign: "center" },
  detailLine: { fontSize: 14, marginTop: 2 },
  detailLabel: { fontWeight: "700" },
});
