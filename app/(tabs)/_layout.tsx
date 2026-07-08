import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HealthIcon, HomeIcon, JournalIcon, PrepareIcon } from '../../components/Icons';
import { useTheme, useThemedStyles } from '../../lib/ThemeContext';
import { Colors, fonts, radius, shadowFor } from '../../lib/theme';

const TABS = [
  { name: 'index', label: 'Home', Icon: HomeIcon },
  { name: 'health', label: 'Health', Icon: HealthIcon },
  { name: 'journal', label: 'Journal', Icon: JournalIcon },
  { name: 'prepare', label: 'Prepare', Icon: PrepareIcon },
];

function LumiDock({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { colors, gradient } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 16) }]} pointerEvents="box-none">
      <View style={styles.dock}>
        {TABS.map((tab) => {
          // Render in the explicit TABS order (Home | Health | Journal | Prepare),
          // independent of how expo-router orders state.routes.
          const index = state.routes.findIndex((r: any) => r.name === tab.name);
          if (index === -1) return null;
          const route = state.routes[index];
          const focused = state.index === index;
          const Icon = tab.Icon;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          if (focused) {
            return (
              <TouchableOpacity key={route.key} style={styles.tab} activeOpacity={0.85} onPress={onPress}>
                <LinearGradient
                  colors={gradient.accent}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.tabActive}
                >
                  <Icon size={22} color={colors.onAccent} />
                  <Text style={[styles.label, styles.labelActive]}>{tab.label}</Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          }
          return (
            <TouchableOpacity key={route.key} style={[styles.tab, styles.tabInactive]} activeOpacity={0.7} onPress={onPress}>
              <Icon size={22} color={colors.body} />
              <Text style={styles.label}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <LumiDock {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="health" />
      <Tabs.Screen name="journal" />
      <Tabs.Screen name="prepare" />
    </Tabs>
  );
}

const makeStyles = (c: Colors) => StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16 },
  dock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: c.dock,
    borderRadius: radius.dock,
    borderWidth: 1,
    borderColor: c.cardBorder,
    paddingVertical: 12,
    paddingHorizontal: 8,
    shadowColor: c.scheme === 'light' ? '#3A1626' : '#000000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: c.scheme === 'light' ? 0.12 : 0.5,
    shadowRadius: 34,
    elevation: 10,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabInactive: { gap: 5, paddingVertical: 9 },
  tabActive: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: radius.dock,
    ...shadowFor(c.scheme).accent,
  },
  label: { fontFamily: fonts.body5, fontSize: 10, color: c.body },
  labelActive: { fontFamily: fonts.body6, color: c.onAccent },
});
