// src/screens/Documents/DocumentsScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { DocumentCategory, DocumentItem } from '../../types/vault';
import { useVault } from '../../context/VaultContext';
import { darkTheme, slateTheme, lightTheme } from '../../theme/colors';
import { DocumentDetailModal } from './DocumentDetailModal';
import { AddDocumentModal } from './AddDocumentModal';
import { PangolinCompanion } from '../../components/PangolinCompanion';
import {
  Search,
  Plus,
  Camera,
  FileText,
  Lock,
  Calendar,
  ChevronRight,
  ShieldCheck,
  Building,
  CreditCard,
  Car,
  Briefcase,
  GraduationCap,
} from 'lucide-react-native';

export const DocumentsScreen: React.FC = () => {
  const { documents, settings, setScannerModalOpen } = useVault();
  const theme = settings.theme === 'light' ? lightTheme : settings.theme === 'slate' ? slateTheme : darkTheme;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeDoc, setActiveDoc] = useState<DocumentItem | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const categories = ['All', 'Government', 'Banking', 'Insurance', 'Work', 'School', 'Vehicle', 'Other'];

  const filteredDocs = documents.filter((doc) => {
    const matchesCat = selectedCategory === 'All' || doc.category === selectedCategory;
    const matchesSearch =
      (doc.title && doc.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.provider && doc.provider.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.documentNumber && doc.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const getCategoryIcon = (category: DocumentCategory) => {
    switch (category) {
      case 'Government':
        return Building;
      case 'Banking':
        return CreditCard;
      case 'Vehicle':
        return Car;
      case 'Work':
        return Briefcase;
      case 'School':
        return GraduationCap;
      default:
        return FileText;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Search & Scan Row */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBox, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
          <Search size={16} color={theme.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder="Search documents, IDs, passport..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <TouchableOpacity
          style={[styles.scanBtn, { backgroundColor: theme.primaryGlow, borderColor: theme.primary }]}
          onPress={() => setScannerModalOpen(true)}
          activeOpacity={0.8}
        >
          <Camera size={16} color={theme.primary} />
          <Text style={[styles.scanBtnText, { color: theme.primary }]}>Scan</Text>
        </TouchableOpacity>
      </View>

      {/* Category Pills */}
      <View style={styles.categoriesSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.catPill,
                selectedCategory === cat
                  ? { backgroundColor: theme.primary, borderColor: theme.primary }
                  : { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.catPillText,
                  {
                    color: selectedCategory === cat ? '#000' : theme.textSecondary,
                    fontWeight: selectedCategory === cat ? '700' : '500',
                  },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Document List or Empty State */}
      <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        {filteredDocs.length === 0 ? (
          <View style={styles.emptyState}>
            <PangolinCompanion mood="thinking" size={80} showBubble={false} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
              Your important documents belong here.
            </Text>
            <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
              Capture IDs, insurance policies, registrations, and bank cards. Everything stays on this phone.
            </Text>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: theme.primary }]}
              onPress={() => setAddModalOpen(true)}
            >
              <Plus size={16} color="#000" />
              <Text style={styles.emptyBtnText}>Add First Document</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredDocs.map((doc) => {
            const IconComp = getCategoryIcon(doc.category);
            const num = doc.documentNumber || '';
            const maskedNum =
              num.length > 4
                ? '•••• ' + num.slice(-4)
                : (num ? '•••• ' + num : 'No number');

            return (
              <TouchableOpacity
                key={doc.id}
                activeOpacity={0.75}
                onPress={() => setActiveDoc(doc)}
                style={[styles.docCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              >
                <View style={[styles.docIconBox, { backgroundColor: theme.surfaceElevated }]}>
                  <IconComp size={22} color={theme.primary} />
                </View>

                <View style={styles.docInfo}>
                  <View style={styles.docTitleRow}>
                    <Text style={[styles.docTitle, { color: theme.textPrimary }]}>{doc.title}</Text>
                    {doc.isSensitive && (
                      <View style={styles.shieldIcon}>
                        <Lock size={12} color={theme.textMuted} />
                      </View>
                    )}
                  </View>

                  <Text style={[styles.docProvider, { color: theme.textSecondary }]}>{doc.provider}</Text>

                  <View style={styles.docBottomRow}>
                    <Text style={[styles.docNumber, { color: theme.accentCyan }]}>{maskedNum}</Text>

                    {doc.expiryDate && (
                      <View style={[styles.expiryBadge, { backgroundColor: theme.surfaceSubtle }]}>
                        <Calendar size={10} color={theme.accentAmber} />
                        <Text style={[styles.expiryText, { color: theme.accentAmber }]}>
                          Exp: {doc.expiryDate}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                <ChevronRight size={18} color={theme.textMuted} />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Document Detail Modal */}
      <DocumentDetailModal
        document={activeDoc}
        visible={activeDoc !== null}
        onClose={() => setActiveDoc(null)}
      />

      {/* Add Document Modal */}
      <AddDocumentModal
        visible={addModalOpen}
        onClose={() => setAddModalOpen(false)}
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
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
  },
  scanBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  searchBox: {
    flex: 1,
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
  categoriesSection: {
    paddingVertical: 6,
  },
  catScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  catPillText: {
    fontSize: 12,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
    gap: 10,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
  },
  docIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docInfo: {
    flex: 1,
    gap: 3,
  },
  docTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  docTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  shieldIcon: {
    padding: 2,
  },
  docProvider: {
    fontSize: 12,
  },
  docBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  docNumber: {
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  expiryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  expiryText: {
    fontSize: 10,
    fontWeight: '600',
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
