import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LayoutWrapper from './LayoutWrapper';

export default function AboutScreen() {
  return (
    <LayoutWrapper>
      <View style={styles.container}>
        <Text style={styles.text}>ATMS Content Coming Soon</Text>
      </View>
    </LayoutWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#888',
    fontSize: 16,
  },
});


