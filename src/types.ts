export type UserRole = 'Student' | 'Faculty' | 'Employee';
export type EmployeeType = 'Teacher' | 'Staff';
export type AppRole = 'Admin' | 'User';

export interface VisitorLog {
  id?: string;
  fullName: string;
  email: string;
  role: UserRole;
  college: string;
  reason: string;
  timestamp: any; // Firestore Timestamp
  employeeType?: EmployeeType;
}

export interface UserProfile {
  email: string;
  role: AppRole;
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}
