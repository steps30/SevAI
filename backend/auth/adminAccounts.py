# backend/auth/adminAccounts.py

"""
⚠️ STRICT SYNC: 
The 'department', 'email', and 'password' strings below are exact 1:1 copies 
of the React ADMIN_ACCOUNTS and the backend AI (nlp.py). 
"""

admin_accounts = [
    {
        "name": "City Mayor (Super Admin)",
        "adminId": "ADM-MAYOR-00",
        "email": "mayor@sevai.in",
        "password": "1234",
        "role": "main_admin",  # CRITICAL: This role bypasses the database filters
        "department": "All"
    },
    {
        "name": "PWD Director",
        "adminId": "ADM-PWD-01",
        "email": "pwd.admin@sevai.in",
        "password": "1234",
        "role": "dept_admin",
        "department": "Highways and Public Works Department (Roads, Potholes, Infrastructure, Pavement)"
    },
    {
        "name": "Energy Grid Supervisor",
        "adminId": "ADM-ENERGY-01",
        "email": "energy.admin@sevai.in",
        "password": "1234",
        "role": "dept_admin",
        "department": "Energy Department TANGEDCO (Electricity, Broken Wires, Power Poles, Transformers)"
    },
    {
        "name": "MAWS Commissioner",
        "adminId": "ADM-MAWS-01",
        "email": "maws.admin@sevai.in",
        "password": "1234",
        "role": "dept_admin",
        "department": "Municipal Administration and Water Supply (Garbage, Dead Animals, Fallen Trees, Sewage)"
    },
    {
        "name": "Traffic & Police Chief",
        "adminId": "ADM-POLICE-01",
        "email": "police.admin@sevai.in",
        "password": "1234",
        "role": "dept_admin",
        "department": "Home Prohibition and Traffic Police (Illegal Parking, Vandalism, Law Enforcement)"
    }
]