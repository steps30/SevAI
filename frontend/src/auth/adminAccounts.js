const ADMIN_ACCOUNTS = [
  {
    adminId: "ADM-MAWS-01",
    email: "maws.admin@sevai.in",
    password: "1234",
    department: "MAWS - Water supply",
  },
  {
    adminId: "ADM-PWD-01",
    email: "pwd.admin@sevai.in",
    password: "1234",
    department: "PWD - Roads",
  },
  {
    adminId: "ADM-ENERGY-01",
    email: "energy.admin@sevai.in",
    password: "1234",
    department: "ENERGY - Electricity",
  },
  {
    adminId: "ADM-HEALTH-01",
    email: "health.admin@sevai.in",
    password: "1234",
    department: "HEALTH - Public health",
  },
  {
    adminId: "ADM-TRANS-01",
    email: "trans.admin@sevai.in",
    password: "1234",
    department: "TRANS - Transport",
  },
  {
    adminId: "ADM-ENVFOR-01",
    email: "envfor.admin@sevai.in",
    password: "1234",
    department: "ENVFOR - Environment",
  },
];

function findAdminAccountByEmail(email) {
  return ADMIN_ACCOUNTS.find((item) => item.email === email);
}

export { ADMIN_ACCOUNTS, findAdminAccountByEmail };