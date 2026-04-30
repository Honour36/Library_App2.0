import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown } from 'lucide-react-native';
import academicApi from '../../api/academicApi';
import AnimatedSvgIllustration from '../../components/AnimatedSvgIllustration';
import Skeleton from '../../components/Skeleton';
import { getProgramsByFaculty } from '../../data/academic';
import { useStudentStore } from '../../store/studentStore';
import { colors, radius, shadows, spacing, typography } from '../../theme/designSystem';

const STEPS = ['Faculty', 'Program', 'Year', 'Ceremonial Hall', 'Done'] as const;
const HALL_PLACEHOLDER = 'Write a short statement or paragraph...';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [faculty, setFaculty] = useState<string | null>(null);
  const [program, setProgram] = useState<string | null>(null);
  const [yearOfStudy, setYearOfStudy] = useState<string | null>(null);
  const [ceremonialHallThought, setCeremonialHallThought] = useState('');
  const [facultyOpen, setFacultyOpen] = useState(false);
  const [programOpen, setProgramOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);
  const completeOnboarding = useStudentStore((state) => state.completeOnboarding);
  const { data: catalog, isLoading, isError } = useQuery({
    queryKey: ['academic-catalog'],
    queryFn: academicApi.getAcademicCatalog,
  });

  const faculties = useMemo(() => catalog?.faculties.map((item: any) => item.name) || [], [catalog]);
  const programsByFaculty = useMemo(() => getProgramsByFaculty(catalog), [catalog]);
  const years = useMemo(() => catalog?.years || [], [catalog]);
  const programs = useMemo(() => {
    if (!faculty) return [];
    return programsByFaculty[faculty] || [];
  }, [faculty, programsByFaculty]);

  useEffect(() => {
    if (!faculties.length || faculty) return;
    setFaculty(faculties[0]);
  }, [faculties, faculty]);

  useEffect(() => {
    if (!programs.length) {
      setProgram(null);
      return;
    }

    if (program && programs.includes(program)) return;
    setProgram(programs[0]);
  }, [program, programs]);

  useEffect(() => {
    if (!years.length || yearOfStudy) return;
    setYearOfStudy(years[0]);
  }, [yearOfStudy, years]);

  const animateDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const toggleDropdown = (target: 'faculty' | 'program' | 'year') => {
    animateDropdown();
    setFacultyOpen(target === 'faculty' ? !facultyOpen : false);
    setProgramOpen(target === 'program' ? !programOpen : false);
    setYearOpen(target === 'year' ? !yearOpen : false);
  };

  const next = async () => {
    if (step < 4) {
      setStep((current) => current + 1);
      return;
    }

    if (faculty && program && yearOfStudy) {
      await completeOnboarding({
        faculty,
        program,
        yearOfStudy,
        aspiration: ceremonialHallThought.trim() || 'Ready to begin reading.',
      });
    }
  };

  const skip = async () => {
    const fallbackFaculty = faculty || faculties[0];
    const fallbackProgram = program || (fallbackFaculty ? programsByFaculty[fallbackFaculty]?.[0] : '');
    const fallbackYear = yearOfStudy || years[0];

    if (!fallbackFaculty || !fallbackProgram || !fallbackYear) {
      return;
    }

    await completeOnboarding({
      faculty: fallbackFaculty,
      program: fallbackProgram,
      yearOfStudy: fallbackYear,
      aspiration: ceremonialHallThought.trim() || 'Ready to begin reading.',
    });
  };

  const canContinue =
    (step === 0 && !!faculty) ||
    (step === 1 && !!program) ||
    (step === 2 && !!yearOfStudy) ||
    (step === 3 && ceremonialHallThought.trim().length > 0) ||
    step === 4;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.stepDots}>
          {STEPS.map((label, index) => (
            <View key={label} style={[styles.dot, index <= step && styles.dotActive]} />
          ))}
        </View>
        <TouchableOpacity onPress={skip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {step === 0 ? (
            <>
              <AnimatedSvgIllustration source={require('../../../assets/study-online.svg')} width={280} height={220} />
              <Text style={styles.title}>Which faculty are you in?</Text>
              <Text style={styles.subtitle}>Choose your faculty to shape the reading path you see first.</Text>
              {isLoading ? (
                <Skeleton style={styles.dropdownSkeleton} />
              ) : isError ? (
                <Text style={styles.errorText}>Unable to load faculties from the backend.</Text>
              ) : (
                <DropdownCard
                  label="Faculty"
                  value={faculty || 'Choose a faculty'}
                  open={facultyOpen}
                  onPress={() => toggleDropdown('faculty')}
                  options={faculties}
                  selectedValue={faculty}
                  onSelect={(item) => {
                    animateDropdown();
                    setFaculty(item);
                    setFacultyOpen(false);
                    setProgramOpen(false);
                  }}
                />
              )}
            </>
          ) : null}

          {step === 1 ? (
            <>
              <AnimatedSvgIllustration source={require('../../../assets/reach-heights.svg')} width={280} height={220} />
              <Text style={styles.title}>Which program are you starting?</Text>
              <Text style={styles.subtitle}>Pick the program you want this library to prioritize.</Text>
              {isLoading ? (
                <Skeleton style={styles.dropdownSkeleton} />
              ) : (
                <DropdownCard
                  label="Program"
                  value={program || 'Choose a program'}
                  open={programOpen}
                  onPress={() => toggleDropdown('program')}
                  options={programs}
                  selectedValue={program}
                  onSelect={(item) => {
                    animateDropdown();
                    setProgram(item);
                    setProgramOpen(false);
                  }}
                  emptyMessage="Select a faculty first."
                />
              )}
            </>
          ) : null}

          {step === 2 ? (
            <>
              <AnimatedSvgIllustration source={require('../../../assets/reading-online.svg')} width={280} height={220} />
              <Text style={styles.title}>Which year are student?</Text>
              <Text style={styles.subtitle}>Choose your current year so we can surface the right reading level.</Text>
              {isLoading ? (
                <Skeleton style={styles.dropdownSkeleton} />
              ) : (
                <DropdownCard
                  label="Year"
                  value={yearOfStudy || 'Choose a year'}
                  open={yearOpen}
                  onPress={() => toggleDropdown('year')}
                  options={years}
                  selectedValue={yearOfStudy}
                  onSelect={(item) => {
                    animateDropdown();
                    setYearOfStudy(item);
                    setYearOpen(false);
                  }}
                />
              )}
            </>
          ) : null}

          {step === 3 ? (
            <>
              <AnimatedSvgIllustration source={require('../../../assets/read00.svg')} width={280} height={220} />
              <Text style={styles.title}>What do you think of the ceremonial hall?</Text>
              <Text style={styles.subtitle}>Write a short statement or paragraph before finishing setup.</Text>
              <TextInput
                multiline
                textAlignVertical="top"
                placeholder={HALL_PLACEHOLDER}
                placeholderTextColor={colors.textMuted}
                style={styles.textArea}
                value={ceremonialHallThought}
                onChangeText={setCeremonialHallThought}
              />
              <TouchableOpacity
                disabled={!ceremonialHallThought.trim()}
                onPress={() => setStep(4)}
                style={[styles.doneButton, !ceremonialHallThought.trim() && styles.disabledButton]}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </>
          ) : null}

          {step === 4 ? (
            <>
              <AnimatedSvgIllustration source={require('../../../assets/light-bulb.svg')} width={280} height={220} />
              <Text style={styles.title}>All Set, Start your reading journey</Text>
              <Text style={styles.subtitle}>Your profile setup is complete and the app is ready.</Text>
            </>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        {step > 0 ? (
          <TouchableOpacity onPress={() => setStep((current) => current - 1)} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Back</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.secondaryPlaceholder} />
        )}
        <TouchableOpacity
          disabled={!canContinue || isLoading || isError}
          onPress={next}
          style={[styles.primaryButton, (!canContinue || isLoading || isError) && styles.disabledButton]}
        >
          {isLoading ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.primaryButtonText}>{step === 4 ? 'Start reading' : 'Next'}</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function DropdownCard({
  label,
  value,
  open,
  onPress,
  options,
  selectedValue,
  onSelect,
  emptyMessage,
}: {
  label: string;
  value: string;
  open: boolean;
  onPress: () => void;
  options: string[];
  selectedValue: string | null;
  onSelect: (value: string) => void;
  emptyMessage?: string;
}) {
  return (
    <View style={styles.dropdownCard}>
      <Text style={styles.dropdownLabel}>{label}</Text>
      <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={[styles.dropdownTrigger, open && styles.dropdownTriggerOpen]}>
        <Text style={[styles.dropdownValue, !selectedValue && styles.dropdownPlaceholder]}>{value}</Text>
        <ChevronDown size={20} color={colors.textMuted} style={open ? styles.chevronOpen : undefined} />
      </TouchableOpacity>

      {open ? (
        <View style={styles.dropdownMenu}>
          {options.length ? (
            options.map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => onSelect(item)}
                style={[styles.optionCard, selectedValue === item && styles.optionCardSelected]}
              >
                <Text style={[styles.optionText, selectedValue === item && styles.optionTextSelected]}>{item}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>{emptyMessage || 'No options available.'}</Text>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepDots: { flexDirection: 'row', gap: spacing.sm },
  dot: { width: 10, height: 10, borderRadius: radius.pill, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primary },
  skipText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  title: { ...typography.h1, textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { ...typography.body, textAlign: 'center', color: colors.textMuted, marginBottom: spacing.xxl, lineHeight: 22 },
  errorText: { ...typography.body, textAlign: 'center', color: colors.error },
  dropdownSkeleton: { height: 72, borderRadius: radius.lg },
  dropdownCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  dropdownLabel: {
    ...typography.label,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  dropdownTrigger: {
    minHeight: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownTriggerOpen: {
    borderColor: colors.primary,
    backgroundColor: '#EEF2FF',
  },
  dropdownValue: {
    flex: 1,
    paddingRight: spacing.md,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  dropdownPlaceholder: {
    color: colors.textMuted,
  },
  chevronOpen: {
    transform: [{ rotate: '180deg' }],
  },
  dropdownMenu: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  optionCard: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#E9EDFF',
  },
  optionText: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  optionTextSelected: { color: colors.primary },
  emptyText: { ...typography.body, color: colors.textMuted },
  textArea: {
    minHeight: 170,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
    ...shadows.card,
  },
  doneButton: {
    marginTop: spacing.lg,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    padding: spacing.xl,
    flexDirection: 'row',
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  secondaryButton: {
    flex: 1,
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryPlaceholder: { flex: 1 },
  secondaryButtonText: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
  primaryButton: {
    flex: 1,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: { opacity: 0.45 },
  primaryButtonText: { color: colors.surface, fontSize: 14, fontWeight: '700' },
});
