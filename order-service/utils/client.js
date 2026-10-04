const axios = require('axios');

const getUserServiceUrl = () => process.env.USER_SERVICE_URL || 'http://localhost:3001';
const getProductServiceUrl = () => process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';

/**
 * Fetch User by ID from User Service over HTTP
 */
async function fetchUser(userId) {
  const baseUrl = getUserServiceUrl();
  const url = `${baseUrl}/users/${userId}`;
  try {
    const response = await axios.get(url, { timeout: 3000 });
    return { success: true, data: response.data };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return { success: false, status: 404, message: `User with ID '${userId}' not found in User Service` };
    }
    return {
      success: false,
      status: 503,
      message: `User Service unavailable at ${baseUrl}. Details: ${error.message}`
    };
  }
}

/**
 * Fetch Product by ID from Product Service over HTTP
 */
async function fetchProduct(productId) {
  const baseUrl = getProductServiceUrl();
  const url = `${baseUrl}/products/${productId}`;
  try {
    const response = await axios.get(url, { timeout: 3000 });
    return { success: true, data: response.data };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return { success: false, status: 404, message: `Product with ID '${productId}' not found in Product Service` };
    }
    return {
      success: false,
      status: 503,
      message: `Product Service unavailable at ${baseUrl}. Details: ${error.message}`
    };
  }
}

module.exports = {
  fetchUser,
  fetchProduct
};
