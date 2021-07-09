import * as functions from 'firebase-functions';
import * as express from 'express';
import * as cors from 'cors';
import {
  addEntry,
  getAllEntries,
  updateEntry,
  deleteEntry,
} from './entryController';

import {
  addEmployee,
  getAllEmployees,
  updateEmployee,
  deleteEmployee,
  getEmployeeById,
  allowEmployeeAccess,
  registerNewEmployeeAccount,
  createNewUser,
} from './employeesController';

const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'https://salary-checker.firebaseapp.com',
  'https://salary-checker.web.app',
  'https://my-salary-g9ah40brn-franruedaesq.vercel.app/',
  'https://my-salary-g9ah40brn-franruedaesq.vercel.app',
];
//options for cors midddleware
const options: cors.CorsOptions = {
  origin: allowedOrigins,
};

//use cors middleware
app.use(cors(options));

app.get('/', (req, res) => res.status(200).send('Hey there!'));
app.post('/entries', addEntry);
app.get('/entries', getAllEntries);
app.patch('/entries/:entryId', updateEntry);
app.delete('/entries/:entryId', deleteEntry);

app.post('/employees', addEmployee);
app.get('/employees', getAllEmployees);
app.get('/employees/:employeeId', getEmployeeById);
app.patch('/employees/:employeeId', updateEmployee);
app.delete('/employees/:employeeId', deleteEmployee);

app.get('/access', allowEmployeeAccess);
app.get('/register', registerNewEmployeeAccount);
app.get('/createUser', createNewUser);

exports.app = functions.https.onRequest(app);
