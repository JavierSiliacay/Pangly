// src/screens/Vehicles/VehicleDetailModal.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { VehicleItem } from '../../types/vault';
import { useVault } from '../../context/VaultContext';
import { darkTheme, slateTheme, lightTheme } from '../../theme/colors';
import { AddMaintenanceModal } from './AddMaintenanceModal';
import {
  X,
  Wrench,
  FileText,
  Calendar,
  Plus,
  Trash2,
  AlertTriangle,
  Info,
  Car,
} from 'lucide-react-native';

interface VehicleDetailModalProps {
  vehicle: VehicleItem | null;
  visible: boolean;
  onClose: () => void;
}

export const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({
  vehicle,
  visible,
  onClose,
}) => {
  const {
    maintenance,
    documents,
    deleteVehicle,
    deleteMaintenance,
    settings,
  } = useVault();
  const theme = settings.theme === 'light' ? lightTheme : settings.theme === 'slate' ? slateTheme : darkTheme;

  const [activeTab, setActiveTab] = useState<'overview' | 'maintenance' | 'documents'>('overview');
  const [addMaintOpen, setAddMaintOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  if (!vehicle || !visible) return null;

  // Filter linked items
  const vehicleMaintenance = maintenance.filter((m) => m.vehicleId === vehicle.id);
  const vehicleDocs = documents.filter((d) => d.category === 'Vehicle' || d.linkedVehicleId === vehicle.id);

  const totalMaintCost = vehicleMaintenance.reduce((sum, m) => sum + (m.cost || 0), 0);
  const kmToService = Math.max(0, vehicle.nextMaintenanceKm - vehicle.mileage);

  const handleDelete = () => {
    deleteVehicle(vehicle.id);
    setDeleteConfirm(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <View style={[styles.badge, { backgroundColor: theme.accentTeal + '22' }]}>
                <Text style={[styles.badgeText, { color: theme.accentTeal }]}>{vehicle.plateNumber}</Text>
              </View>
              <Text style={[styles.title, { color: theme.textPrimary }]}>
                {vehicle.make} {vehicle.model}
              </Text>
              <Text style={[styles.sub, { color: theme.textSecondary }]}>
                {vehicle.year} • {vehicle.mileage.toLocaleString()} km
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* 3 Tabs: Overview | Maintenance | Documents */}
          <View style={styles.tabsRow}>
            {(['overview', 'maintenance', 'documents'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabBtn,
                  activeTab === tab
                    ? { backgroundColor: theme.primary, borderColor: theme.primary }
                    : { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text
                  style={[
                    styles.tabText,
                    {
                      color: activeTab === tab ? '#000' : theme.textSecondary,
                      fontWeight: activeTab === tab ? '700' : '500',
                      textTransform: 'capitalize',
                    },
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <View style={styles.tabContent}>
                {/* Status Hero Card */}
                <View style={[styles.heroCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <View style={styles.heroRow}>
                    <View>
                      <Text style={[styles.heroLabel, { color: theme.textMuted }]}>NEXT SERVICE DUE</Text>
                      <Text style={[styles.heroVal, { color: theme.primary }]}>
                        {kmToService.toLocaleString()} km
                      </Text>
                      <Text style={[styles.heroSub, { color: theme.textSecondary }]}>
                        Target Odometer: {vehicle.nextMaintenanceKm.toLocaleString()} km
                      </Text>
                    </View>
                    <View style={[styles.heroIconBox, { backgroundColor: theme.primaryGlow }]}>
                      <Wrench size={24} color={theme.primary} />
                    </View>
                  </View>
                </View>

                {/* Spec Sheet Grid */}
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Vehicle Information</Text>
                <View style={[styles.specGrid, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <View style={styles.specItem}>
                    <Text style={[styles.specLabel, { color: theme.textMuted }]}>Plate Number</Text>
                    <Text style={[styles.specVal, { color: theme.textPrimary }]}>{vehicle.plateNumber}</Text>
                  </View>
                  <View style={styles.specItem}>
                    <Text style={[styles.specLabel, { color: theme.textMuted }]}>Year Model</Text>
                    <Text style={[styles.specVal, { color: theme.textPrimary }]}>{vehicle.year}</Text>
                  </View>
                  <View style={styles.specItem}>
                    <Text style={[styles.specLabel, { color: theme.textMuted }]}>Odometer Reading</Text>
                    <Text style={[styles.specVal, { color: theme.textPrimary }]}>
                      {vehicle.mileage.toLocaleString()} km
                    </Text>
                  </View>
                  <View style={styles.specItem}>
                    <Text style={[styles.specLabel, { color: theme.textMuted }]}>VIN / Chassis Number</Text>
                    <Text style={[styles.specVal, { color: theme.textPrimary }]}>
                      {vehicle.vin || 'Not recorded'}
                    </Text>
                  </View>
                </View>

                {/* Quick Add Maintenance */}
                <TouchableOpacity
                  style={[styles.addMaintBtn, { backgroundColor: theme.primary }]}
                  onPress={() => setAddMaintOpen(true)}
                >
                  <Plus size={16} color="#000" />
                  <Text style={styles.addMaintBtnText}>Log New Maintenance</Text>
                </TouchableOpacity>

                {/* Delete Vehicle */}
                <View style={styles.dangerZone}>
                  {!deleteConfirm ? (
                    <TouchableOpacity
                      style={[styles.deleteBtn, { borderColor: theme.danger }]}
                      onPress={() => setDeleteConfirm(true)}
                    >
                      <Trash2 size={16} color={theme.danger} />
                      <Text style={[styles.deleteBtnText, { color: theme.danger }]}>Delete Vehicle</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={[styles.confirmDeleteCard, { backgroundColor: theme.danger + '15', borderColor: theme.danger }]}>
                      <Text style={[styles.confirmDeleteText, { color: theme.danger }]}>
                        Are you sure you want to delete this vehicle record?
                      </Text>
                      <View style={styles.confirmRow}>
                        <TouchableOpacity
                          style={[styles.cancelBtn, { borderColor: theme.border }]}
                          onPress={() => setDeleteConfirm(false)}
                        >
                          <Text style={{ color: theme.textSecondary }}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: theme.danger }]} onPress={handleDelete}>
                          <Text style={{ color: '#FFF', fontWeight: '700' }}>Confirm Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* MAINTENANCE TAB */}
            {activeTab === 'maintenance' && (
              <View style={styles.tabContent}>
                <View style={styles.tabHeaderRow}>
                  <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                    Service History ({vehicleMaintenance.length})
                  </Text>
                  <TouchableOpacity
                    style={[styles.miniAddBtn, { backgroundColor: theme.primary }]}
                    onPress={() => setAddMaintOpen(true)}
                  >
                    <Plus size={14} color="#000" />
                    <Text style={styles.miniAddBtnText}>Log</Text>
                  </TouchableOpacity>
                </View>

                {vehicleMaintenance.length === 0 ? (
                  <View style={[styles.emptyMaint, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Wrench size={32} color={theme.textMuted} />
                    <Text style={[styles.emptyMaintTitle, { color: theme.textPrimary }]}>No service logs yet</Text>
                    <Text style={[styles.emptyMaintSub, { color: theme.textMuted }]}>
                      Log oil changes, PMS schedules, and battery replacements.
                    </Text>
                  </View>
                ) : (
                  vehicleMaintenance.map((maint) => (
                    <View
                      key={maint.id}
                      style={[styles.timelineCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    >
                      <View style={styles.timelineHeader}>
                        <View style={[styles.timelineIcon, { backgroundColor: theme.accentIndigo + '22' }]}>
                          <Wrench size={16} color={theme.accentIndigo} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.maintType, { color: theme.textPrimary }]}>{maint.type}</Text>
                          <Text style={[styles.maintDate, { color: theme.textSecondary }]}>
                            {maint.date} • {maint.mileage.toLocaleString()} km
                          </Text>
                        </View>
                        {maint.cost ? (
                          <Text style={[styles.maintCost, { color: theme.primary }]}>₱{maint.cost.toLocaleString()}</Text>
                        ) : null}
                      </View>

                      {maint.parts && (
                        <Text style={[styles.partsText, { color: theme.textSecondary }]}>
                          <Text style={{ fontWeight: '700', color: theme.textMuted }}>Parts: </Text>
                          {maint.parts}
                        </Text>
                      )}

                      {maint.serviceProvider && (
                        <Text style={[styles.providerText, { color: theme.textMuted }]}>
                          📍 {maint.serviceProvider}
                        </Text>
                      )}

                      {maint.notes && (
                        <Text style={[styles.maintNotes, { color: theme.textSecondary }]}>
                          "{maint.notes}"
                        </Text>
                      )}

                      <View style={styles.maintFooter}>
                        <TouchableOpacity onPress={() => deleteMaintenance(maint.id)}>
                          <Trash2 size={14} color={theme.textMuted} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* DOCUMENTS TAB */}
            {activeTab === 'documents' && (
              <View style={styles.tabContent}>
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                  Vehicle Documents ({vehicleDocs.length})
                </Text>
                {vehicleDocs.length === 0 ? (
                  <View style={[styles.emptyMaint, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <FileText size={32} color={theme.textMuted} />
                    <Text style={[styles.emptyMaintTitle, { color: theme.textPrimary }]}>No linked documents</Text>
                    <Text style={[styles.emptyMaintSub, { color: theme.textMuted }]}>
                      Add OR/CR, insurance policies, or emission test certificates.
                    </Text>
                  </View>
                ) : (
                  vehicleDocs.map((doc) => (
                    <View
                      key={doc.id}
                      style={[styles.timelineCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    >
                      <View style={styles.timelineHeader}>
                        <View style={[styles.timelineIcon, { backgroundColor: theme.primaryGlow }]}>
                          <FileText size={16} color={theme.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.maintType, { color: theme.textPrimary }]}>{doc.title}</Text>
                          <Text style={[styles.maintDate, { color: theme.textSecondary }]}>
                            {doc.provider} • Number: {doc.documentNumber}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}
          </ScrollView>

          {/* Add Maintenance Modal Sub-Screen */}
          <AddMaintenanceModal
            vehicleId={vehicle.id}
            vehicleName={`${vehicle.make} ${vehicle.model}`}
            currentMileage={vehicle.mileage}
            visible={addMaintOpen}
            onClose={() => setAddMaintOpen(false)}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    height: '88%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  sub: {
    fontSize: 13,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 12,
  },
  body: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  tabContent: {
    gap: 16,
  },
  heroCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroVal: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  heroSub: {
    fontSize: 11,
    marginTop: 2,
  },
  heroIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  specGrid: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  specItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  specLabel: {
    fontSize: 12,
  },
  specVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  addMaintBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
    marginTop: 4,
  },
  addMaintBtnText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 14,
  },
  dangerZone: {
    marginTop: 8,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  deleteBtnText: {
    fontWeight: '700',
    fontSize: 13,
  },
  confirmDeleteCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  confirmDeleteText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  confirmRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  confirmBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
  },
  tabHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  miniAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  miniAddBtnText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '700',
  },
  emptyMaint: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  emptyMaintTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyMaintSub: {
    fontSize: 12,
    textAlign: 'center',
  },
  timelineCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timelineIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  maintType: {
    fontSize: 14,
    fontWeight: '700',
  },
  maintDate: {
    fontSize: 11,
    marginTop: 2,
  },
  maintCost: {
    fontSize: 14,
    fontWeight: '800',
  },
  partsText: {
    fontSize: 12,
  },
  providerText: {
    fontSize: 11,
  },
  maintNotes: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  maintFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
});
