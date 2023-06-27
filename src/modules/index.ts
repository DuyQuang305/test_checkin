import authRouter from './auth/router';
import homeRouter from './home/router';
import profileRouter from './profile/router';
import attendanceRouter from './attendance/router';
import statisticRouter from './statistic/router';

export default class Module {
  protected app: any;
  constructor(app: any) {
    this.app = app;
  }

  async main() {
    await this.app.use('/auth', authRouter);
    await this.app.use('/profile', profileRouter);
    await this.app.use('/attendance', attendanceRouter);
    await this.app.use('/statistic', statisticRouter);
    await this.app.use('/', homeRouter);
  }
}
