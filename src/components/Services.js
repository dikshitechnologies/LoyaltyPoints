
import { getCompanyCode }  from "../store";
const BASE_URL = "https://dikshi.ddns.net/loyaltypoints/API/";

const fcomCode = getCompanyCode();
export { BASE_URL, fcomCode };