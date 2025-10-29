import { View, Text, StyleSheet, useWindowDimensions, ScrollView } from 'react-native';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { width, height } = useWindowDimensions();
  const isWebLarge = width >= 768; // breakpoint for web layout

  return (
    <View style={[styles.container, isWebLarge ? styles.row : styles.column]}>
      {/* Main content scrollable */}
      <ScrollView style={styles.mainContent}>{children}</ScrollView>

      {/* Bulletin board */}
      <View style={[styles.bulletin, isWebLarge && { height: height - 20 }]}>
        <Text style={styles.bulletinTitle}>Bulletin Board</Text>
        <Text>- Announcement 1</Text>
        <Text>- Announcement 2</Text>
        <Text>- Announcement 3</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    padding: 10, // top/bottom padding matches margin from edges
  },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  column: { flexDirection: 'column' },
  mainContent: { flex: 1, marginRight: 10 },
  bulletin: {
    width: 250,
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 8,
    alignSelf: 'stretch', // stretch to fill vertical space
  },
  bulletinTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003da5',
    marginBottom: 8,
  },
  announcement: {
    color: '#fff',  
    marginBottom: 4,
  },
});


