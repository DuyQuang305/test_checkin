import authRouter from './auth/router';
import homeRouter from './home/router';
import profileRouter from './profile/router';
import attendanceRouter from './attendance/router';
import statisticRouter from './statistic/router';
import roomRouter from './room/router';
import timeRouter from './time/router';

import errorHandler from '../middlewares/errorHandler';


export default class Module {
  protected app: any;
  constructor(app: any) {
    this.app = app;
  }

  async main() {
    await this.app.use('/auth', authRouter);
    await this.app.use('/profile', profileRouter);
    await this.app.use('/attendance', attendanceRouter);
    await this.app.use('/room', roomRouter);
    await this.app.use('/statistic', statisticRouter);
    await this.app.use('/time', timeRouter);
    await this.app.use('/', homeRouter);

    await this.app.use(errorHandler)
  }
}
