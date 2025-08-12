// store.js
let companyCode = "";

export const setCompanyCode = (code) => {
  companyCode = code;
};

export const getCompanyCode = () => {

  console.log("Current company code:", companyCode);
  return companyCode;
};
