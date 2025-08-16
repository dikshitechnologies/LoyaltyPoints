// store.js
let companyCode = "";
let groupCode = "";

export const setCompanyCode = (code) => {
  companyCode = code;
};
export const setGroupCode = (code) => {
  groupCode = code;
};

export const getCompanyCode = () => {

  console.log("Current company code:", companyCode);
  return companyCode;
};

export const getGroupCode = () => {

  console.log("Current group code:", groupCode);
  return groupCode;
};
