const NAME_RE = /^[\p{L}\s'-]+$/u;

function normalizeName(value: string | null | undefined) {
  return (value ?? "").trim();
}

function emailHasValidDomain(domain: string) {
  if (!domain || domain.includes("..")) return false;
  const labels = domain.split(".");
  if (labels.length < 2) return false;
  const tld = labels[labels.length - 1];
  if (!tld || tld.length < 2 || !/^[A-Za-z]+$/.test(tld)) return false;

  return labels.every((label) => {
    if (!label || label.length > 63) return false;
    if (label.startsWith("-") || label.endsWith("-")) return false;
    return /^[A-Za-z0-9-]+$/.test(label);
  });
}

function isValidEmailSyntax(value: string) {
  if (!value || value.includes(" ")) return false;
  const parts = value.split("@");
  if (parts.length !== 2) return false;

  const [localPart, domain] = parts;
  if (!localPart || !domain) return false;
  if (localPart.startsWith(".") || localPart.endsWith(".") || localPart.includes("..")) return false;
  if (!/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(localPart)) return false;

  return emailHasValidDomain(domain);
}

export function validateFirstName(value: string | null | undefined) {
  const firstName = normalizeName(value);
  if (!firstName) return "First name is required";
  if (firstName.length < 2) return "First name must contain at least 2 characters";
  if (!NAME_RE.test(firstName)) return "Enter a valid first name";
  return null;
}

export function validateLastName(value: string | null | undefined) {
  const lastName = normalizeName(value);
  if (!lastName) return "Last name is required";
  if (lastName.length < 2) return "Last name must contain at least 2 characters";
  if (!NAME_RE.test(lastName)) return "Enter a valid last name";
  return null;
}

export function validateEmail(value: string | null | undefined) {
  const email = (value ?? "").trim().toLowerCase();
  if (!email) return "Email is required";
  if (!isValidEmailSyntax(email)) return "Enter a valid email address";
  return null;
}

export function validatePassword(
  value: string | null | undefined,
  {
    firstName,
    lastName,
    email,
  }: {
    firstName: string;
    lastName: string;
    email: string;
  },
) {
  const password = value ?? "";
  if (!password || password.length === 0 || password.trim().length === 0) {
    return "Password is required";
  }
  if (password.length < 8) return "Password must contain at least 8 characters";
  if (!/[A-Z]/.test(password)) return "Add at least one uppercase letter";
  if (!/[a-z]/.test(password)) return "Add at least one lowercase letter";
  if (!/[0-9]/.test(password)) return "Add at least one number";
  if (!/[^A-Za-z0-9]/.test(password)) return "Add at least one special character";

  const normalizedPassword = password.toLowerCase();
  const checks = [firstName, lastName, email]
    .map((item) => item.trim().toLowerCase())
    .filter((item) => item.length >= 2);
  if (checks.some((item) => normalizedPassword.includes(item))) {
    return "Password must not contain your personal information";
  }

  return null;
}

export function validateConfirmPassword(value: string | null | undefined, password: string) {
  const confirm = value ?? "";
  if (!confirm) return "Please confirm your password";
  if (confirm !== password) return "Passwords do not match";
  return null;
}

export function normalizeSignupValues(params: {
  firstName: string;
  lastName: string;
  email: string;
}) {
  return {
    firstName: params.firstName.trim(),
    lastName: params.lastName.trim(),
    email: params.email.trim().toLowerCase(),
  };
}
