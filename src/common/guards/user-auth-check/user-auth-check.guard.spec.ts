import { UserAuthCheckGuard } from './user-auth-check.guard';

describe('UserAuthCheckGuard', () => {
  it('should be defined', () => {
    expect(new UserAuthCheckGuard()).toBeDefined();
  });
});
