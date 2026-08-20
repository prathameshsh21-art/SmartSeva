export const isEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isPhone = (phone) => {
  return /^[6-9]\d{9}$/.test(phone);
};

export const isRequired = (value) => {
  return value !== null && value !== undefined && value.toString().trim() !== '';
};

export const minLength = (value, length) => {
  return value && value.length >= length;
};