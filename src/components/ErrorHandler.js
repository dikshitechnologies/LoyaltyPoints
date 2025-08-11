

export const handleStatusCodeError = (statusCode, message = "") => {
    let defaultMessage;
  
    switch (statusCode) {
      case 200:
        defaultMessage = "Success: Data fetched successfully.";
        alert(message || defaultMessage);
        break;
      case 400:
        defaultMessage = "Bad Request: The request was invalid.";
        alert(message || defaultMessage);
        break;
      case 401:
        defaultMessage = "Unauthorized: Invalid credentials.";
        alert(message || defaultMessage);
        break;
      case 404:
        defaultMessage = "Not Found: The resource does not exist.";
        alert(message || defaultMessage);
        break;
        case 409:
          defaultMessage = "Already exists in the Table.";
          alert(message || defaultMessage);
          break;
      case 500:
        defaultMessage = "Internal Server Error: Something went wrong on the server.";
        alert(message || defaultMessage);
        break;
      case 501:
        defaultMessage = "Not Implemented: The server does not support the functionality required.";
        alert(message || defaultMessage);
        break;
      default:
        defaultMessage = `Unhandled Status Code: ${statusCode}`;
        alert(message || defaultMessage);
    }
  };
  


  export  const isValidUrl = (url) => {
    try {
      new URL(url); 
      return true; 
    } catch (e) {
      return false; 
    }
  };

