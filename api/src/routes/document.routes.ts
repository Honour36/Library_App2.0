import { Router } from 'express';
import { deleteDocumentById, getDocumentById, getDocuments, updateDocument, uploadDocument } from '../controllers/document.controller';
import multer from 'multer';
import { protect } from '../middleware/auth';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/', getDocuments);
router.get('/:id', getDocumentById);
router.put('/:id', protect, updateDocument);
router.delete('/:id', protect, deleteDocumentById);

export default router;
