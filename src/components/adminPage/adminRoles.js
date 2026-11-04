/* Backend rol kodlari: belgi rangi va tarjima kaliti. */
export const ROLE_META = {
    king: {label: 'King', color: 'indigo'},
    superadmin: {label: 'Super Admin', color: 'brand'},
    admin: {label: 'Admin', color: 'blue'},
    operator: {label: 'Operator', color: 'gray'},
};

/* Formada tanlanadigan rollar (avvalgi forma bilan bir xil) */
export const ROLE_OPTIONS = [
    {value: 'superadmin', label: 'Super Foydalanuvchi'},
    {value: 'admin', label: 'Foydalanuvchi'},
    {value: 'operator', label: 'Kuzatuvchi'},
];

export const roleMeta = (role) => ROLE_META[role] || {label: role || '—', color: 'gray'};
