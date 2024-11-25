import { Router } from 'express';
const router = Router();
import  {getLeaderboard} from '../controller/leaderboard.Controller.js';

router.get('/leaderboard', getLeaderboard);

export default router;
