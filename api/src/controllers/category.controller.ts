import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import logger from '../utils/logger';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;

    res.status(200).json(data);
  } catch (error: any) {
    logger.error('Error fetching categories:', error);
    res.status(500).json({ message: error.message });
  }
};
