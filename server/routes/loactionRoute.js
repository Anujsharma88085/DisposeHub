import express from 'express';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import { saveLocation, getActiveLocations, deactivateLocation, getMyActiveLocation } from '../controllers/LocationController.js';

const router = express.Router();
router.use(protect)
router.post('/save', restrictTo('user'), saveLocation);
router.get('/my-active-location', restrictTo('user'), getMyActiveLocation);
router.get('/active-locations', restrictTo('driver'), getActiveLocations);
router.patch('/:id/deactivate', restrictTo('driver'), deactivateLocation);

export default router;
