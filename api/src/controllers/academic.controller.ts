import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import logger from '../utils/logger';

export const getFaculties = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('faculties')
      .select('*')
      .order('name');

    if (error) throw error;
    res.status(200).json(data);
  } catch (error: any) {
    logger.error('Error fetching faculties:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getProgramsByFaculty = async (req: Request, res: Response) => {
  try {
    const { facultyId } = req.params;
    const { data, error } = await supabase
      .from('programs')
      .select('*')
      .eq('faculty_id', facultyId)
      .order('name');

    if (error) throw error;
    res.status(200).json(data);
  } catch (error: any) {
    logger.error('Error fetching programs:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getModulesByProgram = async (req: Request, res: Response) => {
  try {
    const { programId } = req.params;
    const { data, error } = await supabase
      .from('program_modules')
      .select('modules(*)')
      .eq('program_id', programId);

    if (error) throw error;
    
    // Flatten the result
    const modules = data.map((item: any) => item.modules);
    res.status(200).json(modules);
  } catch (error: any) {
    logger.error('Error fetching modules:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getAcademicCatalog = async (req: Request, res: Response) => {
  try {
    // This returns a structured object similar to the old hardcoded one but dynamic
    const { data: faculties, error: fError } = await supabase
      .from('faculties')
      .select('id, name');

    if (fError) throw fError;

    const catalog = await Promise.all(faculties.map(async (faculty) => {
      const { data: programs } = await supabase
        .from('programs')
        .select('id, name, level')
        .eq('faculty_id', faculty.id);
      
      return {
        ...faculty,
        programs: programs || []
      };
    }));

    res.status(200).json({
      faculties: catalog,
      years: ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Postgrad']
    });
  } catch (error: any) {
    logger.error('Error fetching academic catalog:', error);
    res.status(500).json({ message: error.message });
  }
};
