import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HealthIcon, HomeIcon, JournalIcon, PrepareIcon } from '../../components/Icons';
import { colors, fonts, gradient, radius, shadow } from '../../lib/theme';

const TABS = [
  { name: 'index', label: 'Home', Icon: HomeIcon },
  { name: 'health', label: 'Health', Icon: HealthIcon },
  { name: 'journal', label: 'Journal', Icon: JournalIcon },
  { name: 'prepare', label: 'Prepare', Icon: PrepareIcon },
];

function LumiDock({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 16) }]} pointerEvents="box-none">
      <View style={styles.dock}>
        {state.routes.map((route: any, index: number) => {
          const tab = TABS.find((t) => t.name === route.name);
          if (!tab) return null;
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
                  <Icon size={22} color={colors.white} filled />
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

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16 },
  dock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: radius.dock,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 12,
    paddingHorizontal: 8,
    shadowColor: '#3A1626',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.12,
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
    ...shadow.accent,
  },
  label: { fontFamily: fonts.body5, fontSize: 10, color: colors.body },
  labelActive: { fontFamily: fonts.body6, color: colors.white },
});
