import { Router } from 'express';
import { 
  getFaculties, 
  getProgramsByFaculty, 
  getModulesByProgram,
  getAcademicCatalog 
} from '../controllers/academic.controller';

const router = Router();

router.get('/faculties', getFaculties);
router.get('/faculties/:facultyId/programs', getProgramsByFaculty);
router.get('/programs/:programId/modules', getModulesByProgram);
router.get('/catalog', getAcademicCatalog);

export default router;
