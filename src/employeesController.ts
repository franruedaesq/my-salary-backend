import { Response } from 'express';
import { db, auth } from './config/firebase';

type EmployeeType = {
  name: string;
  lastName: string;
  dni: string;
  salary: number;
  email: string;
  uid: string;
  rol: string;
  id: number;
};

type Request = {
  body: EmployeeType;
  params: { employeeId: string; employeeEmail: string };
  query: { uid: string; email: string };
};

const addEmployee = async (req: Request, res: Response) => {
  const { name, lastName, dni, salary, email, uid } = req.body;
  try {
    const entry = db.collection('employees').doc();
    const entryObject = {
      id: entry.id,
      name,
      lastName,
      dni,
      salary,
      email,
      uid: uid || '',
      rol: 'user',
    };

    entry.set(entryObject);

    res.status(200).send({
      status: 'Success',
      message: 'Employee added successfully',
      data: entryObject,
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

const getAllEmployees = async (req: Request, res: Response) => {
  try {
    const allEmployees: EmployeeType[] = [];
    const querySnapshot = await db.collection('employees').get();
    querySnapshot.forEach((doc: any) => allEmployees.push(doc.data()));
    return res.status(200).json(allEmployees);
  } catch (error) {
    return res.status(500).json(error);
  }
};

const getEmployeeById = async (req: Request, res: Response) => {
  const {
    params: { employeeId },
  } = req;
  try {
    const employee = db.collection('employees').doc(employeeId);
    const currentData = (await employee.get()).data() || {};
    return res.status(200).json(currentData);
  } catch (error) {
    return res.status(500).json(error);
  }
};

const updateEmployee = async (req: Request, res: Response) => {
  const {
    body: { name, lastName, dni, salary, email, uid, rol, id },
    params: { employeeId },
  } = req;

  try {
    const employee = db.collection('employees').doc(employeeId);
    const currentData = (await employee.get()).data() || {};
    const employeeObject = {
      name: name || currentData.name,
      lastName: lastName || currentData.lastName,
      dni: dni || currentData.dni,
      salary: salary || currentData.salary,
      email: email || currentData.email,
      uid: uid || currentData.uid,
      rol: rol || currentData.rol,
      id: id || currentData.id,
    };

    await employee.set(employeeObject).catch((error) => {
      return res.status(400).json({
        status: 'error',
        message: error.message,
      });
    });

    return res.status(200).json({
      status: 'success',
      message: 'entry updated successfully',
      data: employeeObject,
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};

const deleteEmployee = async (req: Request, res: Response) => {
  const { employeeId } = req.params;

  try {
    const employee = db.collection('employees').doc(employeeId);

    await employee.delete().catch((error) => {
      return res.status(400).json({
        status: 'error',
        message: error.message,
      });
    });

    return res.status(200).json({
      status: 'success',
      message: 'Employee deleted successfully',
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};

const allowEmployeeAccess = async (req: Request, res: Response) => {
  const { uid } = req.query;

  try {
    const employee = db.collection('employees');
    const querySnapshot = await employee.where('uid', '==', uid).get();
    const docs = querySnapshot.docs[0].data();
    const employeeRole = (await auth.getUser(uid)).customClaims;
    return res.status(200).json({ docs, employeeRole });
  } catch (error) {
    return res.status(500).json(error);
  }
};

// return employee id when given email
const createNewUser = async (req: Request, res: Response) => {
  const { email } = req.query;

  try {
    const employee = db.collection('employees');
    const querySnapshot = await employee.where('email', '==', email).get();
    const docs = querySnapshot.docs[0].data();
    const { id } = docs;

    return res.status(200).json(id);
  } catch (error) {
    return res
      .status(400)
      .send({ error: 'emailNotFound', message: 'Email not found in database' });
  }
};

const registerNewEmployeeAccount = async (req: Request, res: Response) => {
  const { uid } = req.query;
  try {
    const role = 'employee';
    auth.setCustomUserClaims(uid, { role });
    const employeeRole = (await auth.getUser(uid)).customClaims;
    const employeeEmail = (await auth.getUser(uid)).email;
    return res.status(200).json({ employeeRole, employeeEmail });
  } catch (error) {
    return res.status(500).json(error);
  }
};

export {
  addEmployee,
  getAllEmployees,
  updateEmployee,
  deleteEmployee,
  getEmployeeById,
  allowEmployeeAccess,
  registerNewEmployeeAccount,
  createNewUser,
};
