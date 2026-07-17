// Bracketed fields are explicit placeholders pending School Admin sign-off — see README.md.

const SCHOOL_NAME = "Pant Public School";

export const SCHOOL = {
  name: SCHOOL_NAME,
  shortName: "PPS",
  affiliation: "[Government affiliation status — to be confirmed by School Admin]",
  classes: "Nursery – Class 8",
  location: "Vidyadhar Nagar, Jaipur, Rajasthan",
  locationShort: "Vidyadhar Nagar, Jaipur",
  address: "[Full postal address — to be confirmed by School Admin]",
  email: "[Email address — to be confirmed by School Admin]",
  phone: "[Phone number — to be confirmed by School Admin]",
  principal: {
    name: "[Principal's Name]",
    title: `Principal, ${SCHOOL_NAME}`,
  },
  academicSession: "[Academic session — to be confirmed by School Admin]",
  motto: "[School motto — to be confirmed by School Admin]",
} as const;
