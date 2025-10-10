export const bodyToUser = (body) => {
    const birth = new Date(body.birth);
  
    return {
      email: body.email,
      name: body.name,
      password: body.password,
      gender: body.gender,
      birth,
      address: body.address || "",
      detailAddress: body.detailAddress || "",
      phoneNumber: body.phoneNumber,
      preferences: body.preferences,
    };
  };

export const responseFromUser=({user, preferences}) => {
  const preferFoods = preferences.map(
    (preference) => preference.foodCategory.name
  );

  return {
    email: user.email,
    name: user.name,
    preferCategory: preferFoods,
  };
};