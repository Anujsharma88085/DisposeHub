import express from 'express';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import { saveLocation, cancelLocation, getActiveLocations, deactivateLocation, getMyActiveLocation } from '../controllers/LocationController.js';
const router = express.Router();
router.use(protect)
router.post('/save', restrictTo('user'), saveLocation);
router.patch('/:id/cancel', restrictTo('user'), cancelLocation)
router.get('/my-active-location', restrictTo('user'), getMyActiveLocation);
router.get('/active-locations', restrictTo('driver'), getActiveLocations);
router.patch('/:id/deactivate', restrictTo('user', 'driver'), deactivateLocation);

export default router;
