import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useThemedStyles } from '../lib/ThemeContext';
import { Colors, fonts, radius } from '../lib/theme';

type Props = {
  visible: boolean;
  value: Date;
  mode?: 'date' | 'time';
  minimumDate?: Date;
  maximumDate?: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
};

/**
 * Cross-platform date/time picker.
 *
 * Android: shows the native dialog (which has its own OK/Cancel) and reports
 * the result via onChange's event type.
 *
 * iOS: the native picker is an inline view with no built-in buttons and it
 * fires onChange on every scroll tick, so we present a spinner inside a Modal
 * with our own Cancel/Done and only commit the value on Done.
 */
export default function DateTimeModal({
  visible, value, mode = 'date', minimumDate, maximumDate, onConfirm, onCancel,
}: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useThemedStyles(makeStyles);
  const [temp, setTemp] = useState(value);

  // Re-seed the working value each time the picker is opened.
  useEffect(() => {
    if (visible) setTemp(value);
  }, [visible, value]);

  if (Platform.OS === 'android') {
    if (!visible) return null;
    return (
      <DateTimePicker
        value={value}
        mode={mode}
        display="default"
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        onChange={(event, selected) => {
          if (event.type === 'set' && selected) onConfirm(selected);
          else onCancel();
        }}
      />
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent navigationBarTranslucent onRequestClose={onCancel}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onCancel}>
        <TouchableOpacity activeOpacity={1} style={[styles.sheet, { paddingBottom: 24 + insets.bottom }]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onCancel} hitSlop={8}>
              <Text style={styles.cancel}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onConfirm(temp)} hitSlop={8}>
              <Text style={styles.done}>Done</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={temp}
            mode={mode}
            display="spinner"
            themeVariant="light"
            textColor={colors.ink}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            onChange={(_, selected) => { if (selected) setTemp(selected); }}
            style={styles.picker}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const makeStyles = (c: Colors) => StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: c.scrim, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: c.surface,
    borderTopLeftRadius: radius.card, borderTopRightRadius: radius.card,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: c.cardBorder,
  },
  cancel: { fontSize: 16, color: c.muted, fontFamily: fonts.body5 },
  done: { fontSize: 16, color: c.accentDeep, fontFamily: fonts.displaySemi },
  picker: { alignSelf: 'stretch', height: 216 },
});
