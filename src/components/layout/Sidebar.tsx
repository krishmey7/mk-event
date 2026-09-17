/**
 * Sidebar desktop (≥768 px) — plum profond + accent coral.
 */

import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';

import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/context/AuthContext';
import { useAppTheme } from '@/context/ThemePreferenceContext';
import { fontFamilies, layout, spacing } from '@/constants/theme';

const NAV_ITEMS = [
  { route: '/dashboard', label: 'Tableau de bord', icon: 'home-outline', iconActive: 'home' },
  { route: '/invitations', label: 'Mes invitations', icon: 'mail-outline', iconActive: 'mail' },
  { route: '/modeles', label: 'Modèles', icon: 'grid-outline', iconActive: 'grid' },
  { route: '/profil', label: 'Profil', icon: 'person-outline', iconActive: 'person' },
] as const;

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { theme } = useAppTheme();
  const c = theme.colors;
  const isDark = theme.mode === 'dark';

  const initials =
    user?.full_name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join('') ?? 'MK';

  const handleSignOut = () => {
    void signOut().then(() => router.replace('/login'));
  };

  return (
    <View
      style={[
        styles.sidebar,
        {
          backgroundColor: isDark ? c.surface : '#4A2740',
          borderRightColor: isDark ? c.border : 'rgba(247,240,232,0.08)',
        },
      ]}
    >
      <View style={styles.top}>
        <View style={styles.brand}>
          <Logo size="sm" variant="light" style={styles.logo} />
          <Text style={styles.brandHint}>Studio d’invitations</Text>
        </View>

        <View style={styles.nav}>
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.route === '/invitations'
                ? pathname === '/invitations' || pathname.startsWith('/invitations/')
                : pathname === item.route
                  || (item.route !== '/dashboard' && pathname.startsWith(item.route));
            return (
              <Pressable
                key={item.route}
                accessibilityRole="link"
                accessibilityState={{ selected: isActive }}
                onPress={() => {
                  if (item.route === '/invitations') router.replace('/invitations');
                  else router.push(item.route);
                }}
                style={({ pressed }) => [
                  styles.navItem,
                  isActive && { backgroundColor: 'rgba(224, 122, 95, 0.18)' },
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name={isActive ? item.iconActive : item.icon}
                  size={18}
                  color={isActive ? '#E07A5F' : 'rgba(247, 240, 232, 0.45)'}
                />
                <Text
                  style={[
                    styles.navLabel,
                    { color: isActive ? '#F7F0E8' : 'rgba(247, 240, 232, 0.55)' },
                    isActive && styles.navLabelActive,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.userBlock}>
        <View style={[styles.avatar, { backgroundColor: '#E07A5F' }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.userMeta}>
          <Text style={styles.userName} numberOfLines={1}>
            {user?.full_name ?? 'Organisateur'}
          </Text>
          <Text style={styles.userEmail} numberOfLines={1}>
            {user?.email ?? ''}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Se déconnecter"
          onPress={handleSignOut}
          hitSlop={6}
          style={({ pressed }) => [styles.logoutBtn, pressed && styles.pressed]}
        >
          <Ionicons name="log-out-outline" size={18} color="rgba(242, 244, 247, 0.45)" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: layout.sidebarWidth,
    paddingTop: spacing.xl + 4,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    justifyContent: 'space-between',
    borderRightWidth: 1,
  },
  top: { gap: spacing.xl },
  brand: { gap: 8, paddingHorizontal: 8 },
  logo: { alignSelf: 'flex-start' },
  brandHint: {
    fontFamily: fontFamilies.sans,
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(247, 240, 232, 0.4)',
  },
  nav: { gap: 4 },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  pressed: { opacity: 0.75 },
  navLabel: {
    fontFamily: fontFamilies.sansMedium,
    fontSize: 14,
    lineHeight: 19,
    flex: 1,
  },
  navLabelActive: {
    fontFamily: fontFamilies.sansSemiBold,
  },
  userBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(247, 240, 232, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(247, 240, 232, 0.1)',
    borderRadius: 14,
    padding: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 12,
    lineHeight: 16,
    color: '#FFFFFF',
  },
  userMeta: { flex: 1 },
  userName: {
    fontFamily: fontFamilies.sansSemiBold,
    fontSize: 13,
    lineHeight: 17,
    color: '#F7F0E8',
  },
  userEmail: {
    fontFamily: fontFamilies.sans,
    fontSize: 11,
    lineHeight: 15,
    color: 'rgba(247, 240, 232, 0.4)',
  },
  logoutBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
