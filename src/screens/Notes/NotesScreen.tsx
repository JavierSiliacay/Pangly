// src/screens/Notes/NotesScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { NoteItem } from '../../types/vault';
import { useVault } from '../../context/VaultContext';
import { darkTheme, slateTheme, lightTheme } from '../../theme/colors';
import { NoteEditorModal } from './NoteEditorModal';
import { PangolinCompanion } from '../../components/PangolinCompanion';
import {
  Search,
  Plus,
  Pin,
  Tag,
  ChevronRight,
  FileEdit,
} from 'lucide-react-native';

export const NotesScreen: React.FC = () => {
  const { notes, settings } = useVault();
  const theme = settings.theme === 'light' ? lightTheme : settings.theme === 'slate' ? slateTheme : darkTheme;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [activeNote, setActiveNote] = useState<NoteItem | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Extract all unique tags
  const allTags = ['All', ...Array.from(new Set(notes.flatMap((n) => n.tags || [])))];

  const filteredNotes = notes.filter((note) => {
    const matchesTag = selectedTag === 'All' || (note.tags && note.tags.includes(selectedTag));
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  const handleCreateNew = () => {
    setActiveNote(null);
    setIsEditorOpen(true);
  };

  const handleOpenNote = (n: NoteItem) => {
    setActiveNote(n);
    setIsEditorOpen(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Search Input */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBox, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
          <Search size={16} color={theme.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder="Search notes, mechanic logs, codes..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Tag Filters */}
      <View style={styles.tagsSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagScroll}>
          {allTags.map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                styles.tagPill,
                selectedTag === t
                  ? { backgroundColor: theme.primary, borderColor: theme.primary }
                  : { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
              onPress={() => setSelectedTag(t)}
            >
              <Text
                style={[
                  styles.tagPillText,
                  {
                    color: selectedTag === t ? '#000' : theme.textSecondary,
                    fontWeight: selectedTag === t ? '700' : '500',
                  },
                ]}
              >
                {t === 'All' ? 'All Tags' : `#${t}`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Notes Feed */}
      <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        {filteredNotes.length === 0 ? (
          <View style={styles.emptyState}>
            <PangolinCompanion mood="thinking" size={80} showBubble={false} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
              Your private notes, all in one place.
            </Text>
            <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
              Replace messaging yourself or scattered notepad drafts. Store codes, checklists, and memories safely.
            </Text>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: theme.primary }]}
              onPress={handleCreateNew}
            >
              <Plus size={16} color="#000" />
              <Text style={styles.emptyBtnText}>Create Note</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredNotes.map((note) => (
            <TouchableOpacity
              key={note.id}
              activeOpacity={0.75}
              onPress={() => handleOpenNote(note)}
              style={[styles.noteCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            >
              <View style={styles.noteCardHeader}>
                <Text style={[styles.noteTitle, { color: theme.textPrimary }]}>{note.title}</Text>
                {note.isPinned && <Pin size={14} color={theme.accentAmber} />}
              </View>

              <Text style={[styles.noteSnippet, { color: theme.textSecondary }]} numberOfLines={3}>
                {note.content}
              </Text>

              <View style={styles.noteFooter}>
                <View style={styles.tagRow}>
                  {(note.tags || []).slice(0, 3).map((tag) => (
                    <View key={tag} style={[styles.miniTag, { backgroundColor: theme.surfaceElevated }]}>
                      <Text style={[styles.miniTagText, { color: theme.primary }]}>#{tag}</Text>
                    </View>
                  ))}
                </View>
                <Text style={[styles.noteDate, { color: theme.textMuted }]}>
                  {note.createdAt ? note.createdAt.split('T')[0] : 'Today'}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Note Editor Modal */}
      <NoteEditorModal
        note={activeNote}
        visible={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  addBtnText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '700',
  },
  searchSection: {
    paddingHorizontal: 16,
    marginVertical: 6,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  tagsSection: {
    paddingVertical: 6,
  },
  tagScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tagPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  tagPillText: {
    fontSize: 12,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  noteCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
  },
  noteCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  noteSnippet: {
    fontSize: 13,
    lineHeight: 19,
  },
  noteFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 6,
  },
  miniTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  miniTagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  noteDate: {
    fontSize: 11,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginTop: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 8,
  },
  emptyBtnText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
});
