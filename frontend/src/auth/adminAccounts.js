/**
 * ⚠️ STRICT SYNC: The 'department' strings below are exact 1:1 copies 
 * of the categories defined in the backend AI (nlp.py). 
 * Do not alter these strings or the Admin Panel filters will fail.
 */

const ADMIN_ACCOUNTS = [
  {
    adminId: "ADM-MAYOR-00",
    email: "mayor@sevai.in",
    password: "1234",
    department: null, // SUPER ADMIN: Passing null bypasses the filter to show ALL tickets
  },
  {
    adminId: "ADM-PWD-01",
    email: "pwd.admin@sevai.in",
    password: "1234",
    department: "Highways and Public Works Department (Roads, Potholes, Infrastructure, Pavement)",
  },
  {
    adminId: "ADM-ENERGY-01",
    email: "energy.admin@sevai.in",
    password: "1234",
    department: "Energy Department TANGEDCO (Electricity, Broken Wires, Power Poles, Transformers)",
  },
  {
    adminId: "ADM-MAWS-01",
    email: "maws.admin@sevai.in",
    password: "1234",
    department: "Municipal Administration and Water Supply (Garbage, Dead Animals, Fallen Trees, Sewage)",
  },
  {
    adminId: "ADM-POLICE-01",
    email: "police.admin@sevai.in",
    password: "1234",
    department: "Home Prohibition and Traffic Police (Illegal Parking, Vandalism, Law Enforcement)",
  }
];

function findAdminAccountByEmail(email) {
  return ADMIN_ACCOUNTS.find((item) => item.email === email);
}

// Function to verify login (simulating a backend check)
function verifyAdminLogin(email, password) {
  const account = findAdminAccountByEmail(email);
  if (account && account.password === password) {
    return account;
  }
  return null;
}

export { ADMIN_ACCOUNTS, findAdminAccountByEmail, verifyAdminLogin };