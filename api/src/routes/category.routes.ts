import { Router } from 'express';
import { getAcademicCatalog, getCategories } from '../controllers/category.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/academic', getAcademicCatalog);
router.get('/', protect, getCategories);

export default router;
