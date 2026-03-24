import { authFetch } from "./authFetch";

export interface Comment {
  id: number;
  commenter: string;
  text: string;
  comment_type: string;
  timestamp: string;
}

// Separate type for creating a comment
export interface CreateCommentRequest {
  text: string;
  comment_type: string;
}

const root_url = process.env.EXPO_PUBLIC_API_URL;

// fetching comments
export async function fetchComments(): Promise<Comment[]> {
  const res = await authFetch(`${root_url}/comments`);
  if (!res.ok) throw new Error(`Failed to fetch comments: ${res.status}`);
  return res.json();
}

// creating comments
export async function createComment(
  comment: CreateCommentRequest
): Promise<void> {
  const res = await authFetch(`${root_url}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(comment),
  });

  if (!res.ok) throw new Error(`Failed to create comment: ${res.status}`);
}

// deleting comments
export async function deleteComment(id: number): Promise<void> {
  const res = await authFetch(`${root_url}/comments/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(`Failed to delete comment: ${res.status}`);
  }
}
  
  