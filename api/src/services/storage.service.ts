import { supabase } from '../config/supabase';
import logger from '../utils/logger';

export const uploadFile = async (bucketName: string, filePath: string, fileBuffer: Buffer, contentType: string) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: true
      });

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error: any) {
    logger.error('Storage upload error:', error);
    throw error;
  }
};

export const deleteFile = async (bucketName: string, filePath: string) => {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) throw error;
  } catch (error: any) {
    logger.error('Storage delete error:', error);
    throw error;
  }
};
