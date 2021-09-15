const sequelize = require('../db/db');
const {DataTypes} = require('sequelize');

const Student = sequelize.define('student', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, defaultValue: 'STUD' },
  status: { type: DataTypes.ENUM, values: ['active', 'no_active'], defaultValue: 'no_active' },
  adress: { type: DataTypes.STRING },
  material: { type: DataTypes.STRING },
  token: { type: DataTypes.STRING },
  tokenLife: { type: DataTypes.DATE }
});

const Diplom = sequelize.define('diplom', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  theme: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING },
  isFree: { type: DataTypes.BOOLEAN, values: [true, false], defaultValue: true }
});

const View = sequelize.define('view', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false }
});

const DipSupervisor = sequelize.define('dip_supervisor', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING },
  role: { type: DataTypes.STRING, defaultValue: 'DIP.RUC'},
  status: { type: DataTypes.ENUM, values: ['active', 'no_active'], defaultValue: 'no_active' },
  company: { type: DataTypes.STRING, allowNull: false },
  post: { type: DataTypes.STRING, allowNull: false },
  token: { type: DataTypes.STRING },
  tokenLife: { type: DataTypes.DATE }
});

const Group = sequelize.define('group', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  date_release: { type: DataTypes.INTEGER, allowNull: false },
  isRelease: { type: DataTypes.BOOLEAN, values: [true, false], defaultValue: false }
});

const ClassroomTeacher = sequelize.define('classroom_teacher', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  isGroup: { type: DataTypes.BOOLEAN, values: [true, false], defaultValue: false }
});

const Customer = sequelize.define('customer', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  isProcessed: { type: DataTypes.BOOLEAN, values: [true, false], defaultValue: false },
  isFree: { type: DataTypes.BOOLEAN, values: [true, false], defaultValue: true }
});

const Admin = sequelize.define('admin', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false},
  role: { type: DataTypes.STRING, defaultValue: 'ADMIN'},
  email: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING },
  token: { type: DataTypes.STRING },
  tokenLife: { type: DataTypes.DATE }
});

const Notice = sequelize.define('notice', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  text: { type: DataTypes.TEXT('medium'), allowNull: false }
});

const News = sequelize.define('new', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  text: { type: DataTypes.TEXT('long'), allowNull: false }
});

const RefreshToken = sequelize.define('refresh_token', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  idUser: { type: DataTypes.INTEGER },
  roleUser: { type: DataTypes.STRING },
  refreshToken: { type: DataTypes.STRING }
});

DipSupervisor.hasMany(Student);
Student.belongsTo(DipSupervisor);

ClassroomTeacher.hasOne(Group);
Group.belongsTo(ClassroomTeacher);

Diplom.hasOne(Student);
Student.belongsTo(Diplom);

View.hasMany(Diplom);
Diplom.belongsTo(View);

Customer.hasMany(Diplom);
Diplom.belongsTo(Customer);

Group.hasMany(Student);
Student.belongsTo(Group)

module.exports = {
  Student,
  Diplom,
  View,
  DipSupervisor,
  Group,
  ClassroomTeacher,
  Customer,
  Admin,
  Notice,
  News,
  RefreshToken
};