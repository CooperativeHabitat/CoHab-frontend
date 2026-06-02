export interface Family{
    id: string,
    familyName: string,
    createdBy: string,
    memberCount: number
}

export interface Role{
    id: string,
    name: string,
    value: number,
    accessList: string[],
    memberCount: number
}

export interface PersonalInfo{
    id: string,
    firstname: string,
    lastname: string,
    birthDate: string,
    roles: Role[]
}

export interface FamilyMember{
    id: string,
    username: string,
    personalInfo: PersonalInfo
    family: Family,
    addedAt: Date
}

export interface CreateInvitation{
    familyId: string,
    numMembers: number,
    expiresAt: Date,
}

export interface Invitation{
    familyId: string,
    invitationCode: string,
    numMembers: number,
    expiresAt: Date,
}