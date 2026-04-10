import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function UserManagementScreen() {
  return (
    <View style={s.c}>
      <Text style={s.t}>User Management</Text>
    </View>
  );
}

const s = StyleSheet.create({
  c: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  t: { fontSize: 18, color: '#111' }
});
