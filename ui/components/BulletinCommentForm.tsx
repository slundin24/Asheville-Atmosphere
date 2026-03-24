import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { createComment } from '../api/comments';

interface BulletinCommentFormProps {
  onCreated: () => void;
}

// Comment form inside layoutwrapper
export default function BulletinCommentForm({ onCreated }: BulletinCommentFormProps) {
  const [text, setText] = useState('');
  const [commentType, setCommentType] = useState('GENERAL');
  const [loading, setLoading] = useState(false);

  // User enters nothing handling
  const submit = async () => {
    if (!text.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    setLoading(true);
    try {
      await createComment({ text, comment_type: commentType });

      setText('');
      onCreated();
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', 'Failed to submit comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Your comment"
        value={text}
        onChangeText={setText}
        multiline
      />

      <Button
        title={loading ? 'Submitting...' : 'Add Comment'}
        onPress={submit}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 8,
    borderRadius: 6,
  },
  textArea: {
    height: 60,
  },
});

