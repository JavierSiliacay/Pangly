// src/screens/Vehicles/VehiclesScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { VehicleItem } from '../../types/vault';
import { useVault } from '../../context/VaultContext';
import { darkTheme, slateTheme, lightTheme } from '../../theme/colors';
import { VehicleDetailModal } from './VehicleDetailModal';
import { AddVehicleModal } from './AddVehicleModal';
import { PangolinCompanion } from '../../components/PangolinCompanion';
import {
  Plus,
  Car,
  Wrench,
  Gauge,
  ChevronRight,
  ShieldCheck,
  Calendar,
} from 'lucide-react-native';

export const VehiclesScreen: React.FC = () => {
  const { vehicles, maintenance, settings } = useVault();
  const theme = settings.theme === 'light' ? lightTheme : settings.theme === 'slate' ? slateTheme : darkTheme;

  const [activeVehicle, setActiveVehicle] = useState<VehicleItem | null>(null);
  const [addVehicleOpen, setAddVehicleOpen] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
        {vehicles.length === 0 ? (
          <View style={styles.emptyState}>
            <PangolinCompanion mood="thinking" size={80} showBubble={false} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
              Keep track of your vehicles.
            </Text>
            <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
              Store plate numbers, OR/CR documents, oil changes, and upcoming maintenance intervals.
            </Text>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: theme.primary }]}
              onPress={() => setAddVehicleOpen(true)}
            >
              <Plus size={16} color="#000" />
              <Text style={styles.emptyBtnText}>Add First Vehicle</Text>
            </TouchableOpacity>
          </View>
        ) : (
          vehicles.map((veh) => {
            const vehMaint = maintenance.filter((m) => m.vehicleId === veh.id);
            const totalMaintCost = vehMaint.reduce((sum, m) => sum + (m.cost || 0), 0);
            const kmRemaining = Math.max(0, veh.nextMaintenanceKm - veh.mileage);

            return (
              <TouchableOpacity
                key={veh.id}
                activeOpacity={0.8}
                onPress={() => setActiveVehicle(veh)}
                style={[styles.vehicleCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              >
                <View style={styles.cardHeaderRow}>
                  <View style={[styles.iconBox, { backgroundColor: theme.accentTeal + '22' }]}>
                    <Car size={22} color={theme.accentTeal} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={[styles.vehicleTitle, { color: theme.textPrimary }]}>
                      {veh.make} {veh.model}
                    </Text>
                    <Text style={[styles.vehicleSub, { color: theme.textSecondary }]}>
                      Plate: {veh.plateNumber} • {veh.year}
                    </Text>
                  </View>

                  <ChevronRight size={18} color={theme.textMuted} />
                </View>

                {/* Metrics Row */}
                <View style={[styles.metricsRow, { backgroundColor: theme.surfaceElevated }]}>
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricLabel, { color: theme.textMuted }]}>ODOMETER</Text>
                    <Text style={[styles.metricVal, { color: theme.textPrimary }]}>
                      {veh.mileage.toLocaleString()} km
                    </Text>
                  </View>

                  <View style={[styles.metricDivider, { backgroundColor: theme.borderSubtle }]} />

                  <View style={styles.metricItem}>
                    <Text style={[styles.metricLabel, { color: theme.textMuted }]}>NEXT SERVICE</Text>
                    <Text style={[styles.metricVal, { color: theme.primary }]}>
                      in {kmRemaining.toLocaleString()} km
                    </Text>
                  </View>

                  <View style={[styles.metricDivider, { backgroundColor: theme.borderSubtle }]} />

                  <View style={styles.metricItem}>
                    <Text style={[styles.metricLabel, { color: theme.textMuted }]}>TOTAL SERVICE</Text>
                    <Text style={[styles.metricVal, { color: theme.primary }]}>
                      ₱{totalMaintCost.toLocaleString()}
                    </Text>
                  </View>
                </View>

                {/* Last maintenance snippet */}
                {vehMaint[0] && (
                  <View style={styles.snippetRow}>
                    <Wrench size={12} color={theme.accentIndigo} />
                    <Text style={[styles.snippetText, { color: theme.textMuted }]}>
                      Last Service: {vehMaint[0].type} on {vehMaint[0].date} {vehMaint[0].cost ? `(₱${vehMaint[0].cost.toLocaleString()})` : ''}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Vehicle Detail Modal */}
      <VehicleDetailModal
        vehicle={activeVehicle}
        visible={activeVehicle !== null}
        onClose={() => setActiveVehicle(null)}
      />

      {/* Add Vehicle Modal */}
      <AddVehicleModal
        visible={addVehicleOpen}
        onClose={() => setAddVehicleOpen(false)}
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
  listContainer: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  vehicleCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  vehicleSub: {
    fontSize: 12,
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
  },
  metricVal: {
    fontSize: 13,
    fontWeight: '800',
  },
  metricDivider: {
    width: 1,
    height: 24,
  },
  snippetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  snippetText: {
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
