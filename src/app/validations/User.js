import * as Yup from 'yup';

const name = Yup.string().max(200, 'Your name can not exceed 200 characters!');
const email = Yup.string().max(
  100,
  'Your email can not exceed 100 characters!'
);
const password = Yup.string()
  .min(6, 'Your password must have at least 6 characters!')
  .max(25, 'Your password can not exceed 25 characters!');
const oldPassword = password;
const confirmPassword = password.when('password', (pass, field) =>
  pass
    ? field
        .required('Please confirm your password!')
        .oneOf([Yup.ref('password')], 'The new passwords do not match.')
    : field
);

export const storeSchema = Yup.object().shape({
  name: name.required('Name is required.'),
  email: email.required('Email is required.'),
  password: password.required('Password is required')
});

export const updateSchema = Yup.object().shape({
  name,
  email,
  oldPassword,
  password: password.when('oldPassword', (oldPass, field) =>
    oldPass ? field.required('New password is required!') : field
  ),
  confirmPassword
});
