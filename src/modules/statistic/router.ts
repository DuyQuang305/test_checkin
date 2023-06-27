import express from 'express';

import StatisticController from './controller';

import { jwtGuard } from '../../middlewares/jwtGuard';
import roleGuard from '../../middlewares/roleGuard';

const router = express.Router();
const statisticController = new StatisticController();

router.get('/paginate', jwtGuard, roleGuard, statisticController.paginate);

router.get('/find-by-day', jwtGuard, roleGuard, statisticController.findByDay);
router.get(
  '/find-by-user',
  jwtGuard,
  roleGuard,
  statisticController.findByUser,
);

router.get('/:id', jwtGuard, roleGuard, statisticController.getOneById);
router.get('/', jwtGuard, roleGuard, statisticController.getAll);

router.delete(
  '/delete-all',
  jwtGuard,
  roleGuard,
  statisticController.deleteAll,
);
router.delete('/:id', jwtGuard, roleGuard, statisticController.delete);

export default router;
