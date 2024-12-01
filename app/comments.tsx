import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet 
} from 'react-native';

const CommentsSection: React.FC = () => {
  const [comments, setComments] = useState<Array<{ id: number; text: string; likes: number; dislikes: number; replies: any[] }>>([]);
  const [newComment, setNewComment] = useState('');

  const addComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: comments.length + 1, // Ensure `id` is unique
        text: newComment.trim(),
        likes: 0,
        dislikes: 0,
        replies: [],
      };
      setComments([comment, ...comments]);
      setNewComment('');
    }
  };

  const likeComment = (id: number) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === id
          ? { ...comment, likes: comment.likes + 1 }
          : comment
      )
    );
  };

  const dislikeComment = (id: number) => {
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === id
          ? { ...comment, dislikes: comment.dislikes + 1 }
          : comment
      )
    );
  };

  const renderComment = ({ item }: { item: { id: number; text: string; likes: number; dislikes: number; replies: any[] } }) => (
    <View style={styles.commentContainer}>
      <Text style={styles.commentText}>{item.text}</Text>
      <View style={styles.commentActions}>
        <TouchableOpacity onPress={() => likeComment(item.id)}>
          <Text style={styles.actionText}>Like ({item.likes})</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => dislikeComment(item.id)}>
          <Text style={styles.actionText}>Dislike ({item.dislikes})</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Comments</Text>
      <TextInput
        style={styles.input}
        placeholder="Add a comment..."
        value={newComment}
        onChangeText={setNewComment}
      />
      <TouchableOpacity style={styles.addButton} onPress={addComment}>
        <Text style={styles.addButtonText}>Add Comment</Text>
      </TouchableOpacity>
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id.toString()} // Ensures unique keys for FlatList
        renderItem={renderComment} // Ensure renderComment matches the expected signature
        ListEmptyComponent={<Text style={styles.noCommentsText}>No comments yet. Be the first to comment!</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    backgroundColor: '#F9F9F9',
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderRadius: 10,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#A1A0FE',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  noCommentsText: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginTop: 10,
  },
  commentContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
  },
  commentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionText: {
    fontSize: 12,
    color: '#A1A0FE',
    fontWeight: 'bold',
  },
});

export default CommentsSection;
