import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { deleteFile, uploadFile } from '../services/storage.service';
import logger from '../utils/logger';

export const uploadDocument = async (req: Request, res: Response) => {
  try {
    const { title, category_id, academic_year, description, user_id, author, department } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (!title || !category_id) {
      return res.status(400).json({ message: 'Missing document metadata' });
    }

    // 1. Upload to Supabase Storage
    const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${Date.now()}-${sanitizedOriginalName}`;
    const filePath = `documents/${fileName}`;
    
    const publicUrl = await uploadFile('documents', filePath, file.buffer, file.mimetype);

    // 2. Insert record into database
    const { data, error } = await supabase
      .from('documents')
      .insert([
        {
          title,
          category_id,
          academic_year,
          author,
          department,
          description,
          file_url: publicUrl,
          user_id,
          status: 'approved' // Set to approved immediately
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error: any) {
    logger.error('Document upload error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getDocuments = async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;
    
    let query = supabase
      .from('documents')
      .select('*, categories(name)')
      // Removed status filter to show everything immediately
      .order('created_at', { ascending: false });

    if (category && category !== 'all') {
      query = query.eq('categories.name', category);
    }

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.status(200).json(data);
  } catch (error: any) {
    logger.error('Error fetching documents:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getDocumentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('documents')
      .select('*, categories(name), users(full_name)')
      .eq('id', id)
      .single();

    if (error) throw error;
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, academic_year, author, department, category_id } = req.body;

    const { data: existingDoc, error: existingError } = await supabase
      .from('documents')
      .select('id, user_id')
      .eq('id', id)
      .single();

    if (existingError || !existingDoc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const currentUser = (req as any).user;
    if (currentUser?.role !== 'admin' && existingDoc.user_id !== currentUser?.sub) {
      return res.status(403).json({ message: 'You can only modify your own uploads' });
    }

    const updates = {
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(academic_year !== undefined ? { academic_year } : {}),
      ...(author !== undefined ? { author } : {}),
      ...(department !== undefined ? { department } : {}),
      ...(category_id !== undefined ? { category_id } : {}),
    };

    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', id)
      .select('*, categories(name), users(full_name)')
      .single();

    if (error) throw error;

    res.status(200).json(data);
  } catch (error: any) {
    logger.error('Document update error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteDocumentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data: existingDoc, error: existingError } = await supabase
      .from('documents')
      .select('id, user_id, file_url')
      .eq('id', id)
      .single();

    if (existingError || !existingDoc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const currentUser = (req as any).user;
    if (currentUser?.role !== 'admin' && existingDoc.user_id !== currentUser?.sub) {
      return res.status(403).json({ message: 'You can only delete your own uploads' });
    }

    const storagePath = getStoragePathFromPublicUrl(existingDoc.file_url);
    if (storagePath) {
      await deleteFile('documents', storagePath);
    }

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.status(200).json({ success: true });
  } catch (error: any) {
    logger.error('Document delete error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getStoragePathFromPublicUrl = (fileUrl?: string) => {
  if (!fileUrl) return null;

  try {
    const url = new URL(fileUrl);
    const marker = '/object/public/documents/';
    const markerIndex = url.pathname.indexOf(marker);
    if (markerIndex === -1) return null;
    return decodeURIComponent(url.pathname.slice(markerIndex + marker.length));
  } catch (error) {
    logger.warn('Unable to parse storage path from file URL');
    return null;
  }
};
