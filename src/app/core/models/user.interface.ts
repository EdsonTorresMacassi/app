export interface User {
  userId: string;
  username: string;
  roles: string[];
  permissions: string[];
  person: {
    firstName: string;
    lastName: string;
    secondLastName?: string;
    email: string;
    phone?: string;
  };
}
