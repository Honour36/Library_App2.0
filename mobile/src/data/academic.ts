export interface AcademicProgram {
  id: string;
  name: string;
  level: string;
}

export interface AcademicFaculty {
  id: string;
  name: string;
  programs: AcademicProgram[];
}

export interface AcademicCatalog {
  faculties: AcademicFaculty[];
  years: string[];
}

export const ASPIRATIONS = [
  'Starting my own business',
  'Working at a top company',
  'Pursuing postgraduate study',
  'Going into research',
  'Working internationally',
  'Public/Civil service',
] as const;

export const DEFAULT_LIBRARY_CATEGORIES = [
  'Past Exam Papers',
  'Lecture Notes',
  'Articles',
  'Practical Guides',
  'Course Outline',
  'Tutorials & Assignments',
  'Solutions & Model Answers',
  'Exam Timetables',
] as const;

export const getOrderedCategoryNames = (categories?: { name: string }[]) => {
  if (!categories?.length) return [...DEFAULT_LIBRARY_CATEGORIES];

  const available = new Map(categories.map((item) => [item.name.toLowerCase(), item.name]));
  const preferred = DEFAULT_LIBRARY_CATEGORIES
    .map((name) => available.get(name.toLowerCase()))
    .filter(Boolean) as string[];
  const remaining = categories
    .map((item) => item.name)
    .filter((name) => !preferred.includes(name))
    .sort((a, b) => a.localeCompare(b));

  return [...preferred, ...remaining];
};

export const getCategorySearchTerm = (categoryName: string) => {
  const normalized = categoryName.toLowerCase();

  if (normalized.includes('exam')) return 'past exam papers examination papers';
  if (normalized.includes('lecture')) return 'lecture notes';
  if (normalized.includes('article')) return 'articles research';
  if (normalized.includes('practical')) return 'practical guides';
  if (normalized.includes('tutorial')) return 'tutorials assignments';
  if (normalized.includes('solution')) return 'solutions model answers';
  if (normalized.includes('outline')) return 'course outline';
  if (normalized.includes('timetable')) return 'exam timetables';

  return categoryName;
};

export const getCategoryIllustration = (categoryName: string) => {
  const normalized = categoryName.toLowerCase();

  if (normalized.includes('lecture') || normalized.includes('study')) {
    return require('../../assets/studying.svg');
  }

  if (normalized.includes('exam') || normalized.includes('past paper')) {
    return require('../../assets/exam.svg');
  }

  if (
    normalized.includes('textbook') ||
    normalized.includes('book') ||
    normalized.includes('course outline') ||
    normalized.includes('article')
  ) {
    return require('../../assets/book.svg');
  }

  if (
    normalized.includes('tutorial') ||
    normalized.includes('assignment') ||
    normalized.includes('research') ||
    normalized.includes('practical')
  ) {
    return require('../../assets/research.svg');
  }

  return require('../../assets/book.svg');
};

export const getFacultyShortLabel = (facultyName: string) =>
  facultyName.replace('Faculty of ', '').replace(/\s*\(.*?\)\s*/g, '').trim();

export const getProgramsByFaculty = (catalog?: AcademicCatalog) => {
  if (!catalog || !catalog.faculties) return {};
  return Object.fromEntries(
    catalog.faculties.map((faculty) => [
      faculty.name,
      (faculty.programs || []).map((p) => (typeof p === 'string' ? p : p.name))
    ])
  ) as Record<string, string[]>;
};
