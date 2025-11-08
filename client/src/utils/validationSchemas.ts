import parsePhoneNumberFromString, { getCountryCallingCode } from "libphonenumber-js/core";
import metadata from "libphonenumber-js/metadata.full";
import * as Yup from "yup";

const fallbackCountry = {
    "code": "IN",
    "name": "India",
    "callingCode": "91",
};
// Visitor schema
export const visitorSchema = Yup.object().shape({
  firstName: Yup.string()
    .required("First Name is required")
    .test("no-whitespace", "First Name cannot be only whitespace", (value) =>
      value ? value.trim() !== "" : false
    ),
  lastName: Yup.string()
    .required("Last Name is required")
    .test("no-whitespace", "Last Name cannot be only whitespace", (value) =>
      value ? value.trim() !== "" : false
    ),
  phoneNumber: Yup.string().required("Mobile Number is required")
    .test(
      "no-whitespace-only",
      "Mobile Number cannot be only whitespace",
      (value) => !!value && value.trim() !== ""
    )
    .test(
      "no-inner-whitespace",
      "Mobile Number cannot contain spaces",
      (value) => !!value && !/\s/.test(value)
    )
    .test('is-valid-mobile', 'Invalid mobile number', function (value) {
      const country = this.parent.country || fallbackCountry;
      const callingCode = (country.callingCode || fallbackCountry.callingCode || '').replace(/\D/g, '');



      if (!value || !callingCode) return false;

      try {
        const cleanedValue = value.replace(/\D/g, '').replace(/^0+/, '');
        const fullNumber = `+${callingCode}${cleanedValue}`;

        const phoneNumber = parsePhoneNumberFromString(fullNumber, metadata);
        if (!phoneNumber || !phoneNumber.isValid()) return false;

        const type = phoneNumber.getType();
        return type === 'MOBILE' || type === 'FIXED_LINE_OR_MOBILE';
      } catch (e) {
        return false;
      }
    }),
  email: Yup.string().email('Please enter a valid email address').notRequired().nullable()
    .test(
      "no-whitespace-only",
      "email cannot be only whitespace",
      (value) => !!value && value.trim() !== ""
    )
    .test(
      'valid-or-empty',
      'Please enter a valid email address',
      (value) => {
        if (!value) return true; // allow empty
        return /^(?!.*\.\.)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value); // basic email format check
      }
    ),
  category: Yup.string().required("Category of Visitor is required"),
  otherCategory: Yup.string().nullable().when('category', {
    is: (val: string) => val === 'Other',
    then: (schema) => schema.required('Other Category is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
  referredBy: Yup.string().nullable().notRequired(),
  countryCode: Yup.string().required('Country Code is required'),
  // country: Yup.string().required('Country is required'),
});

export const userSchema = Yup.object().shape({
  firstName: Yup.string()
    .transform((value) => (value ? value.trim() : ""))
    .required("First Name is required")
    .test(
      "only-letters",
      "First Name can only contain letters",
      (value) => /^[A-Za-z]+$/.test(value || "")
    ),
  lastName: Yup.string().required("Last Name is required")
    .transform((value) => (value ? value.trim() : ""))
    .required("Last Name is required")
    .test(
      "only-letters",
      "Last Name can only contain letters",
      (value) => /^[A-Za-z]+$/.test(value || "")
    ),

  mobileNumber: Yup.string()
    .required("Mobile Number is required")
    .test(
      "not-empty",
      "Mobile Number cannot be only whitespace",
      (value) => !!value && value.trim() !== ""
    )
    .test(
      "no-inner-whitespace",
      "Mobile Number cannot contain spaces",
      (value) => !!value && !/\s/.test(value)
    )
    .test(
      "only-digits",
      "Mobile Number must contain only digits",
      (value) => !!value && /^\d+$/.test(value)
    )
    .when('country', ([country], schema) => {
      if (country === '+91') {
        return schema.matches(/^\d{10}$/, "Mobile Number must be exactly 10 digits");
      }

      return schema;
    })
    .test('is-valid-mobile', 'Invalid mobile number', function (value) {
      const country = this.parent.country || fallbackCountry;
      const callingCode = (country.callingCode || fallbackCountry.callingCode || '').replace(/\D/g, '');

      if (!value || !callingCode) return false;

      try {
        const cleanedValue = value.replace(/\D/g, '').replace(/^0+/, '');
        const fullNumber = `+${callingCode}${cleanedValue}`; 

        const phoneNumber = parsePhoneNumberFromString(fullNumber, metadata);
        if (!phoneNumber || !phoneNumber.isValid()) return false;

        const type = phoneNumber.getType();
        return type === 'MOBILE' || type === 'FIXED_LINE_OR_MOBILE';
      } catch (e) {
        return false;
      }
    }),


  email: Yup.string()
    .transform((value) => (value ? value.trim() : ''))
    .notRequired()
    .nullable()
    .test(
      "no-whitespace-only",
      "Email cannot be only whitespace",
      (value) => {
        if (!value) return true;
        return value.trim() !== "";
      }
    )
    .test(
      "valid-or-empty",
      "Please enter a valid email address",
      (value) => {
        if (!value) return true; // allow empty
        return /^(?!.*\.\.)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
      }
    ),
    
});

export const leadSchema = Yup.object().shape({
  firstName: Yup.string()
    .transform((value) => (value ? value.trim() : ""))
    .required("First Name is required")
    .test(
      "only-letters",
      "First Name can only contain letters",
      (value) => /^[A-Za-z]+$/.test(value || "")
    ),
  lastName: Yup.string()
    .transform((value) => (value ? value.trim() : ""))
    .required("Last Name is required")
    .test(
      "only-letters",
      "Last Name can only contain letters",
      (value) => /^[A-Za-z]+$/.test(value || "")
    ),
  mobileNumber: Yup.string()
    .transform((value) => (value ? value.replace(/\s+/g, "") : ""))
    .required("Mobile Number is required")
    .test("no-letters", "Mobile Number cannot contain letters", (value) =>
      /^[^a-zA-Z]*$/.test(value || "")
    )
    .test('is-valid-mobile', 'Invalid mobile number', function (value) {
      const rawCountry = this.parent.country || fallbackCountry;
      
      let callingCode = '';
      if (typeof rawCountry === 'string') {
        try {
          callingCode = getCountryCallingCode(rawCountry, metadata);
        } catch (e) {
          console.error('Could not derive calling code from string:', rawCountry);
        }
      } else if (typeof rawCountry === 'object') {
        if (rawCountry.callingCode) {
          callingCode = rawCountry.callingCode.replace(/\D/g, '');
        } else if (rawCountry.code) {
          try {
            callingCode = getCountryCallingCode(rawCountry.code, metadata);
          } catch (e) {
            console.error('Could not derive calling code for:', rawCountry.code);
          }
        }
      };

      if (!value || !callingCode) return false;

      try {
        const cleanedValue = value.replace(/\D/g, '').replace(/^0+/, '');
        const fullNumber = `+${callingCode}${cleanedValue}`;

        const phoneNumber = parsePhoneNumberFromString(fullNumber, metadata);
        if (!phoneNumber || !phoneNumber.isValid()) return false;

        const type = phoneNumber.getType();

        return type === 'MOBILE' || type === 'FIXED_LINE_OR_MOBILE';
      } catch (e) {
        return false;
      }
    }),

alternateMobileNumber: Yup.string()
  .transform((value) => {
    const trimmed = value?.trim();
    return trimmed === "" ? undefined : trimmed;
  })
  .notRequired()
  .test('is-valid-mobile', 'Invalid mobile number', function (value) {
    const rawCountry = this.parent.alternateCountry || fallbackCountry;
    let callingCode = '';

    if (typeof rawCountry === 'string') {
      try {
        callingCode = getCountryCallingCode(rawCountry, metadata);
      } catch (e) {
        console.error('Could not derive calling code from string:', rawCountry);
      }
    } else if (typeof rawCountry === 'object') {
      if (rawCountry.callingCode) {
        callingCode = rawCountry.callingCode.replace(/\D/g, '');
      } else if (rawCountry.code) {
        try {
          callingCode = getCountryCallingCode(rawCountry.code, metadata);
        } catch (e) {
          console.error('Could not derive calling code for:', rawCountry.code);
        }
      }
    };

    if (!value) return true;
    if (!callingCode) return false;

    try {
      const cleanedValue = value.replace(/\D/g, '').replace(/^0+/, '');
      const fullNumber = `+${callingCode}${cleanedValue}`;

      const phoneNumber = parsePhoneNumberFromString(fullNumber, metadata);
      if (!phoneNumber || !phoneNumber.isValid()) return false;

      const type = phoneNumber.getType();
      return type === 'MOBILE' || type === 'FIXED_LINE_OR_MOBILE';
    } catch (e) {
      return false;
    }
  })
  .test(
    "not-same-as-mobile",
    "Mobile Number and Additional Number cannot be the same",
    function (value) {
      const { mobileNumber } = this.parent;
      return !value || value !== mobileNumber;
    }
  ),

  email: Yup.string()
    .transform((value) => (value ? value.trim() : ''))
    .notRequired()
    .nullable()
    .test(
      "no-whitespace-only",
      "Email cannot be only whitespace",
      (value) => {
        if (!value) return true;
        return value.trim() !== "";
      }
    )
    .test(
      "valid-or-empty",
      "Please enter a valid email address",
      (value) => {
        if (!value) return true; // allow empty
        return /^(?!.*\.\.)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
      }
    ),
  referralType: Yup.string().notRequired(),
  referralName: Yup.string()
    .transform((value) => (value ? value.trim() : ""))
    .when("referralType", {
      is: (val: string) => val && val !== "unset",
      then: (schema) =>
        schema
          .required("Referral Name is required when Referral Type is selected")
          .test(
            "letters-and-spaces",
            "Referral Name can only contain letters",
            (value) => /^[A-Za-z]+( [A-Za-z]+)*$/.test(value || "")
          ),
      otherwise: (schema) => schema.notRequired(),
    }),

  referralMobileNumber: Yup.string()
    .transform((value) => {
      const trimmed = value?.trim();
      return trimmed === "" ? undefined : trimmed;
    })
    .when("referralType", {
      is: (val: string) => val && val !== "unset",
      then: (schema) =>
        schema
          .required("Referral Mobile Number is required when Referral Type is selected")
          .test(
            "no-letters",
            "Referral Mobile Number cannot contain letters",
            (value) => !value || /^[0-9]*$/.test(value)
          )
          .test('is-valid-mobile', 'Invalid mobile number', function (value) {
            const rawCountry = this.parent.referralCountry || fallbackCountry;

            let callingCode = '';

            if (typeof rawCountry === 'string') {
              try {
                callingCode = getCountryCallingCode(rawCountry, metadata);
              } catch (e) {
                console.error('Could not derive calling code from string:', rawCountry);
              }
            } else if (typeof rawCountry === 'object') {
              if (rawCountry.callingCode) {
                callingCode = rawCountry.callingCode.replace(/\D/g, '');
              } else if (rawCountry.code) {
                try {
                  callingCode = getCountryCallingCode(rawCountry.code, metadata);
                } catch (e) {
                  console.error('Could not derive calling code for:', rawCountry.code);
                }
              }
            }

            if (!value || !callingCode) return false;

            try {
              const cleanedValue = value.replace(/\D/g, '').replace(/^0+/, '');
              const fullNumber = `+${callingCode}${cleanedValue}`;

              const phoneNumber = parsePhoneNumberFromString(fullNumber, metadata);
              if (!phoneNumber || !phoneNumber.isValid()) return false;

              const type = phoneNumber.getType();
              return type === 'MOBILE' || type === 'FIXED_LINE_OR_MOBILE';
            } catch (e) {
              console.error("Phone number parse error:", e);
              return false;
            }
          }),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),

  referredBy: Yup.string().nullable().notRequired(),
  // countryCode: Yup.string().required('Country Code is required'),
  areaRequired: Yup.string()
    .notRequired()
    .test(
      "no-whitespace",
      "Required area cannot be only whitespace",
      (value) => {
        // Allow empty or undefined (because it's not required)
        if (!value) return true;
        // Reject if only whitespace
        return value.trim() !== "";
      }
    ),
  location: Yup.string()
    .transform((value) => (value ? value.trim() : ""))
    .notRequired()
    .test(
      "no-whitespace",
      "Location cannot be only whitespace",
      (value) => !value || value !== ""
    ),
  // .test(
  //   "only-letters-spaces",
  //   "Location can only contain letters and spaces",
  //   (value) => !value || /^[A-Za-zÀ-ÿ\s]+$/.test(value)
  // ),
  project: Yup.string()
    .required("Project Name is required")
    .test("no-whitespace", "Project Name cannot be only whitespace", (value) =>
      value ? value.trim() !== "" : false
    ),
  source: Yup.string()
    .required("Please select a source")
    .test("no-whitespace", "Source cannot be only whitespace", (value) =>
      value ? value.trim() !== "" : false
    ),
  subSource: Yup.string()
    .required("Please select a sub source")
    .test("no-whitespace", "Sub Source cannot be only whitespace", (value) =>
      value ? value.trim() !== "" : false
    ),
  // country: Yup.string().required('Country is required'),
});

export const channelSalesSchema = Yup.object().shape({
  firstName: Yup.string()
    .required("First Name is required")
    .test("no-whitespace", "First Name cannot be only whitespace", (value) =>
      value ? value.trim() !== "" : false
    ),
  lastName: Yup.string()
    .required("Last Name is required")
    .test("no-whitespace", "Last Name cannot be only whitespace", (value) =>
      value ? value.trim() !== "" : false
    ),
  email: Yup.string().email('Please enter a valid email address').notRequired().nullable()
    .test(
      "no-whitespace-only",
      "email cannot be only whitespace",
      (value) => !!value && value.trim() !== ""
    )
    .test(
      'valid-or-empty',
      'Please enter a valid email address',
      (value) => {
        if (!value) return true; // allow empty
        return /^(?!.*\.\.)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value); // basic email format check
      }
    ),
  address: Yup.string()
    .required("Address is required")
    .test("no-whitespace", "Address cannot be only whitespace", (value) =>
      value ? value.trim() !== "" : false
    ),
  type: Yup.string().notRequired(),
  validTill: Yup.string().when('channelRole', {
    is: 'Experienced, RERA Certified',
    then: (schema) =>
      schema
        .required('Valid date is required')
        .test(
          'is-future-date',
          'Valid date must be in the future',
          (value) => !value || new Date(value) >= new Date()
        ),
    otherwise: (schema) => schema.notRequired(),
  }),
  companyName: Yup.string().when('type', {
    is: (val: string) => val === 'Company',
    then: (schema) => schema.required('Company Name is required when registering as a company'),
    otherwise: (schema) => schema.notRequired(),
  }),
  channelRole: Yup.string().required("Channel Role is required"),
  mobileNumber: Yup.string().required("Mobile Number is required")
  .test("no-letters", "Mobile Number cannot contain letters", (value) =>
      /^[^a-zA-Z]*$/.test(value || "")
    )
    .test('is-valid-mobile', 'Invalid mobile number', function (value) {
      const rawCountry = this.parent.country || fallbackCountry;
      let callingCode = '';

      if (typeof rawCountry === 'string') {
        try {
          callingCode = getCountryCallingCode(rawCountry, metadata);
        } catch (e) {
          console.error('Could not derive calling code from string:', rawCountry);
        }
      } else if (typeof rawCountry === 'object') {
        if (rawCountry.callingCode) {
          callingCode = rawCountry.callingCode.replace(/\D/g, '');
        } else if (rawCountry.code) {
          try {
            callingCode = getCountryCallingCode(rawCountry.code, metadata);
          } catch (e) {
            console.error('Could not derive calling code for:', rawCountry.code);
          }
        }
      }

      if (!value) return true;
      if (!callingCode) return false;

      try {
        const cleanedValue = value.replace(/\D/g, '').replace(/^0+/, '');
        const fullNumber = `+${callingCode}${cleanedValue}`;

        const phoneNumber = parsePhoneNumberFromString(fullNumber, metadata);
        if (!phoneNumber || !phoneNumber.isValid()) return false;

        const type = phoneNumber.getType();
        return type === 'MOBILE' || type === 'FIXED_LINE_OR_MOBILE';
      } catch (e) {
        return false;
      }
    }),
});

export const projectDocumentsSchema = Yup.object().shape({
  reraNumber: Yup.string()
    .trim()
    .matches(/^(?!\s*$).+$/, 'RERA Number cannot be empty or whitespace')
    .required('RERA Number is required'),

  reraLink: Yup.string()
    .trim()
    .matches(/^(?!\s*$).+$/, 'RERA Link cannot be empty or whitespace')
    .url('Must be a valid URL')
    .required('RERA Link is required'),

  reraCertificate: Yup.mixed()
    .required('RERA Certificate is required'),
  // .test('fileType', 'Only PDF allowed', (value) =>
  //   value && value.type === 'application/pdf')
  // .test('fileSize', 'File too large (Max 1MB)', (value) =>
  //   value && value.size <= 1024 * 1024),

  reraQr: Yup.mixed()
    .required('RERA QR is required'),

  rajaChithi: Yup.mixed()
    .required('Raja Chithi is required'),

  titleClearanceDoc: Yup.mixed()
    .required('Title Clearance Document is required'),

  fireNoc: Yup.mixed()
    .required('Fire NOC is required'),

  environmentalClearance: Yup.mixed()
    .required('Environmental Clearance is required'),

  naNocDoc: Yup.mixed()
    .required('NA NOC Document is required'),

  brochure: Yup.mixed()
    .required('Brochure is required'),

  paymentPlanDetail: Yup.mixed()
    .required('Payment Plan Detail is required')

  // paymentPlan: Yup.mixed()
  //   .required('Payment Plan is required')
  //   .test('fileType', 'Only PDF allowed', (value) =>
  //     value && value.type === 'application/pdf')
  //   .test('fileSize', 'File too large (Max 1MB)', (value) =>
  //     value && value.size <= 1024 * 1024),


  // .test('fileType', 'Only PDF allowed', (value) =>
  //   value && value.type === 'application/pdf')
  // .test('fileSize', 'File too large (Max 1MB)', (value) =>
  //   value && value.size <= 1024 * 1024),
});

export const gstInSchema = Yup.object().shape({
  panNumber: Yup.string()
    .required('PAN Card Number is required')
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format (e.g., ABCDE1234F)')
    .test('no-spaces', 'PAN number cannot contain spaces', (value) => !/\s/.test(value)),

  gstNumber: Yup.string()
    .required('GSTIN Number is required')
    .matches(/^\d{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format')
    .test('no-spaces', 'GST number cannot contain spaces', (value) => !/\s/.test(value)),

  gstCertificate: Yup.mixed().required('GST Certificate is required'),
  panCardFile: Yup.mixed().required('PAN Card document is required')
  // panCard: Yup.mixed()
  //   .required('PAN Card document is required')
  //   .test('fileType', 'Only PDF allowed', (value) =>
  //     value && value.type === 'application/pdf')
  //   .test('fileSize', 'File too large (Max 1MB)', (value) =>
  //     value && value.size <= 1024 * 1024),

  // gstCertificate: Yup.mixed()
  //   .required('GST Certificate is required')
  //   .test('fileType', 'Only PDF allowed', (value) =>
  //     value && value.type === 'application/pdf')
  //   .test('fileSize', 'File too large (Max 5MB)', (value) =>
  //     value && value.size <= 5 * 1024 * 1024),
});

export const bankDetailsSchema = Yup.object().shape({
  bankName: Yup.string()
    .trim()
    .required('Bank Name is required')
    .matches(/^\S.*$/, 'No leading spaces allowed'),

  ifscCode: Yup.string()
    .trim()
    .required('IFSC Code is required')
    .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC Code'),

  bankAccountNumber: Yup.string()
    .trim()
    .required('Bank Account Number is required')
    .matches(/^\d{1,18}$/, 'Bank Account Number must be numeric and up to 18 digits'),

  branchName: Yup.string()
    .trim()
    .required('Branch Name is required')
    .matches(/^\S.*$/, 'No leading spaces allowed'),

  approvedBanks: Yup.array()
    .min(1, 'Please select at least one bank')
    .required('Approved Banks is required'),

  loanOffers: Yup.string()
    .trim()
    .required('Loan Offers is required')
    .matches(/^\S.*$/, 'No leading spaces allowed'),

  isPreApproved: Yup.boolean(), // optional checkbox
});

export const seoSchema = Yup.object().shape({
  seoPageTitle: Yup.string()
    .required('SEO Page Title is required')
    .trim('Whitespace is not allowed')
    .min(3, 'Title must be at least 3 characters')
    .max(60, 'Title cannot exceed 60 characters'),

  seoPageDescription: Yup.string()
    .required('SEO Page Description is required')
    .trim('Whitespace is not allowed')
    .min(10, 'Description must be at least 10 characters')
    .max(160, 'Description cannot exceed 160 characters'),

  seoPageKeywords: Yup.string()
    .required('SEO Page Keywords is required')
    .trim('Whitespace is not allowed')
    .min(3, 'Keywords must be at least 3 characters')
    .max(100, 'Keywords cannot exceed 100 characters'),
});

const mobileRegex = /^\d{10}$/;
const nameRegex = /^[A-Za-z\s]+$/;

export const leadFormSchema = Yup.object().shape({
  storeName: Yup.string()
    .trim()
    .required('Store Name is required')
    .notOneOf(['unset'], 'Please select a valid Store Name'),

  firstName: Yup.string()
    .trim()
    .required('First Name is required')
    .matches(nameRegex, 'First Name can only contain letters')
    .test('not-empty', 'First Name cannot be empty', val => !!val?.trim()),

  lastName: Yup.string()
    .trim()
    .required('Last Name is required')
    .matches(nameRegex, 'Last Name can only contain letters')
    .test('not-empty', 'Last Name cannot be empty', val => !!val?.trim()),

  mobileNumber: Yup.string()
    .trim()
    .required('Mobile Number is required')
    .test("no-letters", "Mobile Number cannot contain letters", (value) =>
      /^[^a-zA-Z]*$/.test(value || "")
    )
    .test('is-valid-mobile', 'Invalid mobile number', function (value) {
      const rawCountry = this.parent.country || fallbackCountry;  
          // Derive calling code
          let callingCode = '';
          if (rawCountry && typeof rawCountry === 'object') {
            if (rawCountry.callingCode) {
              callingCode = rawCountry.callingCode.replace(/\D/g, '');
            } else if (rawCountry.code) {
              try {
                callingCode = getCountryCallingCode(rawCountry.code, metadata);
              } catch (e) {
                console.error('Could not derive calling code from country code:', rawCountry.code);
              }
            }
          } else if (typeof rawCountry === 'string') {
            try {
              callingCode = getCountryCallingCode(rawCountry, metadata);
            } catch (e) {
              console.error('Could not derive calling code from string country:', rawCountry);
            }
          }

      if (!value || !callingCode) return false;

      try {
        const cleanedValue = value.replace(/\D/g, '').replace(/^0+/, '');
        const fullNumber = `+${callingCode}${cleanedValue}`;

        const phoneNumber = parsePhoneNumberFromString(fullNumber, metadata);
        if (!phoneNumber || !phoneNumber.isValid()) return false;

        const type = phoneNumber.getType();
        return type === 'MOBILE' || type === 'FIXED_LINE_OR_MOBILE';
      } catch (e) {
        console.error('Parsing error:', e);
        return false;
      }
    }),

  email: Yup.string()
    .transform((value) => (value === '' ? null : value)) // convert "" to null
    .nullable()
    .email('Invalid email format'),

  source: Yup.string()
    .trim()
    .required('Source is required')
    .notOneOf(['unset'], 'Please select a valid Source'),

  subSource: Yup.string()
    .trim()
    .required('Sub Source is required')
    .notOneOf(['unset'], 'Please select a valid Sub Source'),

  category: Yup.string().trim().required('Product Category is required').notOneOf(['unset'], 'Please select a valid Product Category'),
  subCategory: Yup.string().trim().required('Product Sub Category is required').notOneOf(['unset'], 'Please select a valid Product Sub Category'),

  clientRemarks: Yup.string().trim().nullable(),

  referralType: Yup.string()
    .transform((value) => (value === '' || value === 'unset' ? null : value))
    .nullable()
    .notRequired(),

  referralName: Yup.string().when('referralType', {
    is: (val: string | null) => !!val && val !== 'unset',
    then: (schema) =>
      schema
        .transform((val) => (val === '' ? null : val))
        .trim()
        .required('Referral Name is required')
        .test('not-empty', 'Referral Name cannot be empty', val => !!val?.trim()),
    otherwise: (schema) => schema.nullable(),
  }),
  referralCountry: Yup.mixed()  // allow object or nullable
    .nullable(),

  referralMobileNumber: Yup.string().when(['referralType', 'referralCountry'], {
    is: (referralType, referralCountry) => {
      return !!referralType && referralType !== 'unset' && !!referralCountry;
    },
    then: (schema) =>
      schema
        .required('Referral Mobile Number is required when Referral Type is selected')
        .test(
          "no-letters",
          "Referral Mobile Number cannot contain letters",
          (value) => !value || /^[0-9]*$/.test(value)
        )
        .test('is-valid-mobile', 'Invalid mobile number', function (value) {
          const rawCountry = this.parent.referralCountry || fallbackCountry;

          // Derive calling code
          let callingCode = '';
          if (rawCountry && typeof rawCountry === 'object') {
            if (rawCountry.callingCode) {
              callingCode = rawCountry.callingCode.replace(/\D/g, '');
            } else if (rawCountry.code) {
              try {
                callingCode = getCountryCallingCode(rawCountry.code, metadata);
              } catch (e) {
                console.error('Could not derive calling code from country code:', rawCountry.code);
              }
            }
          } else if (typeof rawCountry === 'string') {
            try {
              callingCode = getCountryCallingCode(rawCountry, metadata);
            } catch (e) {
              console.error('Could not derive calling code from string country:', rawCountry);
            }
          }

          if (!value || !callingCode) {
            return this.createError({ message: 'Invalid country or number' });
          }

          try {
            const cleanedValue = value.replace(/\D/g, '').replace(/^0+/, '');
            const fullNumber = `+${callingCode}${cleanedValue}`;

            const phoneNumber = parsePhoneNumberFromString(fullNumber, metadata);
            if (!phoneNumber || !phoneNumber.isValid()) {
              return false;
            }

            const type = phoneNumber.getType();
            return type === 'MOBILE' || type === 'FIXED_LINE_OR_MOBILE';
          } catch (e) {
            console.error('Phone validation error:', e);
            return false;
          }
        }),
    otherwise: (schema) => schema.notRequired().nullable(),
  }),
  referralId: Yup.string().trim().nullable(),

  priority: Yup.string().trim().nullable(),
  budget: Yup.string().trim().nullable(),
  projectType: Yup.string().trim().nullable(),

  buyingTime: Yup.string()
    .trim()
    .nullable(),

  finance: Yup.string().trim().nullable(),
  DOB: Yup.string().nullable(),
  location: Yup.string().trim().nullable(),
  companyName: Yup.string().trim().nullable(),
  quantity: Yup.string().trim().nullable(),
  projectTimeline: Yup.string().trim().nullable()
});

const parseLocalDateTime = (value: string) => {
  const [date, time] = value.split("T");
  return new Date(`${date}T${time}`);
};

export const eventFormSchema = Yup.object().shape({
  title: Yup.string()
    .transform((value) => (value ? value.trim() : ""))
    .required("Title is required"),

  category: Yup.string()
    .transform((value) => (value ? value.trim() : ""))
    .required("Category is required"),

  type: Yup.string()
    .transform((value) => (value ? value.trim() : ""))
    .required("Type is required"),

  description: Yup.string()
    .transform((value) => (value ? value.trim() : ""))
    .required("Description is required"),

  venue: Yup.string()
    .transform((value) => (value ? value.trim() : ""))
    .required("Venue is required"),

  eventStart: Yup.string()
    .required("Start date is required"),

  eventEnd: Yup.string()
    .required("End date is required")
    .test("is-after-start", "End Date must be after Start Date", function (value) {
      const { eventStart } = this.parent;
      if (!value || !eventStart) return true;
      const start = parseLocalDateTime(eventStart);
      const end = parseLocalDateTime(value);
      return end > start;
    }),

  registrationLimit: Yup.number()
    .typeError("Registration limit must be a number")
    .required("Registration limit is required")
    .moreThan(0, "Registration limit must be greater than 0"),

  image: Yup.mixed()
    .nullable(), // Optional
});

export const InstituteLeadSchema = Yup.object().shape({
  firstName: Yup.string()
    .transform((value) => (value ? value.trim() : ""))
    .required("First Name is required")
    .test(
      "only-letters",
      "First Name can only contain letters",
      (value) => /^[A-Za-z]+$/.test(value || "")
    ),
  lastName: Yup.string()
    .transform((value) => (value ? value.trim() : ""))
    .required("Last Name is required")
    .test(
      "only-letters",
      "Last Name can only contain letters",
      (value) => /^[A-Za-z]+$/.test(value || "")
    ),
  mobileNumber: Yup.string()
    .transform((value) => (value ? value.replace(/\s+/g, "") : ""))
    .required("Mobile Number is required")
    .test("no-letters", "Mobile Number cannot contain letters", (value) =>
      /^[^a-zA-Z]*$/.test(value || "")
    )
    .test('is-valid-mobile', 'Invalid mobile number', function (value) {
      const rawCountry = this.parent.country || fallbackCountry;

      let callingCode = '';
      if (typeof rawCountry === 'string') {
        try {
          callingCode = getCountryCallingCode(rawCountry, metadata);
        } catch (e) {
          console.error('Could not derive calling code from string:', rawCountry);
        }
      } else if (typeof rawCountry === 'object') {
        if (rawCountry.callingCode) {
          callingCode = rawCountry.callingCode.replace(/\D/g, '');
        } else if (rawCountry.code) {
          try {
            callingCode = getCountryCallingCode(rawCountry.code, metadata);
          } catch (e) {
            console.error('Could not derive calling code for:', rawCountry.code);
          }
        }
      };

      if (!value || !callingCode) return false;

      try {
        const cleanedValue = value.replace(/\D/g, '').replace(/^0+/, '');
        const fullNumber = `+${callingCode}${cleanedValue}`;

        const phoneNumber = parsePhoneNumberFromString(fullNumber, metadata);
        if (!phoneNumber || !phoneNumber.isValid()) return false;

        const type = phoneNumber.getType();

        return type === 'MOBILE' || type === 'FIXED_LINE_OR_MOBILE';
      } catch (e) {
        return false;
      }
    }),

  email: Yup.string()
    .transform((value) => (value ? value.trim() : ''))
    .required("Email is required")
    .test(
      "no-whitespace-only",
      "Email cannot be only whitespace",
      (value) => {
        if (!value) return true;
        return value.trim() !== "";
      }
    )
    .test(
      "valid-or-empty",
      "Please enter a valid email address",
      (value) => {
        if (!value) return true; // allow empty
        return /^(?!.*\.\.)[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
      }
    ),
  referralType: Yup.string().notRequired(),
  referralName: Yup.string()
    .transform((value) => (value ? value.trim() : ""))
    .when("referralType", {
      is: (val: string) => val && val !== "unset",
      then: (schema) =>
        schema
          .required("Referral Name is required when Referral Type is selected")
          .test(
            "letters-and-spaces",
            "Referral Name can only contain letters",
            (value) => /^[A-Za-z]+( [A-Za-z]+)*$/.test(value || "")
          ),
      otherwise: (schema) => schema.notRequired(),
    }),

  referralMobileNumber: Yup.string()
    .transform((value) => {
      const trimmed = value?.trim();
      return trimmed === "" ? undefined : trimmed;
    })
    .when("referralType", {
      is: (val: string) => val && val !== "unset",
      then: (schema) =>
        schema
          .required("Referral Mobile Number is required when Referral Type is selected")
          .test(
            "no-letters",
            "Referral Mobile Number cannot contain letters",
            (value) => !value || /^[0-9]*$/.test(value)
          )
          .test('is-valid-mobile', 'Invalid mobile number', function (value) {
            const rawCountry = this.parent.referralCountry || fallbackCountry;

            let callingCode = '';

            if (typeof rawCountry === 'string') {
              try {
                callingCode = getCountryCallingCode(rawCountry, metadata);
              } catch (e) {
                console.error('Could not derive calling code from string:', rawCountry);
              }
            } else if (typeof rawCountry === 'object') {
              if (rawCountry.callingCode) {
                callingCode = rawCountry.callingCode.replace(/\D/g, '');
              } else if (rawCountry.code) {
                try {
                  callingCode = getCountryCallingCode(rawCountry.code, metadata);
                } catch (e) {
                  console.error('Could not derive calling code for:', rawCountry.code);
                }
              }
            }

            if (!value || !callingCode) return false;

            try {
              const cleanedValue = value.replace(/\D/g, '').replace(/^0+/, '');
              const fullNumber = `+${callingCode}${cleanedValue}`;

              const phoneNumber = parsePhoneNumberFromString(fullNumber, metadata);
              if (!phoneNumber || !phoneNumber.isValid()) return false;

              const type = phoneNumber.getType();
              return type === 'MOBILE' || type === 'FIXED_LINE_OR_MOBILE';
            } catch (e) {
              console.error("Phone number parse error:", e);
              return false;
            }
          }),
      otherwise: (schema) => schema.notRequired().nullable(),
    }),

  referredBy: Yup.string().nullable().notRequired(),

  yearofExperience: Yup.string()
    .transform((value) => (value ? value.trim() : ""))
    .notRequired()
    .test("not-only-whitespace", "Year of experience cannot be only whitespace", (value) => {
      return !value || value !== "";
    }),

  city: Yup.string()
    .transform((value) => (value ? value.trim() : ""))
    .notRequired()
    .test(
      "no-whitespace",
      "City cannot be only whitespace",
      (value) => !value || value !== ""
    ),
  batch: Yup.string()
    .required("Batch is required")
    .test("no-whitespace", "Batch cannot be only whitespace", (value) =>
      value ? value.trim() !== "" : false
    ),
  source: Yup.string()
    .required("Please select a source")
    .test("no-whitespace", "Source cannot be only whitespace", (value) =>
      value ? value.trim() !== "" : false
    ),
  subSource: Yup.string()
    .required("Please select a sub source")
    .test("no-whitespace", "Sub Source cannot be only whitespace", (value) =>
      value ? value.trim() !== "" : false
    ),
  interestedIn: Yup.string()
    .transform((value) => (value ? value.trim() : ""))
    .notRequired()
    .test(
      "no-whitespace",
      "Interested cannot be only whitespace",
      (value) => !value || value !== ""
    ),
  paymentMode: Yup.string()
    .transform((value) => (value ? value.trim() : ""))
    .notRequired()
    .test(
      "no-whitespace",
      "Payment Mode cannot be only whitespace",
      (value) => !value || value !== ""
    ),
  transactionId: Yup.string()
    .transform((value) => (value ? value.trim() : ""))
    .notRequired()
    .test(
      "no-whitespace",
      "Transaction cannot be only whitespace",
      (value) => !value || value !== ""
    ),
  paymentAmount: Yup.string()
    .transform((value) => (value ? value.trim() : ""))
    .notRequired()
    .test(
      "no-whitespace",
      "Payment Amount cannot be only whitespace",
      (value) => !value || value !== ""
    ),
  paymentDate: Yup.string()
    .transform((value) => (value ? value.trim() : ""))
    .notRequired()
    .test(
      "no-whitespace",
      "Payment Date cannot be only whitespace",
      (value) => !value || value !== ""
    ),
  // country: Yup.string().required('Country is required'),
});


