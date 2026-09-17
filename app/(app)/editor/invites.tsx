/**
 * STUDIO — Gestion des invités (fin d’édition).
 * Ajout d’invités (Prénom, Nom, Téléphone/Email, places attribuées).
 * Lien / QR personnels : visibles après publication (pas de partage ici
 * pour éviter d’envoyer un lien provisoire INV-…).
 */

import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { EditorInput } from '@/features/editor/components/EditorInput';
import { QrPattern } from '@/components/ui/QrPattern';
import { EditorHeader } from '@/features/editor/components/EditorHeader';
import { EditorHint } from '@/features/editor/components/EditorHint';
import { useEditor } from '@/features/editor/EditorContext';
import { useStudioChrome } from '@/features/editor/useStudioChrome';
import { goBackInEditor } from '@/features/editor/navigation';
import { buildGuestLink, guestAccessKey } from '@/features/invitation/qr';
import type { Guest } from '@/features/invitation/types';

export default function InvitesScreen() {
  const router = useRouter();
  const { guests, addGuest, removeGuest, invitationSlug } = useEditor();
  const colors = useStudioChrome();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contact, setContact] = useState('');
  const [seats, setSeats] = useState(2);
  const [openId, setOpenId] = useState<string | null>(null);

  const totalSeats = guests.reduce((sum, guest) => sum + guest.seats, 0);
  const canAdd = firstName.trim().length > 0 && lastName.trim().length > 0;

  const submit = () => {
    if (!canAdd) return;
    addGuest({ firstName, lastName, contact, seats });
    setFirstName('');
    setLastName('');
    setContact('');
    setSeats(2);
  };

  const linkFor = (guest: Guest) => buildGuestLink(invitationSlug, guestAccessKey(guest));

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg }]}>
      <EditorHeader title="Invités" onBack={() => goBackInEditor(router)} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <EditorHint>
          Ajoutez prénom et nom, puis publiez l’invitation. Les liens personnels se créent à la
          publication — ne les envoyez qu’après.
        </EditorHint>
        <View style={[styles.summary, { backgroundColor: colors.chip }]}>
          <Ionicons name="people-outline" size={15} color={colors.primary} />
          <Text style={[styles.summaryText, { color: colors.primary }]}>
            {guests.length} invité{guests.length > 1 ? 's' : ''} · {totalSeats} place
            {totalSeats > 1 ? 's' : ''}
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Ajouter un invité</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.nameRow}>
            <EditorInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Prénom"
              containerStyle={styles.halfField}
            />
            <EditorInput
              value={lastName}
              onChangeText={setLastName}
              placeholder="Nom"
              containerStyle={styles.halfField}
            />
          </View>
          <EditorInput
            value={contact}
            onChangeText={setContact}
            placeholder="Téléphone ou email"
            keyboardType="email-address"
            leftIcon="call-outline"
          />
          <View style={styles.seatsRow}>
            <Text style={[styles.seatsLabel, { color: colors.text }]}>Places attribuées</Text>
            <View style={[styles.seatsStepper, { backgroundColor: colors.chip }]}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setSeats(Math.max(1, seats - 1))}
                hitSlop={6}
                style={styles.stepBtn}
              >
                <Ionicons name="remove" size={16} color={colors.text} />
              </Pressable>
              <Text style={[styles.seatsValue, { color: colors.primary }]}>{seats}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => setSeats(Math.min(10, seats + 1))}
                hitSlop={6}
                style={styles.stepBtn}
              >
                <Ionicons name="add" size={16} color={colors.text} />
              </Pressable>
            </View>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !canAdd }}
          onPress={submit}
          disabled={!canAdd}
          style={({ pressed }) => [
            styles.addBtn,
            { backgroundColor: colors.primary },
            !canAdd && styles.disabled,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons name="person-add-outline" size={16} color={colors.onPrimary} />
          <Text style={[styles.addLabel, { color: colors.onPrimary }]}>Ajouter cet invité</Text>
        </Pressable>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Vos invités</Text>
        {guests.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={22} color="#ADB5BD" />
            <Text style={styles.emptyText}>
              Ajoutez vos invités — chacun aura un lien et un QR personnels après publication.
            </Text>
          </View>
        ) : null}

        {guests.map((guest) => {
          const open = openId === guest.id;
          const accessKey = guestAccessKey(guest);
          const link = linkFor(guest);
          const published = Boolean(guest.accessToken);
          return (
            <View
              key={guest.id}
              style={[styles.guestCard, { borderColor: colors.border, backgroundColor: colors.surface }]}
            >
              <Pressable
                accessibilityRole="button"
                onPress={() => setOpenId(open ? null : guest.id)}
                style={({ pressed }) => [styles.guestRow, pressed && styles.pressed]}
              >
                <View style={[styles.avatar, { backgroundColor: colors.chip }]}>
                  <Text style={[styles.avatarText, { color: colors.primary }]}>
                    {guest.firstName.charAt(0)}
                    {guest.lastName.charAt(0)}
                  </Text>
                </View>
                <View style={styles.guestBody}>
                  <Text style={[styles.guestName, { color: colors.text }]}>
                    {guest.firstName} {guest.lastName}
                  </Text>
                  <Text style={[styles.guestContact, { color: colors.textMuted }]}>
                    {guest.contact || 'Contact non renseigné'}
                  </Text>
                  <Text style={[styles.guestId, { color: colors.primary }]}>
                    {published ? 'Publié' : guest.id} · {guest.seats} place
                    {guest.seats > 1 ? 's' : ''}
                  </Text>
                </View>
                <Ionicons
                  name={open ? 'chevron-up' : 'qr-code-outline'}
                  size={18}
                  color={colors.textMuted}
                />
              </Pressable>

              {open ? (
                <View style={[styles.guestShare, { borderTopColor: colors.border }]}>
                  <QrPattern seed={accessKey} size={17} cell={5} style={styles.guestQr} />
                  {published ? (
                    <Text
                      style={[styles.linkText, { color: colors.textMuted }]}
                      numberOfLines={2}
                      ellipsizeMode="middle"
                    >
                      {link}
                    </Text>
                  ) : null}
                  <Text style={[styles.shareHint, { color: colors.textMuted }]}>
                    {published
                      ? 'Lien personnel prêt. Après confirmation de présence, l’invité affichera son pass d’entrée.'
                      : 'Publiez l’invitation pour activer le vrai lien personnel de cet invité.'}
                  </Text>
                </View>
              ) : null}

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Supprimer ${guest.firstName}`}
                onPress={() => removeGuest(guest.id)}
                hitSlop={8}
                style={styles.removeBtn}
              >
                <Ionicons name="trash-outline" size={15} color="#A45A45" />
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.45 },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 7,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 8,
    marginBottom: 16,
  },
  summaryText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  sectionTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#121318', marginBottom: 10 },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6DCCB',
    borderRadius: 14,
    padding: 14,
    gap: 10,
    marginBottom: 14,
  },
  nameRow: { flexDirection: 'row', gap: 10 },
  halfField: { flex: 1 },
  seatsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  seatsLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 13.5, color: '#121318' },
  seatsStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EDE6D8',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  stepBtn: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  seatsValue: { fontFamily: 'Inter_600SemiBold', fontSize: 15, minWidth: 26, textAlign: 'center' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    minHeight: 48,
    borderRadius: 999,
    marginBottom: 22,
  },
  addLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  empty: { alignItems: 'center', gap: 8, paddingVertical: 26 },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12.5,
    lineHeight: 18,
    color: '#9A9EA7',
    textAlign: 'center',
    maxWidth: 260,
  },
  guestCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderRadius: 14,
    marginBottom: 10,
    overflow: 'hidden',
  },
  guestRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: 'Inter_600SemiBold', fontSize: 13 },
  guestBody: { flex: 1, gap: 1 },
  guestName: { fontFamily: 'Inter_600SemiBold', fontSize: 14, color: '#121318' },
  guestContact: { fontFamily: 'Inter_400Regular', fontSize: 11.5, color: '#9A9EA7' },
  guestId: { fontFamily: 'Inter_600SemiBold', fontSize: 10.5, letterSpacing: 1 },
  guestShare: {
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#EDE6D8',
    padding: 16,
  },
  guestQr: { borderRadius: 10, overflow: 'hidden' },
  linkText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11.5,
    color: '#6F675C',
    textAlign: 'center',
  },
  shareHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10.5,
    lineHeight: 15,
    color: '#9A9EA7',
    textAlign: 'center',
    paddingHorizontal: 6,
  },
  removeBtn: { position: 'absolute', top: 10, right: 10, padding: 4 },
});
