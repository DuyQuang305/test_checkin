import UserInterface from '../../common/interface/user';

export default class Manager implements UserInterface {
  constructor(
    public firstName: string,
    public lastName: string,
    public phoneNumber: string,
    public email: string,
    public avartar: string,
    public password: string,
  ) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.phoneNumber = phoneNumber;
    this.email = email;
    this.avartar = avartar;
    this.password = password;
  }
}
