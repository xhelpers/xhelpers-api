type UserSso = {
  email: any;
  name: any;
  avatar: any;
  token: string;
  userType: any;
  meta: any;
};

export const authUser = async (callback: any, user: UserSso, h: any) => {
  const { url } = await callback(user);
  const response = h.redirect(url);
  return response;
};
