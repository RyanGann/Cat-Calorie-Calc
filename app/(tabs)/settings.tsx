import React from 'react';
import { View, ScrollView, Pressable, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card, Button } from '@/components/primitives';
import { useTheme } from '@/theme/ThemeProvider';
import { useSettingsStore } from '@/state/settings';
import { useCatsStore } from '@/state/cats';
import { ensurePermissions, cancelAll } from '@/services/notifications';
import { VET_DISCLAIMER } from '@/domain/calories';
import { radii } from '@/theme/spacing';
import { haptics } from '@/services/haptics';
import { exportVetSummaryPdf } from '@/services/vetExport';
import { resolveUnitSystem } from '@/utils/units';

export default function SettingsScreen() {
  const { colors } = useTheme();
  const { unitPref, theme, remindersOn, proUnlocked, set } = useSettingsStore();
  const { cats, activeCatId } = useCatsStore();
  const activeCat = cats.find((cat) => cat.id === activeCatId) ?? null;
  const [exporting, setExporting] = React.useState(false);

  async function exportVetSummary() {
    if (!activeCat) {
      Alert.alert('No cat selected', 'Add a cat before exporting a vet summary.');
      return;
    }
    setExporting(true);
    try {
      await exportVetSummaryPdf({
        cat: activeCat,
        unitSystem: resolveUnitSystem(unitPref),
      });
    } catch (err) {
      console.error('[settings] vet export failed', err);
      Alert.alert('Export failed', 'Please try again in a moment.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.canvas }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text variant="displayL">Settings</Text>

        <SectionTitle>Units</SectionTitle>
        <Card padded={false}>
          <Row label="Measurement system">
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {(['auto', 'metric', 'imperial'] as const).map((u) => (
                <Pressable
                  key={u}
                  onPress={() => {
                    haptics.selection();
                    set({ unitPref: u });
                  }}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: radii.pill,
                    backgroundColor: unitPref === u ? colors.accent : 'transparent',
                    borderWidth: 1,
                    borderColor: unitPref === u ? colors.accent : colors.hairline,
                  }}
                >
                  <Text
                    variant="label"
                    color={unitPref === u ? colors.onAccent : colors.text}
                  >
                    {u === 'auto' ? 'Auto' : u === 'metric' ? 'kg · g' : 'lb · oz'}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Row>
        </Card>

        <SectionTitle>Theme</SectionTitle>
        <Card padded={false}>
          <Row label="Appearance">
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {(['system', 'light', 'dark'] as const).map((t) => (
                <Pressable
                  key={t}
                  onPress={() => {
                    haptics.selection();
                    set({ theme: t });
                  }}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: radii.pill,
                    backgroundColor: theme === t ? colors.accent : 'transparent',
                    borderWidth: 1,
                    borderColor: theme === t ? colors.accent : colors.hairline,
                  }}
                >
                  <Text variant="label" color={theme === t ? colors.onAccent : colors.text}>
                    {t[0]!.toUpperCase() + t.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Row>
        </Card>

        <SectionTitle>Notifications</SectionTitle>
        <Card padded={false}>
          <Row label="Meal reminders">
            <Switch
              value={remindersOn}
              onValueChange={async (v) => {
                haptics.selection();
                if (v) {
                  const granted = await ensurePermissions();
                  await set({ remindersOn: granted });
                  if (!granted) {
                    Alert.alert('Permission needed', 'Enable notifications in Settings to receive reminders.');
                  }
                } else {
                  await set({ remindersOn: false });
                  await cancelAll();
                }
              }}
              trackColor={{ true: colors.accent, false: colors.hairline }}
              thumbColor={colors.surface}
            />
          </Row>
        </Card>

        <SectionTitle>Data</SectionTitle>
        <Card>
          <Text variant="displayS">Vet summary</Text>
          <Text variant="body" muted style={{ marginTop: 6 }}>
            Share {activeCat?.name ?? 'your cat'}'s profile, current feeding plan, and recent feeding history as a PDF.
          </Text>
          <Button
            label="Export PDF"
            variant="secondary"
            loading={exporting}
            disabled={!activeCat}
            onPress={exportVetSummary}
            style={{ marginTop: 14 }}
          />
        </Card>

        <SectionTitle>Pro</SectionTitle>
        <Card>
          <Text variant="displayS">Whiskr Pro</Text>
          <Text variant="body" muted style={{ marginTop: 6 }}>
            One-time unlock. Sync across devices, unlimited cats, custom themes, advanced insights.
          </Text>
          <Button
            label={proUnlocked ? '✓ Unlocked' : 'Coming soon'}
            variant="secondary"
            disabled
            style={{ marginTop: 14 }}
          />
        </Card>

        <SectionTitle>About</SectionTitle>
        <Card>
          <Text variant="label" style={{ marginBottom: 6 }}>Medical disclaimer</Text>
          <Text variant="bodySm" muted>{VET_DISCLAIMER}</Text>
        </Card>

        <Text variant="bodySm" subtle align="center" style={{ marginTop: 24 }}>
          {cats.length} cat{cats.length === 1 ? '' : 's'} · Whiskr 0.1
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text variant="overline" subtle style={{ marginTop: 20, marginBottom: 10 }}>
      {children}
    </Text>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      <Text variant="body" style={{ flex: 1 }}>{label}</Text>
      {children}
    </View>
  );
}
