import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  useWindowDimensions, 
  ScrollView, 
  ActivityIndicator, 
  Pressable,
  Platform,
  Alert
} from 'react-native';

import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet'; // used for mobile bulletin board
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // needed for bottom sheet

// Comment form and API helpers
import BulletinCommentForm from '../../components/BulletinCommentForm';
import { fetchComments, deleteComment, Comment } from '../../api/comments';

// Token storage
import storage from '@/storage';

// Runs logic whenever screen comes into focus
import { useFocusEffect } from 'expo-router';

// Auth helpers
// Retrieve stored auth token
async function getToken(): Promise<string | null> {
  return storage.getItem("token");
}

// Auth state type
type AuthStatus = "unknown" | "authenticated" | "anonymous";

// User info structure from backend
type UserInfo = {
  id: string;
  username: string;
  role: string;
} | null;

// Main layout wrapper
export default function LayoutWrapper({ children }: { children: React.ReactNode }) {

  // screen size detection 
  const { width, height } = useWindowDimensions();
  const isWebLarge = width >= 768; // desktop
  const isSmallScreen = width < 768; // mobile/tablet

  const sheetRef = useRef<BottomSheet>(null);

  // Snap points for bottom sheet (collapsed, mid, expanded)
  const snapPoints = useMemo(() => [
    100,              // collapsed
    height * 0.45,    // mid
    height * 0.85     // full
  ], [height]);

  // State
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("unknown");
  const [userInfo, setUserInfo] = useState<UserInfo>(null);

  // Load  all bulletin comments 
  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await fetchComments();
      setComments(data);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete comment
  const handleDelete = async (id: number) => {
    // Web uses browser confirm
    if (Platform.OS === "web") {
      const confirmed = window.confirm("Delete this comment?");
      if (!confirmed) return;

      await deleteComment(id);
      await loadComments();

    } else {
      // Native uses Alert dialog
      Alert.alert(
        "Delete Comment",
        "Delete this comment?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              await deleteComment(id);
              await loadComments();
            }
          }
        ]
      );
    }
  };

  // Load comments on initial load
  useEffect(() => {
    loadComments();
  }, []);

  // Auth check
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      async function checkAuth() {
        try {
          const token = await getToken();

          // No token = anonymous user
          if (!token) {
            if (!cancelled) setAuthStatus("anonymous");
            return;
          }

          // Verify token with backend
          const root_url = process.env.EXPO_PUBLIC_API_URL;
          const res = await fetch(`${root_url}/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!res.ok) {
            if (!cancelled) setAuthStatus("anonymous");
            return;
          }

          // Save user info
          const data = await res.json();

          if (!cancelled) {
            setUserInfo(data);
            setAuthStatus("authenticated");
          }
        } catch {
          if (!cancelled) setAuthStatus("anonymous");
        }
      }

      checkAuth();

      return () => {
        cancelled = true;
      };
    }, [])
  );

  // Render
  return ( 
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, !isSmallScreen ? styles.row : styles.column]}> 

        {/* MAIN CONTENT */}
        <ScrollView 
          style={styles.mainScroll}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 140 }}
        >
          {children}
        </ScrollView>

        {/* MOBILE: Bottom Sheet */}
        {isSmallScreen ? ( 
          <BottomSheet
            ref={sheetRef}
            index={0}
            snapPoints={snapPoints}
            enablePanDownToClose={false}
            keyboardBehavior="interactive"
            keyboardBlurBehavior="restore"
            handleIndicatorStyle={styles.handle}
            backgroundStyle={{ backgroundColor: '#1a1d23' }}
          >
            <BottomSheetScrollView contentContainerStyle={{ padding: 16 }}>

              <Text style={styles.bulletinTitle}>Bulletin Board</Text>

              {authStatus === "authenticated" &&
                userInfo &&
                (userInfo.role === "admin" || userInfo.role === "moderator") && (
                  <BulletinCommentForm onCreated={loadComments} />
              )}

              {/* Comment list */}
              {loading ? (
                <ActivityIndicator />
              ) : comments.length > 0 ? (
                comments.map((comment) => (
                  <View key={comment.id} style={styles.alertCard}>
                    <Text style={styles.alertEvent}>{comment.commenter}</Text>
                    <Text style={styles.alertHeadline}>{comment.text}</Text>
                    <Text style={styles.alertTime}>
                      {new Date(comment.timestamp).toLocaleString()}
                    </Text>

                    {/* Delete button admin only */}
                    {userInfo &&
                      (userInfo.role === "admin" ||
                       userInfo.role === "moderator") && (
                      <Pressable onPress={() => handleDelete(comment.id)}>
                        <Text style={styles.deleteText}>Delete</Text>
                      </Pressable>
                    )}
                  </View>
                ))
              ) : (
                <Text style={{ color: '#888', textAlign: 'center' }}>
                  No comments yet
                </Text>
              )}

            </BottomSheetScrollView>
          </BottomSheet>
        ) : (

        /* Web side panel bulletin */
        <View style={[styles.bulletin, styles.bulletinWeb]}>
          <Text style={styles.bulletinTitle}>Bulletin Board</Text>

          {/* Admin form */}
          {authStatus === "authenticated" &&
            userInfo &&
            (userInfo.role === "admin" || userInfo.role === "moderator") && (
              <BulletinCommentForm onCreated={loadComments} />
          )}
          {/* Scrollable comments */}
          <ScrollView style={styles.commentScroll}>
            {loading ? (
              <ActivityIndicator />
            ) : comments.map((comment) => (
              <View key={comment.id} style={styles.alertCard}>
                <Text style={styles.alertEvent}>{comment.commenter}</Text>
                <Text style={styles.alertHeadline}>{comment.text}</Text>

                {/* Delete button */}
                {userInfo &&
                  (userInfo.role === "admin" ||
                   userInfo.role === "moderator") && (
                  <Pressable onPress={() => handleDelete(comment.id)}>
                    <Text style={styles.deleteText}>Delete</Text>
                  </Pressable>
                )}
              </View>
            ))}
          </ScrollView>
        </View>

        )}

      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#25292e', padding: 10 },
  row: { flexDirection: 'row' },
  column: { flexDirection: 'column' },

  mainScroll: { flex: 1, marginRight: 10 },

  bulletin: { 
    backgroundColor: '#1a1d23', 
    padding: 15, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#333' 
  },

  bulletinWeb: {
    width: 280,
    height: '100%',
  },

  commentScroll: { marginTop: 10 },

  bulletinTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#fff', 
    marginBottom: 15 
  },

  handle: {
    backgroundColor: '#666',
    width: 50,
  },

  alertCard: { 
    backgroundColor: '#25292e', 
    borderRadius: 8, 
    padding: 12, 
    marginBottom: 12, 
    borderLeftWidth: 4, 
    borderLeftColor: '#003da5' 
  },

  alertEvent: { color: '#fff', fontWeight: 'bold' },
  alertHeadline: { color: '#ccc', fontSize: 12 },
  alertTime: { color: '#888', fontSize: 11 },

  deleteText: {
    color: "#ff6b6b",
    marginTop: 8,
    fontSize: 12,
    fontWeight: "bold"
  },
});