import * as yup from "yup";

export const storeCoffeeTableBook = yup.object({
  firstName: yup.string().required("First name is required").max(150),
  lastName: yup.string().required("Last name is required").max(150),
  email: yup.string().email("Invalid email").required("Email is required").max(255),
  phone: yup.string().max(50).optional().nullable(),
  address: yup.string().optional().nullable(),
});

export const updateCoffeeTableBook = yup.object({
  firstName: yup.string().max(150).optional(),
  lastName: yup.string().max(150).optional(),
  email: yup.string().email("Invalid email").max(255).optional(),
  phone: yup.string().max(50).optional().nullable(),
  address: yup.string().optional().nullable(),
});
