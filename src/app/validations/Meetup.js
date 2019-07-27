import * as Yup from 'yup';

const title = Yup.string().max(55, 'Title can not exceed 55 characters.');
const description = Yup.string().max(
  650,
  'Description must have a maximum of 650 characters.'
);
const location = Yup.string().max(
  150,
  'Location can not exceed 150 characters!'
);
const date = Yup.date('Invalid date!');
const banner_id = Yup.number();
const subscribers = Yup.array(
  Yup.number('Subscribers must be an array of IDs!')
);

export const storeSchema = Yup.object().shape({
  title: title.required('Title can not be empty!'),
  description: description.required('Description can not be empty!'),
  location: location.required('Location can not be empty!'),
  date: date.required('Date can not be empty.'),
  banner_id: banner_id.required('You must set a banner for the meetup!')
});

export const updateSchema = Yup.object().shape({
  title: title.required('Title can not be empty!'),
  description: description.required('Description can not be empty!'),
  location: location.required('Location can not be empty!'),
  date: date.required('Date can not be empty.'),
  banner_id: banner_id.required('You must set a banner for the meetup!'),
  subscribers
});
