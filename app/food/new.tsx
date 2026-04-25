import React from 'react';
import { Alert, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen, Text, Card, Button, Chip, IconButton, Input } from '@/components/primitives';
import { insertCustomFood } from '@/db/repositories/foods';
import type { FoodType } from '@/domain/types';
import { useTheme } from '@/theme/ThemeProvider';
import { haptics } from '@/services/haptics';

export default function NewFoodScreen() {
  const { query, returnToPlanCatId } = useLocalSearchParams<{
    query?: string;
    returnToPlanCatId?: string;
  }>();
  const { colors } = useTheme();

  const [brand, setBrand] = React.useState('');
  const [name, setName] = React.useState(typeof query === 'string' ? query : '');
  const [type, setType] = React.useState<FoodType>('wet');
  const [kcalPerKg, setKcalPerKg] = React.useState('');
  const [kcalPerCan, setKcalPerCan] = React.useState('');
  const [canSizeG, setCanSizeG] = React.useState('');
  const [proteinPct, setProteinPct] = React.useState('');
  const [fatPct, setFatPct] = React.useState('');
  const [moisturePct, setMoisturePct] = React.useState('');
  const [fiberPct, setFiberPct] = React.useState('');
  const [ingredients, setIngredients] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  const parsedKcalPerKg = parsePositiveNumber(kcalPerKg);
  const parsedKcalPerCan = parsePositiveNumber(kcalPerCan);
  const parsedCanSizeG = parsePositiveNumber(canSizeG);
  const derivedKcalPerKg =
    parsedKcalPerKg ??
    (type === 'wet' && parsedKcalPerCan && parsedCanSizeG
      ? (parsedKcalPerCan / parsedCanSizeG) * 1000
      : null);

  const canSave =
    brand.trim().length > 0 &&
    name.trim().length > 0 &&
    derivedKcalPerKg != null &&
    derivedKcalPerKg > 0;

  async function save() {
    if (!canSave || derivedKcalPerKg == null) {
      Alert.alert(
        'More food details needed',
        'Add a brand, food name, and calorie content. For wet food, kcal per can plus can size is enough.',
      );
      return;
    }

    setSaving(true);
    try {
      const food = await insertCustomFood({
        brand: brand.trim(),
        name: name.trim(),
        type,
        kcalPerKg: derivedKcalPerKg,
        kcalPerCan: parsedKcalPerCan,
        canSizeG: parsedCanSizeG,
        proteinPct: parsePositiveNumber(proteinPct),
        fatPct: parsePositiveNumber(fatPct),
        moisturePct: parsePositiveNumber(moisturePct),
        fiberPct: parsePositiveNumber(fiberPct),
        ingredients: ingredients.trim() || null,
      });
      haptics.success();
      if (returnToPlanCatId) {
        router.replace(`/cat/${returnToPlanCatId}/plan?addFoodId=${food.id}`);
      } else {
        router.replace(`/food/${food.id}`);
      }
    } catch (err) {
      console.error('[foods] custom save failed', err);
      Alert.alert('Food not saved', 'Please double-check the fields and try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen scroll padded keyboardAvoid>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <IconButton onPress={() => router.back()} accessibilityLabel="Back">
          <Text variant="displayS" color={colors.text}>‹</Text>
        </IconButton>
        <Text variant="displayM">Add custom food</Text>
      </View>

      <Text variant="body" muted>
        Use the calorie content from the label. Whiskr stores metric values and handles display conversion for you.
      </Text>

      <Card style={{ marginTop: 18 }}>
        <View style={{ gap: 14 }}>
          <Input label="Brand" placeholder="e.g. Fancy Feast" value={brand} onChangeText={setBrand} />
          <Input label="Food name" placeholder="e.g. Classic Chicken Feast" value={name} onChangeText={setName} />

          <View>
            <Text variant="label" muted style={{ marginBottom: 8 }}>Food type</Text>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              <Chip label="Wet" selected={type === 'wet'} onPress={() => setType('wet')} />
              <Chip label="Dry" selected={type === 'dry'} onPress={() => setType('dry')} />
              <Chip label="Treat" selected={type === 'treat'} onPress={() => setType('treat')} />
            </View>
          </View>
        </View>
      </Card>

      <Text variant="overline" subtle style={{ marginTop: 22, marginBottom: 8 }}>
        CALORIES
      </Text>
      <Card>
        <View style={{ gap: 14 }}>
          <Input
            label="kcal per kg"
            placeholder={type === 'wet' ? 'Optional if can info is filled' : 'e.g. 3850'}
            value={kcalPerKg}
            onChangeText={(value) => setKcalPerKg(sanitizeDecimal(value))}
            keyboardType="decimal-pad"
            trailingUnit="kcal/kg"
          />
          {type === 'wet' || type === 'treat' ? (
            <Input
              label={type === 'treat' ? 'kcal per piece' : 'kcal per can'}
              placeholder={type === 'treat' ? 'e.g. 2' : 'e.g. 82'}
              value={kcalPerCan}
              onChangeText={(value) => setKcalPerCan(sanitizeDecimal(value))}
              keyboardType="decimal-pad"
              trailingUnit="kcal"
            />
          ) : null}
          {type === 'wet' ? (
            <Input
              label="Can size"
              placeholder="e.g. 85"
              value={canSizeG}
              onChangeText={(value) => setCanSizeG(sanitizeDecimal(value))}
              keyboardType="decimal-pad"
              trailingUnit="g"
              helper={
                derivedKcalPerKg && !parsedKcalPerKg
                  ? `Calculated ${Math.round(derivedKcalPerKg)} kcal/kg from can details.`
                  : undefined
              }
            />
          ) : null}
        </View>
      </Card>

      <Text variant="overline" subtle style={{ marginTop: 22, marginBottom: 8 }}>
        GUARANTEED ANALYSIS
      </Text>
      <Card>
        <View style={{ gap: 14 }}>
          <Input label="Protein" value={proteinPct} onChangeText={(value) => setProteinPct(sanitizeDecimal(value))} keyboardType="decimal-pad" trailingUnit="%" />
          <Input label="Fat" value={fatPct} onChangeText={(value) => setFatPct(sanitizeDecimal(value))} keyboardType="decimal-pad" trailingUnit="%" />
          <Input label="Moisture" value={moisturePct} onChangeText={(value) => setMoisturePct(sanitizeDecimal(value))} keyboardType="decimal-pad" trailingUnit="%" />
          <Input label="Fiber" value={fiberPct} onChangeText={(value) => setFiberPct(sanitizeDecimal(value))} keyboardType="decimal-pad" trailingUnit="%" />
          <Input
            label="Ingredients"
            placeholder="Optional"
            value={ingredients}
            onChangeText={setIngredients}
            multiline
          />
        </View>
      </Card>

      <Button
        label="Save custom food"
        onPress={save}
        loading={saving}
        disabled={!canSave}
        size="lg"
        fullWidth
        style={{ marginTop: 24 }}
      />
    </Screen>
  );
}

function sanitizeDecimal(value: string): string {
  const clean = value.replace(/[^0-9.]/g, '');
  const [first, ...rest] = clean.split('.');
  return rest.length > 0 ? `${first}.${rest.join('')}` : clean;
}

function parsePositiveNumber(value: string): number | null {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}
