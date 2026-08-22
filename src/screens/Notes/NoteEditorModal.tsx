// src/screens/Notes/NoteEditorModal.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { NoteItem } from '../../types/vault';
import { useVault } from '../../context/VaultContext';
import { darkTheme, slateTheme, lightTheme } from '../../theme/colors';
import { X, Check, Trash2, Pin, Tag, Sparkles } from 'lucide-react-native';

interface NoteEditorModalProps {
  note: NoteItem | null;
  visible: boolean;
  onClose: () => void;
}

export const NoteEditorModal: React.FC<NoteEditorModalProps> = ({ note, visible, onClose }) => {
  const { addNote, updateNote, deleteNote, settings } = useVault();
  const theme = settings.theme === 'light' ? lightTheme : settings.theme === 'slate' ? slateTheme : darkTheme;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags || []);
      setIsPinned(note.isPinned || false);
    } else {
      setTitle('');
      setContent('');
      setTags(['General']);
      setIsPinned(false);
    }
  }, [note, visible]);

  const handleAddTag = () => {
    if (newTagInput.trim() && !tags.includes(newTagInput.trim())) {
      setTags((prev) => [...prev, newTagInput.trim()]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleSave = () => {
    if (!title.trim() && !content.trim()) return;

    if (note) {
      updateNote(note.id, {
        title: title.trim() || 'Untitled Note',
        content,
        tags,
        isPinned,
      });
    } else {
      addNote({
        title: title.trim() || 'Untitled Note',
        content,
        category: 'General',
        tags,
        isPinned,
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (note) {
      deleteNote(note.id);
    }
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>

            <View style={styles.headerRight}>
              <TouchableOpacity
                style={[
                  styles.pinBtn,
                  isPinned && { backgroundColor: theme.accentAmber + '22', borderColor: theme.accentAmber },
                ]}
                onPress={() => setIsPinned(!isPinned)}
              >
                <Pin size={16} color={isPinned ? theme.accentAmber : theme.textSecondary} />
              </TouchableOpacity>

              {note && (
                <TouchableOpacity style={styles.delBtn} onPress={handleDelete}>
                  <Trash2 size={16} color={theme.danger} />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: theme.primary }]}
                onPress={handleSave}
              >
                <Check size={18} color="#000" />
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
            {/* Title Input */}
            <TextInput
              style={[styles.titleInput, { color: theme.textPrimary }]}
              placeholder="Note Title"
              placeholderTextColor={theme.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            {/* Tags Row */}
            <View style={styles.tagsContainer}>
              <Tag size={14} color={theme.textMuted} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagScroll}>
                {tags.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.tagPill, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    onPress={() => handleRemoveTag(t)}
                  >
                    <Text style={[styles.tagPillText, { color: theme.primary }]}>#{t} ×</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Add Tag Input */}
            <View style={styles.addTagRow}>
              <TextInput
                style={[styles.tagInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
                placeholder="+ Add tag..."
                placeholderTextColor={theme.textMuted}
                value={newTagInput}
                onChangeText={setNewTagInput}
                onSubmitEditing={handleAddTag}
              />
            </View>

            {/* Note Body */}
            <TextInput
              style={[styles.contentInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
              placeholder="Write thoughts, codes, instructions, or paste text to remember..."
              placeholderTextColor={theme.textMuted}
              multiline
              textAlignVertical="top"
              value={content}
              onChangeText={setContent}
            />

            <Text style={[styles.footerText, { color: theme.textMuted }]}>
              🔒 Lightweight on-device note. Saved only to local storage.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 30,
    height: '92%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  closeBtn: {
    padding: 6,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pinBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  delBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  saveBtnText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '700',
  },
  form: {
    gap: 12,
    paddingBottom: 20,
    flexGrow: 1,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '800',
    paddingVertical: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tagScroll: {
    gap: 6,
  },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  tagPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  addTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagInput: {
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 12,
    width: 140,
  },
  contentInput: {
    flex: 1,
    minHeight: 280,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    fontSize: 15,
    lineHeight: 22,
  },
  footerText: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
});
