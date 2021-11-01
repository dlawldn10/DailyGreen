const response = ({isSuccess, code, message}, result) => {
   return {
        isSuccess: isSuccess,
        code: code,
        message: message,
        result: result
   }
  };

const errResponse = ({isSuccess, code, message}) => {
    return {
        isSuccess: isSuccess,
        code: code,
        message: message
      }
};

const responseTwo = ({isSuccess, code, message}, result1, result2) => {
    return {
        isSuccess: isSuccess,
        code: code,
        message: message,
        result1: result1,
        result2: result2
    }
};

const responseThree = ({isSuccess, code, message}, result1, result2, result3) => {
    return {
        isSuccess: isSuccess,
        code: code,
        message: message,
        result1: result1,
        result2: result2,
        result3: result3
    }
};

const responseFour = ({isSuccess, code, message}, result1, result2, result3, result4) => {
    return {
        isSuccess: isSuccess,
        code: code,
        message: message,
        result1: result1,
        result2: result2,
        result3: result3,
        result4: result4
    }
};
  
module.exports = { response, errResponse, responseTwo, responseThree, responseFour };