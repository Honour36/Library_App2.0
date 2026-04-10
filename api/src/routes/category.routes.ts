import { Router } from 'express';
import { getCategories } from '../controllers/category.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/', protect, getCategories);

export default router;
