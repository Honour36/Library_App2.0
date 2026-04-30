import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';
import logger from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, full_name, department, student_id, role } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const { data: user, error } = await supabase
      .from('users')
      .insert([
        { 
          email, 
          full_name, 
          department, 
          student_id,
          password_hash,
          role: role || 'student'
        }
      ])
      .select()
      .single();

    if (error) throw error;

    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    res.status(201).json({ user, token });
  } catch (error: any) {
    logger.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Missing email or password' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    res.status(200).json({ user, token });
  } catch (error: any) {
    logger.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};
